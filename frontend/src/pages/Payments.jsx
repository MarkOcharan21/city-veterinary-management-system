// Payment Monitoring Page — Developed by KB Trinidad

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../api/axios";

const emptyForm = {
  pet_id: "",
  cashier_id: "",
  or_number: "",
  amount: "",
  purpose: "",
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  verified: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const res = await API.get("/payments");

      setPayments(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      await API.post("/payments", form);

      await fetchPayments();

      setForm(emptyForm);

      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record payment.");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/payments/${id}`, {
        payment_status: status,
      });

      await fetchPayments();
    } catch (err) {
      console.error(err);

      alert(err.response?.data?.message || "Failed to update payment.");
    }
  };

  const filtered = payments.filter(
    (p) =>
      p.or_number?.toLowerCase().includes(search.toLowerCase()) ||
      p.pet_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.purpose?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Payment Monitoring
          </h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            + Record Payment
          </button>
        </div>

        <input
          type="text"
          placeholder="Search by OR number, pet, or purpose..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />

        {loading && (
          <div className="mb-4 text-purple-600 text-sm">Loading...</div>
        )}

        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-purple-50 text-purple-800 text-left">
              <tr>
                <th className="px-4 py-3">OR Number</th>
                <th className="px-4 py-3">Pet</th>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-gray-400 py-8">
                    No payments found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.payment_id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">
                      {p.or_number}
                    </td>
                    <td className="px-4 py-3">{p.pet_name}</td>
                    <td className="px-4 py-3">{p.purpose}</td>
                    <td className="px-4 py-3">
                      ₱{Number(p.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[p.payment_status]}`}
                      >
                        {p.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {p.paid_at?.slice(0, 10)}
                    </td>
                    <td className="px-4 py-3">
                      {p.payment_status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (window.confirm("Verify this payment?")) {
                                updateStatus(p.payment_id, "verified");
                              }
                            }}
                            className="text-xs text-green-600 hover:underline"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm("Reject this payment?")) {
                                updateStatus(p.payment_id, "rejected");
                              }
                            }}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Record Payment
              </h2>
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Pet ID", name: "pet_id" },
                    { label: "Cashier ID", name: "cashier_id" },
                    { label: "OR Number", name: "or_number" },
                    { label: "Amount (₱)", name: "amount", type: "number" },
                    { label: "Purpose", name: "purpose" },
                  ].map((f) => (
                    <div key={f.name}>
                      <label className="text-xs text-gray-600">{f.label}</label>
                      <input
                        type={f.type || "text"}
                        name={f.name}
                        value={form[f.name]}
                        onChange={handleChange}
                        required
                        className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm transition disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Payment"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Discard this payment record?")) {
                        setShowForm(false);
                        setError("");
                        setForm(emptyForm);
                      }
                    }}
                    className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
