import { useSelector } from "react-redux";
import MetricsCard from "../components/Dashboard/MatrixCard";
import MonthlySalesReport from "../components/Dashboard/MonthlySalesReport";
import WeeklySalesReport from "../components/Dashboard/WeeklySalesReport";
import YearlySalesReport from "../components/Dashboard/YearlySalesReport";
import useUsers from "../Hooks/useUsers";
import useProducts from "../Hooks/useProducts";
import { useCategory } from "../Hooks/useCategory";
import { useMasterCategory } from "../Hooks/useMasterCategory";
import { useSubCategory } from "../Hooks/useSubCategory";
const DashboardPage = () => {
  useUsers();
  useCategory();
  useProducts();
  useMasterCategory();
  useSubCategory();
  // useOrders();
  const orders = useSelector((state) => state.orders);
  const products = useSelector((store) => store.products);
  const pendingOrders = orders.filter((order) => order.status === "PENDING");
  // processing order
  const processingOrders = orders.filter(
    (order) => order.status === "PROCESSING"
  );
  const processingOrdersRevenue = processingOrders.reduce(
    (total, order) => total + order.totalPrice,
    0
  );

  const totalOrders = orders?.length;
  const percentageOfPendingOrders =
    (pendingOrders?.length / totalOrders) * 100 || 0;

  // in this revenue should be only for delivered orders status not every order
  const deliveredOrders = orders.filter(
    (order) => order.status === "DELIVERED"
  );
  const deliveredOrdersRevenue = deliveredOrders.reduce(
    (total, order) => total + order.totalPrice,
    0
  );
  // const revenue = orders.reduce((total, order) => total + order.totalPrice, 0);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
        <MetricsCard
          to={"/orders"}
          title="Pending Orders"
          value={pendingOrders.length || 0}
          percentage={percentageOfPendingOrders}
          color="#7d1e0c"
        />
        <MetricsCard
          to={"/orders"}
          title="ORDERS"
          value={orders?.length}
          color="#7d1e0c"
        />
        <MetricsCard
          to={"/orders"}
          title="Actual Revenue"
          value={deliveredOrdersRevenue}
          processingRevenue={processingOrdersRevenue}
          color="#7d1e0c"
        />
        <MetricsCard
          to={"/products"}
          title="PRODUCTS"
          value={products?.length}
          color="#3BC0C3"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <WeeklySalesReport />
        <YearlySalesReport />
      </div>

      <div className="mt-8">
        <MonthlySalesReport />
      </div>
    </>
  );
};

export default DashboardPage;
