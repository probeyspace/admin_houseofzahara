import { useEffect, useState } from "react";
import api from "../../Api/api";
import { FaTrash } from "react-icons/fa6";
import { BiTrash } from "react-icons/bi";
import { FiDownload, FiRefreshCcw } from "react-icons/fi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const SearchedLogs = () => {
  const [logs, setLogs] = useState([]);
  const [groupedLogs, setGroupedLogs] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortMode, setSortMode] = useState("recent"); // or 'most-searched'

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get("/searchLogs");
      const logsData = response.data.data;
      setLogs(logsData);
      setGroupedLogs(groupLogs(logsData));
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  const groupLogs = (logs) => {
    const map = {};

    for (const log of logs) {
      // Group by first 5 characters (can adjust to 4 or exact match)
      const key = log.text?.trim().toLowerCase().slice(0, 5) || "";

      if (!map[key]) {
        map[key] = {
          text: log.text,
          count: 1,
        };
      } else {
        map[key].count++;
      }
    }

    const grouped = Object.values(map);
    return grouped.sort((a, b) => b.count - a.count);
  };

  const exportToExcel = () => {
    if (!logs.length) return;

    const worksheet = XLSX.utils.json_to_sheet(
      logs.map((log, index) => ({
        "S.No": index + 1,
        "Log ID": log.id,
        "Searched Text": log.text,
      }))
    );

    worksheet["!cols"] = [{ wch: 6 }, { wch: 40 }, { wch: 40 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Search Logs");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(data, "search-logs.xlsx");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this log?")) {
      try {
        await api.delete(`/searchLogs/${id}`);
        fetchLogs();
      } catch (error) {
        console.error("Error deleting log:", error);
      }
    }
  };

  const handleClearList = async () => {
    if (window.confirm("Are you sure you want to delete all logs?")) {
      try {
        await api.delete("/searchLogs");
        fetchLogs();
      } catch (error) {
        console.error("Error deleting all logs:", error);
      }
    }
  };

  const handleRefreshList = async () => {
    setIsRefreshing(true);
    try {
      await fetchLogs();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 bg-white shadow-md rounded-lg">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Searched Logs</h2>

        <div className="flex gap-2">
          <button
            className="bg-primary text-white hover:bg-primary/80 py-2 px-4 rounded-md cursor-pointer"
            onClick={() =>
              setSortMode((prev) =>
                prev === "recent" ? "most-searched" : "recent"
              )
            }
          >
            {sortMode === "recent" ? "Most Searched" : "Recent"}
          </button>

          <button
            title="Refresh"
            className="bg-primary hover:bg-primary/80 text-white py-2.5 px-5 rounded-md cursor-pointer"
            onClick={handleRefreshList}
            disabled={isRefreshing}
          >
            <FiRefreshCcw
              className={`text-lg ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>

          <button
            title="Clear All"
            className="bg-primary hover:bg-primary/80 text-white py-2.5 px-5 rounded-md cursor-pointer"
            onClick={handleClearList}
          >
            <FaTrash className="text-lg" />
          </button>

          <button
            title="Export Logs"
            className="bg-primary hover:bg-primary/80 text-white py-2.5 px-5 rounded-md cursor-pointer"
            onClick={exportToExcel}
          >
            <FiDownload className="text-lg" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full rounded-lg shadow-md">
          <thead className="bg-gray-200 text-slate-600">
            <tr className="text-left">
              <th className="p-3">#</th>
              <th className="p-3">Searched Text</th>
              {sortMode === "most-searched" && <th className="p-3">Count</th>}
              <th className="p-3 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {sortMode === "most-searched"
              ? groupedLogs.map((log, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-100 text-gray-500 text-sm"
                  >
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{log.text}</td>
                    <td className="p-3">{log.count}</td>
                    <td className="p-3 px-4 text-right text-gray-400">--</td>
                  </tr>
                ))
              : logs.map((log, index) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-100 text-gray-500 text-sm"
                  >
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{log?.text}</td>
                    <td className="p-3 px-4 text-right">
                      <button
                        title="Delete Log"
                        className="text-primary hover:text-primary/50 cursor-pointer"
                        onClick={() => handleDelete(log.id)}
                      >
                        <BiTrash size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SearchedLogs;
