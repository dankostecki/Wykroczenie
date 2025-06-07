import React, { useState, useRef } from 'react';
import { Camera, Video, Upload, Plus } from 'lucide-react';
import { GoogleUser, MediaFile } from '../types';
import { FileThumbnail } from './FileThumbnail';
import { ReportForm } from './ReportForm';
import { useGoogleDriveUpload } from '../hooks/useGoogleDriveUpload';
import { Header } from './Header'; // <- nowy import!

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
        size: file.size
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

  const handleContinueToReport = async () => {
    if (files.length === 0) {
      alert('Dodaj przynajmniej jeden plik jako dowód incydentu');
      return;
    }
    setCurrentStep('report');
    try {
      await uploadFiles(files);
      console.log('Pliki zostały przesłane na Google Drive');
    } catch (error) {
      console.error('Błąd podczas przesyłania plików:', error);
      alert('Wystąpił błąd podczas przesyłania plików na Google Drive. Spróbuj ponownie.');
    }
  };

  const handleBackToEvidence = () => {
    setCurrentStep('evidence');
  };

  if (currentStep === 'report') {
    return (
      <>
        <Header
          title="Zgłoszenie Wykroczenia"
          onSignOut={onSignOut}
          showBack={true}
          onBack={handleBackToEvidence}
        />
        <ReportForm
          user={user}
          files={files}
          onSignOut={onSignOut}
          onBack={handleBackToEvidence}
          uploadProgress={progress}
          isUploading={isUploading}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header
        title="Zbieranie Dowodów"
        onSignOut={onSignOut}
        showBack={false}
        showCamera={true}
      />

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Sekcja nagłówka */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <p className="text-blue-100 text-sm">
              Zrób zdjęcia lub nagraj filmy dokumentujące wykroczenie
            </p>
          </div>

          <div className="p-4 border-b border-gray-200 space-y-4">
            {/* Wiersz 1: Dodaj pliki */}
            <button
              onClick={selectFiles}
              className="w-full flex items-center justify-center gap-4 px-4 py-3 border border-green-300 rounded-lg bg-white text-green-700 hover:bg-green-50 transition font-medium"
            >
              <Upload className="w-5 h-5" />
              <span>Dodaj pliki</span>
            </button>

            {/* Wiersz 2: Zrób zdjęcie | Nagraj film */}
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
