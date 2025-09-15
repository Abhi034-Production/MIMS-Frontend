import React, { useEffect, useState, useRef } from "react";
import Layout from "../Components/Layout";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Loading from '../Components/Loading'
import { Link } from "react-router-dom";
import { MdOutlineHome, MdInventory } from "react-icons/md";
import Spinner from '../Components/Spinner'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  isValid,
} from "date-fns";
import { Helmet } from "react-helmet-async";

const Report = () => {
  const [salesData, setSalesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [yearlyData, setYearlyData] = useState([]);
  const [allBills, setAllBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadTimeoutExceeded, setLoadTimeoutExceeded] = useState(false);
  const [lowStock, setLowStock] = useState([]);

  const reportRef = useRef(null);
  const ordersRef = useRef(null);


  useEffect(() => {
    // Fetch business profile first to get businessEmail
    let timeout = setTimeout(() => {
      setLoadTimeoutExceeded(true);
    }, 20000);

    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      setLoading(false);
      return;
    }

    axios.get(`https://mims-backend-x0i3.onrender.com/business-profile/${userEmail}`)
      .then(({ data }) => {
        let businessEmail = data?.profile?.businessEmail;
        // If no businessEmail, fallback to all bills
        if (!businessEmail) {
          return axios.get(`https://mims-backend-x0i3.onrender.com/bills`).then(({ data }) => ({ bills: data, businessEmail: null }));
        }
        return axios.get(`https://mims-backend-x0i3.onrender.com/bills?businessEmail=${encodeURIComponent(businessEmail)}`)
          .then(({ data }) => ({ bills: data, businessEmail }));
      })
      .then(({ bills, businessEmail }) => {
        setAllBills(bills);

        const monthlySales = {};
        const yearlySales = {};
        const productSales = {};

        bills.forEach((bill) => {
          if (!bill?.billDate || typeof bill.total !== "number") return;

          const date = parseISO(bill.billDate);
          if (!isValid(date)) return;

          const monthKey = format(date, "yyyy-MM");
          const yearKey = format(date, "yyyy");

          monthlySales[monthKey] = (monthlySales[monthKey] || 0) + bill.total;
          yearlySales[yearKey] = (yearlySales[yearKey] || 0) + bill.total;

          bill.order?.forEach((item) => {
            productSales[item.productName] =
              (productSales[item.productName] || 0) + item.quantity;
          });
        });

        const salesArray = Object.entries(monthlySales)
          .map(([ym, total]) => {
            const dt = parseISO(ym + "-01");
            return {
              monthKey: ym,
              monthLabel: format(dt, "MMM yyyy"),
              total,
              start: format(startOfMonth(dt), "dd MMM yyyy"),
              end: format(endOfMonth(dt), "dd MMM yyyy"),
            };
          })
          .sort((a, b) => (a.monthKey > b.monthKey ? 1 : -1));

        setSalesData(salesArray);
        setFilteredData(salesArray);

        const yearArray = Object.entries(yearlySales)
          .map(([year, total]) => ({ year, total }))
          .sort((a, b) => a.year - b.year);
        setYearlyData(yearArray);

        const top5 = Object.entries(productSales)
          .map(([name, sold]) => ({ name, sold }))
          .sort((a, b) => b.sold - a.sold)
          .slice(0, 5);
        setTopProducts(top5);

        //  low stock products fetch
        if (businessEmail) {
          return axios.get(`https://mims-backend-x0i3.onrender.com/products?email=${encodeURIComponent(businessEmail)}`);
        } else {
          return axios.get(`https://mims-backend-x0i3.onrender.com/products`);
        }
      })
      .then(({ data: products }) => {
        const lowStockItems = products.filter(product => product.quantity < 5)
          .map(product => ({
            name: product.name,
            quantity: product.quantity,
            price: product.price
          }));
        setLowStock(lowStockItems);
        clearTimeout(timeout);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch data:", err);
        clearTimeout(timeout);
        setLoading(false);
      });
  }, []);


  useEffect(() => {
    setFilteredData(
      selectedMonth === "All"
        ? salesData
        : salesData.filter((item) => item.monthKey === selectedMonth)
    );
  }, [selectedMonth, salesData]);



  const downloadLowStockPDF = () => {
    const doc = new jsPDF();
    doc.text("Low Stock Inventory Report", 14, 15);
    autoTable(doc, {
      startY: 25,
      head: [["Product Name", "Quantity", "Price"]],
      body: lowStock.map(item => [item.name, item.quantity, `₹${item.price}`]),
    });
    doc.save("low_stock_inventory.pdf");
  };


  const downloadSalesReportPDF = () => {
    const input = reportRef.current;
    if (!input) return;

    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("Sales_Report.pdf");
    });
  };

  const downloadOrdersPDF = () => {
    const input = ordersRef.current;
    if (!input) return;

    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Orders_${selectedMonth}.pdf`);
    });
  };

  if (loading) return <Layout><div className="text-center py-10"><Spinner /></div></Layout>;

  return (
    <>
      <Layout>

        <Seo
          title="Reports | easyinventory"
          description="Generate and download sales reports, view top products, and monitor low stock inventory with easyinventory."
          keywords="sales report, inventory report, top products, low stock, business reports, easyinventory"
          url="https://easyinventory.online/reports"
        />

        {/* Breadcrumbs */}
        <div className="text-sm text-gray-600 mb-4 dark:text-white">
          <nav className="flex items-center space-x-2">
            <span className="text-gray-500 dark:text-white">
              <Link to="/home"><MdOutlineHome fontSize={20} /></Link>
            </span>
            <span className="text-gray-400 dark:text-white">/</span>
            <span className="font-semibold text-gray-800 dark:text-white">Reports</span>
          </nav>
        </div>

        <div className="p-4 md:p-6 bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
              Sales Report
            </h1>
            <div className="flex gap-2 flex-wrap">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 rounded-md border border-gray-300 text-sm dark:bg-gray-900 dark:text-white dark:border-gray-600"
              >
                <option value="All">All Months</option>
                {salesData.map(({ monthKey, monthLabel }) => (
                  <option key={monthKey} value={monthKey}>
                    {monthLabel}
                  </option>
                ))}
              </select>
              <button
                onClick={downloadSalesReportPDF}
                className="bg-[#5990d7] hidden hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md text-sm"
              >
                Download Sales PDF
              </button>
              <button
                onClick={downloadOrdersPDF}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md text-sm"
              >
                Download Orders PDF
              </button>
            </div>
          </div>

          {/* REPORT CONTENT */}
          <div ref={reportRef}>
            {/* Monthly Bar Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6 transition-colors">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-white mb-3">Monthly Sales Chart</h2>
              {filteredData.length === 0 ? (
                <p className="text-gray-500 dark:text-white">No data available.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300} className="dark:text-white">
                  <BarChart className="dark:text-white" data={filteredData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="monthLabel" className="dark:text-white" />
                    <YAxis className="dark:text-white" />
                    <Tooltip className="dark:text-white" />
                    <Bar dataKey="total" fill="#5990d7" className="dark:text-white" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Monthly Summary */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6 transition-colors">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-white mb-3">Monthly Sales Summary</h2>
              <ul className="divide-y divide-gray-200 text-sm md:text-base">
                {filteredData.slice(-5).map(({ monthLabel, total, start, end }) => (
                  <li key={monthLabel} className="py-2 flex flex-col md:flex-row justify-between dark:text-white">
                    <div>
                      <span className="font-medium text-gray-800 dark:text-white">{monthLabel}</span>
                      <p className="text-gray-500 text-xs dark:text-white">({start} – {end})</p>
                    </div>
                    <span className="font-bold text-[#5990d7] dark:text-white">₹{total}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Top Products */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6 transition-colors">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-white mb-3">Top 5 Selling Products</h2>
              <ul className="divide-y divide-gray-200 text-sm md:text-base">
                {topProducts.map((p, idx) => (
                  <li key={idx} className="flex justify-between py-2 dark:text-white">
                    <span>{p.name}</span>
                    <span className="font-bold text-[#5990d7] dark:text-white">{p.sold}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Yearly Sales */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-colors">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-white mb-3">Yearly Sales Report</h2>
              {yearlyData.length === 0 ? (
                <p className="text-gray-500 dark:text-white">No data available.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300} className="dark:text-white">
                  <BarChart data={yearlyData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#34a853" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>



          {/* ✅ Low Stock Section */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition duration-300 mt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <MdInventory className="text-2xl text-red-600" />
                <h2 className="text-lg font-semibold text-gray-700 dark:text-white">Low Stock Inventory (Less than 5)</h2>
              </div>
              {lowStock.length > 0 && (
                <button
                  onClick={downloadLowStockPDF}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
                >
                  📄 Download PDF
                </button>
              )}
            </div>

            {lowStock.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {lowStock.map((product, index) => (
                  <li key={index} className="flex justify-between py-3 text-gray-700 dark:text-white">
                    <span>{product.name}</span>
                    <span className="text-sm">Qty: {product.quantity} | ₹{product.price}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-white">All inventory is sufficiently stocked.</p>
            )}
          </div>


          {/* Orders Table (hidden for UI, shown in PDF) */}
          {selectedMonth !== "All" && allBills.some(bill => {
            const date = parseISO(bill.billDate);
            return isValid(date) && format(date, "yyyy-MM") === selectedMonth;
          }) && (
              <div ref={ordersRef} className="overflow-x-auto bg-white rounded-lg shadow p-4 mb-6 mt-4">
                <h2 className="text-xl font-semibold mb-4">Orders for {selectedMonth}</h2>
                <table className="w-full text-sm md:text-base">
                  <thead className="text-center">
                    <tr className="text-center">
                      <th className="px-4 py-2 text-center">Date</th>
                      <th className="px-4 py-2">Customer Name</th>
                      <th className="px-4 py-2 hidden">Mobile</th>
                      <th className="px-4 py-2 hidden">Email</th>
                      <th className="px-4 py-2">Total</th>
                      <th className="px-4 py-2">Product Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allBills
                      .filter((bill) => {
                        const date = parseISO(bill.billDate);
                        return (
                          isValid(date) &&
                          format(date, "yyyy-MM") === selectedMonth
                        );
                      })
                      .map((bill, index) => (
                        <tr key={index}>

                          <td className="py-2 text-center">{format(parseISO(bill.billDate), "dd MMM yyyy")}</td>
                          <td className="py-2 text-center">{bill.customer?.name || "N/A"}</td>
                          <td className="py-2 hidden">{bill.customer?.mobile || "N/A"}</td>
                          <td className="py-2 hidden">{bill.customer?.email || "N/A"}</td>
                          <td className="py-2 text-center">₹{bill.total}</td>
                          <td className="py-2 text-center">
                            <ul>
                              {bill.order?.map((item, idx) => (
                                <li key={idx}>
                                  {item.productName} (x{item.quantity})
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

          {/* Orders Table (hidden for UI, shown in PDF)
        <div ref={ordersRef} className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 mt-4 transition-colors">
          <h2 className="text-xl font-semibold mb-4">Orders for {selectedMonth}</h2>
         
          <table className="w-full text-sm md:text-base">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr className="bg-gray-200">
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Customer Name</th>
                <th className="px-4 py-2">Mobile</th>
                <th className="px-4 py-2 hidden">Email</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Product Name</th>
              </tr>
            </thead>
            <tbody>
              {allBills
                .filter((bill) => {
                  const date = parseISO(bill.billDate);
                  return (
                    selectedMonth !== "All" &&
                    isValid(date) &&
                    format(date, "yyyy-MM") === selectedMonth
                  );
                })
                .map((bill, index) => (
                  <tr key={index}>
                    <td className="py-2">{format(parseISO(bill.billDate), "dd MMM yyyy")}</td>
                    <td className="py-2">{bill.customer?.name || "N/A"}</td>
                    <td className="py-2">{bill.customer?.mobile || "N/A"}</td>
                    <td className="py-2 hidden">{bill.customer?.email || "N/A"}</td>
                    <td className="py-2">₹{bill.total}</td>
                    <td className="py-2">
                      <ul>
                        {bill.order?.map((item, idx) => (
                          <li key={idx}>
                            {item.productName} (x{item.quantity})
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div> */}
        </div>
      </Layout>
    </>
  );
};

export default Report;