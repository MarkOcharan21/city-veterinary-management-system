// Vaccination Records Page — Developed by Andrei Vincent Parala

import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/axios";

const emptyForm = {
  pet_id: "",
  veterinarian_id: "",
  vaccine_name: "",
  date_given: "",
  next_due_date: "",
  remarks: "",
};

export default function Vaccinations() {
  const [records, setRecords] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [pets, setPets] = useState([]);
  const [vets, setVets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ============================================
  // LOAD PETS
  // ============================================
  const fetchPets = async () => {
    const res = await API.get("/pets");
    setPets(res.data);
  };

  // ============================================
  // LOAD VETERINARIANS
  // ============================================
  const fetchVeterinarians = async () => {
    const res = await API.get("/users");

    setVets(res.data.filter((user) => user.role === "veterinarian"));
  };

  // ============================================
  // LOAD VACCINATIONS
  // ============================================
  const fetchVaccinations = async () => {
    const res = await API.get("/vaccinations");

    setRecords(res.data);
  };

  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true);

        await Promise.all([
          fetchVaccinations(),
          fetchPets(),
          fetchVeterinarians(),
        ]);
      } catch (err) {
        console.error(err);

        setError("Failed to load vaccination records.");
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      if (editingRecord) {
        await API.put(`/vaccinations/${editingRecord.vaccination_id}`, {
          vaccine_name: form.vaccine_name,
          date_given: form.date_given,
          next_due_date: form.next_due_date,
          remarks: form.remarks,
        });
      } else {
        await API.post("/vaccinations", form);
      }

      setEditingRecord(null);

      setForm(emptyForm);

      setShowForm(false);

      await fetchVaccinations();
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Failed to save vaccination.");
    } finally {
      setSaving(false);
    }
  };

  const filtered = records.filter(
    (r) =>
      r.pet_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.vaccine_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.veterinarian_name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Vaccination Records
          </h1>
          <button
            onClick={() => {
              setEditingRecord(null);
              setForm(emptyForm);
              setError("");
              setShowForm(true);
            }}
          >
            <h2>{editingRecord ? "Edit Vaccination" : "Record Vaccination"}</h2>
          </button>
        </div>

        <input
          type="text"
          placeholder="Search by pet, vaccine, or veterinarian..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-green-400"
        />

        {loading && (
          <div className="mb-4 text-green-600 text-sm">
            Loading vaccination records...
          </div>
        )}

        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-green-50 text-green-800 text-left">
              <tr>
                <th className="px-4 py-3">Pet</th>
                <th className="px-4 py-3">Vaccine</th>
                <th className="px-4 py-3">Date Given</th>
                <th className="px-4 py-3">Next Due</th>
                <th className="px-4 py-3">Veterinarian</th>
                <th className="px-4 py-3">Remarks</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-gray-400 py-8">
                    No records found.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr
                    key={v.vaccination_id}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium">{v.pet_name}</td>

                    <td className="px-4 py-3">{v.vaccine_name}</td>

                    <td className="px-4 py-3">{v.date_given?.slice(0, 10)}</td>

                    <td className="px-4 py-3">
                      {v.next_due_date?.slice(0, 10)}
                    </td>

                    <td className="px-4 py-3">{v.veterinarian_name}</td>

                    <td className="px-4 py-3 text-gray-500">{v.remarks}</td>

                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingRecord(v);

                            setForm({
                              pet_id: v.pet_id,
                              veterinarian_id: v.veterinarian_id,
                              vaccine_name: v.vaccine_name,
                              date_given: v.date_given?.slice(0, 10),
                              next_due_date: v.next_due_date?.slice(0, 10),
                              remarks: v.remarks || "",
                            });

                            setShowForm(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                        >
                          Edit
                        </button>

                        <button
                          onClick={async () => {
                            if (
                              !window.confirm("Delete this vaccination record?")
                            )
                              return;

                            try {
                              await API.delete(
                                `/vaccinations/${v.vaccination_id}`,
                              );

                              fetchVaccinations();
                            } catch (err) {
                              console.error(err);

                              alert("Failed to delete vaccination.");
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                        >
                          Delete
                        </button>
                      </div>
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
                {editingRecord ? "Edit Vaccination" : "Record Vaccination"}
              </h2>
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Pet */}
                <div>
                  <label className="text-xs text-gray-600">Pet</label>

                  <select
                    name="pet_id"
                    value={form.pet_id}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                  >
                    <option value="">Select Pet</option>

                    {pets.map((pet) => (
                      <option key={pet.pet_id} value={pet.pet_id}>
                        {pet.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Veterinarian */}
                <div>
                  <label className="text-xs text-gray-600">Veterinarian</label>

                  <select
                    name="veterinarian_id"
                    value={form.veterinarian_id}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                  >
                    <option value="">Select Veterinarian</option>

                    {vets.map((vet) => (
                      <option key={vet.user_id} value={vet.user_id}>
                        {vet.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vaccine */}
                <div>
                  <label className="text-xs text-gray-600">Vaccine Name</label>

                  <input
                    name="vaccine_name"
                    value={form.vaccine_name}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                  />
                </div>

                {/* Date Given */}
                <div>
                  <label className="text-xs text-gray-600">Date Given</label>

                  <input
                    type="date"
                    name="date_given"
                    value={form.date_given}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                  />
                </div>

                {/* Next Due */}
                <div>
                  <label className="text-xs text-gray-600">Next Due Date</label>

                  <input
                    type="date"
                    name="next_due_date"
                    value={form.next_due_date}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                  />
                </div>

                {/* Remarks */}
                <div>
                  <label className="text-xs text-gray-600">Remarks</label>

                  <input
                    name="remarks"
                    value={form.remarks}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm transition disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : editingRecord
                        ? "Update Record"
                        : "Save Record"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          editingRecord
                            ? "Discard your changes?"
                            : "Discard this vaccination record?",
                        )
                      ) {
                        setShowForm(false);

                        setEditingRecord(null);

                        setForm(emptyForm);

                        setError("");
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
    </Layout>
  );
}
