import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/axios";

export default function SystemRecords() {
  const [pets, setPets] = useState([]);
  const [payments, setPayments] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [petsRes, paymentsRes, vaccinationsRes] = await Promise.all([
        API.get("/pets"),
        API.get("/payments"),
        API.get("/vaccinations"),
      ]);

      setPets(petsRes.data);
      setPayments(paymentsRes.data);
      setVaccinations(vaccinationsRes.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load system records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout>
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">System Records</h1>

          <button
            onClick={fetchData}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            Refresh
          </button>
        </div>

        {loading && (
          <div className="text-blue-600 text-sm">Loading system records...</div>
        )}

        {error && <div className="text-red-500 text-sm">{error}</div>}

        {/* SUMMARY CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-600 text-white rounded-2xl p-6 shadow">
            <h2 className="text-sm opacity-80">Total Pets</h2>

            <p className="text-4xl font-bold mt-2">{pets.length}</p>
          </div>

          <div className="bg-green-600 text-white rounded-2xl p-6 shadow">
            <h2 className="text-sm opacity-80">Total Payments</h2>

            <p className="text-4xl font-bold mt-2">{payments.length}</p>
          </div>

          <div className="bg-red-600 text-white rounded-2xl p-6 shadow">
            <h2 className="text-sm opacity-80">Vaccinations</h2>

            <p className="text-4xl font-bold mt-2">{vaccinations.length}</p>
          </div>
        </div>

        {/* RECENT PETS */}

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="bg-blue-700 text-white px-5 py-3 font-semibold">
            Recent Pet Registrations
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Pet Name</th>

                <th className="px-4 py-3 text-left">Species</th>

                <th className="px-4 py-3 text-left">Breed</th>
              </tr>
            </thead>

            <tbody>
              {pets.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center text-gray-400 py-8">
                    No pet records found.
                  </td>
                </tr>
              ) : (
                pets.slice(0, 5).map((pet) => (
                  <tr key={pet.pet_id} className="border-t">
                    <td className="px-4 py-3">{pet.name}</td>

                    <td className="px-4 py-3">{pet.species}</td>

                    <td className="px-4 py-3">{pet.breed}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* RECENT PAYMENTS */}

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="bg-green-700 text-white px-5 py-3 font-semibold">
            Recent Payments
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Amount</th>

                <th className="px-4 py-3 text-left">Status</th>

                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>

            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center text-gray-400 py-8">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.slice(0, 5).map((payment) => (
                  <tr key={payment.payment_id} className="border-t">
                    <td className="px-4 py-3">
                      ₱{Number(payment.amount || 0).toLocaleString()}
                    </td>

                    <td className="px-4 py-3">{payment.payment_status}</td>

                    <td className="px-4 py-3">
                      {(payment.payment_date || payment.paid_at)?.slice(0, 10)}
                    </td>
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
