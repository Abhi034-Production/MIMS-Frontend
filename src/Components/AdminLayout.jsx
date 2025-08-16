import React, { useState, useContext, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { MdDashboard, MdInventory, MdMoney, MdList, MdLogout, MdOutlineClose, MdOutlineLightMode, MdNotificationsNone, MdOutlineSettings } from "react-icons/md";
import { TbListDetails } from "react-icons/tb";
import { BiSolidReport } from "react-icons/bi";

const AdminLayout = ({ children }) => {
    const location = useLocation();
    const { user, logout } = useContext(AuthContext);
    const [businessName, setBusinessName] = useState("");
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [businessCategory, setBusinessCategory] = useState("");

    const Nav_Links = [
        { label: 'Dashboard', to: '/home', icon: <MdDashboard /> },
        { label: 'Inventory', to: '/inventory', icon: <MdInventory /> },
        { label: 'Billing', to: '/billing', icon: <MdMoney /> },
        { label: 'Orders', to: '/orders', icon: <MdList /> },
        // { label: 'Reports', to: '/report', icon: <BiSolidReport /> },
        { label: 'Business Detail', to: '/business-detail', icon: <TbListDetails /> },
    ];

    useEffect(() => {
        if (!user || !user.email) return;
        fetch(`https://mims-backend-x0i3.onrender.com/business-profile/${user.email}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.status === "success" && data.profile && data.profile.businessName) {
                    setBusinessName(data.profile.businessName);
                    if (data.profile.businessCategory) {
                        setBusinessCategory(data.profile.businessCategory);
                        localStorage.setItem("businessCategory", data.profile.businessCategory);
                    }
                } else {
                    setBusinessName("");
                    setBusinessCategory("");
                }
            })
            .catch(() => {
                setBusinessName("");
                setBusinessCategory("");
            });
        // Also check localStorage in case user just saved
        const cat = localStorage.getItem("businessCategory");
        if (cat) setBusinessCategory(cat);
    }, [user]);

    const handleNavToggle = () => {
        setIsNavOpen(!isNavOpen);
    };

    // Custom sidebar for Share Market Trade Management
    const ShareMarketSidebar = (
        <ul className="w-full flex-1">
            <h1 className="text-xl p-1 mb-1 text-white font-semibold">
                <img src="https://i.ibb.co/MkqjQ2cG/logo.png" />
            </h1>
            <hr className="mb-3 p-2" />
            <li className="w-full ">
                <Link to="/portfolio" className={`p-2 flex items-center rounded-lg text-lg mb-2 font-semibold transition-colors duration-300 ${location.pathname === "/home" ? "bg-[#5990d7] text-white dark:bg-blue-900 dark:text-white" : "hover:bg-blue-300 hover:text-white dark:hover:bg-blue-900"}`} onClick={() => setIsNavOpen(false)}>
                    <p className="flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 w-full">
                        <span className="text-2xl text-white"><MdDashboard /></span>
                        <span className="text-xl text-white">Portfolio</span>
                    </p>
                </Link>
            </li>
            <li className="w-full">
                <Link to="/new-entry" className={`p-2 flex items-center rounded-lg text-lg mb-2 font-semibold transition-colors duration-300 ${location.pathname === "/home" ? "bg-[#5990d7] text-white dark:bg-blue-900 dark:text-white" : "hover:bg-blue-300 hover:text-white dark:hover:bg-blue-900"}`} onClick={() => setIsNavOpen(false)}>
                    <p className="flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 w-full">
                        <span className="text-2xl text-white"><MdDashboard /></span>
                        <span className="text-xl text-white">New Entry</span>
                    </p>
                </Link>
            </li>

              <li className="w-full">
                <Link to="/my-trades" className={`p-2 flex items-center rounded-lg text-lg mb-2 font-semibold transition-colors duration-300 ${location.pathname === "/home" ? "bg-[#5990d7] text-white dark:bg-blue-900 dark:text-white" : "hover:bg-blue-300 hover:text-white dark:hover:bg-blue-900"}`} onClick={() => setIsNavOpen(false)}>
                    <p className="flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 w-full">
                        <span className="text-2xl text-white"><MdDashboard /></span>
                        <span className="text-xl text-white">Trade History</span>
                    </p>
                </Link>
            </li>

          
            {/* <li className="w-full">
                <Link to="/portfolio" className={`p-2 flex items-center rounded-lg text-lg mb-2 font-semibold transition-colors duration-300 ${location.pathname === "/portfolio" ? "bg-[#5990d7] text-white dark:bg-blue-900 dark:text-white" : "hover:bg-blue-300 hover:text-white dark:hover:bg-blue-900"}`} onClick={() => setIsNavOpen(false)}>
                    <p className="flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 w-full">
                        <span className="text-2xl text-white"><MdInventory /></span>
                        <span className="text-xl text-white">Portfolio</span>
                    </p>
                </Link>
            </li>
            <li className="w-full">
                <Link to="/transactions" className={`p-2 flex items-center rounded-lg text-lg mb-2 font-semibold transition-colors duration-300 ${location.pathname === "/transactions" ? "bg-[#5990d7] text-white dark:bg-blue-900 dark:text-white" : "hover:bg-blue-300 hover:text-white dark:hover:bg-blue-900"}`} onClick={() => setIsNavOpen(false)}>
                    <p className="flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 w-full">
                        <span className="text-2xl text-white"><MdMoney /></span>
                        <span className="text-xl text-white">Transactions</span>
                    </p>
                </Link>
            </li>
            <li className="w-full">
                <Link to="/reports" className={`p-2 flex items-center rounded-lg text-lg mb-2 font-semibold transition-colors duration-300 ${location.pathname === "/reports" ? "bg-[#5990d7] text-white dark:bg-blue-900 dark:text-white" : "hover:bg-blue-300 hover:text-white dark:hover:bg-blue-900"}`} onClick={() => setIsNavOpen(false)}>
                    <p className="flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 w-full">
                        <span className="text-2xl text-white"><BiSolidReport /></span>
                        <span className="text-xl text-white">Reports</span>
                    </p>
                </Link>
            </li> */}
            <li className="w-full">
                <Link to="/settings" className={`p-2 flex items-center rounded-lg text-lg mb-2 font-semibold transition-colors duration-300 ${location.pathname === "/settings" ? "bg-[#5990d7] text-white dark:bg-blue-900 dark:text-white" : "hover:bg-blue-300 hover:text-white dark:hover:bg-blue-900"}`} onClick={() => setIsNavOpen(false)}>
                    <p className="flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 w-full">
                        <span className="text-2xl text-white"><MdOutlineSettings /></span>
                        <span className="text-xl text-white">Settings</span>
                    </p>
                </Link>
            </li>
        </ul>
    );

    return (
        <>
            <div className="dark:text-white flex min-h-screen h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 transition-colors">
                {/* Sidebar */}
                <aside
                    className={`bg-gray-600 dark:text-white dark:bg-gray-800 p-5 text-white fixed md:relative h-screen 
                flex flex-col items-center md:items-start w-64 transition-transform duration-300
                ${isNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} z-10`}
                >
                    <button
                        className="text-white text-2xl self-end mb-4 md:hidden"
                        onClick={handleNavToggle}
                    >
                        <MdOutlineClose />
                    </button>

                    <nav className="w-full flex flex-col h-full">
                        {/* Conditionally render sidebar */}
                        {businessCategory === "Share Market Trade Management" ? (
                            ShareMarketSidebar
                        ) : (
                            <ul className="w-full flex-1">
                                <h1 className="text-xl p-1 mb-1 text-white font-semibold">
                                    <img src="https://i.ibb.co/MkqjQ2cG/logo.png" />
                                </h1>

                                <hr className="mb-3 p-2" />
                                {Nav_Links.map((item, index) => (
                                    <li key={index} className="w-full">
                                        <Link
                                            to={item.to}
                                            className={`p-2 flex items-center rounded-lg text-lg 
                                            mb-2 font-semibold transition-colors 
                                            duration-300 ${location.pathname === item.to ?
                                                    "bg-[#5990d7] text-white dark:bg-blue-900 dark:text-white" : "hover:bg-blue-300 hover:text-white dark:hover:bg-blue-900"}`}
                                            onClick={() => setIsNavOpen(false)}
                                        >
                                            <p className="flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 w-full">
                                                <span className="text-2xl text-white">{item.icon}</span>
                                                <span className="text-xl text-white">{item.label}</span>
                                            </p>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 mt-auto
                            text-white bg-red-500 hover:bg-red-600 font-semibold rounded-lg transition duration-200"
                        >
                            <MdLogout className="text-lg md:text-xl" />
                            <span>Logout</span>
                        </button>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 dark:text-white flex flex-col min-h-0 overflow-hidden bg-gray-100 dark:bg-gray-900 transition-colors">
                    {/* Top Bar */}
                    <div className="border-b w-full dark:text-white h-16 flex items-center px-4 bg-white dark:bg-gray-800 shadow-sm flex-shrink-0 transition-colors">
                        {/* Mobile Nav Toggle */}
                        <button
                            className="text-3xl md:hidden dark:text-white focus:outline-none"
                            onClick={handleNavToggle}
                        >
                            ☰
                        </button>
                        <div className="hidden dark:text-white md:block">
                            <span id="businessName" className="text-xl ml-2 font-semibold">
                                {businessName}
                            </span>
                        </div>
                        <div className="ml-auto dark:text-white flex items-center gap-8 text-2xl sm:text-base font-medium text-gray-700">
                            <button className="hover:text-blue-500 text-2xl transition hidden"><MdOutlineLightMode /></button>
                            <button className="hover:text-blue-500 text-2xl transition"><MdNotificationsNone /></button>
                            <button className="hover:text-blue-500 text-2xl transition">
                                <Link to='/settings'><MdOutlineSettings /></Link>
                            </button>
                        </div>
                    </div>

                    {/* Page Content - Scrollable Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-gray-900 transition-colors">
                        {children}

                        {/* Footer - Fixed to bottom of content area */}
                        <div className="p-4 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-white mt-4">
                            <span>Powered by</span>
                            <img className="w-20 h-20 object-contain" src="https://i.ibb.co/MkqjQ2cG/logo.png" alt="Logo" />
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default AdminLayout;