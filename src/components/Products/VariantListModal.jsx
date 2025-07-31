import Modal from "../../common/Modal";

function VariantListModal({ isOpen, onClose, variants }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Product Variants">
      <div className="overflow-x-auto">
        {variants?.length > 0 ? (
          <table className="w-full text-sm text-gray-700 border">
            <thead className="bg-gray-100 text-xs uppercase font-semibold">
              <tr>
                <th className="p-2 text-left border">SKU</th>
                <th className="p-2 text-left border">Size</th>
                <th className="p-2 text-left border">Shade</th>
                <th className="p-2 text-left border">Price</th>
                <th className="p-2 text-left border">Discount</th>
                <th className="p-2 text-left border">Stock</th>
                <th className="p-2 text-left border">Images</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => (
                <tr key={variant._id} className="border-b hover:bg-gray-50">
                  <td className="p-2 border">{variant.sku}</td>
                  <td className="p-2 border">{variant.size}</td>
                  <td className="p-2 border">{variant.shade}</td>
                  <td className="p-2 border">
                    ₹{Number(variant.price?.$numberDecimal || variant.price)}
                  </td>
                  <td className="p-2 border">
                    ₹
                    {Number(
                      variant.discountPrice?.$numberDecimal ||
                        variant.discountPrice
                    )}
                  </td>
                  <td className="p-2 border">{variant.stock}</td>
                  <td className="p-2 border">
                    <div className="flex gap-1 overflow-x-auto max-w-[120px] scrollbar-thin">
                      {variant.images?.map((img) => (
                        <img
                          key={img._id}
                          src={img.url}
                          alt="variant"
                          className="w-8 h-8 rounded object-cover shrink-0"
                        />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 p-4 text-sm">
            No variants available for this product.
          </p>
        )}
      </div>
    </Modal>
  );
}

export default VariantListModal;
