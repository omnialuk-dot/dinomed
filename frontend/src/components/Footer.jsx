import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageCircle, Shield } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_cbca8df4-19d4-4d71-953b-5838b233adfd/artifacts/0nbasxb8_IMG_0596.png" 
                alt="DinoMed" 
                className="h-10 object-contain"
              />
            </div>
            <p className="text-sm text-gray-600">
              Piattaforma gratuita per preparare il semestre filtro di Medicina con simulazioni basate sul formato reale.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Risorse</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/simulazioni" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Simulazioni gratuite
                </Link>
              </li>
              <li>
                <Link to="/dispense" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Dispense PDF
                </Link>
              </li>
              <li>
                <Link to="/cosa-non-studiare" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Cosa NON studiare
                </Link>
              </li>
              <li>
                <Link to="/chi-siamo" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Chi siamo
                </Link>
              </li>
              <li>
                <Link to="/contatti" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Contatti
                </Link>
              </li>
              <li className="pt-2 border-t border-gray-200">
                <Link to="/login" className="text-sm text-green-700 hover:text-green-800 font-medium transition-colors flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  Area Admin (Riservata)
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Contatti</h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:info@dinomed.it" className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  <Mail className="h-4 w-4" />
                  <span>info@dinomed.it</span>
                </a>
              </li>
              <li>
                <a href="https://t.me/dinomed_community" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  <span>Community Telegram</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-gray-200 mt-8 pt-8">
          <p className="text-sm text-gray-600 text-center mb-2">
            © 2025 DinoMed. Progetto gratuito e non commerciale.
          </p>
          <p className="text-xs text-gray-500 text-center">
            DinoMed non è una scuola e non garantisce risultati. È un supporto gratuito per allenarsi al formato del semestre filtro.
          </p>
        </div>
      </div>
    </footer>
  );
};
