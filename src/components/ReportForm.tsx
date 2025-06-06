import React, { useState, useEffect } from 'react';
import { Shield, MapPin, ArrowLeft } from 'lucide-react';
import { GoogleUser, MediaFile } from '../types';
import { FileThumbnail } from './FileThumbnail';

interface ReportFormProps {
  user: GoogleUser;
  files: MediaFile[];
  onSignOut: () => void;
  onBack: () => void;
  uploadProgress: number;
  isUploading: boolean;
}

interface ReportData {
  title: string;
  description: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export const ReportForm: React.FC<ReportFormProps> = ({ 
  user, 
  files, 
  onSignOut, 
  onBack,
  uploadProgress,
  isUploading 
}) => {
  const [reportData, setReportData] = useState<ReportData>({
    title: '',
    description: '',
    location: ''
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Automatyczne pobieranie lokalizacji przy wejściu na stronę
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolokalizacja nie jest obsługiwana w tej przeglądarce');
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding - zamiana współrzędnych na adres
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pl`
          );
          const data = await response.json();
          
          const address = data.locality 
            ? `${data.locality}, ${data.principalSubdivision || data.countryName}`
            : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

          setReportData(prev => ({
            ...prev,
            location: address,
            coordinates: { lat: latitude, lng: longitude }
          }));
        } catch (error) {
          console.error('Błąd reverse geocoding:', error);
          // Fallback do współrzędnych
          setReportData(prev => ({
            ...prev,
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            coordinates: { lat: latitude, lng: longitude }
          }));
        }
        
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Błąd geolokalizacji:', error);
        setLocationError('Nie udało się pobrać lokalizacji. Wprowadź ją ręcznie.');
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minut cache
      }
    );
  };

  const handleInputChange = (field: keyof ReportData, value: string) => {
    setReportData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportData.title.trim()) {
      alert('Proszę wprowadzić tytuł incydentu');
      return;
    }
    
    if (!reportData.description.trim()) {
      alert('Proszę opisać co się stało');
      return;
    }

    // Tutaj będzie logika wysyłania raportu
    console.log('Zgłoszenie:', {
      ...reportData,
      files: files.map(f => ({ name: f.name, type: f.type, size: f.size })),
      user: user.email
    });
    
    alert('Zgłoszenie zostało przesłane!');
  };

  const removeFile = (id: string) => {
    // Ta funkcja powinna być przekazana z rodzica
    console.log('Remove file:', id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Progress Bar */}
      {isUploading && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Przesyłanie plików na Google Drive...
              </span>
              <span className="text-sm text-gray-500">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`bg-white shadow-sm border-b ${isUploading ? 'mt-16' : ''}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Szczegóły Incydentu</h1>
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
                  {user.given_name || user.name}
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header sekcji */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center">
              <Shield className="w-6 h-6 text-white mr-2" />
              <h2 className="text-xl font-bold text-white">Incident Details</h2>
            </div>
            <p className="text-blue-100 text-sm mt-1">
              Provide details about what happened
            </p>
          </div>

          {/* Formularz */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Tytuł incydentu */}
            <div>
              <label htmlFor="incident-title" className="block text-sm font-medium text-gray-700 mb-2">
                Incident Title
              </label>
              <input
                id="incident-title"
                type="text"
                value={reportData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g. Suspicious activity, Traffic accident"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Opis */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                rows={6}
                value={reportData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what happened in detail..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                required
              />
            </div>

            {/* Lokalizacja */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="location"
                  type="text"
                  value={reportData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder={isGettingLocation ? "Pobieranie lokalizacji..." : "Where did this happen?"}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={isGettingLocation}
                  required
                />
                {!isGettingLocation && (
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <MapPin className="h-5 w-5" />
                  </button>
                )}
              </div>
              {locationError && (
                <p className="mt-1 text-sm text-red-600">{locationError}</p>
              )}
              {reportData.coordinates && (
                <p className="mt-1 text-xs text-gray-500">
                  Współrzędne: {reportData.coordinates.lat.toFixed(6)}, {reportData.coordinates.lng.toFixed(6)}
                </p>
              )}
            </div>

            {/* Sekcja z plikami */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Your Evidence ({files.length})
              </h3>
              {files.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {files.map(file => (
                    <div key={file.id} className="relative">
                      <FileThumbnail 
                        mediaFile={file} 
                        onRemove={removeFile}
                      />
                      {/* Upload status overlay */}
                      {isUploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                          <div className="text-white text-xs font-medium">
                            Przesyłanie...
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Brak załączonych plików</p>
              )}
            </div>

            {/* Przycisk wysyłania */}
            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isUploading && uploadProgress < 100}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <span>Continue to Recipient</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              {isUploading && uploadProgress < 100 && (
                <p className="text-center text-sm text-gray-500 mt-2">
                  Poczekaj na zakończenie przesyłania plików...
                </p>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
