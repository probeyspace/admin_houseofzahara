import React from "react";
import { useBrand } from "../../Hooks/useBrand";

const ProductDetails = ({ productData, handleChange, categories }) => {
  const { brands } = useBrand();

  return (
    <div className="p-6 border border-gray-300 rounded-lg bg-gray-50 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">
        Product Details
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Product Name */}
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={productData.name}
          onChange={handleChange}
          required
          className="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400 w-full"
        />

        {/* Brand Name Dropdown */}
        <div className="relative">
          <select
            name="brandName"
            value={productData.brandName}
            onChange={handleChange}
            required
            className="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400 w-full bg-white"
          >
            <option value="">Select Brand</option>
            {brands?.map((brand) => (
              <option key={brand.id} value={brand.name}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Type */}
        <select
          name="productType"
          value={productData.productType}
          onChange={handleChange}
          required
          className="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400 w-full"
        >
          <option value="">Select Product Type</option>
          <option value="VEG">Veg</option>
          <option value="NON_VEG">Non-Veg</option>
        </select>

        {/* Department Checkboxes */}
        <div className="flex flex-wrap gap-4 mt-2">
          {["men", "women", "kid", "unisex"].map((dept) => (
            <label key={dept} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={dept}
                checked={productData.department?.split(",").includes(dept)}
                onChange={(e) => {
                  const selected = productData.department
                    ? productData.department.split(",").filter(Boolean)
                    : [];

                  if (e.target.checked) {
                    selected.push(dept);
                  } else {
                    const index = selected.indexOf(dept);
                    if (index > -1) selected.splice(index, 1);
                  }

                  handleChange({
                    target: {
                      name: "department",
                      value: selected.join(","),
                    },
                  });
                }}
                className="accent-blue-500"
              />
              <span className="capitalize">{dept}</span>
            </label>
          ))}
        </div>

        {/* Category Dropdown */}
        <div className="relative">
          <select
            name="categoryId"
            value={productData.categoryId}
            onChange={handleChange}
            required
            className="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400 w-full bg-white"
          >
            <option value="">Select Category</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <textarea
        name="description"
        placeholder="Description"
        value={productData.description}
        onChange={handleChange}
        required
        className="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400 w-full h-24 mt-4"
      />
    </div>
  );
};

export default ProductDetails;
