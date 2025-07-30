import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useWeeklyReport } from "../../Hooks/useWeeklyReport";

const WeeklySalesReport = () => {
  const { data } = useWeeklyReport();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Weekly Revenue Report
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="revenue" fill="#902414" name="Revenue" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklySalesReport;
