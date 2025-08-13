import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
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
  axios.get(`http://localhost:3001/bills`)
    .then((res) => {
      const sorted = res.data.sort((a, b) => new Date(b.billDate) - new Date(a.billDate));
      if (businessProfile && businessProfile.businessEmail) {
        const filtered = sorted.filter(bill => bill.businessEmail && bill.businessEmail === businessProfile.businessEmail);
        setBills(filtered);
        setFilteredBills(filtered);
      } else {
        setBills(sorted);
        setFilteredBills(sorted);
      }
    }).catch((err) => console.error("Error fetching:", err));
}, [businessProfile]);

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
    logo.src = businessProfile?.businessLogo ? `http://localhost:3001${businessProfile.businessLogo}` : "Please upload a logo";

    const stamp = new Image();
    stamp.src = businessProfile?.businessStamp ? `http://localhost:3001${businessProfile.businessStamp}` : "Please upload a stamp";
    
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

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 mb-6 mt-6 sm:p-0 transition-colors">
          <table className="w-full text-center text-[10px] xs:text-xs sm:text-sm md:text-base table-fixed break-words">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-1 py-2 sm:px-2 sm:py-4 dark:text-white whitespace-normal">Customer Name</th>
                <th className="px-1 py-2 sm:px-2 dark:text-white whitespace-normal">Products</th>
                <th className="px-1 py-2 sm:px-2 dark:text-white whitespace-normal">Total Price</th>
                <th className="px-1 py-2 sm:px-2 dark:text-white whitespace-normal">Date</th>
                <th className="px-1 py-2 sm:px-2 dark:text-white whitespace-normal">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map(bill => (
                <tr key={bill._id} className={highlightedId === bill._id ? "bg-blue-50 dark:bg-blue-900 text-center border-b" : "text-center border-b"}>
                  <td className="py-1 px-1 sm:px-2 capitalize whitespace-normal break-words">{bill.customer.name}</td>
                  <td className="py-1 px-1 sm:px-2 text-left whitespace-normal break-words">
                    <ul className="list-decimal pl-4">
                      {bill.order.map((item, i) => (
                        <li key={i} className="dark:text-white">{item.productName} (x{item.quantity}) - ₹{item.price}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-1 px-1 sm:px-2 text-blue-600 font-semibold whitespace-normal break-words">₹{bill.total}</td>
                  <td className="py-1 px-1 sm:px-2 whitespace-normal break-words">{new Date(bill.billDate).toLocaleString()}</td>
                  <td className="py-1 px-1 sm:px-2 whitespace-normal break-words">
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
          <div className="fixed inset-0 w-1/2 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:text-black text-black p-4 rounded shadow-lg w-full max-w-[850px] max-h-[90vh] overflow-auto">
              <div ref={invoiceRef} className="p-4">
                <style>{`
                  body {
                    font-family: 'Helvetica', Arial, sans-serif;
                    background-color: #f8e1e1;
                    margin: 0;
                    padding: 0;
                  }
                  
                  th {
                    background-color: #d32f2f;
                    color: #fff;
                  }
                `}</style>
                <div className="max-w-[800px] mx-auto bg-white p-6 rounded-lg shadow-lg font-sans">
                  <div className="text-center border-b-2 border-[#f0b8b8] pb-4 mb-6">
                    <div className="flex flex-row-reverse w-full p-2">
                      <div className="w-9/12">
                        <h1 className="text-10xl font-extrabold text-center my-2 text-[26px] text-[#d32f2f]">
                          {businessProfile?.businessName || 'Business Name'}
                        </h1>
                      </div>
                      <div className="w-3/12 flex items-center">
                        <img
                          className="block m-auto -top-4 w-full h-full"
                          src={businessProfile?.businessLogo ? `http://localhost:3001${businessProfile.businessLogo}` : "Please upload a logo"}
                          alt="Business Logo"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="my-1 text-[#444]">{businessProfile?.businessAddress || 'Business Address'}</p>
                      <p className="my-1 text-[#444]">
                        Phone: {businessProfile?.businessMobile || ''} | Email: {businessProfile?.businessEmail || ''}
                      </p>
                    </div>
                  </div>

                  <div className="w-[48%]">
                    <div>
                      <p><strong>Invoice Number:</strong> INV-{selectedBill._id.slice(-6).toUpperCase()}</p>
                      <p><strong>Date:</strong> {new Date(selectedBill.billDate).toDateString()}</p>
                    </div>
                    <div>
                      <p className="hidden"><strong>Due Date:</strong> {new Date(new Date(selectedBill.billDate).getTime() + 7 * 86400000).toDateString()}</p>
                      <p><strong>Payment Terms:</strong> Payment Receipt</p>
                    </div>
                  </div>

                  <div className="flex justify-between mb-6 ">
                    <div>
                      <p className="my-1 text-[#444]"><strong>Customer Details:</strong></p>
                      <p className="my-1 text-[#444]">{selectedBill.customer.name}</p>
                      <p className="my-1 text-[#444]">Email: {selectedBill.customer.email}</p>
                      <p className="my-1 text-[#444]">Mobile: {selectedBill.customer.mobile}</p>
                    </div>
                  </div>

                  <table className="w-full border-collapse mb-6">
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
                          <td className="border border-[#f0b8b8] p-2 text-left">{item.productName}</td>
                          <td className="border border-[#f0b8b8] p-2 text-left">{item.quantity}</td>
                          <td className="border border-[#f0b8b8] p-2 text-left">₹{item.price}</td>
                          <td className="border border-[#f0b8b8] p-2 text-left">₹{item.totalPrice}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="text-right font-bold text-[16px] text-[#b71c1c] mt-2">
                    <p>Total: ₹{selectedBill.total}</p>
                  </div>

                  <div className="text-center  text-[13px] text-[#666] border-t border-[#f0b8b8] pt-4 flex flex-col md:flex-row justify-between mt-0 items-center">
                    <div className="text-left">
                      <p>Thank you for shopping at {businessProfile?.businessName || 'Business Name'}!</p>
                      <p>Terms: All sales are final. Contact us for warranty details.</p>
                    </div>
                    <div className="text-center mt-5">
                      <img
                        className="w-24 h-24 md:w-32 md:h-32 object-contain max-w-[120px] my-[10px]"
                        src={businessProfile?.businessStamp ? `http://localhost:3001${businessProfile.businessStamp}` : "Please upload a stamp"}
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

