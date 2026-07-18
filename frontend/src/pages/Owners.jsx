// Owners Management Module
// CityVet System
// Matches CityVet Database V2

import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/axios";

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

const labelClass = "block text-xs font-semibold text-gray-500 uppercase mb-1";

export default function Owners() {
  // ============================================
  // TABLE DATA
  // ============================================

  const [owners, setOwners] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [users, setUsers] = useState([]);

  // ============================================
  // PAGE STATE
  // ============================================

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [error, setError] = useState("");

  // ============================================
  // MODAL
  // ============================================

  const [showModal, setShowModal] = useState(false);

  const [editingOwner, setEditingOwner] = useState(null);

  // ============================================
  // FORM
  // ============================================

  const emptyForm = {
    user_id: "",
    barangay_id: "",
    address: "",
    contact_number: "",
    id_type: "",
    id_number: "",
  };

  const [form, setForm] = useState(emptyForm);

  // ============================================
  // FETCH OWNERS
  // ============================================

  const fetchOwners = async () => {
    const res = await API.get("/owners");
    setOwners(res.data);
  };

  // ============================================
  // FETCH BARANGAYS
  // ============================================

  const fetchBarangays = async () => {
    const res = await API.get("/barangays");
    setBarangays(res.data);
  };

  // ============================================
  // FETCH AVAILABLE PET OWNERS
  // ============================================

  const fetchUsers = async () => {
    const res = await API.get("/users/pet-owners");
    setUsers(res.data);
  };

  // ============================================
  // LOAD PAGE
  // ============================================

  const loadOwnersPage = async () => {
    try {
      setLoading(true);

      await Promise.all([fetchOwners(), fetchBarangays(), fetchUsers()]);
    } catch (err) {
      console.error(err);

      alert("Failed to load owners.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // HANDLE INPUT
  // ============================================

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ============================================
  // RESET FORM
  // ============================================

  const resetForm = () => {
    setEditingOwner(null);

    setForm({
      user_id: "",
      barangay_id: "",
      address: "",
      contact_number: "",
      id_type: "",
      id_number: "",
    });
  };

  // ============================================
  // CREATE / UPDATE OWNER
  // ============================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingOwner) {
        await API.put(`/owners/${editingOwner.owner_id}`, form);

        alert("Owner updated successfully.");
      } else {
        await API.post("/owners", form);

        alert("Owner registered successfully.");
      }

      setShowModal(false);

      resetForm();

      await loadOwnersPage();
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Failed to save owner.");
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // DELETE OWNER
  // ============================================

  const handleDelete = async (owner) => {
    const confirmDelete = window.confirm(`Delete ${owner.full_name}?`);

    if (!confirmDelete) return;

    try {
      await API.delete(`/owners/${owner.owner_id}`);

      alert("Owner deleted successfully.");

      loadOwnersPage();
    } catch (err) {
      console.error(err);

      alert(err.response?.data?.message || "Failed to delete owner.");
    }
  };

  // ============================================
  // FILTERED OWNERS
  // ============================================

  const filteredOwners = owners.filter((owner) => {
    const keyword = search.toLowerCase();

    return (
      owner.full_name?.toLowerCase().includes(keyword) ||
      owner.email?.toLowerCase().includes(keyword) ||
      owner.barangay_name?.toLowerCase().includes(keyword) ||
      owner.contact_number?.toLowerCase().includes(keyword)
    );
  });

  // ============================================
  // INITIAL LOAD
  // ============================================

  useEffect(() => {
    loadOwnersPage();
  }, []);
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ============================================ */}
        {/* PAGE HEADER */}
        {/* ============================================ */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Owners Management
            </h1>

            <p className="text-gray-500 mt-1">Manage registered pet owners.</p>
          </div>

          <button
            onClick={() => {
              resetForm();

              setShowModal(true);
            }}
            className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg font-medium transition"
          >
            + Register Owner
          </button>
        </div>

        {/* ============================================ */}
        {/* SEARCH */}
        {/* ============================================ */}

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* ============================================ */}
        {/* TABLE */}
        {/* ============================================ */}

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-blue-700 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>

                  <th className="px-4 py-3 text-left">Full Name</th>

                  <th className="px-4 py-3 text-left">Email</th>

                  <th className="px-4 py-3 text-left">Contact</th>

                  <th className="px-4 py-3 text-left">Barangay</th>

                  <th className="px-4 py-3 text-left">Address</th>

                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      Loading owners...
                    </td>
                  </tr>
                ) : filteredOwners.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      No owners found.
                    </td>
                  </tr>
                ) : (
                  filteredOwners.map((owner) => (
                    <tr
                      key={owner.owner_id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">{owner.owner_id}</td>

                      <td className="px-4 py-3 font-medium">
                        {owner.full_name}
                      </td>

                      <td className="px-4 py-3">{owner.email}</td>

                      <td className="px-4 py-3">{owner.contact_number}</td>

                      <td className="px-4 py-3">{owner.barangay_name}</td>

                      <td className="px-4 py-3">{owner.address}</td>

                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingOwner(owner);

                              setForm({
                                user_id: owner.user_id,
                                barangay_id: owner.barangay_id,
                                address: owner.address || "",
                                contact_number: owner.contact_number || "",
                                id_type: owner.id_type || "",
                                id_number: owner.id_number || "",
                              });

                              setShowModal(true);
                            }}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(owner)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
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
        </div>
        {/* ============================================ */}
        {/* OWNER MODAL */}
        {/* ============================================ */}

        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl">
              {/* Header */}

              <div className="flex items-center justify-between border-b px-6 py-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {editingOwner ? "Edit Owner" : "Register Owner"}
                  </h2>

                  <p className="text-sm text-gray-500">
                    {editingOwner
                      ? "Update owner information."
                      : "Create a new owner profile."}
                  </p>
                </div>

                <button
                  onClick={() => {
                    resetForm();
                    setShowModal(false);
                  }}
                  className="text-gray-500 hover:text-red-500 text-xl"
                >
                  ✕
                </button>
              </div>

              {/* BODY */}

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {error && (
                  <div className="bg-red-100 text-red-700 px-4 py-2 rounded">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* USER */}

                  <div>
                    <label className={labelClass}>Pet Owner</label>

                    <select
                      name="user_id"
                      value={form.user_id}
                      onChange={handleChange}
                      disabled={editingOwner}
                      className={inputClass}
                      required
                    >
                      <option value="">Select Owner</option>

                      {users.map((user) => (
                        <option key={user.user_id} value={user.user_id}>
                          {user.full_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* BARANGAY */}

                  <div>
                    <label className={labelClass}>Barangay</label>

                    <select
                      name="barangay_id"
                      value={form.barangay_id}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    >
                      <option value="">Select Barangay</option>

                      {barangays.map((barangay) => (
                        <option
                          key={barangay.barangay_id}
                          value={barangay.barangay_id}
                        >
                          {barangay.barangay_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* CONTACT */}

                  <div>
                    <label className={labelClass}>Contact Number</label>

                    <input
                      type="text"
                      name="contact_number"
                      value={form.contact_number}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </div>

                  {/* ID TYPE */}

                  <div>
                    <label className={labelClass}>ID Type</label>

                    <select
                      name="id_type"
                      value={form.id_type}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="">Select ID</option>

                      <option value="National ID">National ID</option>

                      <option value="Driver's License">Driver's License</option>

                      <option value="Passport">Passport</option>

                      <option value="PhilHealth">PhilHealth</option>

                      <option value="SSS">SSS</option>

                      <option value="Barangay ID">Barangay ID</option>
                    </select>
                  </div>

                  {/* ID NUMBER */}

                  <div>
                    <label className={labelClass}>ID Number</label>

                    <input
                      type="text"
                      name="id_number"
                      value={form.id_number}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* ADDRESS */}

                <div>
                  <label className={labelClass}>Address</label>

                  <textarea
                    rows="3"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>

                {/* FOOTER */}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowModal(false);
                    }}
                    className="border px-5 py-2 rounded-lg"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg"
                  >
                    {saving
                      ? "Saving..."
                      : editingOwner
                        ? "Update Owner"
                        : "Register Owner"}
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
