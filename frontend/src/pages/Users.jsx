import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/axios";

export default function Users() {
  // ==========================================
  // STATES
  // ==========================================

  const emptyForm = {
    full_name: "",
    email: "",
    password: "",
    role: "admin",
  };

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState(emptyForm);

  const [editingUser, setEditingUser] = useState(null);

  // ==========================================
  // LOAD USERS
  // ==========================================

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await API.get("/users");

      setUsers(res.data);
    } catch (err) {
      console.error(err);

      alert("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    setForm({
      ...form,

      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    onClick={resetForm}
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingUser) {
        await API.put(
          `/users/${editingUser.user_id}`,

          {
            full_name: form.full_name,

            email: form.email,

            role: form.role,
          },
        );

        alert("User updated successfully.");
      } else {
        await API.post("/users", form);

        alert("User created successfully.");
      }

      resetForm();

      fetchUsers();
    } catch (err) {
      console.error(err);

      alert(err.response?.data?.message || "Operation failed.");
    }
  };

  // ==========================================
  // EDIT USER
  // ==========================================

  const editUser = (user) => {
    setEditingUser(user);

    setForm({
      full_name: user.full_name,

      email: user.email,

      password: "",

      role: user.role,
    });

    window.scrollTo({
      top: 0,

      behavior: "smooth",
    });
  };

  // ==========================================
  // DELETE USER
  // ==========================================

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await API.delete(`/users/${id}`);

      fetchUsers();

      alert("User deleted.");
    } catch (err) {
      console.error(err);

      alert(err.response?.data?.message || "Delete failed.");
    }
  };

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredUsers = users.filter((user) => {
    const keyword = search.toLowerCase();

    return (
      user.full_name.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword) ||
      user.role.toLowerCase().includes(keyword)
    );
  });

  // ==========================================
  // UI
  // ==========================================

  return (
    <Layout>
      {/* HEADER */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>

          <p className="text-gray-500 mt-1">Manage system users</p>
        </div>
      </div>

      {/* USER FORM */}

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-5">
          {editingUser ? "Edit User" : "Create User"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            name="full_name"
            placeholder="Full Name"
            value={form.full_name}
            onChange={handleChange}
            className="border rounded-lg px-4 py-3"
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="border rounded-lg px-4 py-3"
            required
          />

          {!editingUser && (
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="border rounded-lg px-4 py-3"
              required
            />
          )}

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="border rounded-lg px-4 py-3"
          >
            <option value="admin">Administrator</option>
            <option value="vet">Veterinarian</option>
            <option value="staff">Staff</option>
            <option value="pet_owner">Pet Owner</option>
          </select>

          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              {editingUser ? "Update User" : "Create User"}
            </button>

            {editingUser && (
              <button
                type="button"
                onClick={() => {
                  setEditingUser(null);

                  resetForm();
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* SEARCH */}

      <div className="mb-5">
        <input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-3 w-full"
        />
      </div>

      {/* TABLE */}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading users...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Role</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Last Login</th>
                <th className="text-left p-4">Created</th>
                <th className="text-center p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.user_id} className="border-t hover:bg-gray-50">
                    <td className="p-4">{user.full_name}</td>

                    <td className="p-4">{user.email}</td>

                    <td className="p-4 capitalize">{user.role}</td>

                    <td className="p-4">
                      {user.is_active ? (
                        <span className="text-green-600 font-semibold">
                          Active
                        </span>
                      ) : (
                        <span className="text-red-600 font-semibold">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleString()
                        : "Never"}
                    </td>

                    <td className="p-4">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>

                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingUser(user);

                          }}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteUser(user.user_id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
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
        )}
      </div>
    </Layout>
  );
}
