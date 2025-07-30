import React from "react";
import { Link } from "react-router-dom";

const MetricsCard = ({
  to,
  title,
  value,
  percentage,
  processingRevenue,
  cancelledRevenue,
  trend,
  color,
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
          <p className="text-2xl font-bold mt-2">
            {title === "Actual Revenue" ? "₹" : ""}
            {value}
          </p>
        </div>

        {processingRevenue > 0 && (
          <div className="group-hover:text-dark">
            <h3 className="text-lg font-semibold">Pending</h3>
            <p className="text-2xl font-bold mt-2">₹{processingRevenue}</p>
          </div>
        )}

        {cancelledRevenue > 0 && (
          <div className="group-hover:text-dark">
            <h3 className="text-lg font-semibold">Cancelled</h3>
            <p className="text-2xl font-bold mt-2">₹{cancelledRevenue}</p>
          </div>
        )}
      </div>

      {percentage && (
        <p className="text-sm mt-1 group-hover:text-dark transition duration-300">
          {percentage.toFixed(2)}% {trend}
        </p>
      )}

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
