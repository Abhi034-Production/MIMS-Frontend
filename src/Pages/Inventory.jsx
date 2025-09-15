import React, { useState, useEffect } from "react";
import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import Layout from "../Components/Layout";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { Link } from "react-router-dom";
import { MdOutlineHome } from 'react-icons/md';
import Spinner from "../Components/Spinner";
import { Helmet } from "react-helmet-async";
import Seo from "../Components/Seo";

const Inventory = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", quantity: "", price: "", email: "" });
  const [editingProduct, setEditingProduct] = useState(null);
  const [businessEmail, setBusinessEmail] = useState("");


  useEffect(() => {
    if (!businessEmail) return;
    axios.get(`http://localhost:3001/products?email=${encodeURIComponent(businessEmail)}`)
      .then((response) => setProducts(response.data))
      .catch((error) => console.error("Error fetching products:", error));
  }, [businessEmail]);

  // Fetch business email from BusinessDetails
  useEffect(() => {
    if (user && user.email) {
      fetch(`http://localhost:3001/business-profile/${user.email}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success" && data.profile && data.profile.businessEmail) {
            setBusinessEmail(data.profile.businessEmail);
            setNewProduct((prev) => ({ ...prev, email: data.profile.businessEmail }));
          }
        });
    }
  }, [user]);

  const addProduct = (e) => {
    e.preventDefault();
    if (newProduct.name && newProduct.quantity && newProduct.price && businessEmail) {
      const productToSend = { ...newProduct, email: businessEmail };
      axios.post(`http://localhost:3001/add-product`, productToSend)
        .then((response) => {
          setProducts([...products, response.data]);
          setNewProduct({ name: "", quantity: "", price: "", email: businessEmail });
        })
        .catch((error) => console.error("Error adding product:", error));
      toast.success("Product Added Successfully..!");
    } else {
      toast.error("Please Fill All The Fields..!");
    }
  };

  const deleteProduct = (id) => {
    axios.delete(`http://localhost:3001/delete-product/${id}`)
      .then(() => {
        setProducts(products.filter((product) => product._id !== id));
      })
      .catch((error) => console.error("Error deleting product:", error));
    toast.warning("Deleted Product..!")
  };

  const startEditing = (product) => {
    setEditingProduct(product);
  };

  const saveEditProduct = (e) => {
    e.preventDefault();
    if (editingProduct.name && editingProduct.quantity && editingProduct.price && businessEmail) {
      const productToSend = { ...editingProduct, email: businessEmail };
      axios.put(`http://localhost:3001/update-product/${editingProduct._id}`, productToSend)
        .then((response) => {
          setProducts(products.map((product) =>
            product._id === editingProduct._id ? response.data : product
          ));
          setEditingProduct(null);
        })
        .catch((error) => console.error("Error updating product:", error));
      toast.success("Successful Updating Product..!");
    } else {
      toast.error("Please fill all the fields");
    }
  };

  return (
    <Layout>

      <Seo
        title="Inventory | easyinventory"
        description="Manage your inventory with ease on easyinventory. Add, edit, and delete products, update stock, and keep track of pricing."
        keywords="inventory, product management, stock tracking, inventory system, easyinventory"
        url="https://easyinventory.online/inventory"
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

        {/* Form */}
        <form
          onSubmit={editingProduct ? saveEditProduct : addProduct}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6 transition-colors"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full flex flex-col">
              <label className="dark:text-white block text-sm font-medium text-gray-600 mb-1">Product Name:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={editingProduct ? editingProduct.name : newProduct.name}
                  onChange={(e) =>
                    editingProduct
                      ? setEditingProduct({ ...editingProduct, name: e.target.value })
                      : setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md p-2 capitalize focus:outline-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white "
                  required
                />
                <input
                  type="hidden"
                  name="email"
                  value={businessEmail}
                  readOnly
                />
              </div>
            </div>
            <div className="w-full">
              <label className="dark:text-white block text-sm font-medium text-gray-600 mb-1">Quantity:</label>
              <input
                type="number"
                placeholder="Qty"
                value={editingProduct ? editingProduct.quantity : newProduct.quantity}
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({ ...editingProduct, quantity: parseInt(e.target.value) })
                    : setNewProduct({ ...newProduct, quantity: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white text-xs"
                required
              />
            </div>
            <div className="w-full">
              <label className="dark:text-white block text-sm font-medium text-gray-600 mb-1">Price:</label>
              <input
                type="number"
                placeholder="Price"
                value={editingProduct ? editingProduct.price : newProduct.price}
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })
                    : setNewProduct({ ...newProduct, price: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white text-xs"
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
            >
              {editingProduct ? "Save" : "Add Product"}
            </button>
            {editingProduct && (
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Product Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 mb-6 sm:p-0 transition-colors">
          {products.length === 0 ? (
            <>
              <Spinner />

            </>
          ) : (
            <table className="w-full text-center text-[10px] xs:text-xs sm:text-sm md:text-base table-fixed break-words">
              <thead className="bg-gray-100 dark:bg-gray-700 dark:text-white">
                <tr>
                  <th className="px-1 py-2 sm:px-2 sm:py-4 dark:text-white whitespace-normal">Product Name</th>
                  <th className="px-1 py-2 sm:px-2 dark:text-white whitespace-normal">Price</th>
                  <th className="px-1 py-2 sm:px-2 dark:text-white whitespace-normal">Qty</th>
                  <th className="px-1 py-2 sm:px-2 dark:text-white whitespace-normal">Stocks</th>
                  <th className="px-1 py-2 sm:px-2 dark:text-white whitespace-normal">Actions</th>
                </tr>
              </thead>
              <tbody className="dark:text-white">
                {products.map((product) => (
                  <tr key={product._id} className="border-b">
                    <td className="py-1 px-1 sm:px-2 capitalize whitespace-normal break-words">{product.name}</td>
                    <td className="py-1 px-1 sm:px-2 text-blue-600 font-semibold whitespace-normal break-words">₹ {product.price.toFixed(2)}</td>
                    <td className="py-1 px-1 sm:px-2 whitespace-normal break-words">{product.quantity}</td>
                    <td className="py-1 px-1 sm:px-2 font-semibold whitespace-normal break-words">
                      {product.quantity === 0 ? (
                        <span className="text-red-500">Out of Stock</span>
                      ) : (
                        <span className="text-green-500">Available</span>
                      )}
                    </td>
                    <td className="py-1 px-1 sm:px-2 whitespace-normal break-words">
                      <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                        <button
                          onClick={() => startEditing(product)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 sm:px-4 py-1 rounded text-xs sm:text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteProduct(product._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-4 py-1 rounded text-xs sm:text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <ToastContainer />
      </div>
    </Layout>
  );
};

export default Inventory;