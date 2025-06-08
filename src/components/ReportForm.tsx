import React, { useState, useEffect } from 'react';
import { MapPin, Info } from 'lucide-react';
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
  onSubmit: (data: {
    title: string;
    description: string;
    location?: string;
    coordinates?: { lat: number; lng: number };
  }) => void;
}

// Funkcja sprawdzająca czy użytkownik ma zapisane dane osobowe
const hasUserPersonalData = (): boolean => {
  try {
    const userData = localStorage.getItem('user_personal_data');
    if (!userData) return false;
    
    const parsed = JSON.parse(userData);
    // Sprawdzamy czy są wszystkie kluczowe dane
    return !!(parsed.name && parsed.address && parsed.phone);
  } catch {
    return false;
  }
};

// Modal z instrukcjami
const InstructionsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-start gap-3 p-4 border-b">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Info className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Informacje dla policji
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Aby policjanci mogli skutecznie ścigać sprawców
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-700">
            Prosimy o przekazanie wraz z materiałem filmowym następujących informacji:
          </p>
          
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                1
              </div>
              <div className="text-sm text-gray-700">
                <strong>Data, godzina i miejsce zdarzenia</strong><br />
                (miejscowość, nr drogi/ulica)
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                2
              </div>
              <div className="text-sm text-gray-700">
                <strong>Dane pojazdu sprawcy</strong><br />
                (numer rejestracyjny, marka, kolor)
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                3
              </div>
              <div className="text-sm text-gray-700">
                <strong>Twoje dane kontaktowe</strong><br />
                (imię, nazwisko, adres, telefon)
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 mt-4">
            <p className="text-xs text-blue-800">
              💡 <strong>Wskazówka:</strong> W przyszłości będzie można zapisać swoje dane w ustawieniach, 
              aby nie wpisywać ich za każdym razem.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Rozumiem, wypełnij zgłoszenie
          </button>
        </div>
      </div>
    </div>
  );
};

export const ReportForm: React.FC<ReportFormProps> = ({
  user,
  files,
  accessToken,
  onSignOut,
  onBack,
  uploadProgress,
  isUploading,
  onSubmit,
}) => {
  const [reportData, setReportData] = useState<ReportData>({
    title: '',
    description: '',
    location: '',
    coordinates: undefined,
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [formEnabled, setFormEnabled] = useState(false);

  // Sprawdź przy pierwszym renderze czy pokazać modal instrukcji
  useEffect(() => {
    const hasPersonalData = hasUserPersonalData();
    
    if (hasPersonalData) {
      // Użytkownik ma dane w ustawieniach - od razu włącz formularz
      setFormEnabled(true);
    } else {
      // Brak danych - pokaż modal z instrukcjami
      setShowInstructionsModal(true);
    }
  }, []);

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

  const handleInstructionsClose = () => {
    setShowInstructionsModal(false);
    setFormEnabled(true);
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
    onSubmit({
      title: reportData.title,
      description: reportData.description,
      location: reportData.location,
      coordinates: reportData.coordinates,
    });
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-blue-50 to-indigo-100">
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

          {/* Formularz - aktywny dopiero po przeczytaniu instrukcji */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className={formEnabled ? '' : 'opacity-50 pointer-events-none'}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tytuł incydentu
                </label>
                <input
                  type="text"
                  value={reportData.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  placeholder="np. Agresja drogowa na A4"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={!formEnabled}
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
                  placeholder="Opisz szczegółowo zdarzenie, podaj datę i godzinę, dane pojazdu sprawcy (rejestracja, marka, kolor) oraz swoje dane kontaktowe (imię, nazwisko, adres, telefon)."
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                  required
                  disabled={!formEnabled}
                />
              </div>

              {/* Lokalizacja */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  disabled={!formEnabled}
                  className="w-full flex items-center px-3 py-2 border rounded-md bg-white hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  style={{ minHeight: 44 }}
                >
                  <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-gray-700 truncate">
                    {reportData.location
                      ? reportData.location
                      : 'Wybierz lokalizację na mapie (opcjonalne)'}
                  </span>
                </button>
                {reportData.location && (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-gray-600 truncate">{reportData.location}</span>
                    <button
                      type="button"
                      onClick={handleLocationRemove}
                      disabled={!formEnabled}
                      className="text-xs text-red-500 hover:underline disabled:cursor-not-allowed"
                    >
                      Usuń lokalizację
                    </button>
                  </div>
                )}
              </div>

              {/* Dowody */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Dowody ({files.length})
                </h3>
                {files.length > 0 ? (
                  <div className="grid grid-cols-4 gap-4">
                    {files.map(file => (
                      <div key={file.id} className="relative">
                        <FileThumbnail mediaFile={file} />
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
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={!formEnabled || (isUploading && uploadProgress < 100)}
                className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {!formEnabled ? 'Najpierw przeczytaj instrukcje' : 'Prześlij zgłoszenie'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Modal z instrukcjami */}
      <InstructionsModal
        isOpen={showInstructionsModal}
        onClose={handleInstructionsClose}
      />

      {/* Modal lokalizacji */}
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
