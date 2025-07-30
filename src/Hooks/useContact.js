import { useEffect, useState } from "react";
import api from "../Api/api";

export const useContact = () => {
  const [data, setData] = useState(null);
  const [subscribers, setSubscribers] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/contact");
        setData(response?.data.data);
      } catch (error) {
        console.log(error);
      }
    };
    const fetchSubscribers = async () => {
      try {
        const response = await api.get("/contact/subscribers");
        setSubscribers(response?.data.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
    fetchSubscribers();
  }, []);

  return { contacts: data, setData, subscribers, setSubscribers };
};
