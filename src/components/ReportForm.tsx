// src/components/ReportForm.tsx
import React, { useState } from 'react';
import { Shield, ArrowLeft, LogOut, MapPin } from 'lucide-react';
import { GoogleUser, MediaFile, ReportData } from '../types';
import { FileThumbnail } from './FileThumbnail';
import { LocationModal, Location } from './LocationModal';

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
    setReportData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationSelect = (loc: Location) => {
    setReportData(prev => ({
      ...prev,
      location: loc.address,
      coordinates: loc.coordinates,
    }));
    setIsLocationModalOpen(false);
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
    // lokalizacja opcjonalna lub sprawdzana w kolejnych krokach
    console.log('Zgłoszenie:', {
      ...reportData,
      files: files.map(f => ({ name: f.name, type: f.type, size: f.size })),
      user: user.email,
    });
    alert('Zgłoszenie zostało przesłane pomyślnie!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Progress Bar */}
      {isUploading && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b px-4 py-3">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <span className="text-sm text-gray-700">Przesyłanie plików…</span>
            <span className="text-sm text-gray-500">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 h-2">
            <div
              className="bg-blue-600 h-2 rounded transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`bg-white shadow-sm border-b ${isUploading ? 'mt-16' : ''}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <Shield className="w-8 h-8 text-blue-600 ml-4" />
              <h1 className="ml-3 text-xl font-semibold text-gray-900">Szczegóły Incydentu</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user.picture && (
                <img src={user.picture} alt="Avatar" className="w-8 h-8 rounded-full" />
              )}
              <button
                onClick={onSignOut}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <LogOut className="w-5 h-5 text-red-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Tytuł incydentu */}
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

            {/* Opis zdarzenia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opis zdarzenia
              </label>
              <textarea
                rows={4}
                value={reportData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                placeholder="Opisz szczegóły zdarzenia..."
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                required
              />
            </div>

            {/* Wybierz lokalizację */}
            <div>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Wybierz lokalizację na mapie</span>
              </button>
            </div>

            {/* Załączniki */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Twoje pliki ({files.length})</h3>
              {files.length > 0 ? (
                <div className="grid grid-cols-4 gap-3">
                  {files.map(file => (
                    <FileThumbnail key={file.id} mediaFile={file} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Brak załączonych plików</p>
              )}
            </div>

            {/* Submit */}
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

      {/* Location Modal */}
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
