import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../Api/api";
import {
  fetchAllMemberships,
  adjustMembership,
  markMembershipsSeen,
} from "../services/membershipApi";

const STATUS_BADGE = {
  ACTIVE: "bg-green-100 text-green-700",
  PENDING_PAYMENT: "bg-yellow-100 text-yellow-700",
  CONSUMED: "bg-gray-200 text-gray-700",
  EXPIRED: "bg-gray-200 text-gray-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const STATUS_OPTIONS = [
  "",
  "ACTIVE",
  "PENDING_PAYMENT",
  "CONSUMED",
  "EXPIRED",
  "CANCELLED",
];

const ACTION_LABELS = {
  setUnitsUsed: "Set discount units used",
  resetGift: "Reset gift (mark as not delivered)",
  extendExpiry: "Extend expiry (days)",
  revoke: "Revoke membership",
  reinstate: "Reinstate membership (restore benefits)",
};

// Only actions that make sense for the membership's current state
const ACTIONS_BY_STATUS = {
  ACTIVE: ["setUnitsUsed", "resetGift", "extendExpiry", "revoke"],
  CONSUMED: ["setUnitsUsed", "resetGift", "extendExpiry", "revoke"],
  EXPIRED: ["extendExpiry", "setUnitsUsed", "resetGift", "revoke"],
  PENDING_PAYMENT: ["revoke"],
  CANCELLED: ["reinstate"],
};

const MembershipManagement = () => {
  const [memberships, setMemberships] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Adjust modal
  const [adjustModal, setAdjustModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState("setUnitsUsed");
  const [actionValue, setActionValue] = useState("");
  const [applying, setApplying] = useState(false);

  // Grant modal
  const [grantModal, setGrantModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [grantSearch, setGrantSearch] = useState("");
  const [granting, setGranting] = useState(false);

  const limit = 20;

  const load = async (p = 1, s = search, st = statusFilter) => {
    setLoading(true);
    try {
      const data = await fetchAllMemberships(p, limit, s, st);
      setMemberships(data.memberships);
      setTotal(data.total);
      setPage(p);
    } catch {
      toast.error("Failed to load memberships");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // Opening this page counts as "seen" — clear the sidebar red dot
    markMembershipsSeen()
      .then(() => window.dispatchEvent(new Event("memberships-seen")))
      .catch(() => {});
  }, []);

  // Debounced server-side search
  useEffect(() => {
    const t = setTimeout(() => load(1, search, statusFilter), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  const openAdjust = (m) => {
    const firstAction = (ACTIONS_BY_STATUS[m.status] || ["revoke"])[0];
    setSelected(m);
    setAction(firstAction);
    setActionValue(
      firstAction === "setUnitsUsed" ? String(m.discountUnitsUsed ?? 0) : ""
    );
    setAdjustModal(true);
  };

  // One-click restore for cancelled memberships (same doc, same benefits)
  const [reinstatingId, setReinstatingId] = useState(null);
  const handleQuickReinstate = async (m) => {
    setReinstatingId(m._id);
    try {
      await adjustMembership({ membershipId: m._id, action: "reinstate" });
      toast.success("Membership reinstated");
      load(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Reinstate failed");
    } finally {
      setReinstatingId(null);
    }
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      const payload = { membershipId: selected._id, action };
      if (action === "setUnitsUsed" || action === "extendExpiry") {
        payload.value = Number(actionValue);
      }
      await adjustMembership(payload);
      toast.success("Membership updated");
      setAdjustModal(false);
      load(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Adjustment failed");
    } finally {
      setApplying(false);
    }
  };

  const openGrant = async () => {
    setGrantModal(true);
    setGrantSearch("");
    if (users.length === 0) {
      try {
        const res = await api.get("/users/all-users");
        setUsers(res.data.data || []);
      } catch {
        toast.error("Failed to load users");
      }
    }
  };

  const handleGrant = async (userId) => {
    setGranting(true);
    try {
      await adjustMembership({ action: "grant", userId });
      toast.success("Membership granted");
      setGrantModal(false);
      load(1);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Grant failed");
    } finally {
      setGranting(false);
    }
  };

  const filteredUsers = users
    .filter((u) => {
      const q = grantSearch.trim().toLowerCase();
      if (!q) return true;
      return (
        u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
      );
    })
    .slice(0, 20);

  const totalPages = Math.ceil(total / limit);

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-AE", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Membership Management
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{total} memberships</span>
          <button
            onClick={openGrant}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Grant membership
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s || "all"} value={s}>
              {s ? s.replace(/_/g, " ") : "All statuses"}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Channel</th>
                <th className="px-4 py-3 text-center">Discount used</th>
                <th className="px-4 py-3 text-center">Gift</th>
                <th className="px-4 py-3 text-right">Paid (AED)</th>
                <th className="px-4 py-3 text-left">Activated</th>
                <th className="px-4 py-3 text-left">Expires</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : memberships.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-400">
                    No memberships found
                  </td>
                </tr>
              ) : (
                memberships.map((m) => (
                  <tr key={m._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-700">
                        {m.user?.name || "—"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {m.user?.email || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[11px] font-semibold px-2 py-1 rounded-full ${
                          STATUS_BADGE[m.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {m.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {m.purchaseChannel}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-gray-800">
                        {m.discountUnitsUsed}
                      </span>
                      <span className="text-gray-400">
                        {" "}
                        / {m.discountUnitCap}
                      </span>
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full mx-auto mt-1 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{
                            width: `${
                              m.discountUnitCap
                                ? Math.min(
                                    100,
                                    (m.discountUnitsUsed / m.discountUnitCap) *
                                      100
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {m.giftDelivered ? (
                        <span className="text-green-600 font-medium text-xs">
                          Delivered
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">
                      {m.priceAtPurchaseAed ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {fmtDate(m.activatedAt)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {fmtDate(m.expiresAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        {m.status === "CANCELLED" ? (
                          <button
                            onClick={() => handleQuickReinstate(m)}
                            disabled={reinstatingId === m._id}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
                          >
                            {reinstatingId === m._id
                              ? "Reinstating…"
                              : "Reinstate"}
                          </button>
                        ) : (
                          <button
                            onClick={() => openAdjust(m)}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                          >
                            Adjust
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-600">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => load(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                onClick={() => load(page + 1)}
                disabled={page >= totalPages}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Adjust Modal */}
      {adjustModal && selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              Adjust Membership
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {selected.user?.name} ({selected.user?.email}) —{" "}
              {selected.status.replace(/_/g, " ")}
            </p>
            <form onSubmit={handleAdjust} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action
                </label>
                <select
                  value={action}
                  onChange={(e) => {
                    setAction(e.target.value);
                    setActionValue(
                      e.target.value === "setUnitsUsed"
                        ? String(selected.discountUnitsUsed ?? 0)
                        : ""
                    );
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                >
                  {(ACTIONS_BY_STATUS[selected.status] || ["revoke"]).map(
                    (a) => (
                      <option key={a} value={a}>
                        {ACTION_LABELS[a]}
                      </option>
                    )
                  )}
                </select>
              </div>

              {(action === "setUnitsUsed" || action === "extendExpiry") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {action === "setUnitsUsed"
                      ? `Units used (0–${selected.discountUnitCap})`
                      : "Days to extend"}
                  </label>
                  <input
                    type="number"
                    value={actionValue}
                    onChange={(e) => setActionValue(e.target.value)}
                    min={0}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                  />
                </div>
              )}

              {action === "revoke" && (
                <p className="text-xs text-red-500">
                  This cancels the membership immediately — the user loses
                  access to their benefits. You can bring it back later with
                  &quot;Reinstate&quot; (refunds are handled separately).
                </p>
              )}

              {action === "reinstate" && (
                <p className="text-xs text-green-600">
                  Restores this exact membership — same units used (
                  {selected.discountUnitsUsed}/{selected.discountUnitCap}),
                  same gift status, same expiry date. Fails if the user has
                  since bought a new membership.
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setAdjustModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {applying ? "Applying..." : "Apply"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grant Modal */}
      {grantModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800">
                Grant Membership
              </h2>
              <button
                onClick={() => setGrantModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Grants an active membership (current config, price 0) to a user.
              Fails if the user already has an open membership.
            </p>
            <input
              type="text"
              autoFocus
              placeholder="Search users by name or email..."
              value={grantSearch}
              onChange={(e) => setGrantSearch(e.target.value)}
              className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
            />
            <div className="overflow-y-auto divide-y divide-gray-100 border border-gray-100 rounded-lg">
              {filteredUsers.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-6">
                  No users found
                </p>
              ) : (
                filteredUsers.map((u) => (
                  <button
                    key={u._id}
                    disabled={granting}
                    onClick={() => handleGrant(u._id)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition disabled:opacity-50"
                  >
                    <p className="text-sm font-medium text-gray-700">
                      {u.name || "—"}
                    </p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipManagement;
