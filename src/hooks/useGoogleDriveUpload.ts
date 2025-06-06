import { useState, useCallback } from 'react';
import { MediaFile } from '../types';

interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  driveUrl?: string;
}

interface UseGoogleDriveUploadReturn {
  uploadFiles: (files: MediaFile[]) => Promise<string[]>;
  progress: number;
  isUploading: boolean;
  uploadStatus: UploadProgress[];
  folderUrl: string | null;
}

export const useGoogleDriveUpload = (): UseGoogleDriveUploadReturn => {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadProgress[]>([]);
  const [folderUrl, setFolderUrl] = useState<string | null>(null);

  // Funkcja do tworzenia nazwy folderu z datą i godziną
  const createFolderName = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    
    return `Wykroczenie_${year}-${month}-${day}_${hour}-${minute}`;
  };

  // Mock funkcja Google Drive API - w rzeczywistości użyjesz Google Drive API
  const mockUploadFile = (file: MediaFile): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Symulacja uploadu z progresem
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.random() * 20;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(interval);
          
          // Symulacja URL do pliku na Drive
          const mockDriveUrl = `https://drive.google.com/file/d/mock_${file.id}/view`;
          resolve(mockDriveUrl);
        }
        
        // Update progress dla tego pliku
        setUploadStatus(prev => prev.map(status => 
          status.fileId === file.id 
            ? { ...status, progress: currentProgress, status: currentProgress === 100 ? 'completed' : 'uploading' }
            : status
        ));
      }, 100 + Math.random() * 200); // Losowy czas między updateami

      // Symulacja błędu (1% szans)
      if (Math.random() < 0.01) {
        setTimeout(() => {
          clearInterval(interval);
          reject(new Error('Upload failed'));
        }, 1000);
      }
    });
  };

  // Rzeczywista funkcja Google Drive API (do zaimplementowania)
  const uploadToGoogleDrive = async (file: MediaFile, folderId: string): Promise<string> => {
    const token = localStorage.getItem('google_token');
    if (!token) {
      throw new Error('Brak tokenu Google');
    }

    // Tutaj będzie rzeczywiste API call do Google Drive
    // Na razie używamy mock
    return mockUploadFile(file);
  };

  // Funkcja do tworzenia folderu na Google Drive
  const createDriveFolder = async (folderName: string): Promise<string> => {
    const token = localStorage.getItem('google_token');
    if (!token) {
      throw new Error('Brak tokenu Google');
    }

    // Mock tworzenia folderu
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockFolderId = `folder_${Date.now()}`;
    const mockFolderUrl = `https://drive.google.com/drive/folders/${mockFolderId}`;
    
    setFolderUrl(mockFolderUrl);
    return mockFolderId;
  };

  // Główna funkcja uploadowania plików
  const uploadFiles = useCallback(async (files: MediaFile[]): Promise<string[]> => {
    if (files.length === 0) return [];

    setIsUploading(true);
    setProgress(0);
    
    // Inicjalizuj status dla wszystkich plików
    const initialStatus: UploadProgress[] = files.map(file => ({
      fileId: file.id,
      fileName: file.name,
      progress: 0,
      status: 'pending'
    }));
    setUploadStatus(initialStatus);

    try {
      // Utwórz folder na Google Drive
      const folderName = createFolderName();
      console.log('Tworzenie folderu:', folderName);
      const folderId = await createDriveFolder(folderName);

      // Upload plików równolegle
      const uploadPromises = files.map(async (file, index) => {
        try {
          setUploadStatus(prev => prev.map(status => 
            status.fileId === file.id 
              ? { ...status, status: 'uploading' }
              : status
          ));

          const driveUrl = await uploadToGoogleDrive(file, folderId);
          
          setUploadStatus(prev => prev.map(status => 
            status.fileId === file.id 
              ? { ...status, status: 'completed', driveUrl, progress: 100 }
              : status
          ));

          return driveUrl;
        } catch (error) {
          console.error(`Błąd uploadu ${file.name}:`, error);
          setUploadStatus(prev => prev.map(status => 
            status.fileId === file.id 
              ? { ...status, status: 'error', progress: 0 }
              : status
          ));
          throw error;
        }
      });

      // Monitoruj ogólny progress
      const progressInterval = setInterval(() => {
        setUploadStatus(current => {
          const totalProgress = current.reduce((sum, status) => sum + status.progress, 0);
          const overallProgress = Math.round(totalProgress / current.length);
          setProgress(overallProgress);
          
          if (overallProgress >= 100) {
            clearInterval(progressInterval);
          }
          
          return current;
        });
      }, 200);

      const results = await Promise.all(uploadPromises);
      
      clearInterval(progressInterval);
      setProgress(100);
      setIsUploading(false);
      
      console.log('Upload zakończony pomyślnie:', {
        folderUrl,
        files: results
      });

      return results;
    } catch (error) {
      console.error('Błąd podczas uploadu:', error);
      setIsUploading(false);
      setProgress(0);
      throw error;
    }
  }, [folderUrl]);

  return {
    uploadFiles,
    progress,
    isUploading,
    uploadStatus,
    folderUrl
  };
};
