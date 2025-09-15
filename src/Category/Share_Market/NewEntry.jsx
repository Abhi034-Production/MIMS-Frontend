import React, { useState, useEffect } from "react";
import { useContext } from "react";
import { AuthContext } from "../../Context/AuthContext";
import Layout from "../../Components/Layout";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { Link } from "react-router-dom";
import { MdOutlineHome } from 'react-icons/md';
import  Spinner from "../../Components/Spinner"; 
import Seo from "../../Components/Seo";


const NewEntry = () => {
  const { user } = useContext(AuthContext);

  // State for dynamic trade records
  const [tradeRecords, setTradeRecords] = useState([
    { tradeType: '', stockName: '', stockQty: '', profitLoss: '' }
  ]);

  // Handler to add a new trade record
  const handleAddTradeRecord = () => {
    setTradeRecords([...tradeRecords, { tradeType: '', stockName: '', stockQty: '', profitLoss: '' }]);
  };

  // Handler to remove a trade record
  const handleRemoveTradeRecord = (idx) => {
    if (tradeRecords.length === 1) return;
    setTradeRecords(tradeRecords.filter((_, i) => i !== idx));
  };

  // Handler to update a trade record
  const handleTradeRecordChange = (idx, e) => {
    const { name, value } = e.target;
    setTradeRecords(tradeRecords.map((rec, i) => i === idx ? { ...rec, [name]: value } : rec));
  };

  // State for main form fields
  const [formData, setFormData] = useState({
    date: "",
    day: "",
    overallProfitLoss: "",
    netProfitLoss: "",
    govCharges: "",
    brokarage: "",
    totalTrade: "",
    tradeType: "",
    tradeIndicators: ""
  });

  // Handle main form field changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        tradeRecords,
        userEmail: user?.email || ""
      };
      const res = await axios.post("http://localhost:3001/intraday-new-entry", payload);
      toast.success(res.data.message || "Entry saved successfully!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Error saving entry.");
    }
  };

  return (
    <Layout>
      
      <Seo
        title="New Inventory Entry | easyinventory"
        description="Add a new inventory entry to your easyinventory system. Track dates, profit/loss, government charges, and trade details."
        keywords="new inventory entry, add inventory, stock management, trade records, easyinventory"
        url="https://easyinventory.online/inventory/new-entry"
      />

      {/* Breadcrumbs */}
      <div className="text-sm text-gray-600 mb-4 dark:text-white">
        <nav className="flex items-center space-x-2 dark:text-white">
          <span className="text-gray-500 dark:text-white">
            <Link to='/home' className="dark:text-white"><MdOutlineHome fontSize={20} /></Link>
          </span>
          <span className="text-gray-400 dark:text-white">/</span>
          <span className="font-semibold dark:text-white text-gray-800 ">Inventory</span>
        </nav>
      </div>
      <div className="dark:text-white p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Add New Entry</h2>
        <form className="space-y-6 max-w-xl mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 font-medium" htmlFor="date">Date</label>
            <input type="date" id="date" name="date" value={formData.date} onChange={handleFormChange} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required />
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="day">Day</label>
            <input type="text" id="day" name="day" value={formData.day} onChange={handleFormChange} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required />
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="overallProfitLoss">Overall Profit/Loss</label>
            <input type="number" id="overallProfitLoss" name="overallProfitLoss" value={formData.overallProfitLoss} onChange={handleFormChange} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required />
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="netProfitLoss">Net Profit/Loss</label>
            <input type="number" id="netProfitLoss" name="netProfitLoss" value={formData.netProfitLoss} onChange={handleFormChange} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required />
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="govCharges">Government Charges</label>
            <input type="number" id="govCharges" name="govCharges" value={formData.govCharges} onChange={handleFormChange} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required />
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="brokarage">Brokarage</label>
            <input type="number" id="brokarage" name="brokarage" value={formData.brokarage} onChange={handleFormChange} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required />
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="totalTrade">Total Trade</label>
            <input type="number" id="totalTrade" name="totalTrade" value={formData.totalTrade} onChange={handleFormChange} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required />
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="tradeType">Trade Type</label>
            <select id="tradeType" name="tradeType" value={formData.tradeType} onChange={handleFormChange} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required>
              <option value="">Select Type</option>
              <option value="intraday">Intraday</option>
              <option value="delivery">Delivery</option>
              <option value="futures">Futures</option>
              <option value="options">Options</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="tradeIndicators">Trade Indicators</label>
            <select id="tradeIndicators" name="tradeIndicators" value={formData.tradeIndicators} onChange={handleFormChange} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required>
              <option value="">Select Indicator</option>
              <option value="moving_average">Moving Average</option>
              <option value="rsi">RSI</option>
              <option value="macd">MACD</option>
              <option value="bollinger_bands">Bollinger Bands</option>
              <option value="stochastic">Stochastic</option>
            </select>
          </div>

          {/* Multiple Trade Records Section */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2 dark:text-white">Trade Records</h3>
            {tradeRecords.map((rec, idx) => (
              <div key={idx} className="flex flex-wrap gap-2 items-end mb-4 bg-gray-100 dark:bg-gray-700 p-3 rounded">
                <div className="flex-1 min-w-[120px]">
                  <label className="block mb-1 font-medium">Trade Type</label>
                  <select
                    name="tradeType"
                    value={rec.tradeType}
                    onChange={e => handleTradeRecordChange(idx, e)}
                    className="w-full px-2 py-1 border rounded dark:bg-gray-800 dark:text-white"
                    required
                  >
                    <option value="">Select</option>
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="block mb-1 font-medium">Stock Name</label>
                  <input
                    type="text"
                    name="stockName"
                    value={rec.stockName}
                    onChange={e => handleTradeRecordChange(idx, e)}
                    className="w-full px-2 py-1 border rounded dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>
                <div className="flex-1 min-w-[100px]">
                  <label className="block mb-1 font-medium">Stock Qty</label>
                  <input
                    type="number"
                    name="stockQty"
                    value={rec.stockQty}
                    onChange={e => handleTradeRecordChange(idx, e)}
                    className="w-full px-2 py-1 border rounded dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="block mb-1 font-medium">Profit/Loss</label>
                  <input
                    type="number"
                    name="profitLoss"
                    value={rec.profitLoss}
                    onChange={e => handleTradeRecordChange(idx, e)}
                    className="w-full px-2 py-1 border rounded dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveTradeRecord(idx)}
                  className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                  disabled={tradeRecords.length === 1}
                  title="Remove"
                >
                  -
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddTradeRecord}
              className="mt-2 px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              + Add Trade Record
            </button>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">Submit</button>
        </form>
        <ToastContainer />
      </div>
    </Layout>
  );
};

export default NewEntry;