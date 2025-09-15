import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import Seo from './Seo';


export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      {/* SEO Meta Tags */}
       <Seo
        title="easyinventory | Smart Inventory Management System"
        description="easyinventory helps businesses track, manage, and optimize stock in real-time with analytics and reports. A complete inventory management solution."
        keywords="inventory management, stock tracking, analytics, warehouse software, business tools"
        url="https://easyinventory.online"
        image="https://easyinventory.online/og-image.jpg"
      />
      

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white shadow-md border-b border-sky-200">
        <nav className="flex justify-between items-center px-4 sm:px-6 py-4 max-w-7xl mx-auto">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-sky-600">
          <Link to='/'>easy<span className="text-gray-900">inventory</span></Link>  
          </h1>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen((p) => !p)}
              aria-controls="mobile-menu"
              aria-expanded={menuOpen}
              className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <span className="sr-only">Toggle main menu</span>
              {menuOpen ? (
                /* Close icon */
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                /* Hamburger icon */
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 text-sm md:text-base font-medium">
            <a href="#features" className="hover:text-sky-600 transition">
              Features
            </a>
            <a href="#blogs" className="hover:text-sky-600 transition">
              Blogs
            </a>
            <a href="#about" className="hover:text-sky-600 transition">
              About
            </a>
            <a href="#contact" className="hover:text-sky-600 transition">
              Contact
            </a>
            <p className="hover:text-sky-600 transition"><Link to='/signup'>Signup</Link></p>
            <p className="hover:text-sky-600 transition">
                <Link className="p-2 rounded-lg  text-white bg-sky-400 border border-sky-400 font-bold shadow  transition text-sm sm:text-base" to='/login'>Login</Link></p>
          </div>
        </nav>

        {/* Mobile Menu Panel */}
        {menuOpen && (
          <div id="mobile-menu" className="md:hidden bg-white border-t border-sky-200 shadow-md">
            <div className="px-4 pt-3 pb-4 space-y-1">
              <a
                href="#features"
                onClick={() => setMenuOpen(false)}
                className="block px-2 py-2 rounded hover:bg-sky-50"
              >
                Features
              </a>
              <a
                href="#blogs"
                onClick={() => setMenuOpen(false)}
                className="block px-2 py-2 rounded hover:bg-sky-50"
              >
                Blogs
              </a>
              <a
                href="#about"
                onClick={() => setMenuOpen(false)}
                className="block px-2 py-2 rounded hover:bg-sky-50"
              >
                About
              </a>
             
              <a
                href="#contact"
                onClick={() => setMenuOpen(false)}
                className="block px-2 py-2 rounded hover:bg-sky-50"
              >
                Contact
              </a>
              
            <p className="block px-2 py-2 rounded hover:bg-sky-50">
                <Link to='/signup' >Signup</Link></p>
            <p className="block px-2 py-2 rounded hover:bg-sky-50">
              <Link className="p-2  rounded bg-white text-sky-600 border border-sky-400 font-bold shadow hover:bg-sky-50 transition text-sm sm:text-base" to='/login'>Login</Link>
            </p>
            </div>
          </div>
        )}
      </header>


      <main className="flex-1">
        {/* Hero Section */}
        <section className="flex flex-col m-2 items-center justify-center text-center px-4 sm:px-6 py-16 sm:py-20 bg-gradient-to-r from-sky-100 to-sky-200">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-sky-700 leading-tight">
            Smarter Inventory Management for Your Business
          </h2>
          <p className="mt-4 sm:mt-6 text-gray-700 max-w-xl text-sm sm:text-base">
            Track, manage, and optimize your stock in real-time with
            easyinventory. Simple, powerful, and accessible anywhere.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button className="px-5 py-3 rounded-full bg-sky-600 text-white font-bold shadow-lg hover:bg-sky-700 transition text-sm sm:text-base">
              <Link to='/signup'>Get Started</Link>
            </button>
            <button className="px-5 py-3 hidden rounded-full bg-white text-sky-600 border border-sky-400 font-bold shadow hover:bg-sky-50 transition text-sm sm:text-base">
              <Link to='/login'>Login</Link>
            </button>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="px-4 sm:px-6 py-12 sm:py-16 bg-white text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-sky-700">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-10">
            {[
              {
                title: "Real-Time Tracking",
                desc: "Always stay updated with live stock data and alerts.",
              },
              {
                title: "Analytics & Reports",
                desc: "Gain insights with interactive charts and detailed reports.",
              },
              {
                title: "Multi-Device Access",
                desc: "Work from desktop, tablet, or mobile seamlessly.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-5 sm:p-6 rounded-xl bg-sky-50 border border-sky-200 shadow-md hover:shadow-xl transition"
              >
                <h3 className="text-lg sm:text-xl font-semibold text-sky-700">{feature.title}</h3>
                <p className="mt-2 sm:mt-3 text-gray-600 text-sm sm:text-base">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Blogs Section */}
        <section id="blogs" className="hidden px-4 sm:px-6 py-12 sm:py-16 bg-white text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-sky-700">Latest Blogs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-10">
            {[
              {
                title: "Top 5 Tips for Smarter Inventory Management",
                date: "August 28, 2025",
                img: "/blog1.jpg",
                desc: "Learn the best practices to reduce stock wastage and improve efficiency.",
              },
              {
                title: "Why Real-Time Stock Tracking Matters",
                date: "September 5, 2025",
                img: "/blog2.jpg",
                desc: "Discover how real-time tracking can save costs and boost profits.",
              },
              {
                title: "The Future of Inventory Management",
                date: "September 10, 2025",
                img: "/blog3.jpg",
                desc: "Explore upcoming trends and technologies shaping inventory systems.",
              },
            ].map((blog, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden border border-sky-200 shadow-md hover:shadow-xl transition flex flex-col"
              >
                <img src={blog.img} alt={blog.title} className="h-40 sm:h-48 w-full object-cover" />
                <div className="p-4 sm:p-6 text-left flex-1 flex flex-col">
                  <p className="text-xs sm:text-sm text-gray-500">{blog.date}</p>
                  <h3 className="text-base sm:text-lg font-semibold text-sky-700 mt-1 sm:mt-2">{blog.title}</h3>
                  <p className="mt-2 sm:mt-3 text-gray-600 text-sm sm:text-base flex-1">{blog.desc}</p>
                  <a href="#" className="mt-3 sm:mt-4 inline-block text-sky-600 font-semibold hover:underline text-sm sm:text-base">Read More →</a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="px-4 sm:px-6 py-12 sm:py-16 bg-gradient-to-r from-sky-50 to-sky-100 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-sky-700">About easyinventory</h2>
          <p className="mt-3 sm:mt-4 max-w-2xl mx-auto text-gray-700 leading-relaxed text-sm sm:text-base">
            easyinventory is designed to simplify stock management for small and large businesses. With a user-friendly interface and real-time updates, it helps reduce losses, improve efficiency, and make better business decisions.
          </p>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="px-4 sm:px-6 py-12 sm:py-16 bg-white">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-sky-700">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto mt-6 sm:mt-8 space-y-5 sm:space-y-6">
            {[
              {
                q: "Is easyinventory free to use?",
                a: "Yes! We offer a free plan with essential features. Advanced plans are also available.",
              },
              {
                q: "Can I access easyinventory on my phone?",
                a: "Absolutely. easyinventory works on desktop, tablet, and mobile devices.",
              },
              {
                q: "Does it support analytics?",
                a: "Yes, you can generate detailed stock reports and visualize trends.",
              },
            ].map((item, i) => (
              <div key={i} className="border-b border-sky-200 pb-3 sm:pb-4">
                <h3 className="font-semibold text-sky-700 text-sm sm:text-base">{item.q}</h3>
                <p className="mt-1 sm:mt-2 text-gray-600 text-sm sm:text-base">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="px-4 sm:px-6 py-12 sm:py-16 bg-sky-50 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-sky-700">Contact Us</h2>
          <p className="mt-3 sm:mt-4 text-gray-700 text-sm sm:text-base">
            Have questions? Reach us at {" "}
            <a href="mailto:abhishekshinde034@gmail.com" className="text-sky-600 font-semibold hover:underline">support@easyinventory.com</a>
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 sm:py-6 border-t border-sky-200 text-gray-600 bg-sky-50 text-xs sm:text-sm">
        © {new Date().getFullYear()} easyinventory. All rights reserved.
      </footer>
    </div>
  );
}
