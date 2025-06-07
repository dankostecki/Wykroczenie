import React from "react";
import { Upload, X, Video } from "lucide-react";
import { MediaFile } from "../types";

interface FileThumbnailProps {
  mediaFile: MediaFile;
  onRemove?: (id: string) => void;
  removable?: boolean;
}

export const FileThumbnail: React.FC<FileThumbnailProps> = ({
  mediaFile,
  onRemove,
  removable = true,
}) => {
  return (
    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 group shadow">
      {/* Miniatura obrazu */}
      {mediaFile.type === "image" ? (
        <img
          src={mediaFile.url}
          alt={mediaFile.name}
          className="w-full h-full object-cover"
          draggable={false}
        />
      ) : mediaFile.type === "video" ? (
        <video
          src={mediaFile.url}
          className="w-full h-full object-cover"
          controls={false}
          draggable={false}
        >
          <source src={mediaFile.url} type="video/mp4" />
          Twój przeglądarka nie obsługuje wideo.
        </video>
      ) : (
        // Dokument – pokazujemy ikonę Upload
        <div className="flex items-center justify-center w-full h-full">
          <Upload className="w-10 h-10 text-gray-400" />
        </div>
      )}

      {/* Przyciski usuwania pliku */}
      {removable && onRemove && (
        <button
          onClick={() => onRemove(mediaFile.id)}
          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-50"
          title="Usuń"
        >
          <X className="w-4 h-4 text-red-500" />
        </button>
      )}
    </div>
  );
};
