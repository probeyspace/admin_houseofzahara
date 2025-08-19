import { useEffect, useState } from "react";
import api from "../Api/api";

export const useMonthlyReport = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/reports/monthly");
        setData(response.data.data);
      } catch (error) {
        console.error("Error fetching weekly report:", error);
      }
    };
    fetchData();
  }, []);

  return { data };
};
