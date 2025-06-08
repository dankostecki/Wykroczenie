import React, { useState, useRef } from 'react';
import { Camera, Video, Upload, Plus, User, X } from 'lucide-react';
import { GoogleAllUser, MediaFile } from '../types';
import { FileThumbnail } from './FileThumbnail';
import { ReportForm } from './ReportForm';
import { useGoogleDriveUpload } from '../hooks/useGoogleDriveUpload';
import { Header } from './Header';
import { SendReportScreen } from './SendReportScreen';
import { ReportSuccess } from './ReportSuccess';

// Funkcja wysyłania maila przez Gmail API
async function sendGmail({
  accessToken,
  recipients,
  subject,
  body,
}: {
  accessToken: string;
  recipients: string[];
  subject: string;
  body: string;
}) {
  const to = recipients.join(', ');
  const message =
    `To: ${to}\r\n` +
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=\r\n` +
    "Content-Type: text/plain; charset=utf-8\r\n" +
    "\r\n" +
    body;

  const raw = btoa(unescape(encodeURIComponent(message)));

  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw }),
    }
  );
  if (!res.ok) {
    throw new Error("Nie udało się wysłać maila przez Gmail API");
  }
}

// Typ dla danych osobowych
interface PersonalData {
  name: string;
  phone: string;
  address: string;
}

// Funkcje do obsługi localStorage
const PERSONAL_DATA_KEY = 'user_personal_data';

const getPersonalData = (): PersonalData | null => {
  try {
    const data = localStorage.getItem(PERSONAL_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const savePersonalData = (data: PersonalData) => {
  localStorage.setItem(PERSONAL_DATA_KEY, JSON.stringify(data));
};

const removePersonalData = () => {
  localStorage.removeItem(PERSONAL_DATA_KEY);
};

const hasCompletePersonalData = (data: PersonalData | null): boolean => {
  return !!(data?.name?.trim() && data?.phone?.trim() && data?.address?.trim());
};

// Drawer z formularzem danych osobowych
const PersonalDataDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PersonalData) => void;
  initialData?: PersonalData | null;
}> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<PersonalData>(
    initialData || { name: '', phone: '', address: '' }
  );

  const handleSave = () => {
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      alert('Wypełnij wszystkie pola');
      return;
    }
    onSave(formData);
    onClose();
  };

  const handleClear = () => {
    if (confirm('Czy na pewno chcesz usunąć zapisane dane?')) {
      removePersonalData();
      setFormData({ name: '', phone: '', address: '' });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-xl z-50 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Twoje dane
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto">
          <p className="text-sm text-gray-600">
            Zapisz swoje dane, aby nie wpisywać ich przy każdym zgłoszeniu. 
            Będą automatycznie dodawane do wysyłanych maili.
          </p>

          {/* Informacja o prywatności */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">🔒 Prywatność danych</p>
                <p>
                  Twoje dane są przechowywane <strong>tylko na tym urządzeniu</strong> i służą wyłącznie do 
                  automatycznego umieszczenia w e-mailach wysyłanych do służb. 
                  Aplikacja nie wysyła danych nigdzie indziej.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imię i nazwisko
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="np. Jan Kowalski"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numer telefonu
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="np. +48 123 456 789"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adres do korespondencji
              </label>
              <textarea
                rows={3}
                value={formData.address}
                onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="np. ul. Testowa 1, 00-001 Warszawa"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Zapisz dane
            </button>
            {initialData && (
              <button
                onClick={handleClear}
                className="px-4 py-3 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
              >
                Usuń dane
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

interface EvidenceCollectorProps {
  user: GoogleAllUser;
  accessToken: string | null;
  onSignOut: () => void;
}

export const EvidenceCollector: React.FC<EvidenceCollectorProps> = ({
  user,
  accessToken,
  onSignOut,
}) => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [currentStep, setCurrentStep] = useState<
    'evidence' | 'report' | 'send' | 'success'
  >('evidence');

  const [reportData, setReportData] = useState<{
    title: string;
    description: string;
    location?: string;
    coordinates?: { lat: number; lng: number };
  }>({ title: '', description: '', location: '', coordinates: undefined });

  const [folderUrl, setFolderUrl] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string[]>([]);

  // Nowe stany dla drawer
  const [isPersonalDataDrawerOpen, setIsPersonalDataDrawerOpen] = useState(false);
  const [personalData, setPersonalData] = useState<PersonalData | null>(getPersonalData());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const { uploadFiles, progress, isUploading } = useGoogleDriveUpload();

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const getFileType = (file: File): 'image' | 'video' | 'document' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'document';
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    Array.from(selectedFiles).forEach(file => {
      const fileType = getFileType(file);
      const url = URL.createObjectURL(file);
      const mediaFile: MediaFile = {
        id: generateId(),
        file,
        type: fileType,
        url,
        name: file.name,
        size: file.size,
      };
      setFiles(prev => [...prev, mediaFile]);
    });
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const takePhoto = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const startVideoRecording = () => {
    if (videoInputRef.current) {
      videoInputRef.current.click();
    }
  };

  const selectFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Obsługa zapisywania danych osobowych
  const handleSavePersonalData = (data: PersonalData) => {
    savePersonalData(data);
    setPersonalData(data);
  };

  // Po kliknięciu "Kontynuuj zgłoszenie"
  const handleContinueToReport = async () => {
    if (files.length === 0) {
      alert('Dodaj przynajmniej jeden plik jako dowód incydentu');
      return;
    }
    setCurrentStep('report');
    setUploadError(null);

    try {
      if (!accessToken) {
        setUploadError('Brak tokenu Google – zaloguj się ponownie.');
        return;
      }
      const uploadResult = await uploadFiles(files, accessToken);
      setFolderUrl(uploadResult.folderUrl);
    } catch (error: any) {
      setUploadError(String(error));
    }
  };

  // Po wypełnieniu formularza w ReportForm
  const handleSubmitForm = (data: {
    title: string;
    description: string;
    location?: string;
    coordinates?: { lat: number; lng: number };
  }) => {
    setReportData(data);
    setCurrentStep('send');
  };

  // Wysyłka maila z automatycznym dodaniem danych osobowych
  const handleSendReport = async (recipients: string[]) => {
    if (!accessToken) {
      setSendError('Brak tokenu Google. Zaloguj się ponownie.');
      return;
    }
    setSending(true);
    setSendError(null);
    try {
      let body = `${reportData.description}\n\n`;

      if (reportData.location) {
        body += `Lokalizacja:\n${reportData.location}\n`;
        if (reportData.coordinates) {
          body += `(${reportData.coordinates.lat}, ${reportData.coordinates.lng})\n`;
        }
        body += `\n`;
      }

      // Automatyczne dodanie danych osobowych jeśli są zapisane
      const currentPersonalData = getPersonalData();
      if (hasCompletePersonalData(currentPersonalData)) {
        body += `Dane zgłaszającego:\n`;
        body += `Imię i nazwisko: ${currentPersonalData!.name}\n`;
        body += `Telefon: ${currentPersonalData!.phone}\n`;
        body += `Adres: ${currentPersonalData!.address}\n\n`;
      }

      body += `Dowody: ${folderUrl}`;

      await sendGmail({
        accessToken,
        recipients,
        subject: reportData.title,
        body,
      });
      setSentTo(recipients);
      setCurrentStep('success');
    } catch (err: any) {
      setSendError(String(err));
    } finally {
      setSending(false);
    }
  };

  // Reset wszystkiego po sukcesie
  const handleNewReport = () => {
    setFiles([]);
    setReportData({ title: '', description: '', location: '', coordinates: undefined });
    setFolderUrl('');
    setUploadError(null);
    setSendError(null);
    setSentTo([]);
    setCurrentStep('evidence');
  };

  // KROK 1: DOWODY
  if (currentStep === 'evidence') {
    const hasCompleteData = hasCompletePersonalData(personalData);
    
    return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header title="Zbieranie Dowodów" onSignOut={onSignOut} showBack={false} />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <p className="text-blue-100 text-sm">
                Zrób zdjęcia lub nagraj filmy dokumentujące wykroczenie
              </p>
            </div>

            <div className="p-4 border-b border-gray-200 space-y-4">
              <button
                onClick={selectFiles}
                className="w-full flex items-center justify-center gap-4 px-4 py-3 border border-green-300 rounded-lg bg-white text-green-700 hover:bg-green-50 transition font-medium"
              >
                <Upload className="w-5 h-5" />
                <span>Dodaj pliki</span>
              </button>
              <div className="flex gap-4">
                <button
                  onClick={takePhoto}
                  className="flex-1 flex items-center justify-center gap-4 px-4 py-3 border border-blue-300 rounded-lg bg-white text-blue-700 hover:bg-blue-50 transition font-medium"
                >
                  <Camera className="w-5 h-5" />
                  <span>Zrób zdjęcie</span>
                </button>
                <button
                  onClick={startVideoRecording}
                  className="flex-1 flex items-center justify-center gap-4 px-4 py-3 border border-purple-300 rounded-lg bg-white text-purple-700 hover:bg-purple-50 transition font-medium"
                >
                  <Video className="w-5 h-5" />
                  <span>Nagraj film</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Twoje pliki ({files.length})
                </h3>
                {files.length > 0 && (
                  <button
                    onClick={() => {
                      files.forEach(file => URL.revokeObjectURL(file.url));
                      setFiles([]);
                    }}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Usuń wszystkie
                  </button>
                )}
              </div>
              {files.length === 0 ? (
                <div className="text-center py-3">
                  <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">
                    Nie dodano jeszcze żadnych plików
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Użyj przycisków powyżej, aby dodać zdjęcia, filmy lub dokumenty
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-4 lg:grid-cols-5 gap-4">
                  {files.map(file => (
                    <FileThumbnail key={file.id} mediaFile={file} onRemove={removeFile} />
                  ))}
                </div>
              )}
              {uploadError && (
                <div className="text-red-600 mt-4 text-sm">{uploadError}</div>
              )}
            </div>
            
            {/* Sekcja z przyciskami na dole */}
            {files.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 space-y-3">
                {/* Przycisk danych osobowych - pokazuje się tylko gdy nie ma kompletnych danych */}
                {!hasCompleteData && (
                  <div className="space-y-2">
                    <button
                      onClick={() => setIsPersonalDataDrawerOpen(true)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-medium"
                    >
                      <User className="w-4 h-4" />
                      <span>Podaj swoje dane</span>
                    </button>
                    <p className="text-xs text-gray-500 text-center">
                      Dane przechowywane tylko na urządzeniu • Automatyczne dodanie do e-maili
                    </p>
                  </div>
                )}
                
                {/* Informacja o zapisanych danych - pokazuje się tylko gdy ma kompletne dane */}
                {hasCompleteData && (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">Twoje dane zostaną automatycznie dodane</span>
                    </div>
                    <button
                      onClick={() => setIsPersonalDataDrawerOpen(true)}
                      className="text-xs text-green-600 hover:text-green-800 underline"
                    >
                      Edytuj
                    </button>
                  </div>
                )}
                
                {/* Przycisk kontynuuj */}
                <button
                  onClick={handleContinueToReport}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <span>Kontynuuj zgłoszenie</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Drawer z danymi osobowymi */}
        <PersonalDataDrawer
          isOpen={isPersonalDataDrawerOpen}
          onClose={() => setIsPersonalDataDrawerOpen(false)}
          onSave={handleSavePersonalData}
          initialData={personalData}
        />

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          onChange={e => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={e => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          capture="environment"
          onChange={e => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>
    );
  }

  if (currentStep === 'report') {
    return (
      <ReportForm
        user={user}
        files={files}
        accessToken={accessToken}
        onSignOut={onSignOut}
        onBack={() => setCurrentStep('evidence')}
        uploadProgress={progress}
        isUploading={isUploading}
        onSubmit={handleSubmitForm}
        hasPersonalData={hasCompletePersonalData(personalData)} // przekazujemy info o danych
      />
    );
  }

  if (currentStep === 'send') {
    return (
      <SendReportScreen
        title={reportData.title}
        description={reportData.description}
        location={reportData.location}
        folderUrl={folderUrl}
        onSend={handleSendReport}
        isSending={sending}
        sendError={sendError}
        onSignOut={onSignOut}
        onBack={() => setCurrentStep('report')}
      />
    );
  }

  if (currentStep === 'success') {
    return (
      <ReportSuccess
        sentTo={sentTo}
        title={reportData.title}
        description={reportData.description}
        location={reportData.location}
        folderUrl={folderUrl}
        onNewReport={handleNewReport}
        onSignOut={onSignOut}
      />
    );
  }

  return null;
};
