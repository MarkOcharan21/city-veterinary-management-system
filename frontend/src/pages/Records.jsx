// Clinical Records Page — Developed by Andrei Vincent Parala

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../api/axios";

const emptyForm = {
  pet_id: "",
  vet_id: "",
  visit_date: "",
  diagnosis: "",
  treatment: "",
  notes: "",
};

export default function Records() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [medicines, setMedicines] = useState({});
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    try {
      setLoading(true);

      const pets = await API.get("/pets");

      const results = await Promise.all(
        pets.data.map((p) => API.get(`/records/clinical/${p.pet_id}`)),
      );

      const all = results.flatMap((res, i) =>
        res.data.map((c) => ({
          ...c,
          pet_name: pets.data[i].name,
        })),
      );

      setRecords(
        all.sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date)),
      );
    } catch (err) {
      console.error(err);
      setError("Failed to load clinical records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      await API.post("/records/clinical", form);

      setForm(emptyForm);
      setShowForm(false);

      await fetchAll();
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Failed to save record.");
    } finally {
      setSaving(false);
    }
  };

  const toggleExpand = async (record) => {
    if (expanded === record.clinical_id) {
      setExpanded(null);
      return;
    }

    setExpanded(record.clinical_id);

    if (!medicines[record.clinical_id]) {
      try {
        const res = await API.get(`/records/medicine/${record.clinical_id}`);

        setMedicines((prev) => ({
          ...prev,
          [record.clinical_id]: res.data,
        }));
      } catch (err) {
        console.error(err);
        alert("Failed to load medicines.");
      }
    }
  };

  const filtered = records.filter(
    (r) =>
      r.pet_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.diagnosis?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Clinical Records</h1>

          <button
            onClick={() => {
              setError("");
              setShowForm(true);
            }}
            className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            + Add Clinical Record
          </button>
        </div>

        <input
          type="text"
          placeholder="Search by pet name or diagnosis..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        {loading && (
          <div className="mb-4 text-yellow-600 text-sm">
            Loading clinical records...
          </div>
        )}

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
              No records found.
            </div>
          ) : (
            filtered.map((r) => (
              <div
                key={r.clinical_id}
                className="bg-white rounded-xl shadow overflow-hidden"
              >
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleExpand(r)}
                >
                  <div>
                    <p className="font-medium text-gray-800">{r.pet_name}</p>

                    <p className="text-sm text-gray-500">
                      {r.visit_date?.slice(0, 10)} · {r.diagnosis}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{r.vet_name}</span>

                    <span className="text-gray-400">
                      {expanded === r.clinical_id ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {expanded === r.clinical_id && (
                  <div className="border-t px-5 py-4 bg-gray-50 text-sm space-y-2">
                    <p>
                      <span className="font-medium text-gray-600">
                        Treatment:
                      </span>{" "}
                      {r.treatment}
                    </p>

                    <p>
                      <span className="font-medium text-gray-600">Notes:</span>{" "}
                      {r.notes}
                    </p>

                    <div className="mt-3">
                      <p className="font-medium text-gray-600 mb-2">
                        Medicines Prescribed:
                      </p>

                      {medicines[r.clinical_id]?.length > 0 ? (
                        <table className="w-full text-xs border rounded-lg overflow-hidden">
                          <thead className="bg-yellow-50 text-yellow-800">
                            <tr>
                              <th className="px-3 py-2 text-left">Medicine</th>
                              <th className="px-3 py-2 text-left">Dosage</th>
                              <th className="px-3 py-2 text-left">Frequency</th>
                            </tr>
                          </thead>

                          <tbody>
                            {medicines[r.clinical_id].map((m) => (
                              <tr key={m.medicine_id} className="border-t">
                                <td className="px-3 py-2">{m.medicine_name}</td>

                                <td className="px-3 py-2">{m.dosage}</td>

                                <td className="px-3 py-2">{m.frequency}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-gray-400">No medicines recorded.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Add Clinical Record
              </h2>

              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

              <form onSubmit={handleSubmit} className="space-y-3">
                {" "}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Pet ID", name: "pet_id" },
                    { label: "Vet ID", name: "vet_id" },
                  ].map((f) => (
                    <div key={f.name}>
                      <label className="text-xs text-gray-600">{f.label}</label>

                      <input
                        name={f.name}
                        value={form[f.name]}
                        onChange={handleChange}
                        required
                        className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                  ))}

                  <div className="col-span-2">
                    <label className="text-xs text-gray-600">Visit Date</label>

                    <input
                      type="date"
                      name="visit_date"
                      value={form.visit_date}
                      onChange={handleChange}
                      required
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>

                  {["diagnosis", "treatment", "notes"].map((f) => (
                    <div key={f} className="col-span-2">
                      <label className="text-xs text-gray-600 capitalize">
                        {f}
                      </label>

                      <textarea
                        name={f}
                        value={form[f]}
                        onChange={handleChange}
                        rows={2}
                        className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg text-sm transition disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Record"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Discard this clinical record?")) {
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
