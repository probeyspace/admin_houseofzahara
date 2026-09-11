import React, { useState, useMemo } from "react";
import { WORLD_COUNTRIES } from "../../common/worldCountries";
import { FaGlobe, FaSearch, FaTimes, FaBan, FaCheckCircle } from "react-icons/fa";

const RegionalAvailabilitySelector = ({
  restrictedCountries = [],
  regionalAvailability,
  value,
  onChange,
}) => {
  const regConfig = regionalAvailability || value;
  const inputRestricted =
    Array.isArray(restrictedCountries) && restrictedCountries.length > 0
      ? restrictedCountries
      : Array.isArray(value?.restrictedCountries)
      ? value.restrictedCountries
      : [];

  // Derive current restricted countries array
  const currentRestricted = useMemo(() => {
    if (Array.isArray(inputRestricted) && inputRestricted.length > 0) {
      return inputRestricted.map((c) => c.toUpperCase());
    }
    // Fallback if legacy regionalAvailability had excluded countries
    if (
      regConfig &&
      regConfig.isGlobal === false &&
      Array.isArray(regConfig.allowedCountries) &&
      regConfig.allowedCountries.length > 0
    ) {
      const allowedSet = new Set(regConfig.allowedCountries.map((c) => c.toUpperCase()));
      return WORLD_COUNTRIES.filter((c) => !allowedSet.has(c.code)).map((c) => c.code);
    }
    return [];
  }, [inputRestricted, regConfig]);

  const [search, setSearch] = useState("");
  const unavailableNotice = regConfig?.unavailableNotice || "";

  // Get full country objects for currently restricted countries
  const restrictedCountryObjects = useMemo(() => {
    return currentRestricted.map((code) => {
      return (
        WORLD_COUNTRIES.find((c) => c.code === code) || {
          code,
          name: code,
          flag: "🏳️",
        }
      );
    });
  }, [currentRestricted]);

  // Search filtered countries (excluding already restricted ones)
  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.trim().toLowerCase();
    return WORLD_COUNTRIES.filter(
      (c) =>
        !currentRestricted.includes(c.code) &&
        (c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
    ).slice(0, 10);
  }, [search, currentRestricted]);

  const emitChange = (nextRestricted, nextNotice = unavailableNotice) => {
    onChange({
      restrictedCountries: nextRestricted,
      regionalAvailability: {
        isGlobal: nextRestricted.length === 0,
        allowedCountries:
          nextRestricted.length === 0
            ? []
            : WORLD_COUNTRIES.filter((c) => !nextRestricted.includes(c.code)).map((c) => c.code),
        unavailableNotice: nextNotice,
      },
    });
  };

  // Re-allow a country by removing it from the restricted list
  const handleRemoveRestriction = (countryCode) => {
    const code = countryCode.toUpperCase();
    const nextRestricted = currentRestricted.filter((c) => c !== code);
    emitChange(nextRestricted);
  };

  // Add a country to the restricted list
  const handleAddRestriction = (countryCode) => {
    const code = countryCode.toUpperCase();
    if (currentRestricted.includes(code)) return;
    const nextRestricted = [...currentRestricted, code];
    setSearch("");
    emitChange(nextRestricted);
  };

  // Clear all restrictions (re-allow everywhere)
  const handleClearAllRestrictions = () => {
    emitChange([], "");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 mt-4 space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <FaGlobe className="text-primary text-base" />
          <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
            Regional Country Restrictions
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {currentRestricted.length === 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-full">
              <FaCheckCircle className="text-green-600 text-xs" />
              Available Worldwide
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-full">
              <FaBan className="text-red-500 text-xs" />
              {currentRestricted.length} {currentRestricted.length === 1 ? "Country" : "Countries"} Restricted
            </span>
          )}
        </div>
      </div>

      {/* Section 1: Currently Restricted Countries (Visible at a glance for easy re-allowing) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Currently Restricted Countries:
          </label>
          {currentRestricted.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllRestrictions}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer transition"
            >
              Re-allow All Countries
            </button>
          )}
        </div>

        {restrictedCountryObjects.length === 0 ? (
          <div className="p-3.5 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center">
            <p className="text-xs text-gray-500">
              No countries are restricted. This product is active and purchasable worldwide.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 p-3 bg-red-50/50 border border-red-100 rounded-xl">
            {restrictedCountryObjects.map((country) => (
              <span
                key={country.code}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-red-200 rounded-lg shadow-2xs text-xs font-medium text-gray-800 transition-all hover:border-red-300"
              >
                <img
                  src={`https://flagcdn.com/24x18/${country.code.toLowerCase()}.png`}
                  srcSet={`https://flagcdn.com/48x36/${country.code.toLowerCase()}.png 2x`}
                  width="18"
                  height="14"
                  alt={country.code}
                  loading="lazy"
                  className="w-4 h-3 object-cover rounded-2xs border border-gray-200 shrink-0"
                />
                <span className="font-medium text-gray-900">{country.name}</span>
                <span className="text-[10px] text-gray-400 font-mono">({country.code})</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRestriction(country.code)}
                  title={`Re-allow sales in ${country.name}`}
                  className="ml-1 inline-flex items-center gap-1 text-[11px] text-red-600 hover:text-white hover:bg-red-600 bg-red-100/70 font-semibold px-2 py-0.5 rounded transition cursor-pointer"
                >
                  <FaTimes className="text-[9px]" />
                  <span>Re-allow</span>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Add Countries to Restrict */}
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Add a Country to Restrict:
        </label>

        {/* Live Search Input */}
        <div className="relative">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type country name or code to restrict (e.g. United Arab Emirates, Japan, France)..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
            >
              <FaTimes className="text-xs" />
            </button>
          )}

          {/* Search Results Dropdown */}
          {search.trim() && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-gray-50">
              {searchResults.length === 0 ? (
                <div className="p-3 text-center text-xs text-gray-400">
                  No un-restricted country found matching "{search}"
                </div>
              ) : (
                searchResults.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleAddRestriction(country.code)}
                    className="w-full flex items-center justify-between p-2.5 hover:bg-red-50/60 text-left transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={`https://flagcdn.com/24x18/${country.code.toLowerCase()}.png`}
                        srcSet={`https://flagcdn.com/48x36/${country.code.toLowerCase()}.png 2x`}
                        width="20"
                        height="15"
                        alt={country.code}
                        loading="lazy"
                        className="w-5 h-3.5 object-cover rounded-2xs border border-gray-200 shrink-0"
                      />
                      <span className="text-xs font-medium text-gray-800">{country.name}</span>
                      <span className="text-[10px] text-gray-400 uppercase font-mono">
                        ({country.code})
                      </span>
                    </div>
                    <span className="text-xs text-red-600 font-semibold px-2 py-0.5 rounded bg-red-100/60">
                      + Restrict
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Custom Notice Message */}
      {currentRestricted.length > 0 && (
        <div className="pt-2 border-t border-gray-100">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Custom Unavailable Notice (Optional)
          </label>
          <input
            type="text"
            value={unavailableNotice}
            onChange={(e) => emitChange(currentRestricted, e.target.value)}
            placeholder="e.g. Not available for sale in UAE"
            className="w-full text-xs p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          />
          <p className="text-[11px] text-gray-400 mt-1">
            If left blank, storefront displays "Not available for sale in [Country Name]".
          </p>
        </div>
      )}
    </div>
  );
};

export default RegionalAvailabilitySelector;
