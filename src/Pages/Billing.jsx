import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import AdminLayout from "../Components/AdminLayout";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import { MdOutlineHome, MdFileDownload } from 'react-icons/md';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Billing = () => {
  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [total, setTotal] = useState(0);
  const [recentBills, setRecentBills] = useState([]);
  const [customer, setCustomer] = useState({ name: "", mobile: "", email: "" });
  const [billDate, setBillDate] = useState("");
  const [selectedBill, setSelectedBill] = useState(null);
  const invoiceRef = useRef(null);

  useEffect(() => {
    axios.get(`https://mims-backend-x0i3.onrender.com/products`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  useEffect(() => {
    const now = new Date();
    setBillDate(now.toISOString().slice(0, 16));
  }, []);






  
const shareInvoiceOnWhatsApp = async () => {
  const buttonEl = document.querySelector("#invoice-actions");
  if (buttonEl) buttonEl.style.display = "none";

  try {
    // 1. Generate PDF with fallback for html2canvas errors
    let pdfBlob;
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true, // Enable CORS for images
        allowTaint: true // Allow tainted canvas
      });
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pdfHeight);
      pdfBlob = pdf.output("blob");
    } catch (canvasError) {
      console.error("Canvas generation error:", canvasError);
      throw new Error("Could not generate invoice image. Please try again.");
    }

    // 2. Upload with multiple fallback options
    let invoiceURL;
    const filename = `Invoice_${selectedBill._id}.pdf`;
    
    // Try Transfer.sh first
    try {
      const response = await fetch(`https://transfer.sh/${filename}`, {
        method: "PUT",
        body: pdfBlob,
        headers: {
          "Content-Type": "application/pdf"
        }
      });

      if (!response.ok) throw new Error(`Transfer.sh upload failed: ${response.status}`);
      invoiceURL = await response.text();
    } catch (transferError) {
      console.warn("Transfer.sh failed, trying File.io:", transferError);
      
      // Fallback to File.io
      const formData = new FormData();
      formData.append("file", pdfBlob, filename);
      
      const fileIoResponse = await fetch("https://file.io", {
        method: "POST",
        body: formData,
      });
      
      const fileIoData = await fileIoResponse.json();
      if (!fileIoData?.link) throw new Error("Both upload services failed");
      invoiceURL = fileIoData.link;
    }

    // 3. Prepare WhatsApp message
    const name = selectedBill?.customer?.name || "Customer";
    let mobile = selectedBill?.customer?.mobile?.toString() || "";
    mobile = mobile.replace(/\D/g, "");
    
    // Validate mobile number
    if (!mobile) throw new Error("No mobile number provided");
    if (!mobile.startsWith("91")) mobile = "91" + mobile;
    if (mobile.length !== 12) throw new Error("Invalid mobile number");

    const message = `Hello ${name}, here is your invoice:\n${invoiceURL}`;
    const whatsappLink = `https://wa.me/${mobile}?text=${encodeURIComponent(message)}`;

    // 4. Open WhatsApp with multiple approaches
    try {
      // Method 1: window.open
      const newWindow = window.open(whatsappLink, "_blank", "noopener,noreferrer");
      
      // Fallback if popup blocked
      if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
        // Method 2: Create temporary link
        const a = document.createElement("a");
        a.href = whatsappLink;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => document.body.removeChild(a), 100);
      }
    } catch (windowError) {
      console.error("Window open failed:", windowError);
      // Final fallback - show clickable link
      toast.info(
        <span>
          Please <a href={whatsappLink} target="_blank" rel="noopener noreferrer" 
            style={{color: 'blue', textDecoration: 'underline'}}>
            click here
          </a> to send the invoice manually.
        </span>,
        { autoClose: false }
      );
    }

    toast.success("Invoice shared successfully!");

  } catch (err) {
    console.error("Error sharing invoice:", err);
    toast.error(err.message || "Failed to share invoice");
    
    // Detailed error for debugging
    if (process.env.NODE_ENV === "development") {
      toast.info(`Technical details: ${err.toString()}`);
    }
  } finally {
    if (buttonEl) buttonEl.style.display = "flex";
  }
};









  

  const fetchRecentBills = () => {
    axios.get(`https://mims-backend-x0i3.onrender.com/bills`)
      .then((res) => {
        const sorted = res.data.sort((a, b) => new Date(b.billDate) - new Date(a.billDate));
        setRecentBills(sorted.slice(0, 4));
      })
      .catch((err) => console.error("Error fetching recent bills:", err));
  };

  useEffect(() => {
    fetchRecentBills();
  }, []);

  const addToOrder = () => {
    const product = products.find((p) => p._id === selectedProductId);
    if (product && quantity > 0 && quantity <= product.quantity) {
      const existingProduct = order.find((item) => item._id === product._id);
      if (existingProduct) {
        const updatedOrder = order.map((item) =>
          item._id === product._id
            ? { ...item, orderQuantity: item.orderQuantity + quantity, totalPrice: (item.orderQuantity + quantity) * item.price }
            : item
        );
        setOrder(updatedOrder);
      } else {
        const orderProduct = {
          ...product,
          orderQuantity: quantity,
          totalPrice: quantity * product.price,
        };
        setOrder([...order, orderProduct]);
      }
    } else {
      toast.error("Invalid quantity or product");
    }
  };

  useEffect(() => {
    const totalAmount = order.reduce((acc, item) => acc + item.totalPrice, 0);
    setTotal(totalAmount);
  }, [order]);

  const removeFromOrder = (id) => {
    const updatedOrder = order.filter((item) => item._id !== id);
    setOrder(updatedOrder);
  };

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomer({ ...customer, [name]: value });
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



  











// const shareInvoiceOnWhatsApp = async () => {
//   const buttonEl = document.querySelector("#invoice-actions");
//   if (buttonEl) buttonEl.style.display = "none";

//   try {
//     // Generate PDF
//     const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
//     const imgData = canvas.toDataURL("image/png");
//     const pdf = new jsPDF("p", "mm", "a4");
//     const pageWidth = pdf.internal.pageSize.getWidth();
//     const imgProps = pdf.getImageProperties(imgData);
//     const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;
//     pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pdfHeight);
//     const pdfBlob = pdf.output("blob");

//     // Upload to Transfer.sh
//     const filename = `Invoice_${selectedBill._id}.pdf`;
//     const response = await fetch(`https://transfer.sh/${filename}`, {
//       method: "PUT",
//       body: pdfBlob,
//       headers: {
//         "Content-Type": "application/pdf"
//       }
//     });

//     if (!response.ok) {
//       throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
//     }

//     const invoiceURL = await response.text();

//     // Prepare WhatsApp message
//     const name = selectedBill?.customer?.name || "Customer";
//     let mobile = selectedBill?.customer?.mobile?.toString() || "";
//     mobile = mobile.replace(/\D/g, "");
//     if (mobile && !mobile.startsWith("91")) mobile = "91" + mobile;

//     const message = `Hello ${name}, here is your invoice:\n${invoiceURL}`;
//     const whatsappLink = `https://wa.me/${mobile}?text=${encodeURIComponent(message)}`;

//     // Open WhatsApp
//     window.open(whatsappLink, "_blank", "noopener,noreferrer");

//     // Show success notification
//     toast.success(
//       <span>
//         Invoice shared successfully! If WhatsApp didn't open,{" "}
//         <a 
//           href={whatsappLink} 
//           target="_blank" 
//           rel="noopener noreferrer"
//           style={{ color: 'blue', textDecoration: 'underline' }}
//         >
//           click here
//         </a>.
//       </span>
//     );

//   } catch (err) {
//     console.error("Error sharing invoice:", err);
//     toast.error(`Failed to share invoice: ${err.message}`);
//   } finally {
//     if (buttonEl) buttonEl.style.display = "flex";
//   }
// };




  


// const shareInvoiceOnWhatsApp = async () => {
//   const buttonEl = document.querySelector("#invoice-actions");
//   if (buttonEl) buttonEl.style.display = "none";

//   try {
//     const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
//     const imgData = canvas.toDataURL("image/png");

//     const pdf = new jsPDF("p", "mm", "a4");
//     const pageWidth = pdf.internal.pageSize.getWidth();
//     const imgProps = pdf.getImageProperties(imgData);
//     const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;

//     pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pdfHeight);
//     const pdfBlob = pdf.output("blob");

//     const formData = new FormData();
//     formData.append("file", pdfBlob, `Invoice_${selectedBill._id}.pdf`);

//     // Upload to file.io with 2-day expiration
//     const response = await fetch("https://file.io/?expires=2d", {
//       method: "POST",
//       body: formData,
//     });

//     const data = await response.json();

//     if (!data?.success || !data?.link) {
//       toast.error("Failed to upload invoice");
//       if (buttonEl) buttonEl.style.display = "flex";
//       return;
//     }

//     const invoiceURL = data.link;

//     const name = selectedBill?.customer?.name || "Customer";
//     let mobile = selectedBill?.customer?.mobile || "";
//     mobile = mobile.replace(/\D/g, ""); // remove non-digits
//     if (!mobile.startsWith("91")) mobile = "91" + mobile;

//     const message = `Hello ${name}, here is your invoice:\n${invoiceURL}`;
//     const whatsappLink = `https://wa.me/${mobile}?text=${encodeURIComponent(message)}`;

//     // Try safe method: Create <a> element and trigger click
//     const a = document.createElement("a");
//     a.href = whatsappLink;
//     a.target = "_blank";
//     a.rel = "noopener noreferrer";
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);

//     // Also show fallback link
//     toast.info(
//       <span>
//         If WhatsApp didn't open,{" "}
//         <a href={whatsappLink} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline' }}>
//           click here
//         </a>{" "}
//         to send manually.
//       </span>
//     );

//     toast.success("Invoice uploaded. WhatsApp opened.");
//   } catch (err) {
//     console.error("Error sharing on WhatsApp:", err);
//     alert("Error sharing on WhatsApp.");
//   } finally {
//     if (buttonEl) buttonEl.style.display = "flex";
//   }
// };









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

  const handleSaveBill = async () => {
    const billData = {
      customer,
      billDate,
      order: order.map(item => ({
        productName: item.name,
        price: item.price,
        quantity: item.orderQuantity,
        totalPrice: item.totalPrice,
      })),
      total,
    };

    try {
      await axios.post(`https://mims-backend-x0i3.onrender.com/save-bill`, billData);
      toast.success("Bill Saved Successfully!");
      setCustomer({ name: "", mobile: "", email: "" });
      setOrder([]);
      setTotal(0);
      fetchRecentBills();
    } catch (error) {
      console.error("Error saving bill:", error);
    }
  };

  return (
    <AdminLayout>
      <div className="text-sm text-gray-600 mb-4">
        <nav className="flex items-center space-x-2">
          <Link to='/home'><MdOutlineHome fontSize={20} /></Link>
          <span className="text-gray-400">/</span>
          <span className="font-semibold text-gray-800">Billing</span>
        </nav>
      </div>

      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        {/* Customer Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-lg shadow mb-6">
          {['name', 'mobile', 'email'].map((field, idx) => (
            <div key={idx}>
              <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">{field}:</label>
              <input
                type={field === 'email' ? 'email' : field === 'mobile' ? 'tel' : 'text'}
                name={field}
                placeholder={`Enter ${field}`}
                value={customer[field]}
                onChange={handleCustomerChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-blue-500"
                required
              />
            </div>
          ))}
        </div>

        {/* Product Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-lg shadow mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Product:</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 bg-white"
            >
              <option value="">Select Product</option>
              {products.map(product => (
                <option key={product._id} value={product._id}>
                  {product.name} - ₹{product.price.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Quantity:</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={addToOrder}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
              Add to Order
            </button>
          </div>
        </div>

        {/* Order Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow p-4 mb-6">
          <table className="w-full text-sm md:text-base">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Product Name</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Quantity</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {order.map(item => (
                <tr key={item._id} className="text-center border-b">
                  <td className="py-2">{item.name}</td>
                  <td className="py-2">₹{item.price.toFixed(2)}</td>
                  <td className="py-2">{item.orderQuantity}</td>
                  <td className="py-2">₹{item.totalPrice.toFixed(2)}</td>
                  <td className="py-2">
                    <button
                      onClick={() => removeFromOrder(item._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Save Button */}
        {order.length > 0 && (
          <div className="text-center mb-10">
            <button
              onClick={handleSaveBill}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              Save Bill
            </button>
          </div>
        )}

        {/* Recent Orders Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Orders</h2>
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
              {recentBills.map((bill) => (
                <tr key={bill._id} className="text-center border-b">
                  <td className="py-2">{bill.customer.name}</td>
                  <td className="text-left py-2">
                    <ul className="list-disc pl-4">
                      {bill.order.map((item, i) => (
                        <li key={i}>{item.productName} (x{item.quantity}) - ₹{item.price}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-2">₹{bill.total}</td>
                  <td className="py-2">{new Date(bill.billDate).toLocaleString()}</td>
                  <td className="py-2">
                    <button onClick={() => handleDownloadInvoice(bill)}>
                      <MdFileDownload className="text-blue-600 text-xl" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Invoice Modal */}
        {selectedBill && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-4 rounded shadow-lg w-full max-w-[850px]">
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
                {/* 
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
                </div> */}

                <div id="invoice-actions" className="flex flex-wrap justify-end gap-3 mt-4">
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
                    onClick={shareInvoiceOnWhatsApp}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Share via WhatsApp
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
          </div>
        )}

        <ToastContainer />
      </div>
    </AdminLayout>
  );
};

export default Billing;




// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import AdminLayout from "../Components/AdminLayout";
// import { Link } from "react-router-dom";
// import { ToastContainer, toast } from 'react-toastify';
// import { MdOutlineHome } from 'react-icons/md'

// const Billing = () => {
//   const [products, setProducts] = useState([]);
//   const [order, setOrder] = useState([]);
//   const [selectedProductId, setSelectedProductId] = useState("");
//   const [quantity, setQuantity] = useState(1);
//   const [total, setTotal] = useState(0);
//   const [customer, setCustomer] = useState({
//     name: "",
//     mobile: "",
//     email: "",
//   });

//   const [billDate, setBillDate] = useState("");

//   useEffect(() => {
//     axios
//       .get(`https://mims-backend-x0i3.onrender.com/products`)
//       .then((response) => setProducts(response.data))
//       .catch((error) => console.error("Error fetching products:", error));
//   }, []);

//   useEffect(() => {
//     const now = new Date();
//     setBillDate(now.toISOString().slice(0, 16));
//   }, []);

//   const addToOrder = () => {
//     const product = products.find((p) => p._id === selectedProductId);
//     if (product && quantity > 0 && quantity <= product.quantity) {
//       const orderProduct = {
//         ...product,
//         orderQuantity: quantity,
//         totalPrice: quantity * product.price,
//       };

//       const existingProduct = order.find((item) => item._id === product._id);
//       if (existingProduct) {
//         const updatedOrder = order.map((item) =>
//           item._id === product._id
//             ? {
//               ...item,
//               orderQuantity: item.orderQuantity + quantity,
//               totalPrice: (item.orderQuantity + quantity) * item.price,
//             }
//             : item
//         );
//         setOrder(updatedOrder);
//       } else {
//         setOrder([...order, orderProduct]);
//       }
//     } else {
//       toast.error("Invalid quantity or product");
//     }
//   };

//   useEffect(() => {
//     const totalAmount = order.reduce((acc, item) => acc + item.totalPrice, 0);
//     setTotal(totalAmount);
//   }, [order]);

//   const removeFromOrder = (id) => {
//     const updatedOrder = order.filter((item) => item._id !== id);
//     setOrder(updatedOrder);
//   };

//   const handleCustomerChange = (e) => {
//     const { name, value } = e.target;
//     setCustomer({ ...customer, [name]: value });
//   };

//   const handleShareWhatsApp = () => {
//     const billDetails = `Mobile Inventory Management System \n Bill Receipt\nCustomer Name: ${customer.name}\nMobile Number: ${customer.mobile}\nTotal Amount: ₹${total}\n\nProducts:\n${order
//       .map((item) => `${item.name} - ₹${item.price} x ${item.orderQuantity} = ₹${item.totalPrice}`)
//       .join("\n")}\n\nThank you for your purchase!`;

//     const encodedText = encodeURIComponent(billDetails);
//     window.open(`https://wa.me/${customer.mobile}?text=${encodedText}`, "_blank");
//   };

//   const handleShareGmail = () => {
//     const subject = encodeURIComponent("Mobile Inventory Management System");
//     const body = encodeURIComponent(
//       `Hello ${customer.name},\n\nHere is your bill receipt:\n\n` +
//       order
//         .map((item) => `${item.name} - ₹${item.price} x ${item.orderQuantity} = ₹${item.totalPrice}`)
//         .join("\n") +
//       `\n\nTotal: ₹${total}\n\n Thank you for shopping with us!`
//     );

//     window.open(`mailto:${customer.email}?subject=${subject}&body=${body}`, "_blank");
//   };

//   const handleSaveBill = async () => {
//     const billData = {
//       customer,
//       billDate,
//       order: order.map((item) => ({
//         productName: item.name,
//         price: item.price,
//         quantity: item.orderQuantity,
//         totalPrice: item.totalPrice,
//       })),
//       total,
//     };

//     try {
//       await axios.post(`https://mims-backend-x0i3.onrender.com/save-bill`, billData);
//       toast.success("Bill Saved & Share Successfully..!");

//       handleShareWhatsApp();
//       handleShareGmail();

//       setCustomer({ name: "", mobile: "", email: "" });
//       setOrder([]);
//       setTotal(0);
//     } catch (error) {
//       console.error("Error saving bill:", error);
//     }
//   };

//   return (
//     <>
//       <AdminLayout>
//         {/* Breadcrumbs */}
//         <div className="text-sm text-gray-600 mb-4">
//           <nav className="flex items-center space-x-2">
//             <span className="text-gray-500"><Link to='/home'><MdOutlineHome fontSize={20} /></Link></span>
//             <span className="text-gray-400">/</span>
//             <span className="font-semibold text-gray-800">Billing</span>
//           </nav>
//         </div>
//         <div className="p-4 md:p-6 bg-gray-50 min-h-screen">


//           {/* Customer Info */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-lg shadow mb-6">
//             {['name', 'mobile', 'email'].map((field, idx) => (
//               <div key={idx}>
//                 <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">{field}:</label>
//                 <input
//                   type={field === 'email' ? 'email' : field === 'mobile' ? 'tel' : 'text'}
//                   name={field}
//                   placeholder={`Enter ${field}`}
//                   value={customer[field]}
//                   onChange={handleCustomerChange}
//                   className="w-full border border-gray-300 rounded-md p-2 capitalize focus:outline-blue-500"
//                   required
//                 />
//               </div>
//             ))}
//           </div>

//           {/* Product Selection */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-lg shadow mb-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-600 mb-1">Product:</label>
//               <select
//                 value={selectedProductId}
//                 onChange={(e) => setSelectedProductId(e.target.value)}
//                 className="w-full border border-gray-300 rounded-md p-2 bg-white focus:outline-blue-500"
//               >
//                 <option value="">Select Product</option>
//                 {products.map((product) => (
//                   <option key={product._id} value={product._id}>
//                     {product.name} - ₹{product.price.toFixed(2)}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-600 mb-1">Quantity:</label>
//               <input
//                 type="number"
//                 value={quantity}
//                 onChange={(e) => setQuantity(parseInt(e.target.value))}
//                 className="w-full border border-gray-300 rounded-md p-2 focus:outline-blue-500"
//                 required
//               />
//             </div>

//             <div className="flex items-end">
//               <button
//                 onClick={addToOrder}
//                 className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
//               >
//                 Add to Order
//               </button>
//             </div>
//           </div>

//           {/* Order Summary */}
//           <div className="overflow-x-auto bg-white rounded-lg shadow p-4 mb-6">
//             <table className="w-full text-sm md:text-base">
//               <thead className="bg-gray-100">
//                 <tr>
//                   <th className="px-4 py-2">Product Name</th>
//                   <th className="px-4 py-2">Price</th>
//                   <th className="px-4 py-2">Quantity</th>
//                   <th className="px-4 py-2">Total</th>
//                   <th className="px-4 py-2">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {order.map((item) => (
//                   <tr key={item._id} className="text-center border-b">
//                     <td className="py-2">{item.name}</td>
//                     <td className="py-2">₹{item.price.toFixed(2)}</td>
//                     <td className="py-2">{item.orderQuantity}</td>
//                     <td className="py-2">₹{item.totalPrice.toFixed(2)}</td>
//                     <td className="py-2">
//                       <button
//                         onClick={() => removeFromOrder(item._id)}
//                         className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
//                       >
//                         Remove
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Save & Share */}
//           {order.length > 0 && (
//             <div className="text-center">
//               <button
//                 onClick={handleSaveBill}
//                 className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
//               >
//                 Save & Share
//               </button>
//             </div>
//           )}

//           <ToastContainer />
//         </div>
//       </AdminLayout>
//     </>
//   );
// };

// export default Billing;
