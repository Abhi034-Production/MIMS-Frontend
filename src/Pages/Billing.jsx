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


import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../Components/AdminLayout";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import { MdOutlineHome } from 'react-icons/md'
import jsPDF from "jspdf";

const Billing = () => {
  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [total, setTotal] = useState(0);
  const [recentBills, setRecentBills] = useState([]);
  const [customer, setCustomer] = useState({ name: "", mobile: "", email: "" });
  const [billDate, setBillDate] = useState("");

  useEffect(() => {
    axios.get(`https://mims-backend-x0i3.onrender.com/products`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  useEffect(() => {
    const now = new Date();
    setBillDate(now.toISOString().slice(0, 16));
  }, []);

  useEffect(() => {
    axios.get(`https://mims-backend-x0i3.onrender.com/bills`)
      .then((res) => {
        const sorted = res.data.sort((a, b) => new Date(b.billDate) - new Date(a.billDate));
        setRecentBills(sorted.slice(0, 4));
      })
      .catch((err) => console.error("Error fetching recent bills:", err));
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


  const handleShareWhatsApp = async (bill = null) => {
  const cust = bill ? bill.customer : customer;
  const ord = bill ? bill.order : order;
  const tot = bill ? bill.total : total;

  const doc = new jsPDF();
  doc.setFontSize(12);
  doc.text("Mobile Inventory Management System - Bill Receipt", 10, 10);
  doc.text(`Customer: ${cust.name}`, 10, 20);
  doc.text(`Mobile: ${cust.mobile}`, 10, 30);
  doc.text(`Email: ${cust.email || 'N/A'}`, 10, 40);
  doc.text(`Date: ${new Date().toLocaleString()}`, 10, 50);

  let y = 60;
  ord.forEach((item, index) => {
    doc.text(
      `${index + 1}. ${item.productName || item.name} - ₹${item.price} x ${item.quantity || item.orderQuantity} = ₹${item.totalPrice}`,
      10,
      y
    );
    y += 10;
  });

  doc.text(`Total Amount: ₹${tot}`, 10, y + 10);

  try {
    const pdfBlob = doc.output("blob");

    const formData = new FormData();
    formData.append("file", pdfBlob, "invoice.pdf");

    // ✅ Upload to File.io (valid for 1 download or 24 hours by default)
    const uploadRes = await fetch("https://file.io/?expires=1d", {
      method: "POST",
      body: formData,
    });

    const data = await uploadRes.json();
    if (!data.success) throw new Error("Upload failed");

    const fileUrl = data.link;

    const message = `Hello ${cust.name},%0AHere is your invoice:%0A${fileUrl}%0AThank you for shopping with us!`;
    const whatsappURL = `https://wa.me/${cust.mobile}?text=${message}`;
    window.open(whatsappURL, "_blank");

    toast.success("Invoice shared on WhatsApp!");
  } catch (err) {
    console.error("Error sharing invoice via WhatsApp:", err);
    toast.error("Failed to share invoice. Please try again.");
  }
};


  const handleShareGmail = (bill = null) => {
    const cust = bill ? bill.customer : customer;
    const ord = bill ? bill.order : order;
    const tot = bill ? bill.total : total;

    const subject = encodeURIComponent("Mobile Inventory Management System - Bill Receipt");
    const body = encodeURIComponent(
      `Hello ${cust.name},\n\nHere is your bill receipt:\n\n` +
      ord.map(item => `${item.productName} - ₹${item.price} x ${item.quantity || item.orderQuantity} = ₹${item.totalPrice}`).join("\n") +
      `\n\nTotal: ₹${tot}\n\nThank you for shopping with us!`
    );
    window.open(`mailto:${cust.email}?subject=${subject}&body=${body}`, "_blank");
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
      toast.success("Bill Saved & Share Successfully..!");

      handleShareWhatsApp();
      handleShareGmail();

      setCustomer({ name: "", mobile: "", email: "" });
      setOrder([]);
      setTotal(0);
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

        {/* Save & Share */}
        {order.length > 0 && (
          <div className="text-center">
            <button
              onClick={handleSaveBill}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              Save & Share
            </button>
          </div>
        )}

        {/* Recent Bills Section */}
        {recentBills.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Last 4 Bills</h2>
            <div className="grid grid-cols-1 gap-4">
              {recentBills.map((bill) => (
                <div key={bill._id} className="bg-white p-4 rounded-lg shadow">
                  <p className="font-medium">Customer: {bill.customer.name}</p>
                  <p>Mobile: {bill.customer.mobile}</p>
                  <p>Total: ₹{bill.total}</p>
                  <p>Date: {new Date(bill.billDate).toLocaleString()}</p>
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => handleShareWhatsApp(bill)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Share WhatsApp
                    </button>
                    <button
                      onClick={() => handleShareGmail(bill)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Share Gmail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <ToastContainer />
      </div>
    </AdminLayout>
  );
};

export default Billing;
