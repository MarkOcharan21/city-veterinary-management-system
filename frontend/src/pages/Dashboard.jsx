// Admin Dashboard — Developed by KB Trinidad

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Navbar from "../components/Navbar";
import API from "../api/axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];
const chartOpts = {
  responsive: true,
  plugins: { legend: { position: "bottom" } },
};
const noLegendOpts = {
  responsive: true,
  plugins: { legend: { display: false } },
};

function StatCard({ label, value, color, icon, sub, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`${color} rounded-xl p-5 shadow text-white cursor-pointer
        transform transition hover:scale-105 hover:shadow-lg active:scale-95`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm opacity-80">{label}</p>
          <p className="text-3xl font-bold mt-1">{value ?? "—"}</p>
          {sub && <p className="text-xs opacity-70 mt-1">{sub}</p>}
        </div>
        <span className="text-3xl opacity-50">{icon}</span>
      </div>
      <p className="text-xs opacity-50 mt-3 flex items-center gap-1">
        <span>View details</span>
        <span>→</span>
      </p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

function NoData() {
  return <p className="text-gray-300 text-sm text-center py-10">No data yet</p>;
}

function pieData(data, labelKey, valueKey) {
  return {
    labels: data.map((r) => r[labelKey]),
    datasets: [{ data: data.map((r) => r[valueKey]), backgroundColor: COLORS }],
  };
}

function lineData(data, labelKey, valueKey, color, label) {
  return {
    labels: data.map((r) => r[labelKey]),
    datasets: [
      {
        label,
        data: data.map((r) => r[valueKey]),
        borderColor: color,
        backgroundColor: color + "22",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
      },
    ],
  };
}

function barData(data, labelKey, valueKey, color) {
  return {
    labels: data.map((r) => r[labelKey]),
    datasets: [{ data: data.map((r) => r[valueKey]), backgroundColor: color }],
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [bySpecies, setBySpecies] = useState([]);
  const [byBarangay, setByBarangay] = useState([]);
  const [monthlyVax, setMonthlyVax] = useState([]);
  const [monthlyReg, setMonthlyReg] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState([]);
  const [vaxStatus, setVaxStatus] = useState([]);
  const [recentPets, setRecentPets] = useState([]);
  const [recentVaccinations, setRecentVaccinations] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [s, sp, br, mv, mr, ps, vs, rp, rv, rpay, ra] = await Promise.all(
          [
            API.get("/analytics/summary"),
            API.get("/analytics/pets-by-species"),
            API.get("/analytics/pets-by-barangay"),
            API.get("/analytics/monthly-vaccinations"),
            API.get("/analytics/monthly-registrations"),
            API.get("/analytics/payment-status"),
            API.get("/analytics/vaccination-status"),
            API.get("/analytics/recent-pets"),
            API.get("/analytics/recent-vaccinations"),
            API.get("/analytics/recent-payments"),
            API.get("/analytics/recent-activities"),
          ],
        );

        setSummary(s.data);
        setBySpecies(sp.data);
        setByBarangay(br.data);
        setMonthlyVax(mv.data);
        setMonthlyReg(mr.data);
        setPaymentStatus(ps.data);
        setVaxStatus(vs.data);
        setRecentPets(rp.data);
        setRecentVaccinations(rv.data);
        setRecentPayments(rpay.data);
        setRecentActivities(ra.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const cards = summary
    ? [
        {
          label: "Total Pets",
          value: summary.total_pets,
          color: "bg-blue-500",
          icon: "🐾",
          sub: `${summary.vaccinated_pets} vaccinated`,
          to: "/pets",
        },
        {
          label: "Total Owners",
          value: summary.total_owners,
          color: "bg-green-500",
          icon: "👤",
          sub: `${summary.active_users} system users`,
          to: "/owners",
        },
        {
          label: "Total Vaccinations",
          value: summary.total_vaccinations,
          color: "bg-yellow-500",
          icon: "💉",
          sub: `${summary.overdue_vaccinations} overdue`,
          to: "/vaccinations",
        },
        {
          label: "Verified Revenue (₱)",
          value: Number(summary.total_revenue).toLocaleString(),
          color: "bg-purple-500",
          icon: "💰",
          sub: `${summary.unpaid} unpaid transactions`,
          to: "/payments",
        },
        {
          label: "Overdue Vaccinations",
          value: summary.overdue_vaccinations,
          color: "bg-red-500",
          icon: "⚠️",
          sub: "Requires immediate attention",
          to: "/vaccinations?filter=overdue",
        },
        {
          label: "Unpaid Transactions",
          value: summary.unpaid,
          color: "bg-orange-500",
          icon: "📋",
          sub: "Pending payment verification",
          to: "/payments?filter=unpaid",
        },
        {
          label: "Active Users",
          value: summary.active_users,
          color: "bg-cyan-500",
          icon: "👥",
          sub: "Staff and pet owners",
          to: "/users",
        },
        {
          label: "Pending Drafts",
          value: summary.pending_registrations,
          color: "bg-gray-500",
          icon: "📝",
          sub: "Offline registrations",
          to: "/drafts",
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-3">⏳</div>
            <p className="text-gray-400 text-sm">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              City Veterinary Animal Clinic — Cabuyao City, Laguna
            </p>
          </div>
          <div className="text-xs text-gray-400 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-100">
            {new Date().toLocaleDateString("en-PH", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* 8 Clickable Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {cards.map((card, i) => (
            <StatCard
              key={i}
              label={card.label}
              value={card.value}
              color={card.color}
              icon={card.icon}
              sub={card.sub}
              onClick={() => navigate(card.to)}
            />
          ))}
        </div>

        {/* Row 1: Species + Vaccination Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <ChartCard title="Species Distribution">
            {bySpecies.length > 0 ? (
              <Pie
                data={pieData(bySpecies, "species", "count")}
                options={chartOpts}
              />
            ) : (
              <NoData />
            )}
          </ChartCard>
          <ChartCard title="Vaccination Status">
            {vaxStatus.length > 0 ? (
              <Doughnut
                data={pieData(vaxStatus, "status", "count")}
                options={chartOpts}
              />
            ) : (
              <NoData />
            )}
          </ChartCard>
        </div>

        {/* Row 2: Payment Status + Pets per Barangay */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <ChartCard title="Payment Status">
            {paymentStatus.length > 0 ? (
              <Pie
                data={pieData(paymentStatus, "payment_status", "count")}
                options={chartOpts}
              />
            ) : (
              <NoData />
            )}
          </ChartCard>
          <ChartCard title="Pets per Barangay">
            {byBarangay.length > 0 ? (
              <Bar
                data={barData(byBarangay, "barangay", "count", "#3b82f6")}
                options={noLegendOpts}
              />
            ) : (
              <NoData />
            )}
          </ChartCard>
        </div>

        {/* Row 3: Monthly Registrations + Monthly Vaccinations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartCard title="Monthly Registrations">
            {monthlyReg.length > 0 ? (
              <Line
                data={lineData(
                  monthlyReg,
                  "month",
                  "count",
                  "#8b5cf6",
                  "Registrations",
                )}
                options={chartOpts}
              />
            ) : (
              <NoData />
            )}
          </ChartCard>
          <ChartCard title="Monthly Vaccinations">
            {monthlyVax.length > 0 ? (
              <Line
                data={lineData(
                  monthlyVax,
                  "month",
                  "count",
                  "#10b981",
                  "Vaccinations",
                )}
                options={chartOpts}
              />
            ) : (
              <NoData />
            )}
          </ChartCard>
        </div>
        {/* ================= RECENT SYSTEM INFORMATION ================= */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Recent Pets */}

          <ChartCard title="Recent Pet Registrations">
            <div className="space-y-3">
              {recentPets.length === 0 ? (
                <NoData />
              ) : (
                recentPets.map((pet) => (
                  <div
                    key={pet.pet_id}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div>
                      <p className="font-medium text-gray-700">{pet.name}</p>

                      <p className="text-xs text-gray-400">{pet.species}</p>
                    </div>

                    <span className="text-xs text-gray-500">
                      {pet.registered_at?.slice(0, 10)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </ChartCard>

          {/* Recent Vaccinations */}

          <ChartCard title="Recent Vaccinations">
            <div className="space-y-3">
              {recentVaccinations.length === 0 ? (
                <NoData />
              ) : (
                recentVaccinations.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div>
                      <p className="font-medium text-gray-700">
                        {item.pet_name}
                      </p>

                      <p className="text-xs text-gray-400">
                        {item.vaccine_name}
                      </p>
                    </div>

                    <span className="text-xs text-gray-500">
                      {item.date_given?.slice(0, 10)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </ChartCard>

          {/* Recent Payments */}

          <ChartCard title="Recent Payments">
            <div className="space-y-3">
              {recentPayments.length === 0 ? (
                <NoData />
              ) : (
                recentPayments.map((payment, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div>
                      <p className="font-medium text-green-700">
                        ₱{Number(payment.amount).toLocaleString()}
                      </p>

                      <p className="text-xs text-gray-400">
                        {payment.payment_status}
                      </p>
                    </div>

                    <span className="text-xs text-gray-500">
                      {payment.payment_date?.slice(0, 10)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </ChartCard>

          {/* Recent Activities */}

          <ChartCard title="Recent Activities">
            <div className="space-y-3">
              {recentActivities.length === 0 ? (
                <NoData />
              ) : (
                recentActivities.map((activity, index) => (
                  <div key={index} className="border-b pb-2">
                    <p className="font-medium text-gray-700">
                      {activity.action}

                      <span className="text-blue-600">
                        {" "}
                        ({activity.module_name})
                      </span>
                    </p>

                    <p className="text-xs text-gray-500">
                      {activity.description}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      {activity.created_at?.slice(0, 10)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
