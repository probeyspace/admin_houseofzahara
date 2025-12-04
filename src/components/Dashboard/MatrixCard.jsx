import { Link } from "react-router-dom";

const MetricsCard = ({
  to,
  title,
  value,
  percentage,
  processingRevenue,
  cancelledRevenue,
  revenuePercentage,
}) => {
  return (
    <Link
      to={to}
      className="p-6 rounded-md shadow-md text-gray-700 bg-white transition duration-450 group"
    >
      <div
        className="flex justify-between align-center group-hover:text-dark transition duration-300 w-full"
        style={{
          backgroundColor: "transparent",
        }}
      >
        <div
          className="group-hover:text-dark"
          style={{
            width: "100%",
            backgroundColor: "transparent",
          }}
        >
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex justify-between">
            <div className="flex gap-2">
              <p className="text-3xl font-bold mt-2">
                {title === "Actual Revenue(Delivered & Paid)" ? "$" : ""}
                {value}
              </p>
              {percentage > 0 && (
                <p className="text-sm mt-5 group-hover:text-dark transition duration-300">
                  {percentage.toFixed(2)}%
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {processingRevenue > 0 && (
                <div className="group-hover:text-dark">
                  <p className="text-2xl font-bold mt-2">
                    ${processingRevenue}
                  </p>
                </div>
              )}
              {cancelledRevenue > 0 && (
                <div className="group-hover:text-dark">
                  <p className="text-2xl font-bold mt-2">${cancelledRevenue}</p>
                </div>
              )}
              {revenuePercentage > 0 && (
                <p className="text-xs mt-5 group-hover:text-dark transition duration-300">
                  {revenuePercentage.toFixed(2)}%
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between"></div>

      <style>
        {`
      .group:hover {
        background-color: #e8d6b2;
      }
    `}
      </style>
    </Link>
  );
};

export default MetricsCard;
