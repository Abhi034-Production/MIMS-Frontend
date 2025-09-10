import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { ThemeContext } from "../../Context/ThemeContext";
import AdminLayout from "../../Components/AdminLayout";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import Spinner from "../../Components/Spinner";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);


const Portfolio = () => {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bestDay, setBestDay] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    setLoading(true);
    fetch(`https://mims-backend-x0i3.onrender.com/intraday-entries?userEmail=${user.email}`)
      .then(res => res.json())
      .then(data => {
        setEntries(data);
        setLoading(false);
        if (data.length > 0) {
          // Find best profitable trading day
          const sorted = [...data].sort((a, b) => b.netProfitLoss - a.netProfitLoss);
          setBestDay(sorted[0]);
        }
      })
      .catch(() => setLoading(false));
  }, [user]);

  // Prepare chart data
  const chartData = {
    labels: entries.map(e => e.date),
    datasets: [
      {
        label: "Net Profit/Loss",
        data: entries.map(e => e.netProfitLoss),
        backgroundColor: theme === "dark" ? "#6366f1" : "#3b82f6",
      },
      {
        label: "Overall Profit/Loss",
        data: entries.map(e => e.overallProfitLoss),
        backgroundColor: theme === "dark" ? "#34d399" : "#10b981",
      },
    ],
  };

  // Analytics: Monthly Profit Trend
  const monthlyProfits = {};
  entries.forEach(e => {
    const month = e.date?.slice(0, 7); // YYYY-MM
    monthlyProfits[month] = (monthlyProfits[month] || 0) + e.netProfitLoss;
  });
  const monthlyProfitData = {
    labels: Object.keys(monthlyProfits),
    datasets: [
      {
        label: "Monthly Net Profit/Loss",
        data: Object.values(monthlyProfits),
        fill: false,
        borderColor: theme === "dark" ? "#f59e42" : "#6366f1",
        backgroundColor: theme === "dark" ? "#f59e42" : "#6366f1",
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top", labels: { color: theme === "dark" ? "#fff" : "#222" } },
      title: { display: true, text: "Day-wise Trading Report", color: theme === "dark" ? "#fff" : "#222" },
    },
    scales: {
      x: { ticks: { color: theme === "dark" ? "#fff" : "#222" } },
      y: { ticks: { color: theme === "dark" ? "#fff" : "#222" } },
    },
  };

  

  const lineOptions = {
    plugins: {
      legend: { labels: { color: theme === "dark" ? "#fff" : "#222" } },
      title: { display: true, text: "Monthly Profit Trend", color: theme === "dark" ? "#fff" : "#222" },
    },
    scales: {
      x: { ticks: { color: theme === "dark" ? "#fff" : "#222" } },
      y: { ticks: { color: theme === "dark" ? "#fff" : "#222" } },
    },
  };

  return (
    <AdminLayout>

      <Seo
        title="Portfolio | easyinventory"
        description="Track and analyze your stock market portfolio with easyinventory. View profit/loss trends, best trading days, and key statistics."   
        keywords="stock portfolio, trading analysis, profit loss, stock market, easyinventory"
        url="https://easyinventory.online/portfolio"
      />

      <div
        className={`max-w-6xl mx-auto p-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}
      >
        <div className="md:col-span-2 lg:col-span-3">
          <h2 className="text-2xl font-bold mb-4">Portfolio Dashboard</h2>
        </div>
        {loading ? (
          <div className="py-10 text-center md:col-span-2 lg:col-span-3"><Spinner /></div>
        ) : entries.length === 0 ? (
          <div className="text-center text-gray-500 md:col-span-2 lg:col-span-3">No trading entries found.</div>
        ) : (
          <>
            <div className="mb-8 md:col-span-2 lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <Bar data={chartData} options={chartOptions} />
            </div>
            {/* Trade type chart removed */}
            <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <Line data={monthlyProfitData} options={lineOptions} />
            </div>
            {bestDay && (
              <div className="bg-green-100 dark:bg-green-900 border-l-4 border-green-500 p-4 mb-6 md:col-span-2 lg:col-span-3">
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">Best Profitable Trading Day</h3>
                <p><strong>Date:</strong> {bestDay.date} ({bestDay.day})</p>
                <p><strong>Net Profit/Loss:</strong> ₹{bestDay.netProfitLoss}</p>
                <p><strong>Overall Profit/Loss:</strong> ₹{bestDay.overallProfitLoss}</p>
                <p><strong>Total Trades:</strong> {bestDay.totalTrade}</p>
                <p><strong>Trade Type:</strong> {bestDay.tradeType}</p>
                <p><strong>Indicators:</strong> {bestDay.tradeIndicators}</p>
              </div>
            )}
            <div className="md:col-span-2 lg:col-span-3">
              <h3 className="text-lg font-semibold mb-2">Quick Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-100 dark:bg-blue-900 rounded p-3 text-center">
                  <div className="text-xl font-bold">{entries.length}</div>
                  <div className="text-xs">Total Trading Days</div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 rounded p-3 text-center">
                  <div className="text-xl font-bold">₹{entries.reduce((acc, e) => acc + e.netProfitLoss, 0)}</div>
                  <div className="text-xs">Total Net Profit/Loss</div>
                </div>
                <div className="bg-green-100 dark:bg-green-900 rounded p-3 text-center">
                  <div className="text-xl font-bold">₹{entries.reduce((acc, e) => acc + e.overallProfitLoss, 0)}</div>
                  <div className="text-xs">Total Overall Profit/Loss</div>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900 rounded p-3 text-center">
                  {/* Trade Types stat removed */}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default Portfolio;
