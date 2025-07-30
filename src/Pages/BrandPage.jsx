import React, { useState } from "react";
import BrandList from "../components/Brands/BrandList";
import CreateBrandModal from "../components/Brands/CreateBrandModal";
import { useBrand } from "../Hooks/useBrand";

const BrandPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { fetchBrands } = useBrand();

  return (
    <div>
      <BrandList />
      <CreateBrandModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        fetchBrands={fetchBrands}
      />
    </div>
  );
};

export default BrandPage;
