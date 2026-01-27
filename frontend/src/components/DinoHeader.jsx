import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DinoHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/simulazioni', label: 'Simulazioni' },
    { path: '/dispense', label: 'Dispense' },
    { path: '/cosa-non-studiare', label: 'Cosa NON studiare' },
    { path: '/chi-siamo', label: 'Chi siamo' },
    { path: '/contatti', label: 'Contatti' },
    { path: '/login', label: 'Area Admin', isAdmin: true }
  ];

  return (
    <header className="bg-white border-b-2 border-blue-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo + Mascotte */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
            <img 
              src="https://customer-assets.emergentagent.com/job_cbca8df4-19d4-4d71-953b-5838b233adfd/artifacts/6a6b10sd_1384049B-0EB7-4CD8-857B-844777CEC3F5.png" 
              alt="DinoMed Logo" 
              className="h-12 w-12 object-contain"
            />
            <div>
              <div className="font-bold text-xl text-gray-900">DinoMed</div>
              <div className="text-xs text-gray-600 hidden sm:block">Da zero confusione a più chiarezza</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  link.isAdmin
                    ? 'bg-lime-50 text-lime-700 hover:bg-lime-100 border border-lime-200'
                    : isActive(link.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                {link.isAdmin && <Shield className="h-4 w-4 inline mr-1" />}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-gray-200">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  link.isAdmin
                    ? 'bg-lime-50 text-lime-700 hover:bg-lime-100 border border-lime-200 mb-2'
                    : isActive(link.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                {link.isAdmin && <Shield className="h-4 w-4 inline mr-2" />}
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};
