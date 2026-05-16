import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  fetchAllWallets,
  fetchUserWallet,
  manualAdjustPoints,
} from "../services/walletApi";

const WalletManagement = () => {
  const [wallets, setWallets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Adjust modal state
  const [adjustModal, setAdjustModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [adjustForm, setAdjustForm] = useState({ points: "", description: "" });
  const [adjusting, setAdjusting] = useState(false);

  // Detail modal state
  const [detailModal, setDetailModal] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const limit = 20;

  const loadWallets = async (p = 1) => {
    setLoading(true);
    try {
      const data = await fetchAllWallets(p, limit);
      setWallets(data.wallets);
      setTotal(data.total);
      setPage(p);
    } catch {
      toast.error("Failed to load wallets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallets(1);
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredWallets = wallets.filter((w) => {
    if (!normalizedSearch) return true;
    const name = w.userId?.name?.toLowerCase() || "";
    const email = w.userId?.email?.toLowerCase() || "";
    return name.includes(normalizedSearch) || email.includes(normalizedSearch);
  });

  const openAdjust = (wallet) => {
    setSelectedWallet(wallet);
    setAdjustForm({ points: "", description: "" });
    setAdjustModal(true);
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    const pts = Number(adjustForm.points);
    if (!pts || pts === 0) {
      toast.error("Enter a non-zero number of points");
      return;
    }
    if (!adjustForm.description.trim()) {
      toast.error("Description is required");
      return;
    }
    setAdjusting(true);
    try {
      await manualAdjustPoints(selectedWallet.userId._id, pts, adjustForm.description);
      toast.success(`Wallet adjusted by ${pts > 0 ? "+" : ""}${pts} pts`);
      setAdjustModal(false);
      loadWallets(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Adjustment failed");
    } finally {
      setAdjusting(false);
    }
  };

  const openDetail = async (wallet) => {
    setDetailData(null);
    setDetailModal(true);
    setDetailLoading(true);
    try {
      const data = await fetchUserWallet(wallet.userId._id);
      setDetailData(data);
    } catch {
      toast.error("Failed to load wallet details");
      setDetailModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const TX_LABELS = {
    joining_bonus: "Joining Bonus",
    spend_reward: "Purchase Reward",
    redemption: "Redemption",
    manual_adjustment: "Manual Adjustment",
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Wallet Management</h1>
        <span className="text-sm text-gray-500">{total} total wallets</span>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full max-w-sm mb-5 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
      />

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-right">Points</th>
                <th className="px-4 py-3 text-right">AED Value</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : filteredWallets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    No wallets found
                  </td>
                </tr>
              ) : (
                filteredWallets.map((w) => (
                  <tr key={w._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-700">
                      {w.userId?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{w.userId?.email || "—"}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">
                      {w.balance.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-amber-600 font-semibold">
                      AED {w.dirhamsValue?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openDetail(w)}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                        >
                          View
                        </button>
                        <button
                          onClick={() => openAdjust(w)}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                          Adjust
                        </button>
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
                onClick={() => loadWallets(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                onClick={() => loadWallets(page + 1)}
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
      {adjustModal && selectedWallet && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Adjust Points</h2>
            <p className="text-sm text-gray-500 mb-4">
              User: <span className="font-medium">{selectedWallet.userId?.name}</span> (
              {selectedWallet.userId?.email}) — Current balance:{" "}
              <span className="font-medium">{selectedWallet.balance} pts</span>
            </p>
            <form onSubmit={handleAdjust} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Points (positive = credit, negative = debit)
                </label>
                <input
                  type="number"
                  value={adjustForm.points}
                  onChange={(e) =>
                    setAdjustForm((prev) => ({ ...prev, points: e.target.value }))
                  }
                  placeholder="e.g. 100 or -50"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason / Description
                </label>
                <textarea
                  value={adjustForm.description}
                  onChange={(e) =>
                    setAdjustForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={2}
                  placeholder="e.g. Compensation for delayed order"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none resize-none"
                  required
                />
              </div>
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
                  disabled={adjusting}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {adjusting ? "Applying..." : "Apply"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Wallet Details</h2>
              <button
                onClick={() => setDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>

            {detailLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" />
              </div>
            ) : detailData ? (
              <>
                <div className="bg-amber-50 rounded-lg p-4 mb-4 text-center">
                  <p className="text-3xl font-bold text-gray-800">
                    {detailData.wallet.balance.toLocaleString()} pts
                  </p>
                  <p className="text-amber-600 font-semibold mt-1">
                    = AED {detailData.dirhamsValue?.toFixed(2)}
                  </p>
                </div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">
                  Recent Transactions
                </h3>
                {detailData.transactions.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-6">
                    No transactions yet
                  </p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {detailData.transactions.map((tx) => (
                      <li
                        key={tx._id}
                        className="flex items-center justify-between py-2 text-sm"
                      >
                        <div>
                          <p className="font-medium text-gray-700">
                            {TX_LABELS[tx.type] || tx.type}
                          </p>
                          {tx.description && (
                            <p className="text-xs text-gray-400">{tx.description}</p>
                          )}
                          <p className="text-xs text-gray-400">
                            {new Date(tx.createdAt).toLocaleDateString("en-AE", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              tx.points > 0 ? "text-green-600" : "text-red-500"
                            }`}
                          >
                            {tx.points > 0 ? "+" : ""}
                            {tx.points} pts
                          </p>
                          <p className="text-xs text-gray-400">
                            Bal: {tx.balanceAfter}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletManagement;
