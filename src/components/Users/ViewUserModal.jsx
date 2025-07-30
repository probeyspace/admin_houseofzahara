const ViewUserModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null; // Hide modal if not open or user is not selected
  const cartCount = user.cart?.length || 0; // Get cart count or default to 0 if user has no cart items
  const orderCount = user.orders?.length || 0; // Get order count or default to 0 if user has no orders
  const wishlistCount = user.wishlist?.length || 0; // Get wishlist count or default to 0 if user has no wishlist items
  const addressCount = user.addresses?.length || 0;
  const reviewsCount = user.reviews?.length || 0;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="bg-white p-5 rounded-lg shadow-lg w-96">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-xl font-semibold">User Details</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-red-600 text-2xl cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* User Details */}
        <div className="space-y-3 text-gray-700">
          <p>
            <span className="font-semibold">Name:</span> {user.name}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {user.email}
          </p>
          <p>
            <span className="font-semibold">Phone:</span> {user.phone || "—"}
          </p>
          <p>
            <span className="font-semibold">Role:</span> {user.role}
          </p>
          <p>
            <span className="font-semibold">Created At:</span>{" "}
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
          <hr />
          <p>
            <span className="font-semibold">Cart Items:</span> {cartCount}
          </p>
          <p>
            <span className="font-semibold">Orders:</span> {orderCount}
          </p>
          <p>
            <span className="font-semibold">Wishlist:</span> {wishlistCount}
          </p>
          <p>
            <span className="font-semibold">Reviews:</span> {reviewsCount}
          </p>
          <p>
            <span className="font-semibold">Addresses:</span> {addressCount}
          </p>
        </div>
        {/* Close Button */}
        <div className="mt-2 flex justify-end">
          <button
            onClick={onClose}
            className="bg-primary hover:bg-primary/80 text-white px-4 py-1 rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;
