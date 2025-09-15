import React, { useEffect, useState, useContext, useRef } from "react";
import Layout from "../Components/Layout";
import { AuthContext } from "../Context/AuthContext";
import { Link } from "react-router-dom";
import { MdOutlineHome, MdFileDownload } from 'react-icons/md';
import Spinner from '../Components/Spinner'
import { Helmet } from "react-helmet-async";
import Seo from "../Components/Seo";

const BusinessDetail = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(true);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const isEditingRef = useRef(false);

  useEffect(() => {
    if (!user || !user.email) return;
    setLoading(true);
    fetch(`http://localhost:3001/business-profile/${user.email}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setProfile(data.profile);
          if (!isEditingRef.current) {
            setForm(data.profile);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files[0] }));
  };

  const handleEdit = () => {
    isEditingRef.current = true;
    setEditMode(true);
    setMessage("");
  };

  const handleCancel = () => {
    isEditingRef.current = false;
    setEditMode(false);
    setForm(profile);
    setMessage("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("");

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("userEmail", user.email);

    try {
      const res = await fetch("http://localhost:3001/business-profile", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.status === "success") {
        setProfile(data.profile);
        setForm(data.profile);
        setEditMode(false);
        isEditingRef.current = false;
        setMessage("Profile updated successfully!");
      } else {
        setMessage(data.message || "Update failed");
      }
    } catch {
      setMessage("Update failed");
    }
  };

  if (loading) return <Layout> <div className="text-center py-10"><Spinner /></div></Layout>;
  if (!profile) return <Layout> <div className="text-center py-10 text-red-500">No business profile found.</div></Layout>;

  return (
    <Layout>

      <Seo
        title="Business Details | easyinventory"
        description="View and update your business profile including name, contact info, logo, and stamp on easyinventory."
        keywords="business profile, business details, company logo, business stamp, easyinventory"
        url="https://easyinventory.online/business-details"
      />


      <div className="text-sm text-gray-600 mb-4 dark:text-white">
        <nav className="flex items-center space-x-2 dark:text-white">
          <Link to='/home'><MdOutlineHome fontSize={20} /></Link>
          <span className="text-gray-400 dark:text-white">/</span>
          <span className="font-semibold text-gray-800 dark:text-white">Business-Details</span>
        </nav>
      </div>


      <div className="w-full mx-auto bg-white dark:bg-gray-900 p-6 sm:p-8 md:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 mt-10">
        <h2 className="hidden text-3xl sm:text-4xl font-extrabold mb-8 sm:mb-10 text-gray-800 dark:text-white text-center tracking-wide">Business Details</h2>
        {message && <div className="mb-5 text-center hidden text-green-600 font-semibold text-base sm:text-lg">{message}</div>}
        <form onSubmit={handleSave} encType="multipart/form-data">
          <div className="flex flex-col gap-6 md:gap-8 w-full">
            <div className="flex-1 flex flex-col gap-5 sm:gap-7 bg-gray-50/80 dark:bg-gray-800/80 rounded-xl shadow p-4 sm:p-8 w-full min-w-[220px]">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                <span className="w-40 sm:w-48 font-semibold text-gray-700 dark:text-white text-base sm:text-lg">Business Name:</span>
                {editMode ? (
                  <input type="text" name="businessName" value={form.businessName || ""} onChange={handleChange} required className="flex-1 px-3 sm:px-5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white text-base sm:text-lg" />
                ) : (
                  <span className="text-base sm:text-xl text-gray-900 dark:text-white font-semibold">{profile.businessName}</span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                <span className="w-40 sm:w-48 font-semibold text-gray-700 dark:text-white text-base sm:text-lg">Mobile Number:</span>
                {editMode ? (
                  <input type="tel" name="businessMobile" value={form.businessMobile || ""} onChange={handleChange} required className="flex-1 px-3 sm:px-5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white text-base sm:text-lg" />
                ) : (
                  <span className="text-base sm:text-xl text-gray-900 dark:text-white font-semibold">{profile.businessMobile}</span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                <span className="w-40 sm:w-48 font-semibold text-gray-700 dark:text-white text-base sm:text-lg">Address:</span>
                {editMode ? (
                  <input type="text" name="businessAddress" value={form.businessAddress || ""} onChange={handleChange} required className="flex-1 px-3 sm:px-5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white text-base sm:text-lg" />
                ) : (
                  <span className="text-base sm:text-xl text-gray-900 dark:text-white font-semibold">{profile.businessAddress}</span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                <span className="w-40 sm:w-48 font-semibold text-gray-700 dark:text-white text-base sm:text-lg">Email:</span>
                {editMode ? (
                  <input type="email" name="businessEmail" value={form.businessEmail || ""} onChange={handleChange} readOnly className="flex-1 px-3 sm:px-5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white text-base sm:text-lg" />
                ) : (
                  <span className="text-base sm:text-xl text-gray-900 dark:text-white font-semibold">{profile.businessEmail}</span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                <span className="w-40 sm:w-48 font-semibold text-gray-700 dark:text-white text-base sm:text-lg">Category:</span>
                {editMode ? (
                  <input type="text" name="businessCategory" value={form.businessCategory || ""} onChange={handleChange} required className="flex-1 px-3 sm:px-5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white text-base sm:text-lg" />
                ) : (
                  <span className="text-base sm:text-xl text-gray-900 dark:text-white font-semibold">{profile.businessCategory}</span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 mt-6 justify-center items-center">
                <div className="flex flex-col items-center bg-white dark:bg-gray-900 rounded-xl shadow p-4 w-full max-w-xs">
                  <span className="font-semibold text-gray-700 dark:text-white mb-2 text-base sm:text-lg">Business Logo</span>
                  {editMode ? (
                    <input type="file" name="businessLogo" accept="image/*" onChange={handleFileChange} className="w-28 sm:w-36 md:w-44 text-gray-700 dark:text-white" />
                  ) : profile.businessLogo ? (
                    <img src={`http://localhost:3001${profile.businessLogo}`} alt="Logo" className="h-20 w-20 sm:h-28 sm:w-28 md:h-32 md:w-32 object-cover rounded-full border-2 border-blue-300 dark:border-blue-700 shadow bg-white" />
                  ) : (
                    <span className="text-gray-400 italic">No logo</span>
                  )}
                </div>
                <div className="flex flex-col items-center bg-white dark:bg-gray-900 rounded-xl shadow p-4 w-full max-w-xs">
                  <span className="font-semibold text-gray-700 dark:text-white mb-2 text-base sm:text-lg">Business Stamp/Sign</span>
                  {editMode ? (
                    <input type="file" name="businessStamp" accept="image/*" onChange={handleFileChange} className="w-28 sm:w-36 md:w-44 text-gray-700 dark:text-white" />
                  ) : profile.businessStamp ? (
                    <img src={`http://localhost:3001${profile.businessStamp}`} alt="Stamp" className="h-20 w-20 sm:h-28 sm:w-28 md:h-32 md:w-32 object-cover rounded-full border-2 border-blue-300 dark:border-blue-700 shadow bg-white" />
                  ) : (
                    <span className="text-gray-400 italic">No stamp/sign</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 sm:gap-6 mt-8 sm:mt-12 justify-center">
            {editMode ? (
              <>
                <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-8 sm:py-2.5 sm:px-12 rounded-xl shadow text-base sm:text-lg transition-all">Save</button>
                <button type="button" onClick={handleCancel} className="bg-gray-400 text-white font-bold py-2 px-8 sm:py-2.5 sm:px-12 rounded-xl shadow text-base sm:text-lg transition-all">Cancel</button>
              </>
            ) : (
              <button type="button" onClick={handleEdit} className="bg-blue-600 hidden text-white font-bold py-2 px-8 sm:py-2.5 sm:px-12 rounded-xl shadow text-base sm:text-lg transition-all">Edit</button>
            )}
          </div>
        </form>
      </div>

      <div className="w-full mx-auto bg-white dark:bg-gray-900 p-6 sm:p-8 md:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 mt-10">
        {/* Active User Card Template with Time and Info */}
        {user && (
          <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-xl shadow border border-blue-200 dark:border-blue-700">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-300 dark:bg-blue-700 flex items-center justify-center text-white text-xl font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800 dark:text-white">{user.name || "Active User"}</div>
              <div className="text-base text-gray-600 dark:text-gray-300">{user.email}</div>

              {user.role && (
                <div className="text-sm text-gray-500 dark:text-gray-400">Role: User</div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BusinessDetail;

