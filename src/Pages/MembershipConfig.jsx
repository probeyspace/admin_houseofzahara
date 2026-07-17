import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  fetchAdminMembershipConfig,
  updateAdminMembershipConfig,
} from "../services/membershipApi";
import { fetchProducts } from "../services/products";

const MembershipConfig = () => {
  const [form, setForm] = useState({
    name: "",
    priceAed: "",
    discountPercent: "",
    discountUnitCap: "",
    validityDays: "",
    maxMembers: "",
    isEnabled: false,
  });
  const [giftProductId, setGiftProductId] = useState("");
  const [giftVariantId, setGiftVariantId] = useState("");
  const [products, setProducts] = useState([]);
  const [activatedMembers, setActivatedMembers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([fetchAdminMembershipConfig(), fetchProducts()])
      .then(([data, productList]) => {
        const config = data.config;
        setActivatedMembers(data.activatedMembers || 0);
        setForm({
          name: config.name || "Gold Membership",
          priceAed: config.priceAed,
          discountPercent: config.discountPercent,
          discountUnitCap: config.discountUnitCap,
          validityDays: config.validityDays,
          maxMembers: config.maxMembers,
          isEnabled: config.isEnabled,
        });
        setGiftProductId(config.giftProduct?._id || "");
        setGiftVariantId(config.giftVariant?._id || "");
        setProducts(productList || []);
      })
      .catch(() => toast.error("Failed to load membership config"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const selectedProduct = products.find((p) => p._id === giftProductId);
  const variants = selectedProduct?.variants || [];

  const variantLabel = (v) => {
    const specs = v.specs || {};
    const detail = [specs.shade, specs.size, specs.volume]
      .filter(Boolean)
      .join(" / ");
    const price = Number(v.discountPrice?.$numberDecimal ?? v.discountPrice) || 0;
    return `${v.sku || v._id}${detail ? ` — ${detail}` : ""} ($${price.toFixed(2)}, stock ${v.stock})`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!giftVariantId) {
      toast.error("Please select the gift product and variant");
      return;
    }
    setSaving(true);
    try {
      await updateAdminMembershipConfig({
        name: form.name,
        priceAed: Number(form.priceAed),
        discountPercent: Number(form.discountPercent),
        discountUnitCap: Number(form.discountUnitCap),
        validityDays: Number(form.validityDays),
        maxMembers: Number(form.maxMembers),
        isEnabled: form.isEnabled,
        giftProduct: giftProductId,
        giftVariant: giftVariantId,
      });
      toast.success("Membership config updated successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update config");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-gray-800">
        Membership Configuration
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        {activatedMembers} member{activatedMembers === 1 ? "" : "s"} activated
        so far.
      </p>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow p-6 space-y-5"
        >
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800">
            Changes apply to <strong>new purchases only</strong> — existing
            members keep the benefits they bought.
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Membership name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (AED)
              </label>
              <input
                type="number"
                name="priceAed"
                value={form.priceAed}
                onChange={handleChange}
                min={1}
                step={1}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Member cap (first N members)
              </label>
              <input
                type="number"
                name="maxMembers"
                value={form.maxMembers}
                onChange={handleChange}
                min={1}
                step={1}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount %
              </label>
              <input
                type="number"
                name="discountPercent"
                value={form.discountPercent}
                onChange={handleChange}
                min={0}
                max={100}
                step={1}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product cap (units)
              </label>
              <input
                type="number"
                name="discountUnitCap"
                value={form.discountUnitCap}
                onChange={handleChange}
                min={1}
                step={1}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Validity (days)
              </label>
              <input
                type="number"
                name="validityDays"
                value={form.validityDays}
                onChange={handleChange}
                min={1}
                step={1}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
              />
            </div>
          </div>

          {/* Gift product picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Free gift product
            </label>
            <select
              value={giftProductId}
              onChange={(e) => {
                setGiftProductId(e.target.value);
                setGiftVariantId("");
              }}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
            >
              <option value="">Select a product…</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {giftProductId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gift variant
              </label>
              <select
                value={giftVariantId}
                onChange={(e) => setGiftVariantId(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
              >
                <option value="">Select a variant…</option>
                {variants.map((v) => (
                  <option key={v._id} value={v._id}>
                    {variantLabel(v)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isEnabled"
              name="isEnabled"
              checked={form.isEnabled}
              onChange={handleChange}
              className="w-4 h-4 accent-blue-600"
            />
            <label
              htmlFor="isEnabled"
              className="text-sm font-medium text-gray-700"
            >
              Membership enabled (visible &amp; purchasable on the storefront)
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Configuration"}
          </button>
        </form>
      )}
    </div>
  );
};

export default MembershipConfig;
