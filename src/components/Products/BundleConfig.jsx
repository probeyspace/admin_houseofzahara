import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { getBundleByProduct, createBundle, updateBundle } from "../../services/bundleApi";
import { fetchProducts } from "../../services/products";
import { FiSearch, FiSave, FiTag } from "react-icons/fi";

export default function BundleConfig({ productId }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [bundleId, setBundleId] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [discountAed, setDiscountAed] = useState(60);
  const [companions, setCompanions] = useState([]);
  
  const [allProducts, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    const loadData = async () => {
      if (!productId) return;
      setLoading(true);
      try {
        const [bundleRes, productsRes] = await Promise.all([
          getBundleByProduct(productId).catch(() => ({ data: null })),
          fetchProducts()
        ]);
        
        setAllProducts(productsRes || []);
        
        if (bundleRes?.data && bundleRes.data._id) {
          setBundleId(bundleRes.data._id);
          setIsActive(bundleRes.data.isActive !== undefined ? bundleRes.data.isActive : true);
          setDiscountAed(bundleRes.data.discountAed || 60);
          if (Array.isArray(bundleRes.data.companions)) {
            setCompanions(bundleRes.data.companions.map(c => typeof c === "object" ? c._id : c));
          }
        }
      } catch (error) {
        console.error("Failed to load bundle config", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [productId]);

  const handleToggleCompanion = (id) => {
    setCompanions(prev => {
      const exists = prev.includes(id);
      if (exists) {
        return prev.filter(c => c !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!productId) return;
    setSaving(true);
    try {
      const payload = {
        mainProduct: productId,
        companions,
        discountAed: Number(discountAed),
        isActive
      };

      if (bundleId) {
        await updateBundle(bundleId, payload);
        toast.success("Bundle configuration updated successfully!");
      } else {
        const res = await createBundle(payload);
        if (res?.data?._id) setBundleId(res.data._id);
        toast.success("Bundle configuration created successfully!");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save bundle configuration");
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return allProducts
      .filter(p => p._id !== productId) // exclude self
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [allProducts, productId, searchTerm]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <span className="text-sm font-medium text-gray-500 animate-pulse">Loading bundle configuration...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header section */}
      <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <FiTag className="text-amber-600" />
            Bundle Configuration
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Configure companion products and AED discount</p>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-700 cursor-pointer">Enable Widget</label>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              isActive ? "bg-emerald-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isActive ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      <div className={`p-5 space-y-6 ${!isActive ? "opacity-50" : ""}`}>
        
        {/* Discount Input */}
        <div className="w-full md:w-1/2">
          <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
            Discount per Pair (AED)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 font-semibold text-sm">AED</span>
            </div>
            <input
              type="number"
              min="0"
              value={discountAed}
              onChange={(e) => setDiscountAed(e.target.value)}
              className="w-full text-sm font-semibold text-gray-900 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black rounded-lg pl-14 pr-4 py-2.5 outline-none"
              placeholder="60"
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">
            This amount (e.g. 60 AED) is deducted per pair of Main Product + Companion added to bag.
          </p>
        </div>

        {/* Companion Selection */}
        <div>
          <label className="flex items-center justify-between text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
            <span>Select Companion Products ({companions.length} selected)</span>
          </label>
          
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col shadow-sm">
            {/* Search Bar */}
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-sm bg-white border border-gray-300 rounded-md pl-9 pr-3 py-2 outline-none focus:border-black shadow-inner"
                />
              </div>
            </div>
            
            {/* List */}
            <div className="max-h-56 overflow-y-auto p-2 space-y-1">
              {filteredProducts.map(p => {
                const isSelected = companions.includes(p._id);
                return (
                  <div 
                    key={p._id} 
                    onClick={() => handleToggleCompanion(p._id)}
                    className={`flex items-center gap-3 p-2.5 rounded-md cursor-pointer transition-all border select-none ${
                      isSelected 
                        ? "bg-amber-50/80 border-amber-400" 
                        : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-200"
                    }`}
                  >
                    <input 
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="w-4 h-4 rounded text-black accent-black cursor-pointer pointer-events-none"
                    />
                    <span className={`text-sm flex-1 truncate ${isSelected ? "font-bold text-gray-900" : "text-gray-700"}`}>
                      {p.name}
                    </span>
                  </div>
                );
              })}
              
              {filteredProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center p-6 text-gray-400 text-sm">
                  <FiSearch className="text-gray-300 mb-2" size={24} />
                  <span>No products found matching "{searchTerm}"</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Footer / Actions */}
      <div className="bg-gray-50 px-5 py-4 border-t border-gray-200 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-black text-white text-sm font-bold px-6 py-2.5 rounded-lg hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md cursor-pointer"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            <>
              <FiSave />
              Save Bundle Configuration
            </>
          )}
        </button>
      </div>
    </div>
  );
}
