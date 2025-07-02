import React, { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { MdDashboard, MdInventory, MdMoney, MdList, MdLogout, MdOutlineClose, MdOutlineLightMode, MdNotificationsNone, MdOutlineSettings } from "react-icons/md";
import { FiUser } from "react-icons/fi";
import { BiSolidReport } from "react-icons/bi";


const AdminLayout = ({ children }) => {
    const location = useLocation();
    const { logout } = useContext(AuthContext);
    const [isNavOpen, setIsNavOpen] = useState(false);

    const Nav_Links = [
        { label: 'Dashboard', to: '/home', icon: <MdDashboard /> },
        { label: 'Inventory', to: '/inventory', icon: <MdInventory /> },
        { label: 'Billing', to: '/billing', icon: <MdMoney /> },
        { label: 'Orders', to: '/orders', icon: <MdList /> },
        { label: 'Reports', to: '/report', icon: <BiSolidReport /> },
    ];

    const handleNavToggle = () => {
        setIsNavOpen(!isNavOpen);
    };

    return (
        <>
            <div className="flex min-h-screen">
                {/* Sidebar */}
                <aside
                    className={`bg-gray-600 p-5 text-white fixed md:relative h-full md:h-auto 
                flex flex-col items-center md:items-start w-64 transition-transform duration-300
                ${isNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
                >
                    <button
                        className="text-white text-2xl self-end mb-4 md:hidden"
                        onClick={handleNavToggle}
                    >
                        <MdOutlineClose />
                    </button>

                    <nav className="w-full">
                        <ul className="w-full">
                            <h1 className="text-2xl p-2 mb-2 text-white  font-semibold">
                                Admin Panel
                            </h1>
                            <hr className="mb-3 p-2" />
                            {Nav_Links.map((item, index) => (
                                <li key={index} className="w-full">
                                    <Link
                                        to={item.to}
                                        className={`p-2 flex items-center rounded-lg text-lg 
                                        mb-2 font-semibold transition-colors 
                                        duration-300 ${location.pathname === item.to ?
                                                "bg-[#5990d7] text-white" : "hover:bg-blue-300 hover:text-white"}`}
                                        onClick={() => setIsNavOpen(false)}
                                    >
                                        <p className="flex items-center space-x-2 px-4 py-2  rounded-md transition-all duration-200 w-full">
                                            <span className="text-2xl text-white">{item.icon}</span>
                                            <span className="text-xl text-white">{item.label}</span>
                                        </p>
                                    </Link>
                                </li>
                            ))}
                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 mt-4   text-white bg-red-500 hover:bg-red-600 font-semibold  rounded-lg transition duration-200 ease-in-out text-sm md:text-base"
                            >
                                <MdLogout className="text-lg md:text-xl" />
                                <span>Logout</span>
                            </button>

                        </ul>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-2 md:p-4 transition-all duration-300 bg-gray-100 min-h-screen">
                    {/* Top Bar */}
                    <div className="border-b w-full h-16 flex items-center px-4 bg-white shadow-sm">
                        {/* Mobile Nav Toggle */}
                        <button
                            className="text-3xl md:hidden focus:outline-none"
                            onClick={handleNavToggle}
                        >
                            ☰
                        </button>
                        <div className="hidden md:block">
                            <span className="text-xl font-semibold">
                                Mobile Inventory Management System
                            </span>
                        </div>
                        <div className="ml-auto flex items-center  gap-8 text-2xl sm:text-base font-medium text-gray-700">
                            <button className="hover:text-blue-500 text-2xl transition hidden"><MdOutlineLightMode /></button>
                            <button className="hover:text-blue-500 text-2xl transition"><MdNotificationsNone /></button>
                            <button className="hover:text-blue-500 text-2xl transition">
                            <Link to='/settings'><MdOutlineSettings /></Link>
                            </button>
                            {/* <button className="hover:text-blue-500 text-2xl transition"><FiUser /></button> */}
                        </div>
                    </div>

                    {/* Page Content */}
                    <div className="p-4">{children}</div>

                    <div className="p-4 text-center text-gray-600 text-sm mt-4">
                        Made with ❤️ by Abhishek Shinde <br />
                        📧 <a href="mailto:abhishekshinde034@gmail.com"
                            className="text-blue-500 hover:underline">
                            abhishekshinde034@gmail.com
                        </a>
                    </div>
                </main>

            </div>
        </>
    );
};

export default AdminLayout;
