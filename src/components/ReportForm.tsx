import React, { useState, useEffect } from 'react';
import { Shield, MapPin, ArrowLeft, X } from 'lucide-react';
import { GoogleUser, MediaFile, ReportData } from '../types';
import { FileThumbnail } from './FileThumbnail';
import { LocationModal } from './LocationModal';

interface ReportFormProps {
  user: GoogleUser;
  files: MediaFile[];
  onSignOut: () => void;
  onBack: () => void;
  uploadProgress: number;
  isUploading: boolean;
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
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Automatyczne pobieranie lokalizacji przy wejściu na stronę
  useEffect(() => {
    // Można automatycznie otworzyć modal przy pierwszym wejściu
    // setIsLocationModalOpen(true);
  }, []);

  const handleInputChange = (field: keyof ReportData, value: string) => {
    setReportData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationSelect = (location: { address: string; coordinates: { lat: number; lng: number } }) => {
    setReportData(prev => ({
      ...prev,
      location: location.address,
      coordinates: location.coordinates
    }));
  };

  const handleLocationRemove = () => {
    setReportData(prev => ({
      ...prev,
      location: '',
      coordinates: undefined
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

    if (!reportData.location.trim()) {
      alert('Proszę wybrać lokalizację incydentu na mapie');
      return;
    }

    // Tutaj będzie logika wysyłania raportu
    console.log('Zgłoszenie:', {
      ...reportData,
      files: files.map(f => ({ name: f.name, type: f.type, size: f.size })),
      user: user.email
    });
    
    alert('Zgłoszenie zostało przesłane pomyślnie!');
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
              <h2 className="text-xl font-bold text-white">Szczegóły Incydentu</h2>
            </div>
            <p className="text-blue-100 text-sm mt-1">
              Podaj szczegóły dotyczące zdarzenia
            </p>
          </div>

          {/* Formularz */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Tytuł incydentu */}
            <div>
              <label htmlFor="incident-title" className="block text-sm font-medium text-gray-700 mb-2">
                Tytuł incydentu
              </label>
              <input
                id="incident-title"
                type="text"
                value={reportData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="np. Podejrzana aktywność, Wypadek drogowy"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Opis */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Opis zdarzenia
              </label>
              <textarea
                id="description"
                rows={6}
                value={reportData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Opisz szczegółowo co się wydarzyło..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                required
              />
            </div>

            {/* Lokalizacja */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Lokalizacja
              </label>
              
              {/* Display wybranej lokalizacji */}
              {reportData.location ? (
                <div className="mb-3">
                  {/* Wybrana lokalizacja */}
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md mb-3">
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-900">Wybrana lokalizacja:</p>
                        <p className="text-sm text-green-700 mt-1">{reportData.location}</p>
                        {reportData.coordinates && (
                          <p className="text-xs text-green-600 mt-1">
                            Współrzędne: {reportData.coordinates.lat.toFixed(6)}, {reportData.coordinates.lng.toFixed(6)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Przyciski edycji i usuwania lokalizacji */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsLocationModalOpen(true)}
                      className="flex-1 p-3 border border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group flex items-center justify-center"
                    >
                      <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-700">
                        Zmień lokalizację
                      </span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleLocationRemove}
                      className="px-4 py-3 border border-red-300 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors flex items-center justify-center"
                    >
                      <X className="w-4 h-4 text-red-600 mr-1" />
                      <span className="text-sm font-medium text-red-700">
                        Usuń
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-3">
                  {/* Brak lokalizacji */}
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-md mb-3">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-orange-600 mr-2" />
                      <p className="text-sm text-orange-700">Lokalizacja nie została wybrana</p>
                    </div>
                  </div>

                  {/* Przycisk do otwierania mapy */}
                  <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(true)}
                    className="w-full p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex flex-col items-center">
                      <MapPin className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium text-gray-700">
                        Wybierz lokalizację na mapie
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        Dokładnie wskaż miejsce incydentu
                      </span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Sekcja z plikami */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Twoje dowody ({files.length})
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
                <span>Kontynuuj do odbiorcy</span>
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

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onLocationSelect={handleLocationSelect}
        initialLocation={reportData.coordinates ? {
          address: reportData.location,
          coordinates: reportData.coordinates
        } : undefined}
      />
    </div>
  );
};
