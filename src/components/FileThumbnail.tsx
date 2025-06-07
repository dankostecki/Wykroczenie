import React from 'react';
import { X, FileText, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { MediaFile } from '../types';

interface FileThumbnailProps {
  mediaFile: MediaFile;
  onRemove?: (id: string) => void;
}

export const FileThumbnail: React.FC<FileThumbnailProps> = ({ mediaFile, onRemove }) => {
  const renderPreview = () => {
    if (mediaFile.type === 'image') {
      return (
        <img
          src={mediaFile.url}
          alt={mediaFile.name}
          className="object-cover w-full h-full rounded-lg"
          style={{ aspectRatio: '1 / 1', minHeight: 0, minWidth: 0 }}
        />
      );
    }
    if (mediaFile.type === 'video') {
      return (
        <video
          src={mediaFile.url}
          controls={false}
          className="object-cover w-full h-full rounded-lg"
          style={{ aspectRatio: '1 / 1', minHeight: 0, minWidth: 0 }}
        >
          Sorry, your browser does not support embedded videos.
        </video>
      );
    }
    // document
    return (
      <div className="flex flex-col items-center justify-center w-full h-full aspect-square bg-gray-100 rounded-lg">
        <FileText className="w-8 h-8 text-gray-400 mb-1" />
        <span className="text-xs text-gray-500 text-center truncate w-full px-1">{mediaFile.name}</span>
      </div>
    );
  };

  return (
    <div className="relative group w-full aspect-square rounded-lg overflow-hidden shadow border bg-white">
      {renderPreview()}
      {/* Krzyżyk tylko jeśli jest onRemove */}
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(mediaFile.id)}
          className="absolute top-1 right-1 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-1 shadow transition-opacity opacity-80 group-hover:opacity-100"
        >
          <X className="w-4 h-4 text-red-500" />
        </button>
      )}
    </div>
  );
};
