import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../Components/AdminLayout";
import { Link } from "react-router-dom";
import {
  MdAttachMoney,
  MdShoppingCart,
  MdPeople,
  MdInventory,
  MdTrendingUp,
  MdStar,
  MdOutlineHome,
} from "react-icons/md";
import { format, parseISO } from "date-fns";

const AdminDashboard = () => {
  const [summaryData, setSummaryData] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: "10+",
  });

  const [topProducts, setTopProducts] = useState([]);
  const [monthlyTarget, setMonthlyTarget] = useState(50000);
  const [achievementBadges, setAchievementBadges] = useState([]);

  useEffect(() => {
    axios.get(`https://mims-backend-x0i3.onrender.com/bills`)
      .then((response) => {
        const bills = response.data;
        const now = new Date();
        const currentMonth = format(now, "yyyy-MM");

        // Filter bills for current month
        const monthlyBills = bills.filter((bill) => {
          const billDate = parseISO(bill.billDate);
          return format(billDate, "yyyy-MM") === currentMonth;
        });

        // Total revenue all-time
        const totalRevenue = bills.reduce((sum, bill) => sum + bill.total, 0);

        // Monthly revenue
        const monthlyRevenue = monthlyBills.reduce((sum, bill) => sum + bill.total, 0);

        // Customers in the month
        const totalCustomers = new Set(monthlyBills.map((bill) => bill.customer?.email)).size;

        // Orders count this month
        const totalOrders = monthlyBills.length;

        // Monthly dynamic sales target 
        const dynamicMonthlyTarget = Math.ceil(monthlyRevenue / 50000) * 50000 || 50000;

        setMonthlyTarget(dynamicMonthlyTarget);
        setSummaryData({
          totalRevenue,
          monthlyRevenue,
          totalOrders,
          totalCustomers,
          totalProducts: "10+",
        });

        // Monthly product sales
        const productSales = {};
        monthlyBills.forEach((bill) => {
          bill.order.forEach((item) => {
            if (productSales[item.productName]) {
              productSales[item.productName] += item.quantity;
            } else {
              productSales[item.productName] = item.quantity;
            }
          });
        });

        const topSelling = Object.entries(productSales)
          .map(([name, sold]) => ({ name, sold }))
          .sort((a, b) => b.sold - a.sold)
          .slice(0, 5);

        setTopProducts(topSelling);

        // Badges for every ₹50,000 milestone in monthly revenue
        const badges = Array.from({ length: Math.floor(monthlyRevenue / 50000) }, (_, i) => `₹${(i + 1) * 50000} Achieved`);
        setAchievementBadges(badges);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <AdminLayout>
      {/* Breadcrumbs */}
      <div className="text-sm text-gray-600 mb-4">
        <nav className="flex items-center space-x-2">
          <span className="text-gray-500"><Link to="/home"><MdOutlineHome fontSize={20} /></Link></span>
          <span className="text-gray-400">/</span>
          <span className="font-semibold text-gray-800">Dashboard</span>
        </nav>
      </div>

      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              icon: <p className="text-4xl text-green-800" >₹</p>,
              title: "Total Revenue",
              value: `${summaryData.totalRevenue}`,
            },
            {
              icon: <p className="text-4xl text-green-800" >₹</p>,
              title: "Monthly Revenue",
              value: `${summaryData.monthlyRevenue}`,
            },
            {
              icon: <MdShoppingCart className="text-4xl text-orange-500" />,
              title: "Total Orders (This Month)",
              value: summaryData.totalOrders,
            },
            {
              icon: <MdPeople className="text-4xl text-purple-600" />,
              title: "Total Customers (This Month)",
              value: summaryData.totalCustomers,
            },
            {
              icon: <MdInventory className="text-4xl text-red-600" />,
              title: "Total Products",
              value: summaryData.totalProducts,
            },
          ].map((card, index) => (
            <div key={index} className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow hover:shadow-lg transition duration-300">
              {card.icon}
              <div>
                <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
                <p className="text-xl font-bold text-gray-800">{card.value}</p>
              </div>
            </div>
          ))}
        </div>


        {/* Monthly Sales Target Progress - Clean & Responsive */}
        <div className="p-6 bg-white rounded-3xl shadow  transition-all duration-300 mb-10">
          <div className="flex items-center gap-3 mb-5">
            <MdTrendingUp className="text-3xl text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-800">🎯 Monthly Sales Target Progress</h2>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden shadow-inner">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-sky-500 rounded-full shadow-md transition-all duration-700 ease-in-out"
              style={{
                width: `${Math.min((summaryData.monthlyRevenue / monthlyTarget) * 100, 100)}%`,
              }}
            >

            </div>

          </div>



          {/* Status */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-sm gap-2">
            <p className="text-gray-700 font-semibold">
              <span className="text-base font-bold text-indigo-600">₹{summaryData.monthlyRevenue.toLocaleString()}</span>{" "}
              of ₹{monthlyTarget.toLocaleString()}
            </p>
            <div className="text-yellow-700 font-semibold text-left text-sm">
              {`⭐ ${Math.floor(summaryData.monthlyRevenue / 50000)} Stars`}
            </div>
            {summaryData.monthlyRevenue >= monthlyTarget ? (
              <span className="inline-block px-4 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full shadow-sm">
                ✅ Goal Achieved!
              </span>
            ) : (
              <span className="inline-block px-4 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full shadow-sm">
                {Math.floor((summaryData.monthlyRevenue / monthlyTarget) * 100)}% Achieved
              </span>
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition duration-300">
          <div className="flex items-center gap-3 mb-4">
            <MdStar className="text-2xl text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-700">Top 5 Selling Products (This Month)</h2>
          </div>
          {topProducts.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {topProducts.map((product, index) => (
                <li key={index} className="flex justify-between py-3 text-gray-700">
                  <span>{product.name}</span>
                  <span className="font-bold text-blue-600">{product.sold}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No sales data available for this month.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
