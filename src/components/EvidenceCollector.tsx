import React, { useState, useRef } from 'react';
import { Camera, Video, Upload, Plus, User } from 'lucide-react';
import { GoogleAllUser, MediaFile } from '../types';
import { FileThumbnail } from './FileThumbnail';
import { ReportForm } from './ReportForm';
import { useGoogleDriveUpload } from '../hooks/useGoogleDriveUpload';
import { Header } from './Header';
import { SendReportScreen } from './SendReportScreen';
import { ReportSuccess } from './ReportSuccess';
import { UserDataModal } from './UserDataModal';

// Interfejs dla danych użytkownika
interface UserData {
  name: string;
  address: string;
  phone: string;
}

// Funkcje do obsługi localStorage dla danych użytkownika
const USER_DATA_KEY = 'user_personal_data';

const getUserData = (): UserData | null => {
  try {
    const data = localStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const saveUserData = (userData: UserData): void => {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
};

const deleteUserData = (): void => {
  localStorage.removeItem(USER_DATA_KEY);
};

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

  // State dla danych użytkownika i modala
  const [userData, setUserData] = useState<UserData | null>(getUserData());
  const [isUserDataModalOpen, setIsUserDataModalOpen] = useState(false);

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

  // Funkcje obsługi danych użytkownika
  const handleUserDataSave = (data: UserData) => {
    saveUserData(data);
    setUserData(data);
  };

  const handleUserDataDelete = () => {
    deleteUserData();
    setUserData(null);
  };

  const openUserDataModal = () => {
    setIsUserDataModalOpen(true);
  };

  const closeUserDataModal = () => {
    setIsUserDataModalOpen(false);
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

  // Wysyłka maila z danymi użytkownika
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

        body += `\n`; // <- PUSTA LINIA przed sekcją "Dowody"
      }

      body += `Dowody: ${folderUrl}`;

      // Dodaj dane zgłaszającego jeśli istnieją
      if (userData) {
        body += `\n\nDane zgłaszającego:\n`;
        body += `Imię i nazwisko: ${userData.name}\n`;
        body += `Adres: ${userData.address}\n`;
        body += `Telefon: ${userData.phone}`;
      }

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
    // Odśwież dane użytkownika na wypadek gdyby zostały zmienione
    setUserData(getUserData());
  };

  // KROK 1: DOWODY
  if (currentStep === 'evidence') {
    return (
      <>
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

                {/* Przycisk danych zgłaszającego - zawsze widoczny, styl z ramką */}
                <div className="mt-4">
                  <button
                    onClick={openUserDataModal}
                    className="w-full flex items-center justify-center gap-4 px-4 py-3 border border-orange-300 rounded-lg bg-white text-orange-700 hover:bg-orange-50 transition font-medium"
                  >
                    <User className="w-5 h-5" />
                    <span>{userData ? 'Edytuj dane zgłaszającego' : 'Dodaj dane zgłaszającego'}</span>
                  </button>
                </div>

                {/* Przycisk kontynuuj zgłoszenie - tylko po dodaniu plików */}
                {files.length > 0 && (
                  <div className="mt-3">
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
            </div>
          </main>
          
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
        
        {/* Modal danych użytkownika */}
        <UserDataModal
          isOpen={isUserDataModalOpen}
          onClose={closeUserDataModal}
          onSave={handleUserDataSave}
          onDelete={handleUserDataDelete}
          initialData={userData}
        />
      </>
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
