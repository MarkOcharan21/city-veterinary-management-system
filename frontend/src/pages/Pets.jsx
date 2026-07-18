// Pet Registration & QR Code Module — Developed by Zyrus Catalonia

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "../components/Navbar";
import API from "../api/axios";

const SPECIES_BREEDS = {
  Dog: [
    "Aspin",
    "Labrador",
    "Shih Tzu",
    "Poodle",
    "Bulldog",
    "Beagle",
    "Golden Retriever",
    "Dachshund",
    "Chow Chow",
    "Other",
  ],
  Cat: [
    "Puspin",
    "Persian",
    "Siamese",
    "Maine Coon",
    "Ragdoll",
    "Bengal",
    "Scottish Fold",
    "Other",
  ],
  Bird: [
    "Parrot",
    "Cockatiel",
    "Budgerigar",
    "Canary",
    "Lovebird",
    "Finch",
    "Other",
  ],
  Rabbit: ["Holland Lop", "Dutch", "Lionhead", "Rex", "Angora", "Other"],
  Fish: ["Goldfish", "Betta", "Guppy", "Koi", "Arowana", "Molly", "Other"],
  Reptile: ["Turtle", "Gecko", "Iguana", "Snake", "Chameleon", "Other"],
  Other: ["Other"],
};

const SPECIES_LIST = [
  "Dog",
  "Cat",
  "Bird",
  "Rabbit",
  "Fish",
  "Reptile",
  "Other",
];
const COLORS = [
  "Black",
  "White",
  "Brown",
  "Gray",
  "Golden",
  "Orange",
  "Cream",
  "Mixed",
  "Other",
];

const emptyForm = {
  owner_id: "",
  name: "",
  species: "",
  speciesOther: "",
  breed: "",
  breedOther: "",
  color: "",
  colorOther: "",
  birthdate: "",
  sex: "male",
};

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white";
const labelClass =
  "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

function SelectOrOther({
  label,
  name,
  value,
  otherValue,
  otherName,
  options,
  onChange,
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={inputClass}
      >
        <option value="">— Select —</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {value === "Other" && (
        <input
          name={otherName}
          value={otherValue}
          onChange={onChange}
          placeholder={`Type ${label.toLowerCase()}...`}
          className={`${inputClass} mt-2`}
        />
      )}
    </div>
  );
}

export default function Pets() {
  const [pets, setPets] = useState([]);
  const [owners, setOwners] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPets = () => API.get("/pets").then((r) => setPets(r.data));
  useEffect(() => {
    fetchPets();

    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const res = await API.get("/owners");

      setOwners(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Reset breed when species changes
      if (name === "species") {
        updated.breed = "";
        updated.breedOther = "";
        updated.speciesOther = "";
      }
      return updated;
    });
  };

  const getFinalValue = (value, otherValue) =>
    value === "Other" ? otherValue : value;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await API.post("/pets", {
        owner_id: form.owner_id,
        name: form.name,
        species: getFinalValue(form.species, form.speciesOther),
        breed: getFinalValue(form.breed, form.breedOther),
        color: getFinalValue(form.color, form.colorOther),
        birthdate: form.birthdate,
        sex: form.sex,
      });
      setForm(emptyForm);
      setShowForm(false);
      fetchPets();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register pet.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = pets.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.owner_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.species?.toLowerCase().includes(search.toLowerCase()),
  );

  const breedOptions = SPECIES_BREEDS[form.species] || ["Other"];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Pet Registry</h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage and register pets for Cabuyao City residents
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-700 hover:bg-blue-800 text-white text-sm px-5 py-2.5 rounded-lg transition font-medium shadow"
          >
            + Register Pet
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <span className="absolute left-3 top-2.5 text-gray-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search by pet name, owner, or species..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Stats strip */}
        <div className="flex gap-4 mb-6">
          <div className="bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-100 text-sm">
            <span className="text-gray-400">Total Pets</span>
            <span className="font-bold text-blue-700 ml-2">{pets.length}</span>
          </div>
          <div className="bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-100 text-sm">
            <span className="text-gray-400">Showing</span>
            <span className="font-bold text-blue-700 ml-2">
              {filtered.length}
            </span>
          </div>
        </div>

        {/* Pet Table */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-blue-700 text-white text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Pet Name</th>
                <th className="px-4 py-3 font-medium">Species</th>
                <th className="px-4 py-3 font-medium">Breed</th>
                <th className="px-4 py-3 font-medium">Color</th>
                <th className="px-4 py-3 font-medium">Sex</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Barangay</th>
                <th className="px-4 py-3 font-medium">QR Code</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-gray-400 py-12">
                    <p className="text-3xl mb-2">🐾</p>
                    <p>No pets found.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((pet, idx) => (
                  <tr
                    key={pet.pet_id}
                    className={`border-t hover:bg-blue-50 transition ${idx % 2 === 0 ? "" : "bg-gray-50"}`}
                  >
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {pet.name}
                    </td>
                    <td className="px-4 py-3">{pet.species}</td>
                    <td className="px-4 py-3 text-gray-500">{pet.breed}</td>
                    <td className="px-4 py-3">{pet.color}</td>
                    <td className="px-4 py-3 capitalize">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${pet.sex === "male" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}
                      >
                        {pet.sex}
                      </span>
                    </td>
                    <td className="px-4 py-3">{pet.owner_name}</td>
                    <td className="px-4 py-3 text-gray-500">{pet.barangay_name || "N/A"}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedPet(pet)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-lg transition font-medium"
                      >
                        View QR
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Register Pet Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 py-6">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-blue-700 rounded-t-2xl px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-white font-bold text-lg">
                    Register New Pet
                  </h2>
                  <p className="text-blue-200 text-xs mt-0.5">
                    Fill in all required fields to register a pet
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setError("");
                    setForm(emptyForm);
                  }}
                  className="text-white hover:text-blue-200 text-xl font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                    ⚠️ {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Section: Owner Info */}
                  <div>
                    <label className="text-xs text-gray-600">Owner</label>

                    <select
                      name="owner_id"
                      value={form.owner_id}
                      onChange={handleChange}
                      required
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                    >
                      <option value="">Select Owner</option>

                      {owners.map((owner) => (
                        <option key={owner.owner_id} value={owner.owner_id}>
                          {owner.owner_id} - {owner.full_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Section: Pet Info */}
                  <div>
                    <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 pb-1 border-b border-blue-100">
                      Pet Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className={labelClass}>
                          Pet Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          required
                          placeholder="e.g. Bantay, Muning, Tweety"
                          className={inputClass}
                        />
                      </div>

                      <SelectOrOther
                        label="Species *"
                        name="species"
                        value={form.species}
                        otherValue={form.speciesOther}
                        otherName="speciesOther"
                        options={SPECIES_LIST}
                        onChange={handleChange}
                      />

                      <SelectOrOther
                        label="Breed"
                        name="breed"
                        value={form.breed}
                        otherValue={form.breedOther}
                        otherName="breedOther"
                        options={breedOptions}
                        onChange={handleChange}
                      />

                      <SelectOrOther
                        label="Color"
                        name="color"
                        value={form.color}
                        otherValue={form.colorOther}
                        otherName="colorOther"
                        options={COLORS}
                        onChange={handleChange}
                      />

                      <div>
                        <label className={labelClass}>
                          Sex <span className="text-red-400">*</span>
                        </label>
                        <select
                          name="sex"
                          value={form.sex}
                          onChange={handleChange}
                          className={inputClass}
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label className={labelClass}>Date of Birth</label>
                        <input
                          type="date"
                          name="birthdate"
                          value={form.birthdate}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50 shadow"
                    >
                      {loading ? "⏳ Registering..." : "✓ Register Pet"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setError("");
                        setForm(emptyForm);
                      }}
                      className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        {selectedPet && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center w-full max-w-sm">
              <div className="bg-blue-700 text-white rounded-xl px-4 py-3 mb-5">
                <h2 className="text-lg font-bold">{selectedPet.name}</h2>
                <p className="text-blue-200 text-sm">
                  {selectedPet.species} · {selectedPet.breed}
                </p>
              </div>
              <div className="flex justify-center mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <QRCodeSVG value={selectedPet.qr_code} size={180} />
              </div>
              <p className="text-xs text-gray-400 mb-2">
                Owner:{" "}
                <span className="font-medium text-gray-600">
                  {selectedPet.owner_name}
                </span>
              </p>
              <p className="text-xs font-mono text-gray-300 mb-5">
                {selectedPet.qr_code}
              </p>
              <button
                onClick={() => setSelectedPet(null)}
                className="w-full border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
