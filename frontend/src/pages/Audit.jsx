import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/axios";

export default function Audit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);

      const res = await API.get("/audit");

      setLogs(res.data);
    } catch (err) {
      console.error(err);

      setError("Failed to load audit trail.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <Layout>
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Audit Trail</h1>

          {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

          {loading && (
            <div className="mb-4 text-gray-600 text-sm">
              Loading audit trail...
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">User</th>

                  <th className="px-4 py-3 text-left">Action</th>

                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>

              <tbody>
                {logs.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="3" className="text-center text-gray-400 py-8">
                      No audit records found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.audit_id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">{log.user_name}</td>

                      <td className="px-4 py-3">{log.action}</td>

                      <td className="px-4 py-3">
                        {log.created_at?.slice(0, 10)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
