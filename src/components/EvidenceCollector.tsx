import React, { useState, useRef } from 'react';
import { Camera, Video, Upload, Plus } from 'lucide-react';
import { GoogleUser, MediaFile } from '../types';
import { FileThumbnail } from './FileThumbnail';
import { ReportForm } from './ReportForm';
import { useGoogleDriveUpload } from '../hooks/useGoogleDriveUpload';

interface EvidenceCollectorProps {
  user: GoogleUser;
  onSignOut: () => void;
}

export const EvidenceCollector: React.FC<EvidenceCollectorProps> = ({ user, onSignOut }) => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [currentStep, setCurrentStep] = useState<'evidence' | 'report'>('evidence');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Hook do Google Drive upload
  const { uploadFiles, progress, isUploading } = useGoogleDriveUpload();

  // Funkcja do generowania unikalnego ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Funkcja do określenia typu pliku
  const getFileType = (file: File): 'image' | 'video' | 'document' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'document';
  };

  // Funkcja do dodawania plików
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
        size: file.size
      };
      
      setFiles(prev => [...prev, mediaFile]);
    });
  };

  // Funkcja do usuwania pliku
  const removeFile = (id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  // Funkcja do robienia zdjęcia
  const takePhoto = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  // Funkcja do nagrywania filmu - otwiera natywną kamerę
  const startVideoRecording = () => {
    if (videoInputRef.current) {
      videoInputRef.current.click();
    }
  };

  // Funkcja do wybierania plików z urządzenia
  const selectFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Funkcja do przejścia do formularza zgłoszenia
  const handleContinueToReport = async () => {
    if (files.length === 0) {
      alert('Dodaj przynajmniej jeden plik jako dowód incydentu');
      return;
    }

    // Przejdź do następnego ekranu
    setCurrentStep('report');
    
    // Rozpocznij upload plików w tle
    try {
      await uploadFiles(files);
      console.log('Pliki zostały przesłane na Google Drive');
    } catch (error) {
      console.error('Błąd podczas przesyłania plików:', error);
      alert('Wystąpił błąd podczas przesyłania plików na Google Drive. Spróbuj ponownie.');
    }
  };

  // Funkcja do powrotu do ekranu dowodów
  const handleBackToEvidence = () => {
    setCurrentStep('evidence');
  };

  // Renderuj odpowiedni ekran
  if (currentStep === 'report') {
    return (
      <ReportForm
        user={user}
        files={files}
        onSignOut={onSignOut}
        onBack={handleBackToEvidence}
        uploadProgress={progress}
        isUploading={isUploading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Camera className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Zbieranie Dowodów</h1>
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
          {/* Sekcja nagłówka */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white mb-1">📸 Zbierz Dowody</h2>
            <p className="text-blue-100 text-sm">
              Zrób zdjęcia lub nagraj filmy dokumentujące wykroczenie
            </p>
          </div>

          {/* Sekcja przycisków akcji */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Przycisk zdjęcia */}
              <button
                onClick={takePhoto}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
              >
                <Camera className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-700">Zrób zdjęcie</span>
              </button>

              {/* Przycisk nagrywania */}
              <button
                onClick={startVideoRecording}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-purple-300 hover:border-purple-400 hover:bg-purple-50 transition-colors group"
              >
                <Video className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-700">Nagraj film</span>
              </button>

              {/* Przycisk dodawania plików */}
              <button
                onClick={selectFiles}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-green-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors group"
              >
                <Upload className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-700">Dodaj pliki</span>
              </button>
            </div>
          </div>

          {/* Sekcja z plikami */}
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
              <div className="text-center py-12">
                <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">
                  Nie dodano jeszcze żadnych plików
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Użyj przycisków powyżej, aby dodać zdjęcia, filmy lub dokumenty
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {files.map(file => (
                  <FileThumbnail key={file.id} mediaFile={file} onRemove={removeFile} />
                ))}
              </div>
            )}
          </div>

          {/* Przycisk kontynuacji */}
          {files.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
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

      {/* Ukryte inputy */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
    </div>
  );
};
