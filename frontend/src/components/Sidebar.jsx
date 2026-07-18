import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const menuItems = [

    {
        name: "Dashboard",
        path: "/dashboard",
        icon: "📊",
        roles: ["admin", "vet", "cashier", "pet_owner"]
    },

    {
        name: "Pets",
        path: "/pets",
        icon: "🐾",
        roles: ["admin", "vet", "cashier"]
    },

    {
        name: "Owners",
        path: "/owners",
        icon: "👤",
        roles: ["admin", "cashier"]
    },

    {
        name: "Vaccinations",
        path: "/vaccinations",
        icon: "💉",
        roles: ["admin", "vet"]
    },

    {
        name: "Payments",
        path: "/payments",
        icon: "💳",
        roles: ["admin", "cashier"]
    },

    {
        name: "Records",
        path: "/records",
        icon: "📋",
        roles: ["admin", "vet"]
    },

    {
        name: "Barangay List",
        path: "/barangay",
        icon: "🏘️",
        roles: ["admin"]
    },

    {
        name: "System Records",
        path: "/system-records",
        icon: "🗂️",
        roles: ["admin"]
    },

    {
        name: "Reports",
        path: "/reports",
        icon: "📑",
        roles: ["admin"]
    },

    {
        name: "Users",
        path: "/users",
        icon: "👥",
        roles: ["admin"]
    },

    {
        name: "Audit Trail",
        path: "/audit",
        icon: "🕵️",
        roles: ["admin"]
    },

    {
        name: "Drafts",
        path: "/drafts",
        icon: "📝",
        roles: ["admin"]
    }

];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user } = useAuth();
  const visibleMenu = menuItems.filter((item) =>
    item.roles.includes(user?.role),
  );
  return (
    <aside
      className={`
        hidden md:flex flex-col
        fixed top-[72px]
        h-[calc(100vh-72px)]
        bg-white border-r border-gray-200 shadow-sm
        transition-all duration-300 z-40
        ${collapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Collapse Button */}

      <div className="p-4 border-b border-gray-100 flex justify-end">
        <button
          type="button"
          aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          onClick={() => setCollapsed(!collapsed)}
          className="text-xl rounded-lg px-2 py-1 hover:bg-gray-100 select-none transition"
        >
          {collapsed ? "➡️" : "⬅️"}
        </button>
      </div>

      {/* Navigation */}

      <nav className="flex flex-col gap-2 p-3 overflow-y-auto">
        {visibleMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3
              px-4 py-3 rounded-xl
              transition-all duration-200
              ${
                isActive
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-700 hover:bg-blue-50"
              }
            `}
          >
            <span
              className="text-xl min-w-[24px] text-center"
              title={item.name}
            >
              {item.icon}
            </span>

            {!collapsed && (
              <span className="font-medium whitespace-nowrap">{item.name}</span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
