import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageCircle, AlertTriangle, Shield } from 'lucide-react';

export const DinoFooter = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 border-t-2 border-blue-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand + Descrizione */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_cbca8df4-19d4-4d71-953b-5838b233adfd/artifacts/6a6b10sd_1384049B-0EB7-4CD8-857B-844777CEC3F5.png" 
                alt="DinoMed" 
                className="h-10 w-10 object-contain"
              />
              <div>
                <div className="font-bold text-lg text-gray-900">DinoMed</div>
                <div className="text-xs text-gray-600">Da zero confusione a più chiarezza</div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              DinoMed: simulazioni gratuite basate sul formato reale del semestre filtro.
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
                <Link to="/contatti" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Contatti
                </Link>
              </li>
              <li className="pt-2 border-t border-gray-200">
                <Link to="/login" className="text-sm text-lime-700 hover:text-lime-800 font-medium transition-colors flex items-center">
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
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-4">
            <p className="text-sm text-gray-700 flex items-start">
              <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Disclaimer:</strong> DinoMed non è una scuola e non garantisce risultati. 
                È un supporto gratuito creato da studenti per allenarsi al formato del semestre filtro.
              </span>
            </p>
          </div>
          <p className="text-sm text-gray-600 text-center">
            © 2025 DinoMed. Progetto gratuito e non commerciale.
          </p>
        </div>
      </div>
    </footer>
  );
};
