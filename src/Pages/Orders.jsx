import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import AdminLayout from "../Components/AdminLayout";
import { Link } from "react-router-dom";
import { MdFileDownload, MdSearch, MdOutlineHome } from "react-icons/md";

const Orders = () => {
  const [bills, setBills] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBills, setFilteredBills] = useState([]);
  const [highlightedId, setHighlightedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBill, setSelectedBill] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const invoiceRef = useRef(null);
  const ordersPerPage = 7;

  useEffect(() => {
    axios.get(`https://mims-backend-x0i3.onrender.com/bills`)
      .then((res) => {
        const sorted = res.data.sort((a, b) => new Date(b.billDate) - new Date(a.billDate));
        setBills(sorted);
        setFilteredBills(sorted);
      }).catch((err) => console.error("Error fetching:", err));
  }, []);

  const handleSearchClick = () => {
    const filtered = bills.filter(bill =>
      bill.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredBills(filtered);
    setCurrentPage(1);
    setHighlightedId(filtered.length > 0 ? filtered[0]._id : null);
  };

  const handleDownloadInvoice = (bill) => {
    setSelectedBill(bill);
    setImagesLoaded(false);
    
    const logo = new Image();
    logo.src = "https://i.ibb.co/ymp7B3FW/logo-main.png";
    
    const stamp = new Image();
    stamp.src = "https://iili.io/FVXKZCP.md.png";
    
    Promise.all([
      new Promise(resolve => { logo.onload = resolve; }),
      new Promise(resolve => { stamp.onload = resolve; })
    ]).then(() => {
      setImagesLoaded(true);
    });
  };

  const closeModal = () => {
    setSelectedBill(null);
  };

  const downloadInvoiceAsImage = () => {
    const buttons = document.querySelector("#invoice-actions");
    buttons.style.display = "none";

    html2canvas(invoiceRef.current, {
      useCORS: true,
      scale: 2,
      backgroundColor: "#FFFFFF"
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `Invoice_${selectedBill._id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      buttons.style.display = "flex";
      closeModal();
    });
  };

  const downloadInvoiceAsPDF = () => {
    if (!imagesLoaded) {
      alert("Images are still loading. Please try again in a moment.");
      return;
    }

    const buttons = document.querySelector("#invoice-actions");
    if (buttons) buttons.style.display = "none";

    setTimeout(async () => {
      try {
        const canvas = await html2canvas(invoiceRef.current, {
          scale: 1.5,
          quality: 0.8,
          logging: false,
          useCORS: true,
          backgroundColor: "#FFFFFF"
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.8);
        // Use A5 size for PDF
        const pdf = new jsPDF("p", "mm", "a5");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;

        pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pdfHeight);
        pdf.save(`Invoice_${selectedBill._id}.pdf`);
      } catch (error) {
        alert("Error generating PDF");
      } finally {
        if (buttons) buttons.style.display = "flex";
        closeModal();
      }
    }, 200);
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredBills.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredBills.length / ordersPerPage);

  return (
    <AdminLayout>
      <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white transition-colors">
        <div className="text-sm text-gray-600 mb-4 dark:text-white">
          <nav className="flex items-center space-x-2">
            <Link to="/home"><MdOutlineHome fontSize={20} /></Link>
            <span className="text-gray-400 dark:text-white">/</span>
            <span className="font-semibold text-gray-800 dark:text-white">Orders</span>
          </nav>
        </div>

        <div className="flex flex-col sm:flex-row justify-end items-center gap-4">
          <input
            type="search"
            className="w-full sm:w-auto border border-gray-300 rounded-md px-4 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-600"
            placeholder="Search Customer Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white text-2xl px-4 py-2 rounded-md"
            onClick={handleSearchClick}
          >
            <MdSearch />
          </button>
        </div>

        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 mt-6 transition-colors">
          <table className="w-full text-sm md:text-base">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="text-center px-4 py-2 dark:text-white">Customer Name</th>
                <th className="text-center px-4 py-2 dark:text-white">Products</th>
                <th className="text-center px-4 py-2 dark:text-white">Total Price</th>
                <th className="text-center px-4 py-2 dark:text-white">Date</th>
                <th className="text-center px-4 py-2 dark:text-white">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map(bill => (
                <tr key={bill._id} className={highlightedId === bill._id ? "bg-blue-50 dark:bg-blue-900 text-center border-b" : "text-center border-b"}>
                  <td className="text-center py-2 dark:text-white">{bill.customer.name}</td>
                  <td className="text-left py-2 dark:text-white">
                    <ul className="list-decimal pl-4">
                      {bill.order.map((item, i) => (
                        <li key={i} className="dark:text-white">{item.productName} (x{item.quantity}) - ₹{item.price}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="text-center py-2 dark:text-white">₹{bill.total}</td>
                  <td className="text-center py-2 dark:text-white">{new Date(bill.billDate).toLocaleString()}</td>
                  <td className="text-center py-2 dark:text-white">
                    <button onClick={() => handleDownloadInvoice(bill)}>
                      <MdFileDownload className="text-blue-600 text-xl" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-6 dark:text-white">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
            disabled={currentPage === 1} 
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 dark:border dark:border-gray-600 rounded disabled:opacity-50 dark:text-white transition-colors">
            <span className="dark:text-white">Previous</span>
          </button>
          <span className="text-sm font-semibold dark:text-white">Page {currentPage} of {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
            disabled={currentPage === totalPages} 
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 dark:border dark:border-gray-600 rounded disabled:opacity-50 dark:text-white transition-colors">
            <span className="dark:text-white">Next</span>
          </button>
        </div>

        {selectedBill && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-4 rounded shadow-lg w-full max-w-[850px] max-h-[90vh] overflow-auto">
              <div ref={invoiceRef} className="p-4">
                <style>{`
                  body {
                    font-family: 'Helvetica', Arial, sans-serif;
                    background-color: #f8e1e1;
                    margin: 0;
                    padding: 0;
                  }
                  .invoice-container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: #fff;
                    padding: 25px;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                    font-family: 'Helvetica', Arial, sans-serif;
                  }
                  .header {
                    text-align: center;
                    border-bottom: 2px solid #f0b8b8;
                    padding-bottom: 15px;
                    margin-bottom: 25px;
                  }
                  .header h1 {
                    margin: 10px 0;
                    font-size: 26px;
                    color: #d32f2f;
                  }
                  .header p {
                    margin: 5px 0;
                    color: #444;
                  }
                  .invoice-details, .customer-details {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 25px;
                    font-size: 14px;
                  }
                  .invoice-details div, .customer-details div {
                    width: 48%;
                  }
                  table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 25px;
                  }
                  th, td {
                    border: 1px solid #f0b8b8;
                    padding: 10px;
                    text-align: left;
                  }
                  th {
                    background-color: #d32f2f;
                    color: #fff;
                  }
                  .total {
                    text-align: right;
                    font-weight: bold;
                    font-size: 16px;
                    color: #b71c1c;
                    margin-top: 10px;
                  }
                  .footer {
                    text-align: center;
                    margin-top: 25px;
                    font-size: 13px;
                    color: #666;
                    border-top: 1px solid #f0b8b8;
                    padding-top: 15px;
                  }
                  .stamp {
                    text-align: center;
                    margin-top: 20px;
                  }
                  .stamp img {
                    max-width: 120px;
                    margin: 10px 0;
                  }
                `}</style>
                <div className="invoice-container">
                  <div className="header">
                    <div className="flex flex-row-reverse w-full p-2">
                      <div className="w-9/12">
                        <h1 className="text-10xl font-extrabold text-center">Sai Mobile Shop & Accessories</h1>
                      </div>
                      <div className="w-3/12 flex items-center">
                        <img
                          className="block m-auto -top-4 w-full h-full"
                          src="https://i.ibb.co/ymp7B3FW/logo-main.png"
                          alt="Sai Mobile Shop Logo"
                        />
                      </div>
                    </div>
                    <div>
                      <p>Shop No 3, Koregaon Phata, Ambethan.</p>
                      <p>Phone: +91 9545199204 | Email: saienterprises9063@gmail.com</p>
                    </div>
                  </div>

                  <div className="invoice-details">
                    <div>
                      <p><strong>Invoice Number:</strong> INV-{selectedBill._id.slice(-6).toUpperCase()}</p>
                      <p><strong>Date:</strong> {new Date(selectedBill.billDate).toDateString()}</p>
                    </div>
                    <div>
                      <p className="hidden"><strong>Due Date:</strong> {new Date(new Date(selectedBill.billDate).getTime() + 7 * 86400000).toDateString()}</p>
                      <p><strong>Payment Terms:</strong> Payment Receipt</p>
                    </div>
                  </div>

                  <div className="customer-details">
                    <div>
                      <p><strong>Customer Details:</strong></p>
                      <p>{selectedBill.customer.name}</p>
                      <p>Email: {selectedBill.customer.email}</p>
                      <p>Mobile: {selectedBill.customer.mobile}</p>
                    </div>
                  </div>

                  <table>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBill.order.map((item, i) => (
                        <tr key={i}>
                          <td>{item.productName}</td>
                          <td>{item.quantity}</td>
                          <td>₹{item.price}</td>
                          <td>₹{item.totalPrice}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="total">
                    <p>Total: ₹{selectedBill.total}</p>
                  </div>

                  <div className="footer flex flex-col md:flex-row justify-between mt-0 items-center">
                    <div>
                      <p>Thank you for shopping at Sai Mobile Shop & Accessories!</p>
                      <p>Terms: All sales are final. Contact us for warranty details.</p>
                    </div>
                    <div className="stamp">
                      <img
                        className="w-24 h-24 md:w-32 md:h-32 object-contain"
                        src="https://iili.io/FVXKZCP.md.png"
                        alt="Shop Stamp"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div id="invoice-actions" className="flex flex-wrap justify-end gap-3 mt-4 p-4 sticky bottom-0 bg-white">
                <button
                  onClick={downloadInvoiceAsPDF}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  Download PDF
                </button>
                <button
                  onClick={downloadInvoiceAsImage}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Download Image
                </button>
                <button
                  onClick={closeModal}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Orders;

