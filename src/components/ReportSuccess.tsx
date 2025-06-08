import React from "react";
import { Header } from "./Header";

interface ReportSuccessProps {
  sentTo: string[];
  title: string;
  description: string;
  location?: string;
  folderUrl: string;
  onNewReport: () => void;
  onSignOut: () => void;
}

export const ReportSuccess: React.FC<ReportSuccessProps> = ({
  sentTo,
  title,
  description,
  location,
  folderUrl,
  onNewReport,
  onSignOut,
}) => (
  <div className="min-h-[100dvh] bg-gradient-to-br from-blue-50 to-indigo-100">
    <Header
      title="Zgłoszenie wysłane"
      onSignOut={onSignOut}
      showBack={false}
    />

    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Sekcja nagłówka - zgodna z pozostałymi komponentami */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <p className="text-blue-100 text-sm">
            Zgłoszenie zostało pomyślnie wysłane
          </p>
        </div>

        {/* Zawartość */}
        <div className="p-6 space-y-6">
          {/* Ikona sukcesu */}
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="12" fill="#10B981" />
                <path 
                  d="M8 12l2 2 4-4" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
            </div>
          </div>

          {/* Tytuł i opis sukcesu */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Zgłoszenie wysłane pomyślnie
            </h2>
            <p className="text-gray-600">
              Twoje zgłoszenie zostało poprawnie dostarczone do odbiorców
            </p>
          </div>

          {/* Odbiorcy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wysłano do ({sentTo.length})
            </label>
            <div className="bg-gray-50 border rounded-lg p-3">
              <div className="flex flex-wrap gap-2">
                {sentTo.map(email => (
                  <span
                    key={email}
                    className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {email}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Szczegóły zgłoszenia */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Szczegóły zgłoszenia
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tytuł
              </label>
              <div className="bg-gray-50 border rounded-lg p-3">
                <div className="text-sm text-gray-800">{title}</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opis
              </label>
              <div className="bg-gray-50 border rounded-lg p-3">
                <div className="text-sm text-gray-800 whitespace-pre-wrap">{description}</div>
              </div>
            </div>

            {location && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lokalizacja
                </label>
                <div className="bg-gray-50 border rounded-lg p-3">
                  <div className="text-sm text-gray-800">{location}</div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dowody
              </label>
              <div className="bg-gray-50 border rounded-lg p-3">
                <a
                  href={folderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline text-sm break-all"
                >
                  {folderUrl}
                </a>
              </div>
            </div>
          </div>

          {/* Przycisk nowego zgłoszenia */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={onNewReport}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Wyślij nowe zgłoszenie
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
);
