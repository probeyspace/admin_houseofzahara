import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useYearlyReport } from "../../Hooks/useYearlyReport";

const YearlySalesReport = () => {
  const { data } = useYearlyReport();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Yearly Sales Report
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="sales" stroke="#902414" name="Sales" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default YearlySalesReport;
