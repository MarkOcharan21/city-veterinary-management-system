import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/axios";

export default function Reports() {
  const [pets, setPets] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const [petsRes, vaccinationRes, paymentRes] =
        await Promise.all([
          API.get("/reports/pets"),
          API.get("/reports/vaccinations"),
          API.get("/reports/payments"),
        ]);

      setPets(petsRes.data);
      setVaccinations(vaccinationRes.data);
      setPayments(paymentRes.data);

    } catch (err) {
      console.error(err);
      setError("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <Layout>
      <div className="p-6 space-y-8">

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            Reports
          </h1>

          <button
            onClick={fetchReports}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            Refresh
          </button>
        </div>

        {loading && (
          <div className="text-blue-600 text-sm">
            Loading reports...
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* PET REPORT */}

        <div className="bg-white rounded-xl shadow overflow-hidden">

          <div className="bg-blue-700 text-white px-4 py-3 font-semibold">
            Pet Masterlist
          </div>

          <table className="w-full text-sm">

            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">
                  Pet
                </th>

                <th className="px-4 py-3 text-left">
                  Species
                </th>

                <th className="px-4 py-3 text-left">
                  Owner
                </th>
              </tr>
            </thead>

            <tbody>

              {pets.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="text-center text-gray-400 py-8"
                  >
                    No pet records found.
                  </td>
                </tr>
              ) : (
                pets.map((pet) => (
                  <tr
                    key={pet.pet_id}
                    className="border-t"
                  >
                    <td className="px-4 py-3">
                      {pet.name}
                    </td>

                    <td className="px-4 py-3">
                      {pet.species}
                    </td>

                    <td className="px-4 py-3">
                      {pet.owner_name}
                    </td>
                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

        {/* VACCINATION REPORT */}

        <div className="bg-white rounded-xl shadow overflow-hidden">

          <div className="bg-green-700 text-white px-4 py-3 font-semibold">
            Vaccination Report
          </div>

          <table className="w-full text-sm">

            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">
                  Pet
                </th>

                <th className="px-4 py-3 text-left">
                  Vaccine
                </th>

                <th className="px-4 py-3 text-left">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>

              {vaccinations.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="text-center text-gray-400 py-8"
                  >
                    No vaccination records found.
                  </td>
                </tr>
              ) : (
                vaccinations.map((vaccination) => (
                  <tr
                    key={vaccination.vaccination_id}
                    className="border-t"
                  >
                    <td className="px-4 py-3">
                      {vaccination.pet_name}
                    </td>

                    <td className="px-4 py-3">
                      {vaccination.vaccine_name}
                    </td>

                    <td className="px-4 py-3">
                      {vaccination.date_given?.slice(0, 10)}
                    </td>
                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

                {/* PAYMENT REPORT */}

        <div className="bg-white rounded-xl shadow overflow-hidden">

          <div className="bg-purple-700 text-white px-4 py-3 font-semibold">
            Payment Report
          </div>

          <table className="w-full text-sm">

            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">
                  OR Number
                </th>

                <th className="px-4 py-3 text-left">
                  Pet
                </th>

                <th className="px-4 py-3 text-left">
                  Amount
                </th>

                <th className="px-4 py-3 text-left">
                  Status
                </th>

                <th className="px-4 py-3 text-left">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>

              {payments.length === 0 ? (

                <tr>
                  <td
                    colSpan="5"
                    className="text-center text-gray-400 py-8"
                  >
                    No payment records found.
                  </td>
                </tr>

              ) : (

                payments.map((payment) => (

                  <tr
                    key={payment.payment_id}
                    className="border-t"
                  >
                    <td className="px-4 py-3">
                      {payment.or_number}
                    </td>

                    <td className="px-4 py-3">
                      {payment.pet_name}
                    </td>

                    <td className="px-4 py-3">
                      ₱{Number(payment.amount || 0).toLocaleString()}
                    </td>

                    <td className="px-4 py-3">
                      {payment.payment_status}
                    </td>

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