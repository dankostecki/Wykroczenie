import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// Typy dla Google Identity Services
interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

interface GoogleUser {
  iss: string;
  sub: string;
  aud: string;
  iat: number;
  exp: number;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

// Hook do obsługi Google OAuth
const useGoogleAuth = () => {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Client ID z zmiennej środowiskowej (.env file)
  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com';
  
  useEffect(() => {
    const initializeGoogleAuth = (): void => {
      try {
        // Sprawdź czy Google Identity Services jest dostępne
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: CLIENT_ID,
            callback: handleCredentialResponse,
          });
          
          // Sprawdź czy użytkownik jest już zalogowany
          const token = localStorage.getItem('google_token');
          if (token) {
            const userData = localStorage.getItem('user_data');
            if (userData) {
              try {
                const parsedUser = JSON.parse(userData) as GoogleUser;
                setUser(parsedUser);
              } catch (error) {
                console.error('Błąd parsowania danych użytkownika:', error);
                localStorage.removeItem('user_data');
                localStorage.removeItem('google_token');
              }
            }
          }
        }
      } catch (error) {
        console.error('Błąd inicjalizacji Google Auth:', error);
      } finally {
        setLoading(false);
      }
    };

    // Sprawdź czy skrypt Google jest już załadowany
    if (window.google?.accounts?.id) {
      initializeGoogleAuth();
    } else {
      // Załaduj Google Identity Services
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleAuth;
      script.onerror = () => {
        console.error('Nie udało się załadować Google Identity Services');
        setLoading(false);
      };
      document.head.appendChild(script);

      return () => {
        const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (existingScript) {
          document.head.removeChild(existingScript);
        }
      };
    }
  }, [CLIENT_ID]);

  const handleCredentialResponse = (response: GoogleCredentialResponse): void => {
    try {
      // Dekoduj JWT token
      const userObject = parseJwt(response.credential);
      
      if (userObject) {
        // Zapisz dane użytkownika
        setUser(userObject);
        localStorage.setItem('google_token', response.credential);
        localStorage.setItem('user_data', JSON.stringify(userObject));
        
        console.log('Zalogowano pomyślnie:', userObject);
      }
    } catch (error) {
      console.error('Błąd podczas logowania:', error);
    }
  };

  const signIn = (): void => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      console.error('Google Identity Services nie jest dostępne');
    }
  };

  const signOut = (): void => {
    setUser(null);
    localStorage.removeItem('google_token');
    localStorage.removeItem('user_data');
    
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  return { user, loading, signIn, signOut };
};

// Funkcja pomocnicza do dekodowania JWT
const parseJwt = (token: string): GoogleUser | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload) as GoogleUser;
  } catch (error) {
    console.error('Błąd dekodowania tokenu:', error);
    return null;
  }
};

// Komponent logowania
interface LoginComponentProps {
  onSignIn: () => void;
  loading: boolean;
}

const LoginComponent: React.FC<LoginComponentProps> = ({ onSignIn, loading }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Wykroczenie App</h1>
          <p className="text-gray-600">Zaloguj się aby kontynuować</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={onSignIn}
            disabled={loading}
            className={`w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Ładowanie...' : 'Zaloguj się przez Google'}
          </button>
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

// Komponent dashboard po zalogowaniu
interface DashboardProps {
  user: GoogleUser;
  onSignOut: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onSignOut }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Wykroczenie App</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {user.picture && (
                  <img
                    src={user.picture}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm text-gray-700">
                  Witaj, {user.given_name || user.name}!
                </span>
              </div>
              
              <button
                onClick={onSignOut}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Wyloguj
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Panel główny</h2>
          
          {/* Informacje o użytkowniku */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Informacje o koncie</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">Nazwa:</span>
                <span className="ml-2 text-blue-700">{user.name}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Email:</span>
                <span className="ml-2 text-blue-700">{user.email}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">ID:</span>
                <span className="ml-2 text-blue-700 font-mono text-xs">{user.sub}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Zweryfikowany:</span>
                <span className="ml-2 text-blue-700">
                  {user.email_verified ? 'Tak' : 'Nie'}
                </span>
              </div>
            </div>
          </div>

          {/* Placeholder dla przyszłej funkcjonalności */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Nowa funkcja</h3>
              <p className="text-xs text-gray-500">Tutaj będzie kolejny ekran</p>
            </div>
            
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Statystyki</h3>
              <p className="text-xs text-gray-500">Przyszłe dane</p>
            </div>
            
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Ustawienia</h3>
              <p className="text-xs text-gray-500">Konfiguracja app</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Główny komponent aplikacji
const App: React.FC = () => {
  const { user, loading, signIn, signOut } = useGoogleAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {user ? (
        <Dashboard user={user} onSignOut={signOut} />
      ) : (
        <LoginComponent onSignIn={signIn} loading={loading} />
      )}
    </>
  );
};

export default App;
