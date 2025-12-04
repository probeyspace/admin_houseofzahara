import { useSelector } from "react-redux";
import MetricsCard from "../components/Dashboard/MatrixCard";
import MonthlySalesReport from "../components/Dashboard/MonthlySalesReport";
import WeeklySalesReport from "../components/Dashboard/WeeklySalesReport";
import YearlySalesReport from "../components/Dashboard/YearlySalesReport";

const DashboardPage = () => {
  const orders = useSelector((state) => state.orders);
  const products = useSelector((store) => store.products);
  const users = useSelector((store) => store.users);
  const totalOrders = orders?.length;

  //pending processing orders
  const pendingProcessingOrders = orders.filter(
    (order) =>
      order.status === "PENDING" ||
      order.status === "PROCESSING" ||
      order.status === "SHIPPED"
  );
  const processingOrdersRevenue = pendingProcessingOrders.reduce(
    (total, order) => total + parseFloat(order.totalPrice?.$numberDecimal || 0),
    0
  );
  //cancelled orders
  const cancelledOrders = orders.filter(
    (order) => order.status === "CANCELLED"
  );
  const cancelledOrdersRevenue = cancelledOrders.reduce(
    (total, order) => total + parseFloat(order.totalPrice?.$numberDecimal || 0),
    0
  );

  // ✅ Only delivered & paid orders count as actual revenue
  const deliveredOrders = orders.filter(
    (order) =>
      order.status === "DELIVERED" && order.payment?.paymentStatus === "SUCCESS"
  );
  const deliveredOrdersRevenue = deliveredOrders.reduce(
    (total, order) => total + parseFloat(order.totalPrice?.$numberDecimal || 0),
    0
  );

  // total orders revenue
  const grossRevenue = orders.reduce(
    (total, order) => total + parseFloat(order.totalPrice?.$numberDecimal || 0),
    0
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
        <MetricsCard
          to={"/orders"}
          title="Processing Orders"
          value={pendingProcessingOrders.length || 0}
          percentage={(100 / totalOrders) * pendingProcessingOrders?.length}
          processingRevenue={processingOrdersRevenue.toFixed(2)}
          revenuePercentage={(processingOrdersRevenue / grossRevenue) * 100}
          color="#7d1e0c"
        />
        <MetricsCard
          to={"/orders?status=CANCELLED"}
          title="Cancelled Orders"
          value={cancelledOrders?.length || 0}
          percentage={(100 / totalOrders) * cancelledOrders?.length}
          cancelledRevenue={cancelledOrdersRevenue.toFixed(2)}
          revenuePercentage={(cancelledOrdersRevenue / grossRevenue) * 100}
          color="#7d1e0c"
        />
        <MetricsCard
          to={"/orders?status=DELIVERED"}
          title="Delivered & Paid (Actual Revenue)"
          value={deliveredOrders?.length || 0}
          percentage={(100 / totalOrders) * deliveredOrders?.length}
          processingRevenue={deliveredOrdersRevenue.toFixed(2)}
          revenuePercentage={(deliveredOrdersRevenue / grossRevenue) * 100}
          color="#7d1e0c"
        />
        <MetricsCard
          to={"/orders"}
          title="Total Orders"
          value={orders?.length}
          processingRevenue={grossRevenue.toFixed(2)}
          color="#7d1e0c"
        />
        <MetricsCard
          to={"/products"}
          title="Total Products"
          value={products?.length}
          color="#3BC0C3"
        />
        <MetricsCard
          to={"/users"}
          title="Total Users"
          value={users?.length - 1} //exclude admin
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
