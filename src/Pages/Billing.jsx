import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import axios from "axios";
import AdminLayout from "../Components/AdminLayout";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import { MdOutlineHome, MdFileDownload } from 'react-icons/md';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Spinner from "../Components/Spinner";



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
  const [showPreview, setShowPreview] = useState(false);
  const [editPriceMode, setEditPriceMode] = useState(false);
  const [tempPrices, setTempPrices] = useState({});
  const invoiceRef = useRef(null);
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
      .catch(() => { });
  }, [user]);

  useEffect(() => {
    axios.get("http://localhost:3001/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  useEffect(() => {
    const now = new Date();
    setBillDate(now.toISOString().slice(0, 16));
  }, []);

  const fetchRecentBills = () => {
    axios.get("http://localhost:3001/bills")
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
    if (!product) return;
    const currentPrice = tempPrices[selectedProductId] || product.price;
    if (quantity > 0 && quantity <= product.quantity) {
      const existingProduct = order.find((item) => item._id === product._id);
      if (existingProduct) {
        const updatedOrder = order.map((item) =>
          item._id === product._id
            ? {
              ...item,
              orderQuantity: item.orderQuantity + quantity,
              price: currentPrice,
              totalPrice: (item.orderQuantity + quantity) * currentPrice
            }
            : item
        );
        setOrder(updatedOrder);
      } else {
        const orderProduct = {
          ...product,
          price: currentPrice,
          orderQuantity: quantity,
          totalPrice: quantity * currentPrice,
        };
        setOrder([...order, orderProduct]);
      }

      if (tempPrices[selectedProductId]) {
        const newTempPrices = { ...tempPrices };
        delete newTempPrices[selectedProductId];
        setTempPrices(newTempPrices);
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
    setShowPreview(false);
  };

  const shareInvoiceOnWhatsApp = async () => {
    const buttonEl = document.querySelector("#invoice-actions");
    if (buttonEl) buttonEl.style.display = "none";

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 1.5,
        quality: 0.8,
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.8);
      // Use A5 size for PDF
      const pdf = new jsPDF("p", "mm", "a5");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pdfHeight);

      const pdfBlob = pdf.output("blob");

      const formData = new FormData();
      formData.append("file", pdfBlob, `invoice_${selectedBill._id}.pdf`);

      const uploadResponse = await fetch("https://tmpfiles.org/api/v1/upload", {
        method: "POST",
        body: formData
      });

      const uploadData = await uploadResponse.json();

      if (!uploadData?.data?.url) {
        throw new Error("Failed to upload PDF");
      }

      const pdfUrl = uploadData.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");

      const name = selectedBill?.customer?.name || "Customer";
      let mobile = selectedBill?.customer?.mobile || "";
      mobile = mobile.replace(/\D/g, "");
      if (!mobile.startsWith("91")) mobile = "91" + mobile;

      const message = `Hello ${name},\n\nHere is your invoice from Sai Mobile Shop:\n${pdfUrl}\n\nThank you for your business!`;
      const whatsappLink = `https://wa.me/${mobile}?text=${encodeURIComponent(message)}`;

      window.open(whatsappLink, "_blank");

      toast.success("Invoice shared successfully!");

    } catch (err) {
      console.error("Error sharing on WhatsApp:", err);
      toast.error("Error sharing invoice. Please try downloading and sharing manually.");
    } finally {
      if (buttonEl) buttonEl.style.display = "flex";
    }
  };

  const downloadInvoiceAsPDF = () => {
    const buttons = document.querySelector("#invoice-actions");
    if (buttons) buttons.style.display = "none";

    setTimeout(async () => {
      try {
        const canvas = await html2canvas(invoiceRef.current, {
          scale: 1.5,
          quality: 0.8,
          logging: false
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.8);
        // Use A5 size for PDF
        const pdf = new jsPDF("p", "mm", "a5");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;

        pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pdfHeight);
        pdf.save(`invoice_${selectedBill._id}.pdf`);
      } catch (error) {
        toast.error("Error generating PDF");
      } finally {
        if (buttons) buttons.style.display = "flex";
      }
    }, 200);

  };

  const generateAndSharePDF = async () => {
    if (!customer.name || !/^91\d{10}$/.test(customer.mobile)) {
      toast.error("Please enter valid name and 10-digit mobile number with '91' prefix.");
      return;
    }

    try {
      const tempBill = {
        _id: `Invoice_${Math.floor(1000 + Math.random() * 9000)}`,
        customer,
        billDate: new Date().toISOString(),
        order: order.map(item => ({
          productName: item.name,
          price: item.price,
          quantity: item.orderQuantity,
          totalPrice: item.totalPrice,
        })),
        total,
      };

      setSelectedBill(tempBill);
      setShowPreview(true);
    } catch (err) {
      toast.error("Something went wrong: " + err.message);
    }

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
    businessEmail: businessProfile?.businessEmail || ""
  };

    try {
      await axios.post("http://localhost:3001/save-bill", billData);
      toast.success("Bill Saved Successfully!");
      setCustomer({ name: "", mobile: "", email: "" });
      setOrder([]);
      setTotal(0);
      fetchRecentBills();
      setShowPreview(false);
    } catch (error) {
      console.error("Error saving bill:", error);
    }

  };

  const handleSaveAndShare = async () => {
    await handleSaveBill();
    if (selectedBill) {
      await shareInvoiceOnWhatsApp();
    }
  };

  return (
    <AdminLayout>
      <div className="text-sm text-gray-600 mb-4 dark:text-white">
        <nav className="flex items-center space-x-2 dark:text-white">
          <Link to='/home'><MdOutlineHome fontSize={20} /></Link>
          <span className="text-gray-400 dark:text-white">/</span>
          <span className="font-semibold text-gray-800 dark:text-white">Billing</span>
        </nav>
      </div>

      <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
        {/* Customer Form */}
           <input type="hidden" name="businessEmail" value={businessProfile?.businessEmail || ''} readOnly />
          
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6 transition-colors">
          {['name', 'mobile', 'email'].map((field, idx) => (
            <div key={idx}>
              <label className="block text-sm font-medium text-gray-600 dark:text-white mb-1 capitalize">{field}:</label>
              <input
                type={field === 'email' ? 'email' : field === 'mobile' ? 'tel' : 'text'}
                name={field}
                placeholder={`Enter ${field}`}
                value={customer[field]}
                onChange={handleCustomerChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                required
              />
            </div>
          ))}
        </div>

        {/* Product Selection */}

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6 transition-colors">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            {/* Product */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 dark:text-white mb-1">Product:</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Product</option>
                {products
                  .filter(product => !businessProfile || !businessProfile.businessEmail || product.email === businessProfile.businessEmail)
                  .map(product => (
                    <option key={product._id} value={product._id}>
                      {product.name} - ₹{product.price.toFixed(2)}
                    </option>
                  ))}
              </select>
              {/* Hidden input for business email */}
             </div>
            {/* Quantity */}
            <div className="w-full md:w-40">
              <label className="block text-sm font-medium text-gray-600 dark:text-white mb-1">Quantity:</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-white"
                required
              />
            </div>
            {/* Add Button */}
            <div className="w-full md:w-32 flex items-end">
              <button
                onClick={addToOrder}
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                ADD
              </button>
            </div>
          </div>

          <br />

          {selectedProductId && (
            <div className="md:col-span-2 flex w-full flex-col">
              <label className="block text-sm font-medium text-gray-600 dark:text-white mb-1">Price:</label>
              <div className="flex items-center gap-2 h-full">
                <button
                  type="button"
                  onClick={() => setEditPriceMode(!editPriceMode)}
                  className={`h-12 px-4 rounded-md text-sm font-medium transition-colors flex-shrink-0 ${editPriceMode
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                    }`}
                >
                  {editPriceMode ? 'Editing' : 'Edit'}
                </button>
                {editPriceMode && (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="New Price"
                    value={tempPrices[selectedProductId] || ''}
                    onChange={(e) => {
                      const newPrice = parseFloat(e.target.value);
                      setTempPrices({
                        ...tempPrices,
                        [selectedProductId]: isNaN(newPrice) ? '' : newPrice
                      });
                    }}
                    className="h-12 w-full border border-gray-300 dark:border-gray-600 rounded-md p-4 text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>
            </div>
          )}


          {editPriceMode && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => {
                  setTempPrices({});
                  setEditPriceMode(false);
                }}
                className="text-sm bg-red-100 hover:bg-red-200 text-red-700 font-medium py-1 px-3 rounded-md transition-colors"
              >
                Reset All Prices
              </button>
            </div>
          )}
        </div>


        {/* Order Table */}
        {order.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 mb-6 sm:p-0 transition-colors">
          <table className="w-full text-center text-[10px] xs:text-xs sm:text-sm md:text-base table-fixed break-words">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-1 py-2 sm:px-2 sm:py-4 dark:text-white whitespace-normal">Product Name</th>
                <th className="px-1 py-2 sm:px-2 sm:py-4 dark:text-white whitespace-normal">Price</th>
                <th className="px-1 py-2 sm:px-2 sm:py-4 dark:text-white whitespace-normal">Quantity</th>
                <th className="px-1 py-2 sm:px-2 sm:py-4 dark:text-white whitespace-normal">Total</th>
                <th className="px-1 py-2 sm:px-2 sm:py-4 dark:text-white whitespace-normal">Actions</th>
              </tr>
            </thead>
            <tbody className="dark:text-white">
              {order.map(item => (
                <tr key={item._id} className="border-b">
                  <td className="py-1 px-1 sm:px-2 capitalize whitespace-normal break-words">{item.name}</td>
                  <td className="py-1 px-1 sm:px-2 text-blue-600 font-semibold whitespace-normal break-words">₹{item.price.toFixed(2)}</td>
                  <td className="py-1 px-1 sm:px-2 whitespace-normal break-words">{item.orderQuantity}</td>
                  <td className="py-1 px-1 sm:px-2 whitespace-normal break-words">₹{item.totalPrice.toFixed(2)}</td>
                  <td className="py-2">
                    <button
                      onClick={() => removeFromOrder(item._id)}
                      className="bg-red-500 hover:bg-red-600 py-1 px-1 sm:px-2 whitespace-normal break-words"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {/* Save Button */}
        {order.length > 0 && (
          <div className="text-center mb-10 flex justify-center gap-4">
            <button
              onClick={generateAndSharePDF}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Preview Invoice
            </button>
            <button
              onClick={handleSaveBill}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              Save Bill
            </button>
          </div>
        )}

        {/* Recent Orders Table */}
        {recentBills.length === 0 ? (
          <div className="flex justify-center items-center py-10">
            <Spinner />
            <span className="ml-2 text-gray-500 dark:text-gray-300 hidden">Loading... (wait 10 seconds for more data)</span>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 mb-6 sm:p-0 transition-colors">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Recent Orders</h2>
            <table className="w-full text-center text-[10px] xs:text-xs sm:text-sm md:text-base table-fixed break-words">
              <thead className="bg-gray-100 dark:bg-gray-700 dark:text-white">
                <tr>
                  <th className="px-1 py-2 sm:px-2 sm:py-4 dark:text-white whitespace-normal">Customer Name</th>
                  <th className="px-1 py-2 sm:px-2 sm:py-4 dark:text-white whitespace-normal">Products</th>
                  <th className="px-1 py-2 sm:px-2 sm:py-4 dark:text-white whitespace-normal">Total Price</th>
                  <th className="px-1 py-2 sm:px-2 sm:py-4 dark:text-white whitespace-normal">Date</th>
                  <th className="px-1 py-2 sm:px-2 sm:py-4 dark:text-white whitespace-normal">Invoice</th>
                </tr>
              </thead>
              <tbody className="dark:text-white">
                {recentBills
                  .filter(bill =>
                    businessProfile && businessProfile.businessEmail
                      ? bill.businessEmail === businessProfile.businessEmail
                      : true
                  )
                  .map((bill) => (
                    <tr key={bill._id} className="border-b">
                      <td className="py-1 px-1 sm:px-2 capitalize whitespace-normal break-words">{bill.customer.name}</td>
                      <td className="py-1 px-1 sm:px-2 capitalize whitespace-normal break-words">
                        <ul className="list-decimal pl-4">
                          {bill.order.map((item, i) => (
                            <li key={i} className="dark:text-white">{item.productName} (x{item.quantity}) - ₹{item.price}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="py-1 px-1 sm:px-2 text-blue-600 font-semibold whitespace-normal break-words">₹{bill.total}</td>
                      <td className="py-1 px-1 sm:px-2 capitalize whitespace-normal break-words">{new Date(bill.billDate).toLocaleString()}</td>
                      <td className="py-1 px-1 sm:px-2 capitalize whitespace-normal break-words">
                        <button onClick={() => handleDownloadInvoice(bill)}>
                          <MdFileDownload className="text-blue-600 text-xl" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
     
        {(showPreview || selectedBill) && selectedBill && (
          <div className="fixed w-1/2 inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white text-black p-4 rounded shadow-lg w-full max-w-[850px] max-h-[90vh] overflow-auto">
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
                        <h1 className="text-10xl font-extrabold text-center">
                          {businessProfile?.businessName || 'Business Name'}
                        </h1>
                      </div>
                      <div className="w-3/12 flex items-center">
                        <img
                          className="block m-auto -top-4 w-full h-full"
                          src={businessProfile?.businessLogo ? `http://localhost:3001${businessProfile.businessLogo}` : "Please upload your business logo"}
                          alt="Business Logo"
                        />
                      </div>
                    </div>
                    <div>
                      <p>{businessProfile?.businessAddress || 'Business Address'}</p>
                      <p>
                        <span>Phone: {businessProfile?.businessMobile || ''}</span>
                        <span> |  Email: {businessProfile?.businessEmail || ''}</span>
                      </p>
                    </div>
                  </div>

                  <div className="invoice-details">
                    <div>
                      <p><strong>Invoice Number:</strong> INV-{selectedBill?._id ? selectedBill._id.slice(-6).toUpperCase() : ''}</p>
                      <p><strong>Date:</strong> {selectedBill?.billDate ? new Date(selectedBill.billDate).toDateString() : ''}</p>
                    </div>
                    <div>
                      <p className="hidden"><strong>Due Date:</strong> {selectedBill?.billDate ? new Date(new Date(selectedBill.billDate).getTime() + 7 * 86400000).toDateString() : ''}</p>
                      <p><strong>Payment Terms:</strong> Payment Receipt</p>
                    </div>
                  </div>

                  <div className="customer-details">
                    <div>
                      <p><strong>Customer Details:</strong></p>
                      <p>{selectedBill?.customer?.name || ''}</p>
                      <p>Email: {selectedBill?.customer?.email || ''}</p>
                      <p>Mobile: {selectedBill?.customer?.mobile || ''}</p>
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
                      {(selectedBill?.order && selectedBill.order.length > 0) ? (
                        selectedBill.order.map((item2, i) => (
                          <tr key={i}>
                            <td>{item2.productName}</td>
                            <td>{item2.quantity}</td>
                            <td>₹{item2.price}</td>
                            <td>₹{item2.totalPrice}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="4" className="text-center">No products found</td></tr>
                      )}
                    </tbody>
                  </table>

                  <div className="total">
                    <p>Total: ₹{selectedBill?.total || 0}</p>
                  </div>

                  <div className="footer flex flex-col md:flex-row justify-between mt-0 items-center">
                    <div className="text-left">
                      <p>Thank you for shopping at {businessProfile?.businessName || 'Business Name'}!</p>
                      <p>Terms: All sales are final. Contact us for warranty details.</p>
                    </div>
                    <div className="stamp">
                      <img
                        className="w-24 h-24 md:w-32 md:h-32 object-contain"
                        src={businessProfile?.businessStamp ? `http://localhost:3001${businessProfile.businessStamp}` : "Please upload your business stamp"}
                        alt="Shop Stamp"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div id="invoice-actions" className="flex flex-wrap justify-end gap-3 mt-4 p-4 sticky bottom-0 bg-white">
                {showPreview ? (
                  <>
                    <button
                      onClick={handleSaveAndShare}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Save Bill & Share
                    </button>
                    <button
                      onClick={handleSaveBill}
                      className="bg-blue-600 hidden text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Save Bill Only
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={downloadInvoiceAsPDF}
                      className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                    >
                      Download PDF
                    </button>
                    <button
                      onClick={shareInvoiceOnWhatsApp}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Share via WhatsApp
                    </button>
                  </>
                )}
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

        <ToastContainer />
      </div>
    </AdminLayout>

  );
};

export default Billing;



