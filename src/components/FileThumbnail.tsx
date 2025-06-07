import React from 'react';
import { Image, Film, FileText, X } from 'lucide-react';
import { MediaFile } from '../types';

interface FileThumbnailProps {
  mediaFile: MediaFile;
  onRemove: (id: string) => void;
}

// Funkcja do formatowania rozmiaru pliku
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const FileThumbnail: React.FC<FileThumbnailProps> = ({ mediaFile, onRemove }) => {
  const getIcon = () => {
    switch (mediaFile.type) {
      case 'image':
        return <Image className="w-8 h-8 text-blue-600" />;
      case 'video':
        return <Film className="w-8 h-8 text-purple-600" />;
      default:
        return <FileText className="w-8 h-8 text-gray-600" />;
    }
  };

  return (
    <div className="relative group">
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-colors">
        {mediaFile.type === 'image' ? (
          <img
            src={mediaFile.url}
            alt={mediaFile.name}
            className="w-full h-full object-cover"
          />
        ) : mediaFile.type === 'video' ? (
          <div className="w-full h-full relative">
            <video
              src={mediaFile.url}
              className="w-full h-full object-cover"
              muted
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
              <Film className="w-12 h-12 text-white" />
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-2">
            {getIcon()}
            <span className="text-xs text-gray-600 mt-1 text-center truncate w-full">
              {mediaFile.name}
            </span>
          </div>
        )}
        
        {/* Przycisk usuwania */}
        <button
          onClick={() => onRemove(mediaFile.id)}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Informacje o pliku przy hover */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="truncate">{mediaFile.name}</div>
        <div>{formatFileSize(mediaFile.size)}</div>
      </div>
    </div>
  );
};
