import React from 'react';
import Icon from '../assets/icon-nobg.png'; // ← Ścieżka do pliku graficznego

interface LoginComponentProps {
  onSignIn: () => void;
  loading: boolean;
}

export const LoginComponent: React.FC<LoginComponentProps> = ({ onSignIn, loading }) => (
  <div className="min-h-[100dvh] bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-start p-6">
    {/* Ikona u góry */}
    <img src={Icon} alt="!ncydent logo" className="w-24 h-24 mb-6 mt-10" />

    {/* Box logowania */}
    <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">!ncydent App</h1>
        <p className="text-gray-600">Wymagane logowanie przez Google</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={onSignIn}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-6 py-3 text-lg shadow transition"
        >
          {loading ? 'Logowanie...' : 'Zaloguj się przez Google'}
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Kontynuując, akceptujesz uzyskanie przez aplikacje dostępu do kamery, plików i lokalizacji, aby utworzyć kompletne zgłoszenie
        </p>
      </div>
    </div>
  </div>
);
