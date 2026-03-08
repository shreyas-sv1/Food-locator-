import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary-600">StreetBite</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/" className="text-gray-600 hover:text-primary-600 transition">
              Explore
            </Link>
            {user ? (
              <>
                <Link
                  to="/add-vendor"
                  className="text-gray-600 hover:text-primary-600 transition"
                >
                  Add Vendor
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-600 hover:text-primary-600 transition"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-primary-600 transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition text-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/" className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>
              Explore
            </Link>
            {user ? (
              <>
                <Link to="/add-vendor" className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>
                  Add Vendor
                </Link>
                <Link to="/profile" className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>
                  Profile
                </Link>
                <button onClick={handleLogout} className="block w-full text-left py-2 text-red-500">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/signup" className="block py-2 text-primary-600 font-medium" onClick={() => setMenuOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
