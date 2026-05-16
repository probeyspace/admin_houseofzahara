import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchAdminWalletConfig, updateAdminWalletConfig } from "../services/walletApi";

const WalletConfig = () => {
  const [config, setConfig] = useState(null);
  const [form, setForm] = useState({
    joiningBonus: "",
    pointsPerDirham: "",
    pointValueInDirhams: "",
    isEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdminWalletConfig()
      .then((data) => {
        setConfig(data);
        setForm({
          joiningBonus: data.joiningBonus,
          pointsPerDirham: data.pointsPerDirham,
          pointValueInDirhams: data.pointValueInDirhams,
          isEnabled: data.isEnabled,
        });
      })
      .catch(() => toast.error("Failed to load wallet config"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        joiningBonus: Number(form.joiningBonus),
        pointsPerDirham: Number(form.pointsPerDirham),
        pointValueInDirhams: Number(form.pointValueInDirhams),
        isEnabled: form.isEnabled,
      };
      const updated = await updateAdminWalletConfig(payload);
      setConfig(updated);
      toast.success("Wallet config updated successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update config");
    } finally {
      setSaving(false);
    }
  };

  const earnPreview = form.pointsPerDirham
    ? (100 * Number(form.pointsPerDirham)).toFixed(1)
    : "—";
  const redeemPreview = form.pointValueInDirhams
    ? (100 * Number(form.pointValueInDirhams)).toFixed(2)
    : "—";

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Wallet Configuration</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-5">
          {/* Joining Bonus */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Joining Bonus (points awarded on signup)
            </label>
            <input
              type="number"
              name="joiningBonus"
              value={form.joiningBonus}
              onChange={handleChange}
              min={0}
              step={1}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
            />
          </div>

          {/* Points per Dirham Spent */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Points earned per AED spent
            </label>
            <input
              type="number"
              name="pointsPerDirham"
              value={form.pointsPerDirham}
              onChange={handleChange}
              min={0}
              step={0.01}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Preview: AED 100 spent → {earnPreview} pts
            </p>
          </div>

          {/* Point Value in Dirhams */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AED value per point (point redemption rate)
            </label>
            <input
              type="number"
              name="pointValueInDirhams"
              value={form.pointValueInDirhams}
              onChange={handleChange}
              min={0}
              step={0.001}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Preview: 100 pts = AED {redeemPreview}
            </p>
          </div>

          {/* Enabled toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isEnabled"
              name="isEnabled"
              checked={form.isEnabled}
              onChange={handleChange}
              className="w-4 h-4 accent-blue-600"
            />
            <label htmlFor="isEnabled" className="text-sm font-medium text-gray-700">
              Wallet system enabled
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

export default WalletConfig;
