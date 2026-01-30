import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-green-600 hover:text-green-700 transition">
            buddi.
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-4">
            <Link
              to="/login"
              className="px-4 py-2 text-green-600 font-medium hover:text-green-700 transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-full hover:bg-green-700 transition"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
