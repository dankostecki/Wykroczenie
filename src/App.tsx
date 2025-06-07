import React from 'react';
import { useGoogleAuth } from './hooks/useGoogleAllLogin';
import { LoginComponent } from './components/LoginComponent';
import { EvidenceCollector } from './components/EvidenceCollector';

// Główny komponent aplikacji
const App: React.FC = () => {
  const { user, loading, signInWithGoogle, signOut, accessToken, error } = useGoogleAllLogin();

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
        <EvidenceCollector user={user} accessToken={accessToken} onSignOut={signOut} />
      ) : (
        <LoginComponent onSignIn={signInWithGoogle} loading={loading} />
      )}
    </>
  );
};

export default App;
