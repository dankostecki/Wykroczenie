import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { GoogleAllUser, MediaFile, ReportData } from '../types';
import { FileThumbnail } from './FileThumbnail';
import { LocationModal, Location } from './LocationModal';
import { Header } from './Header';

interface ReportFormProps {
  user: GoogleAllUser;
  files: MediaFile[];
  accessToken: string | null;
  onSignOut: () => void;
  onBack: () => void;
  uploadProgress: number;
  isUploading: boolean;
}

export const ReportForm: React.FC<ReportFormProps> = ({
  user,
  files,
  accessToken,
  onSignOut,
  onBack,
  uploadProgress,
  isUploading,
}) => {
  const [reportData, setReportData] = useState<ReportData>({
    title: '',
    description: '',
    location: '',
    coordinates: undefined,
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const handleInputChange = (field: keyof ReportData, value: string) => {
    setReportData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLocationSelect = (loc: Location) => {
    setReportData(prev => ({
      ...prev,
      location: loc.address,
      coordinates: loc.coordinates,
    }));
    setIsLocationModalOpen(false);
  };

  const handleLocationRemove = () => {
    setReportData(prev => ({
      ...prev,
      location: '',
      coordinates: undefined,
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
    // Lokalizacja jest opcjonalna!
    // if (!reportData.location.trim()) {
    //   alert('Proszę wybrać lokalizację incydentu na mapie');
    //   return;
    // }
    console.log('Zgłoszenie:', {
      ...reportData,
      files: files.map(f => ({ name: f.name, type: f.type, size: f.size })),
      user: user.email,
      accessToken,
    });
    alert('Zgłoszenie zostało przesłane pomyślnie!');
  };

  const removeFile = (id: string) => {
    // Do zaimplementowania: przekazanie usuwania pliku do rodzica, jeśli potrzeba
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header
        title="Szczegóły Incydentu"
        onSignOut={onSignOut}
        showBack={true}
        onBack={onBack}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Sekcja nagłówka */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <p className="text-blue-100 text-sm mt-1">
              Podaj szczegóły dotyczące zdarzenia
            </p>
          </div>

          {/* Formularz */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tytuł incydentu
              </label>
              <input
                type="text"
                value={reportData.title}
                onChange={e => handleInputChange('title', e.target.value)}
                placeholder="np. Podejrzana aktywność"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opis zdarzenia
              </label>
              <textarea
                rows={6}
                value={reportData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                placeholder="Opisz szczegóły zdarzenia..."
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                required
              />
            </div>

            {/* --- Lokalizacja --- */}
            <div>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="w-full flex items-center px-3 py-2 border rounded-md bg-white hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ minHeight: 44 }}
              >
                <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-gray-700 truncate">
                  {reportData.location
                    ? reportData.location
                    : 'Wybierz lokalizację na mapie (opcjonalnie)'}
                </span>
              </button>
              {reportData.location && (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600 truncate">{reportData.location}</span>
                  <button
                    type="button"
                    onClick={handleLocationRemove}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Usuń lokalizację
                  </button>
                </div>
              )}
            </div>

            {/* --- Dowody --- */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Dowody ({files.length})
              </h3>
              {files.length > 0 ? (
                <div className="grid grid-cols-4 gap-4">
                  {files.map(file => (
                    <div key={file.id} className="relative">
                      <FileThumbnail mediaFile={file} onRemove={removeFile} />
                      {isUploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
                          <span className="text-white text-xs">Przesyłanie…</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Brak załączonych plików</p>
              )}
            </div>
            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isUploading && uploadProgress < 100}
                className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Prześlij zgłoszenie
              </button>
            </div>
          </form>
        </div>
      </main>

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onLocationSelect={handleLocationSelect}
        initialLocation={
          reportData.coordinates
            ? { address: reportData.location, coordinates: reportData.coordinates }
            : undefined
        }
      />
    </div>
  );
};
