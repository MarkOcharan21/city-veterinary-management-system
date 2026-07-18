import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/axios";

export default function Drafts() {
  const [drafts, setDrafts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDrafts = async () => {
    try {
      setLoading(true);

      const res = await API.get("/drafts");

      setDrafts(res.data);
    } catch (err) {
      console.error(err);

      setError("Failed to load draft registrations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Draft Registrations</h1>

        {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

        {loading && (
          <div className="mb-4 text-yellow-600 text-sm">
            Loading draft registrations...
          </div>
        )}

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-yellow-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Owner</th>

                <th className="px-4 py-3 text-left">Pet</th>

                <th className="px-4 py-3 text-left">Species</th>

                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {drafts.length === 0 && !loading ? (
                <tr>
                  <td colSpan="4" className="text-center text-gray-400 py-8">
                    No draft registrations found.
                  </td>
                </tr>
              ) : (
                drafts.map((draft) => (
                  <tr key={draft.draft_id} className="border-t">
                    <td className="px-4 py-3">{draft.owner_name}</td>

                    <td className="px-4 py-3">{draft.pet_name}</td>

                    <td className="px-4 py-3">{draft.species}</td>

                    <td className="px-4 py-3">{draft.sync_status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
