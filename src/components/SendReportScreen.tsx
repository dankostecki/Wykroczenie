import React, { useState, useEffect } from 'react';
import { Header } from './Header';

const DEFAULT_RECIPIENTS = [
  { label: "Policja", email: "dyzurny@policja.gov.pl" },
  { label: "Straż miejska", email: "interwencje@strażmiejska.pl" },
  // Dodaj więcej adresatów według potrzeb
];

interface SendReportScreenProps {
  title: string;
  description: string;
  location?: string;
  folderUrl: string;
  onSend: (recipients: string[]) => Promise<void>;
  isSending: boolean;
  sendError?: string | null;
  onSignOut: () => void;
  onBack: () => void;
}

export const SendReportScreen: React.FC<SendReportScreenProps> = ({
  title,
  description,
  location,
  folderUrl,
  onSend,
  isSending,
  sendError,
  onSignOut,
  onBack,
}) => {
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [customEmail, setCustomEmail] = useState('');
  const [customChecked, setCustomChecked] = useState(false);

  useEffect(() => {
    const lastEmail = localStorage.getItem("custom_report_email") || "";
    setCustomEmail(lastEmail);
  }, []);
  useEffect(() => {
    if (customChecked && customEmail) {
      localStorage.setItem("custom_report_email", customEmail);
    }
  }, [customEmail, customChecked]);

  const handleRecipientToggle = (email: string) => {
    setSelectedRecipients(prev =>
      prev.includes(email)
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const handleSend = () => {
    let allRecipients = [...selectedRecipients];
    if (customChecked && customEmail) {
      allRecipients.push(customEmail);
    }
    if (allRecipients.length === 0) {
      alert("Wybierz co najmniej jeden adres e-mail do wysłania zgłoszenia.");
      return;
    }
    onSend(allRecipients);
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Header
        title="Wyślij zgłoszenie"
        onSignOut={onSignOut}
        showBack={!!onBack}
        onBack={onBack}
      />

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <h2 className="flex items-center text-2xl font-semibold mb-2">
            <span className="mr-2">✉️</span> Wyślij zgłoszenie
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            Wybierz odbiorcę zgłoszenia lub wpisz własny adres e-mail.
          </p>

          <div className="mb-6">
            <div className="mb-2 font-medium">Adresaci:</div>
            {DEFAULT_RECIPIENTS.map(rec => (
              <label key={rec.email} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedRecipients.includes(rec.email)}
                  onChange={() => handleRecipientToggle(rec.email)}
                />
                <span>{rec.label} <span className="text-xs text-gray-500">({rec.email})</span></span>
              </label>
            ))}

            <label className="flex items-center mt-3 mb-1">
              <input
                type="checkbox"
                className="mr-2"
                checked={customChecked}
                onChange={e => setCustomChecked(e.target.checked)}
              />
              <span>Własny adres e-mail</span>
            </label>
            {customChecked && (
              <input
                type="email"
                placeholder="Twój e-mail"
                value={customEmail}
                onChange={e => setCustomEmail(e.target.value)}
                className="w-full border rounded px-3 py-2 mt-1 mb-2"
                autoFocus
              />
            )}
          </div>

          <div className="mb-6">
            <div className="mb-1 font-medium">Podgląd wiadomości:</div>
            <div className="border rounded p-3 bg-gray-50 text-xs text-gray-800">
              <b>Tytuł:</b> {title} <br />
              <b>Treść:</b> {description} <br />
              {location && (<><b>Lokalizacja:</b> {location}<br /></>)}
              <b>Dowody:</b> <a href={folderUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">{folderUrl}</a>
            </div>
          </div>

          {sendError && (
            <div className="mb-4 text-red-600 text-sm">{sendError}</div>
          )}

          <button
            onClick={handleSend}
            disabled={isSending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-3 transition"
          >
            {isSending ? "Wysyłanie..." : "Wyślij zgłoszenie"}
          </button>
        </div>
      </div>
    </div>
  );
};
