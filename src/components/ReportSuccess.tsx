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
  <div className="min-h-[100dvh] bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
    <Header
      title="Zgłoszenie wysłane"
      onSignOut={onSignOut}
      showBack={false}
    />
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-green-100 p-4">
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="12" fill="#A7F3D0" />
              <path d="M8 12l2 2 4-4" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-2">Zgłoszenie wysłane</h2>
        <p className="text-center text-gray-600 mb-6">
          Twoje zgłoszenie zostało poprawnie wysłane na adres(y):
        </p>
        <div className="mb-3">
          <ul className="text-sm text-gray-800 list-disc pl-5">
            {sentTo.map(email => <li key={email}>{email}</li>)}
          </ul>
        </div>
        <div className="mb-3">
          <div className="font-medium text-gray-700 mb-1">Tytuł:</div>
          <div className="text-sm text-gray-800">{title}</div>
        </div>
        <div className="mb-3">
          <div className="font-medium text-gray-700 mb-1">Opis:</div>
          <div className="text-sm text-gray-800">{description}</div>
        </div>
        {location && (
          <div className="mb-3">
            <div className="font-medium text-gray-700 mb-1">Lokalizacja:</div>
            <div className="text-sm text-gray-800">{location}</div>
          </div>
        )}
        <div className="mb-6">
          <div className="font-medium text-gray-700 mb-1">Dowody:</div>
          <a
            href={folderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline break-all"
          >
            {folderUrl}
          </a>
        </div>
        <button
          onClick={onNewReport}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg py-3 mt-4 transition"
        >
          Wyślij nowe zgłoszenie
        </button>
      </div>
    </div>
  </div>
);
