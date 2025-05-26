import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Cookie } from 'lucide-react';
import { PrivacyPolicyPopup } from './PrivacyPolicyPopup';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  useEffect(() => {
    const consent = Cookies.get('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    Cookies.set('cookie-consent', 'accepted', { expires: 365 });
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-50">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Cookie className="w-6 h-6 text-teal-400" />
            <p className="text-sm">
              Utilizamos cookies para melhorar sua experiência em nosso site. Ao continuar navegando, você concorda com a nossa{' '}
              <button
                onClick={() => setShowPrivacyPolicy(true)}
                className="text-teal-400 hover:text-teal-300 underline"
              >
                Política de Privacidade
              </button>
              .
            </p>
          </div>
          <button
            onClick={handleAccept}
            className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-md transition-colors whitespace-nowrap"
          >
            Aceitar Cookies
          </button>
        </div>
      </div>

      <PrivacyPolicyPopup
        isOpen={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
      />
    </>
  );
}