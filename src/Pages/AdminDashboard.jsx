import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import axios from "axios";
import AdminLayout from "../Components/AdminLayout";
import { Link } from "react-router-dom";
import {
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
  const [lowStock, setLowStock] = useState([]);

  const { user } = useContext(AuthContext);
  const [businessProfile, setBusinessProfile] = useState(null);

  useEffect(() => {
    if (!user || !user.email) return;
    fetch(`http://localhost:3001/business-profile/${user.email}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setBusinessProfile(data.profile);
        }
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!businessProfile || !businessProfile.businessEmail) return;

    axios.get(`http://localhost:3001/bills?businessEmail=${encodeURIComponent(businessProfile.businessEmail)}`)
      .then((response) => {
        const bills = response.data;
        const now = new Date();
        const currentMonth = format(now, "yyyy-MM");

        const monthlyBills = bills.filter((bill) => {
          const billDate = parseISO(bill.billDate);
          return format(billDate, "yyyy-MM") === currentMonth;
        });

        const totalRevenue = bills.reduce((sum, bill) => sum + bill.total, 0);
        const monthlyRevenue = monthlyBills.reduce((sum, bill) => sum + bill.total, 0);
        const totalCustomers = new Set(monthlyBills.map((bill) => bill.customer?.email)).size;
        const totalOrders = monthlyBills.length;

        const dynamicMonthlyTarget = Math.ceil(monthlyRevenue / 50000) * 50000 || 50000;

        setMonthlyTarget(dynamicMonthlyTarget);
        setSummaryData({
          totalRevenue,
          monthlyRevenue,
          totalOrders,
          totalCustomers,
          totalProducts: "10+",
        });

        // Properly handle both product name structures
        const productSales = {};
        monthlyBills.forEach((bill) => {
          bill.order.forEach((item) => {
            // Handle both item structures
            const productName = item.product?.name || item.productName;
            const quantity = item.quantity;
            
            if (productName) {
              if (productSales[productName]) {
                productSales[productName] += quantity;
              } else {
                productSales[productName] = quantity;
              }
            }
          });
        });

        const topSelling = Object.entries(productSales)
          .map(([name, sold]) => ({ name, sold }))
          .sort((a, b) => b.sold - a.sold)
          .slice(0, 5);

        setTopProducts(topSelling);

        const badges = Array.from({ length: Math.floor(monthlyRevenue / 50000) }, (_, i) => `₹${(i + 1) * 50000} Achieved`);
        setAchievementBadges(badges);
      })
      .catch((error) => console.error("Error fetching data:", error));

    axios.get(`http://localhost:3001/products?email=${encodeURIComponent(businessProfile.businessEmail)}`)
      .then((response) => {
        const lowStockProducts = response.data.filter(
          (product) => product.quantity !== undefined && product.quantity < 5
        );
        setLowStock(lowStockProducts);
      })
      .catch((err) => console.error("Error fetching products:", err));
  }, [businessProfile]);

  return (
    <AdminLayout>
      <div className="text-sm dark:text-white text-gray-600 mb-4">
        <nav className="flex items-center space-x-2">
          <span className="text-gray-500 dark:text-white"><Link to="/home"><MdOutlineHome fontSize={20} /></Link></span>
          <span className="text-gray-400 dark:text-white">/</span>
          <span className="font-semibold dark:text-white text-gray-800">Dashboard</span>
        </nav>
      </div>

      <div className="p-4 md:p-8 bg-gray-50 dark:text-white dark:bg-gray-900 min-h-screen transition-colors">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 dark:bg-gray-900">
          {[
            {
              icon: <p className="text-4xl text-green-800" >₹</p>,
              title: "Total Revenue",
              value: `₹${summaryData.totalRevenue.toLocaleString()}`,
            },
            {
              icon: <p className="text-4xl text-green-800" >₹</p>,
              title: "Monthly Revenue",
              value: `₹${summaryData.monthlyRevenue.toLocaleString()}`,
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
            <div key={index} className="flex items-center gap-4 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition duration-300">
              {card.icon}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-white">{card.title}</h3>
                <p className="text-xl font-bold text-gray-800 dark:text-white">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow transition-all duration-300 mb-10">
          <div className="flex items-center gap-3 mb-5">
            <MdTrendingUp className="text-3xl text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">🎯 Monthly Sales Target Progress</h2>
          </div>

          <div className="relative w-full h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden shadow-inner">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-sky-500 rounded-full shadow-md transition-all duration-700 ease-in-out"
              style={{
                width: `${Math.min((summaryData.monthlyRevenue / monthlyTarget) * 100, 100)}%`,
              }}
            />
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-sm gap-2">
            <p className="text-gray-700 font-semibold dark:text-white">
              <span className="text-base font-bold text-indigo-600 dark:text-indigo-300">₹{summaryData.monthlyRevenue.toLocaleString()}</span>{" "}
              of ₹{monthlyTarget.toLocaleString()}
            </p>
            <div className="text-yellow-700 font-semibold text-left text-sm dark:text-yellow-300">
              {`⭐ ${Math.floor(summaryData.monthlyRevenue / 50000)} Stars`}
            </div>
            {summaryData.monthlyRevenue >= monthlyTarget ? (
              <span className="inline-block px-4 py-1 text-xs font-bold bg-green-100 dark:bg-green-700 text-green-700 dark:text-white rounded-full shadow-sm">
                ✅ Goal Achieved!
              </span>
            ) : (
              <span className="inline-block px-4 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-700 text-yellow-700 dark:text-white rounded-full shadow-sm">
                {Math.floor((summaryData.monthlyRevenue / monthlyTarget) * 100)}% Achieved
              </span>
            )}
          </div>
        </div>

        <div className=" dark:bg-gray-800 p-6 bg-white rounded-2xl shadow hover:shadow-lg transition duration-300">
          <div className="flex items-center gap-3 mb-4">
            <MdStar className="text-2xl text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-700 dark:text-white">Top 5 Selling Products (This Month)</h2>
          </div>
          {topProducts.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {topProducts.map((product, index) => (
                <li key={index} className="flex justify-between py-3 text-gray-700 dark:text-white">
                  <span className="font-medium dark:text-white">{product.name}</span>
                  <span className="font-bold text-blue-600 dark:text-blue-300">{product.sold} sold</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-300">No sales data available for this month.</p>
          )}
        </div>

        {/* Low Stock Section */}
        <div className="p-6 bg-white dark:text-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition duration-300 mt-8">
          <div className="flex items-center gap-3 mb-4">
            <MdInventory className="text-2xl text-red-600" />
            <h2 className="text-lg font-semibold text-gray-700 dark:text-white">Low Stock Inventory (Less than 5)</h2>
          </div>

          {lowStock.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {lowStock.map((product, index) => (
                <li key={index} className="flex justify-between py-3 text-gray-700 dark:text-white">
                  <span className="font-medium dark:text-white">{product.name}</span>
                  <span className="text-sm font-medium dark:text-white">Qty: {product.quantity} | ₹{product.price}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-300">All inventory is sufficiently stocked.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;