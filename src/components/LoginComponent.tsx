import React, { useRef, useEffect } from 'react';

// Komponent logowania
interface LoginComponentProps {
  onSignIn: () => void;
  loading: boolean;
}

export const LoginComponent: React.FC<LoginComponentProps> = ({ onSignIn, loading }) => {
  const googleButtonRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (window.google?.accounts?.id && googleButtonRef.current && !loading) {
      // Renderuj Google Sign-In button
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        width: "100%",
        text: "signin_with",
        shape: "rounded",
        locale: "pl"
      });
    }
  }, [loading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Wykroczenie App</h1>
          <p className="text-gray-600">Zaloguj się aby kontynuować</p>
        </div>
        
        <div className="space-y-4">
          {/* Google Sign-In Button */}
          <div ref={googleButtonRef} className="w-full flex justify-center"></div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Kontynuując, akceptujesz nasze warunki użytkowania
          </p>
        </div>
      </div>
    </div>
  );
};
