import { useState } from 'react';

interface GoogleAllUser {
  email: string;
  name: string;
  picture?: string;
  [key: string]: any;
}

export function useGoogleAllLogin() {
  const [user, setUser] = useState<GoogleAllUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
  // SCOPES: logowanie + drive + mail
  const SCOPE = 'openid email profile https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/gmail.send';

  // Logowanie przez Google i zgoda na Drive + mail
  const signInWithGoogle = () => {
    setLoading(true);
    setError(null);

    // @ts-ignore
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      callback: async (tokenResponse: any) => {
        if (tokenResponse && tokenResponse.access_token) {
          setAccessToken(tokenResponse.access_token);
          try {
            // Pobierz dane użytkownika (name/email/picture)
            const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
              headers: {
                Authorization: "Bearer " + tokenResponse.access_token
              }
            });
            const profile = await res.json();
            setUser(profile);
            setLoading(false);
          } catch (err) {
            setUser(null);
            setLoading(false);
            setError("Nie udało się pobrać profilu Google");
          }
        } else {
          setError("Nie udało się pobrać tokenu Google");
          setLoading(false);
        }
      },
    });
    tokenClient.requestAccessToken();
  };

  const signOut = () => {
    setUser(null);
    setAccessToken(null);
  };

  return {
    user,
    accessToken,
    loading,
    error,
    signInWithGoogle,
    signOut,
  };
}
