import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchSeoSettings, updateSeoSettings } from "../services/seoApi";

const SeoSettings = () => {
  const [seo, setSeo] = useState(null);
  const [baseUrl, setBaseUrl] = useState("");
  const [robotsContent, setRobotsContent] = useState("");
  const [staticUrls, setStaticUrls] = useState([]);
  
  // Form state for adding a new static URL
  const [newLoc, setNewLoc] = useState("");
  const [newChangefreq, setNewChangefreq] = useState("weekly");
  const [newPriority, setNewPriority] = useState(0.8);

  // Editing state for table rows
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editLoc, setEditLoc] = useState("");
  const [editChangefreq, setEditChangefreq] = useState("weekly");
  const [editPriority, setEditPriority] = useState(0.8);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSeoSettings()
      .then((data) => {
        setSeo(data);
        setBaseUrl(data.baseUrl || "");
        setRobotsContent(data.robotsContent || "");
        setStaticUrls(data.staticUrls || []);
      })
      .catch(() => toast.error("Failed to load SEO settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleAddUrl = (e) => {
    e.preventDefault();
    if (!newLoc) {
      toast.warning("Please enter a path/URL");
      return;
    }
    
    // Normalize path to start with /
    let formattedLoc = newLoc.trim();
    if (!formattedLoc.startsWith("/")) {
      formattedLoc = "/" + formattedLoc;
    }

    // Check duplicate
    if (staticUrls.some((u) => u.loc.toLowerCase() === formattedLoc.toLowerCase())) {
      toast.warning("This path already exists in sitemap");
      return;
    }

    const newItem = {
      loc: formattedLoc,
      changefreq: newChangefreq,
      priority: Number(newPriority),
    };

    setStaticUrls((prev) => [...prev, newItem]);
    setNewLoc("");
    setNewChangefreq("weekly");
    setNewPriority(0.8);
    toast.success("Added path to sitemap listing!");
  };

  const startEditing = (index, item) => {
    setEditingIndex(index);
    setEditLoc(item.loc);
    setEditChangefreq(item.changefreq);
    setEditPriority(item.priority);
  };

  const cancelEditing = () => {
    setEditingIndex(-1);
  };

  const saveEditing = (index) => {
    if (!editLoc) {
      toast.warning("Please enter a path/URL");
      return;
    }
    
    let formattedLoc = editLoc.trim();
    if (!formattedLoc.startsWith("/")) {
      formattedLoc = "/" + formattedLoc;
    }

    // Check duplicate (ignoring current index)
    if (staticUrls.some((u, idx) => idx !== index && u.loc.toLowerCase() === formattedLoc.toLowerCase())) {
      toast.warning("This path already exists in sitemap");
      return;
    }

    setStaticUrls((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? { ...item, loc: formattedLoc, changefreq: editChangefreq, priority: Number(editPriority) }
          : item
      )
    );
    setEditingIndex(-1);
    toast.success("Sitemap path updated!");
  };

  const handleDeleteUrl = (indexToDelete) => {
    setStaticUrls((prev) => prev.filter((_, idx) => idx !== indexToDelete));
    toast.info("Removed path from sitemap listing");
  };

  const handleSave = async () => {
    if (!baseUrl) {
      toast.error("Base URL is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        baseUrl: baseUrl.trim(),
        robotsContent: robotsContent,
        staticUrls: staticUrls,
      };
      const updated = await updateSeoSettings(payload);
      setSeo(updated);
      toast.success("SEO Settings and sitemap files updated successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update SEO settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">SEO & Sitemap Configuration</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">General Settings</h2>
            {/* Base Website URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Website URL (for absolute sitemap paths)
              </label>
              <input
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                required
                placeholder="https://celestiqbeauty.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Ensure this matches the live site domain name exactly.
              </p>
            </div>

            {/* Robots.txt content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Robots.txt Content
              </label>
              <textarea
                value={robotsContent}
                onChange={(e) => setRobotsContent(e.target.value)}
                rows={6}
                placeholder="User-agent: *..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-300 outline-none bg-gray-50 text-gray-800"
              />
            </div>
          </div>

          {/* Sitemap static URLs */}
          <div className="bg-white rounded-xl shadow p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Sitemap Static Pages</h2>
            
            {/* Add new url form */}
            <form onSubmit={handleAddUrl} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-lg items-end">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">PAGE PATH</label>
                <input
                  type="text"
                  value={newLoc}
                  onChange={(e) => setNewLoc(e.target.value)}
                  placeholder="/about-us"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">CHANGE FREQ</label>
                <select
                  value={newChangefreq}
                  onChange={(e) => setNewChangefreq(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white text-sm outline-none"
                >
                  <option value="always">Always</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="never">Never</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">PRIORITY (0.0 - 1.0)</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white text-sm outline-none"
                >
                  <option value="1.0">1.0 (High)</option>
                  <option value="0.9">0.9</option>
                  <option value="0.8">0.8 (Normal)</option>
                  <option value="0.7">0.7</option>
                  <option value="0.6">0.6</option>
                  <option value="0.5">0.5 (Low)</option>
                  <option value="0.4">0.4</option>
                  <option value="0.3">0.3</option>
                  <option value="0.2">0.2</option>
                  <option value="0.1">0.1</option>
                </select>
              </div>
              <div className="md:col-span-4 flex justify-end mt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded text-sm font-semibold hover:bg-green-700 transition"
                >
                  Add Path
                </button>
              </div>
            </form>

            {/* List of URLs */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead>
                  <tr className="border-b bg-gray-50 text-xs font-semibold text-gray-500">
                    <th className="py-2 px-3">Path</th>
                    <th className="py-2 px-3">Full URL Preview</th>
                    <th className="py-2 px-3">Changefreq</th>
                    <th className="py-2 px-3">Priority</th>
                    <th className="py-2 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {staticUrls.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400">
                        No static paths added. Add one using the form above.
                      </td>
                    </tr>
                  ) : (
                    staticUrls.map((url, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        {editingIndex === index ? (
                          <>
                            <td className="py-2 px-2">
                              <input
                                type="text"
                                value={editLoc}
                                onChange={(e) => setEditLoc(e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm outline-none"
                              />
                            </td>
                            <td className="py-2 px-2 text-xs text-gray-400">
                              {baseUrl.replace(/\/$/, "")}{editLoc}
                            </td>
                            <td className="py-2 px-2">
                              <select
                                value={editChangefreq}
                                onChange={(e) => setEditChangefreq(e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm outline-none bg-white"
                              >
                                <option value="always">Always</option>
                                <option value="hourly">Hourly</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                                <option value="never">Never</option>
                              </select>
                            </td>
                            <td className="py-2 px-2">
                              <select
                                value={editPriority}
                                onChange={(e) => setEditPriority(Number(e.target.value))}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm outline-none bg-white"
                              >
                                <option value="1.0">1.0</option>
                                <option value="0.9">0.9</option>
                                <option value="0.8">0.8</option>
                                <option value="0.7">0.7</option>
                                <option value="0.6">0.6</option>
                                <option value="0.5">0.5</option>
                                <option value="0.4">0.4</option>
                                <option value="0.3">0.3</option>
                                <option value="0.2">0.2</option>
                                <option value="0.1">0.1</option>
                              </select>
                            </td>
                            <td className="py-2 px-2 text-center space-x-2">
                              <button
                                type="button"
                                onClick={() => saveEditing(index)}
                                className="text-green-600 hover:text-green-800 text-xs font-semibold"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditing}
                                className="text-gray-500 hover:text-gray-700 text-xs font-semibold"
                              >
                                Cancel
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-2.5 px-3 font-medium text-gray-800">{url.loc}</td>
                            <td className="py-2.5 px-3 text-xs text-gray-400 truncate max-w-xs">
                              {baseUrl.replace(/\/$/, "")}{url.loc}
                            </td>
                            <td className="py-2.5 px-3 capitalize">{url.changefreq}</td>
                            <td className="py-2.5 px-3">{url.priority.toFixed(1)}</td>
                            <td className="py-2.5 px-3 text-center space-x-3">
                              <button
                                type="button"
                                onClick={() => startEditing(index, url)}
                                className="text-blue-500 hover:text-blue-700 text-xs font-semibold"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteUrl(index)}
                                className="text-red-500 hover:text-red-700 text-xs font-semibold"
                              >
                                Remove
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? "Saving & Generating Files..." : "Save & Generate XML / Robots.txt"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeoSettings;
