

import React, { useEffect, useState, useRef } from "react";
import AdminLayout from "../Components/AdminLayout";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Loading from '../Components/Loading'
import { Link } from "react-router-dom";
import { MdOutlineHome } from "react-icons/md";
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

const Report = () => {
  const [salesData, setSalesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [yearlyData, setYearlyData] = useState([]);
  const [allBills, setAllBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadTimeoutExceeded, setLoadTimeoutExceeded] = useState(false);

  const reportRef = useRef(null);
  const ordersRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoadTimeoutExceeded(true);
    }, 20000); 

    axios
      .get(`http://localhost:3001/bills`)
      .then(({ data: bills }) => {
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

        clearTimeout(timeout);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch bills:", err);
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

  //  Show loading 
  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex flex-col items-center justify-center text-gray-700 text-lg">
          {loadTimeoutExceeded ? (
            <div className="text-center">
              <div className="mb-4 block m-auto">
              
                     <Loading />
             
              
              </div>
              {/* <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button> */}
            </div>
          ) : (
            <div className="mb-4 block m-auto">
           
                  <Loading />
           
            </div>
          )}
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
    <AdminLayout>
      {/* Breadcrumbs */}
      <div className="text-sm text-gray-600 mb-4">
        <nav className="flex items-center space-x-2">
          <span className="text-gray-500">
            <Link to="/home"><MdOutlineHome fontSize={20} /></Link>
          </span>
          <span className="text-gray-400">/</span>
          <span className="font-semibold text-gray-800">Reports</span>
        </nav>
      </div>

      <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Sales Report
          </h1>
          <div className="flex gap-2 flex-wrap">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 rounded-md border border-gray-300 text-sm"
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
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Monthly Sales Chart</h2>
            {filteredData.length === 0 ? (
              <p className="text-gray-500">No data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthLabel" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#5990d7" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Monthly Summary */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Monthly Sales Summary</h2>
            <ul className="divide-y divide-gray-200 text-sm md:text-base">
              {filteredData.slice(-5).map(({ monthLabel, total, start, end }) => (
                <li key={monthLabel} className="py-2 flex flex-col md:flex-row justify-between">
                  <div>
                    <span className="font-medium text-gray-800">{monthLabel}</span>
                    <p className="text-gray-500 text-xs">({start} – {end})</p>
                  </div>
                  <span className="font-bold text-[#5990d7]">₹{total}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Products */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Top 5 Selling Products</h2>
            <ul className="divide-y divide-gray-200 text-sm md:text-base">
              {topProducts.map((p, idx) => (
                <li key={idx} className="flex justify-between py-2">
                  <span>{p.name}</span>
                  <span className="font-bold text-[#5990d7]">{p.sold}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Yearly Sales */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Yearly Sales Report</h2>
            {yearlyData.length === 0 ? (
              <p className="text-gray-500">No data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
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

        {/* Orders Table (hidden for UI, shown in PDF) */}
        <div ref={ordersRef} className="overflow-x-auto bg-white rounded-lg shadow p-4 mb-6 mt-4">
          <h2 className="text-xl font-semibold mb-4">Orders for {selectedMonth}</h2>
         
          <table className="w-full text-sm md:text-base">
            <thead className="bg-gray-100">
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
        </div>
      </div>
    </AdminLayout>
     </>
  );
};

export default Report;
