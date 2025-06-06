import { useState, useEffect } from 'react';
import { GoogleUser, GoogleCredentialResponse } from '../types';

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

// Hook do obsługi Google OAuth
export const useGoogleAuth = () => {
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
            auto_select: false, // Wyłącza automatyczne logowanie
            cancel_on_tap_outside: false, // Nie anuluje przy kliknięciu poza
          });
          
          // Wyłącz automatyczne wybieranie konta
          window.google.accounts.id.disableAutoSelect();
          
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
      // Wymusza wyświetlenie okna wyboru konta
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('One Tap nie został wyświetlony. Użyj przycisku Sign In.');
        }
      });
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
