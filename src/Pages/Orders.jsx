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
  };

  const closeModal = () => {
    setSelectedBill(null);
  };

  const downloadInvoiceAsImage = () => {
    const buttons = document.querySelector("#invoice-actions");
    buttons.style.display = "none";

    html2canvas(invoiceRef.current).then((canvas) => {
      const link = document.createElement("a");
      link.download = `Invoice_${selectedBill._id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      buttons.style.display = "flex";
      closeModal();
    });
  };

  const downloadInvoiceAsPDF = () => {
    const buttons = document.querySelector("#invoice-actions");
    buttons.style.display = "none";

    html2canvas(invoiceRef.current, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pdfHeight);
      pdf.save(`Invoice_${selectedBill._id}.pdf`);
      buttons.style.display = "flex";
      closeModal();
    });
  };


  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredBills.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredBills.length / ordersPerPage);

  return (
    <AdminLayout>
      <div className="p-6 min-h-screen bg-gray-50">
        <div className="text-sm text-gray-600 mb-4">
          <nav className="flex items-center space-x-2">
            <Link to="/home"><MdOutlineHome fontSize={20} /></Link>
            <span className="text-gray-400">/</span>
            <span className="font-semibold text-gray-800">Orders</span>
          </nav>
        </div>

        <div className="flex flex-col sm:flex-row justify-end items-center gap-4">
          <input
            type="search"
            className="w-full sm:w-auto border border-gray-300 rounded-md px-4 py-2"
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



        <div className="overflow-x-auto bg-white rounded-lg shadow p-4 mb-6 mt-6">
          <table className="w-full text-sm md:text-base">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-center px-4 py-2">Customer Name</th>
                <th className="text-center px-4 py-2">Products</th>
                <th className="text-center px-4 py-2">Total Price</th>
                <th className="text-center px-4 py-2">Date</th>
                <th className="text-center px-4 py-2">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map(bill => (
                <tr key={bill._id} className={highlightedId === bill._id ? "bg-blue-50 text-center border-b" : "text-center border-b"}>
                  <td className="text-center py-2">{bill.customer.name}</td>
                  <td className="text-left py-2">
                    <ul className="list-decimal pl-4">
                      {bill.order.map((item, i) => (
                        <li key={i}>{item.productName} (x{item.quantity}) - ₹{item.price}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="text-center py-2">₹{bill.total}</td>
                  <td className="text-center py-2">{new Date(bill.billDate).toLocaleString()}</td>
                  <td className="text-center py-2">
                    <button onClick={() => handleDownloadInvoice(bill)}>
                      <MdFileDownload className="text-blue-600 text-xl" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-6">
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">Previous</button>
          <span className="text-sm font-semibold">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">Next</button>
        </div>


        {selectedBill && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-4 rounded shadow-lg w-full max-w-[850px]">
              <div ref={invoiceRef}>
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
                    <div className="flex flex-row-reverse w-full  p-2">
                      <div className="w-9/12">
                        <h1 className="text-10xl font-extrabold  text-center">Sai Mobile Shop & Accessories</h1>
                      </div>
                      <div className="w-3/12 flex items-center">
                        <img
                          className="block m-auto -top-4  w-full h-full "
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
                      <p><strong>Due Date:</strong> {new Date(new Date(selectedBill.billDate).getTime() + 7 * 86400000).toDateString()}</p>
                      <p><strong>Payment Terms:</strong> Payment Receipt</p>
                    </div>
                  </div>

                  <div className="customer-details">
                    <div>
                      <p><strong>Customer Details::</strong></p>
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


              <div id="invoice-actions" className="flex justify-end gap-3 mt-4">
                <button
                  onClick={downloadInvoiceAsImage}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Download Image
                </button>
                <button
                  onClick={downloadInvoiceAsPDF}
                  className="bg-purple-600 text-white px-4 py-2 rounded"
                >
                  Download PDF
                </button>
                <button
                  onClick={closeModal}
                  className="bg-red-500 text-white px-4 py-2 rounded"
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





// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import html2canvas from "html2canvas";
// import AdminLayout from "../Components/AdminLayout";
// import { Link } from "react-router-dom";
// import { MdFileDownload, MdSearch,MdOutlineHome  } from "react-icons/md";



// const Orders = () => {
//   const [bills, setBills] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filteredBills, setFilteredBills] = useState([]);
//   const [highlightedId, setHighlightedId] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const ordersPerPage = 7;
//   const [selectedBill, setSelectedBill] = useState(null);

//   const invoiceRef = useRef(null);

//   useEffect(() => {
//     axios
//       .get(`https://mims-backend-x0i3.onrender.com/bills`)
//       .then((response) => {
//         const sortedBills = response.data.sort(
//           (a, b) => new Date(b.billDate) - new Date(a.billDate)
//         );
//         setBills(sortedBills);
//         setFilteredBills(sortedBills);
//       })
//       .catch((error) => console.error("Error fetching orders:", error));
//   }, []);

//   const handleSearchChange = (e) => {
//     setSearchQuery(e.target.value);
//   };

//   const handleSearchClick = () => {
//     const filtered = bills.filter((bill) =>
//       bill.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//     setFilteredBills(filtered);
//     setCurrentPage(1);
//     setHighlightedId(filtered.length > 0 ? filtered[0]._id : null);
    
//   };

//   const handleDownloadInvoice = (bill) => {
//     setSelectedBill(bill);

//     const invoiceModal = document.getElementById("invoiceModal");
//     invoiceModal.style.display = "block";
//   };

//   const closeModal = () => {
//     const invoiceModal = document.getElementById("invoiceModal");
//     invoiceModal.style.display = "none";
//   };

//   const downloadInvoiceAsImage = () => {
//     if (invoiceRef.current) {
//       html2canvas(invoiceRef.current).then((canvas) => {
//         const imageUrl = canvas.toDataURL("image/png");

//         const link = document.createElement("a");
//         link.href = imageUrl;
//         link.download = `Invoice_${selectedBill._id}.png`;
//         link.click();

//         closeModal();
//       });
//     }
//   };

//   // Calculate pagination indexes
//   const indexOfLastOrder = currentPage * ordersPerPage;
//   const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
//   const currentOrders = filteredBills.slice(indexOfFirstOrder, indexOfLastOrder);

//   // Handle pagination
//   const totalPages = Math.ceil(filteredBills.length / ordersPerPage);
//   const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
//   const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

//   return (
//    <AdminLayout>
//      {/* Breadcrumbs */}
//     <div className="text-sm text-gray-600 mb-4">
//       <nav className="flex items-center space-x-2">
//         <span className="text-gray-500"><Link to='/home'><MdOutlineHome fontSize={20}/></Link></span>
//         <span className="text-gray-400">/</span>
//         <span className="font-semibold text-gray-800">Orders</span>
//       </nav>
//     </div>
//       <div className="p-6 min-h-screen bg-gray-50">
        
//         <div className="flex flex-col sm:flex-row justify-end items-center gap-4">
//           <input
//             type="search"
//             className="w-full sm:w-auto border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
//             placeholder="Search Customer Name..."
//             value={searchQuery}
//             onChange={handleSearchChange}
//           />
//           <button
//             className="bg-blue-500 hover:bg-blue-600 text-white text-2xl px-4 py-2 rounded-md transition duration-200"
//             onClick={handleSearchClick}
//           >
//             <MdSearch />
//           </button>
//         </div>

//         <div className="overflow-x-auto bg-white rounded-lg shadow p-4 mb-6 mt-6">
//           <table className="w-full text-sm md:text-base">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="px-4 py-2 text-center border hidden">Order ID</th>
//                 <th className="px-4 py-2 text-center ">Customer Name</th>
//                 <th className="px-4 py-2 text-center list-decimal">Products</th>
//                 <th className="px-4 py-2 text-center ">Total Price (₹)</th>
//                 <th className="px-4 py-2 text-center ">Date</th>
//                 <th className="px-4 py-2 text-center ">Invoice</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentOrders.length > 0 ? (
//                 currentOrders.map((bill) => (
//                   <tr
//                     key={bill._id}
//                     className={`border-b text-sm sm:text-base ${highlightedId === bill._id ? "bg-blue-50" : ""}`}
//                   >
//                     <td className="py-2  hidden">{bill._id}</td>
//                     <td className="py-2  text-center">{bill.customer.name}</td>
//                     <td className="py-2  text-left">
//                       <ul className="list-decimal list-inside">
//                         {bill.order.map((product, index) => (
//                           <li key={index}>
//                             {product.productName} (x{product.quantity}) - ₹{product.price}
//                           </li>
//                         ))}
//                       </ul>
//                     </td>
//                     <td className="py-2 text-center">₹ {bill.total}</td>
//                     <td className="py-2 text-center">{new Date(bill.billDate).toLocaleString()}</td>
//                     <td className="py-2 text-center">
//                       <button
//                         onClick={() => handleDownloadInvoice(bill)}
//                         className="relative group px-4 py-2 rounded-md font-bold text-xl text-blue-700 hover:text-blue-500 transition duration-200"
//                       >
//                         <MdFileDownload className="mx-auto" />
//                         <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition duration-300 z-10">
//                           Download Invoice
//                         </span>
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="6" className="text-center p-4">
//                     No orders found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         <div className="flex justify-between items-center mt-6">
//           <button
//             className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
//             onClick={goToPrevPage}
//             disabled={currentPage === 1}
//           >
//             Previous
//           </button>
//           <span className="text-sm font-semibold">Page {currentPage} of {totalPages}</span>
//           <button
//             className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
//             onClick={goToNextPage}
//             disabled={currentPage === totalPages}
//           >
//             Next
//           </button>
//         </div>

//         <div
//   id="invoiceModal"
//   className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50 "
// >
//   <div
//     ref={invoiceRef}
//     className="bg-white rounded-lg shadow-2xl w-full max-w-lg p-6 text-gray-800"
//   >
//     <div className="border-b pb-4 mb-4">
//       <h1 className="text-2xl font-bold text-gray-900">
//         Mobile Inventory Management System
//       </h1>
//       <h2 className="text-lg font-semibold text-gray-700 mt-2">
//         Customer Invoice
//       </h2>
//     </div>

//     {selectedBill && (
//       <div className="space-y-4">
//         <div className="grid grid-cols-2 gap-4 text-sm">
//           <div>
//             <p className="font-medium">Order ID:</p>
//             <p>{selectedBill._id}</p>
//           </div>
//           <div>
//             <p className="font-medium">Date:</p>
//             <p>{new Date(selectedBill.billDate).toLocaleString()}</p>
//           </div>
//           <div>
//             <p className="font-medium">Customer:</p>
//             <p>{selectedBill.customer.name}</p>
//           </div>
//           <div>
//             <p className="font-medium">Mobile:</p>
//             <p>{selectedBill.customer.mobile}</p>
//           </div>
//           <div className="col-span-2">
//             <p className="font-medium">Email:</p>
//             <p>{selectedBill.customer.email}</p>
//           </div>
//         </div>

//         <div className="mt-6">
//           <h3 className="text-lg font-semibold text-gray-700">Items Purchased</h3>
//           <div className="mt-2 border rounded-lg overflow-hidden">
//             <table className="w-full text-sm">
//               <thead className="bg-gray-100">
//                 <tr>
//                   <th className="text-left p-2">Item</th>
//                   <th className="text-right p-2">Qty</th>
//                   <th className="text-right p-2">Price</th>
//                   <th className="text-right p-2">Total</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {selectedBill.order.map((item, index) => (
//                   <tr key={index} className="border-t">
//                     <td className="p-2">{item.productName}</td>
//                     <td className="text-right p-2">{item.quantity}</td>
//                     <td className="text-right p-2">₹{item.price}</td>
//                     <td className="text-right p-2">₹{item.totalPrice}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         <div className="flex justify-end mt-4">
//           <div className="text-right">
//             <p className="text-lg font-bold text-gray-900">
//               Total Amount: ₹{selectedBill.total}
//             </p>
//           </div>
//         </div>

//         <p className="text-center text-sm text-gray-600 mt-4">
//           Thank you for your purchase!
//         </p>
//       </div>
//     )}

//     <div className="mt-6 flex justify-end gap-3">
//       <button
//         onClick={downloadInvoiceAsImage}
//         className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200"
//       >
//         Download as Image
//       </button>
//       <button
//         onClick={closeModal}
//         className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200"
//       >
//         Close
//       </button>
//     </div>
//   </div>
// </div>
// {/* 
//         <div
//           id="invoiceModal"
//           style={{
//             display: "none",
//             position: "fixed",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             backgroundColor: "white",
//             padding: "20px",
//             boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
//             zIndex: 1000,
//             width: "90%",
//             maxWidth: "500px",
//             borderRadius: "8px"
//           }}
//         >
//           <div ref={invoiceRef} className="text-sm text-gray-800">
//             {selectedBill && (
//               <div>
//                 <h1 className="text-2xl font-bold mb-2">Mobile Inventory Management System</h1>
//                 <hr />
//                 <h2 className="mb-2 font-medium">***** Customer Invoice *****</h2>
//                 <p><strong>Order ID:</strong> {selectedBill._id}</p>
//                 <p><strong>Customer:</strong> {selectedBill.customer.name}</p>
//                 <p><strong>Mobile:</strong> {selectedBill.customer.mobile}</p>
//                 <p><strong>Email:</strong> {selectedBill.customer.email}</p>
//                 <p><strong>Date:</strong> {new Date(selectedBill.billDate).toLocaleString()}</p>

//                 <h3 className="mt-4 font-semibold">Items Purchased:</h3>
//                 <ul className="list-disc pl-4">
//                   {selectedBill.order.map((item, index) => (
//                     <li key={index}>
//                       {item.productName} (x{item.quantity}) - ₹{item.price} = ₹{item.totalPrice}
//                     </li>
//                   ))}
//                 </ul>

//                 <p className="mt-4 font-bold">Total Amount: ₹{selectedBill.total}</p>
//                 <p className="mt-2">Thank you for your purchase!</p>
//               </div>
//             )}
//             <div className="mt-4 flex gap-4">
//               <button onClick={downloadInvoiceAsImage} className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded">
//                 Download as Image
//               </button>
//               <button onClick={closeModal} className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded">
//                 Close
//               </button>
//             </div>
//           </div>


//         </div>
//          */}
//       </div>
//     </AdminLayout>
//   );
// };

// export default Orders;
