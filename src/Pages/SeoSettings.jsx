import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchSeoSettings, updateSeoSettings } from "../services/seoApi";

const SeoSettings = () => {
  const [seo, setSeo] = useState(null);
  const [baseUrl, setBaseUrl] = useState("");
  const [robotsContent, setRobotsContent] = useState("");
  const [staticUrls, setStaticUrls] = useState([]);
  const [pages, setPages] = useState([]);
  const [newPagePath, setNewPagePath] = useState("");
  
  // Form state for adding a new static URL
  const [newLoc, setNewLoc] = useState("");
  const [newChangefreq, setNewChangefreq] = useState("weekly");
  const [newPriority, setNewPriority] = useState(0.8);

  // Editing state for table rows (Sitemap)
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editLoc, setEditLoc] = useState("");
  const [editChangefreq, setEditChangefreq] = useState("weekly");
  const [editPriority, setEditPriority] = useState(0.8);

  // Editing state for Page SEO Metadata
  const [editingPageIndex, setEditingPageIndex] = useState(-1);
  const [editPagePath, setEditPagePath] = useState("");
  const [editPageTitle, setEditPageTitle] = useState("");
  const [editPageDescription, setEditPageDescription] = useState("");
  const [editPageKeywords, setEditPageKeywords] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSeoSettings()
      .then((data) => {
        setSeo(data);
        setBaseUrl(data.baseUrl || "");
        setRobotsContent(data.robotsContent || "");
        setStaticUrls(data.staticUrls || []);
        setPages(data.pages || []);
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

  const handleAddPageMetadata = (e) => {
    e.preventDefault();
    if (!newPagePath) {
      toast.warning("Please enter a page path");
      return;
    }
    let formattedPath = newPagePath.trim();
    if (!formattedPath.startsWith("/")) {
      formattedPath = "/" + formattedPath;
    }
    if (pages.some((p) => p.path.toLowerCase() === formattedPath.toLowerCase())) {
      toast.warning("SEO settings for this path already exist!");
      return;
    }
    const newPage = {
      path: formattedPath,
      title: "",
      description: "",
      keywords: "",
    };
    setPages((prev) => [...prev, newPage]);
    setNewPagePath("");
    toast.success(`Added ${formattedPath} to the metadata list. Remember to Save!`);
  };

  const handleDeletePageMetadata = (pathToDelete) => {
    setPages((prev) => prev.filter((p) => p.path !== pathToDelete));
    toast.info("Removed page from metadata listing. Remember to Save!");
  };

  const startEditingPage = (index, page) => {
    setEditingPageIndex(index);
    setEditPagePath(page.path);
    setEditPageTitle(page.title || "");
    setEditPageDescription(page.description || "");
    setEditPageKeywords(page.keywords || "");
  };

  const cancelEditingPage = () => {
    setEditingPageIndex(-1);
  };

  const saveEditingPage = (index) => {
    if (!editPagePath) {
      toast.warning("Please enter a page path");
      return;
    }
    let formattedPath = editPagePath.trim();
    if (!formattedPath.startsWith("/")) {
      formattedPath = "/" + formattedPath;
    }
    if (pages.some((p, idx) => idx !== index && p.path.toLowerCase() === formattedPath.toLowerCase())) {
      toast.warning("This path already exists");
      return;
    }
    setPages((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? { ...item, path: formattedPath, title: editPageTitle, description: editPageDescription, keywords: editPageKeywords }
          : item
      )
    );
    setEditingPageIndex(-1);
    toast.success("Page SEO metadata updated!");
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
        pages: pages,
      };
      const updated = await updateSeoSettings(payload);
      setSeo(updated);
      setPages(updated.pages || []);
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

          {/* Page-Specific SEO Metadata */}
          <div className="bg-white rounded-xl shadow p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Page-Specific SEO Metadata</h2>
            <p className="text-xs text-gray-400">
              Configure custom titles, descriptions, and keywords for general site pages.
            </p>
            
            {/* Add new page path metadata */}
            <form onSubmit={handleAddPageMetadata} className="flex gap-3 bg-gray-50 p-4 rounded-lg items-end">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">PAGE PATH FOR META TAGS (e.g. /sustainability)</label>
                <input
                  type="text"
                  value={newPagePath}
                  onChange={(e) => setNewPagePath(e.target.value)}
                  placeholder="/new-page-path"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white text-sm outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded text-sm font-semibold hover:bg-green-700 transition"
              >
                Add Page Meta
              </button>
            </form>

            <div className="space-y-4">
              {pages.map((p, idx) => {
                const isDefaultPath = ["/", "/about", "/contact", "/products", "/faq", "/blogs"].includes(p.path);
                const isEditing = editingPageIndex === idx;
                
                return (
                  <div key={idx} className="border border-gray-150 p-4 rounded-lg bg-gray-50/50 space-y-3">
                    <div className="flex justify-between items-center border-b pb-1">
                      <span className="text-sm font-bold text-gray-700">
                        {p.path === "/" ? "Home Page (/)" : `${p.path} Page`}
                      </span>
                      <div className="space-x-3 text-xs">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => saveEditingPage(idx)}
                              className="text-green-600 hover:text-green-800 font-semibold"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditingPage}
                              className="text-gray-500 hover:text-gray-700 font-semibold"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEditingPage(idx, p)}
                              className="text-blue-600 hover:text-blue-800 font-semibold"
                            >
                              Edit Meta
                            </button>
                            {!isDefaultPath && (
                              <button
                                type="button"
                                onClick={() => handleDeletePageMetadata(p.path)}
                                className="text-red-600 hover:text-red-800 font-semibold"
                              >
                                Remove Page
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    
                    {isEditing ? (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Page Path</label>
                          <input
                            type="text"
                            value={editPagePath}
                            onChange={(e) => setEditPagePath(e.target.value)}
                            disabled={isDefaultPath}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white text-sm outline-none disabled:bg-gray-100 disabled:text-gray-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Meta Title</label>
                          <input
                            type="text"
                            value={editPageTitle}
                            onChange={(e) => setEditPageTitle(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white text-sm outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Meta Keywords</label>
                          <input
                            type="text"
                            value={editPageKeywords}
                            onChange={(e) => setEditPageKeywords(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white text-sm outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Meta Description</label>
                          <textarea
                            value={editPageDescription}
                            onChange={(e) => setEditPageDescription(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white text-sm outline-none"
                            rows={1}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                        <div>
                          <span className="font-semibold text-xs text-gray-400 block">Meta Title:</span>
                          <span className="text-gray-800">{p.title || <em className="text-gray-300">None</em>}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-xs text-gray-400 block">Meta Keywords:</span>
                          <span className="text-gray-800">{p.keywords || <em className="text-gray-300">None</em>}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-xs text-gray-400 block">Meta Description:</span>
                          <span className="text-gray-800">{p.description || <em className="text-gray-300">None</em>}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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
