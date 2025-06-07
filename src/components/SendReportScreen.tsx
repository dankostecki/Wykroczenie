import React, { useState, useEffect, useRef } from 'react';
import { Header } from './Header';

const LOCAL_KEY = "custom_report_emails";

interface Recipient {
  label: string;
  email: string;
}

const DEFAULT_RECIPIENTS: Recipient[] = [
  { label: "Policja", email: "dyzurny@policja.gov.pl" },
  { label: "Straż miejska", email: "interwencje@strażmiejska.pl" },
  // Dodaj więcej według potrzeb
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

function getLocalEmails(): string[] {
  try {
    const data = localStorage.getItem(LOCAL_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}
function setLocalEmails(emails: string[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(emails));
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
  // Lista wszystkich wybranych adresów do wysyłki
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  // Obsługa własnych emaili z localStorage
  const [customEmailInput, setCustomEmailInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customEmailList, setCustomEmailList] = useState<string[]>([]);
  const [customSuggestions, setCustomSuggestions] = useState<string[]>([]);
  const [emailError, setEmailError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ładuj maile z localStorage na start
  useEffect(() => {
    setCustomEmailList(getLocalEmails());
  }, []);

  // Podpowiedzi własnych adresów przy wpisywaniu
  useEffect(() => {
    if (customEmailInput.length > 1) {
      setCustomSuggestions(
        customEmailList
          .filter(email =>
            email.includes(customEmailInput) && !selectedRecipients.includes(email)
          )
          .slice(0, 5)
      );
    } else {
      setCustomSuggestions([]);
    }
  }, [customEmailInput, customEmailList, selectedRecipients]);

  // Dodaj wybrany/nowy email
  const handleAddCustomEmail = (email: string) => {
    if (!isValidEmail(email)) {
      setEmailError("Niepoprawny adres email.");
      return;
    }
    setEmailError(null);
    if (!selectedRecipients.includes(email)) {
      setSelectedRecipients(prev => [...prev, email]);
    }
    if (!customEmailList.includes(email)) {
      const updated = [...customEmailList, email];
      setCustomEmailList(updated);
      setLocalEmails(updated);
    }
    setCustomEmailInput('');
    inputRef.current?.focus();
  };

  // Usuwanie adresu z listy do wysyłki
  const handleRemoveRecipient = (email: string) => {
    setSelectedRecipients(prev => prev.filter(e => e !== email));
  };

  // Usuwanie adresu z localStorage (z historii)
  const handleRemoveCustomHistory = (email: string) => {
    const updated = customEmailList.filter(e => e !== email);
    setCustomEmailList(updated);
    setLocalEmails(updated);
    setCustomSuggestions(suggestions => suggestions.filter(e => e !== email));
  };

  // Zaznaczanie odbiorców domyślnych (Policja, Straż)
  const handleRecipientToggle = (email: string) => {
    setSelectedRecipients(prev =>
      prev.includes(email)
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  // Enter = dodanie własnego maila
  const handleInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customEmailInput.length > 3) {
      handleAddCustomEmail(customEmailInput.trim());
    }
  };

  // Wyślij zgłoszenie
  const handleSend = () => {
    if (selectedRecipients.length === 0) {
      alert("Wybierz co najmniej jeden adres e-mail do wysłania zgłoszenia.");
      return;
    }
    onSend(selectedRecipients);
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

            {/* Dodaj własny adres */}
            <button
              type="button"
              className="mt-3 mb-1 text-blue-600 underline text-sm"
              onClick={() => setShowCustomInput(v => !v)}
            >
              {showCustomInput ? "Ukryj pole własnego e-maila" : "Dodaj własny adres e-mail"}
            </button>

            {showCustomInput && (
              <div className="relative">
                <input
                  type="email"
                  ref={inputRef}
                  placeholder="Twój e-mail"
                  value={customEmailInput}
                  onChange={e => {
                    setCustomEmailInput(e.target.value);
                    setEmailError(null);
                  }}
                  className="w-full border rounded px-3 py-2 mt-1 mb-1"
                  autoFocus
                  onKeyDown={handleInputKey}
                  autoComplete="off"
                />
                <button
                  className="absolute right-1 top-2 text-blue-700 text-sm px-2 py-1"
                  type="button"
                  disabled={!customEmailInput || !isValidEmail(customEmailInput)}
                  onClick={() => handleAddCustomEmail(customEmailInput.trim())}
                >
                  Dodaj
                </button>
                {/* Sugestie z historii */}
                {customSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow-lg z-10 max-h-40 overflow-auto">
                    {customSuggestions.map(email => (
                      <div
                        key={email}
                        className="flex items-center justify-between px-3 py-1 hover:bg-blue-50 transition"
                      >
                        <span
                          className="flex-1 cursor-pointer"
                          onClick={() => handleAddCustomEmail(email)}
                        >
                          {email}
                        </span>
                        <button
                          onClick={() => handleRemoveCustomHistory(email)}
                          className="text-red-400 ml-2 px-2 hover:text-red-600"
                          title="Usuń z historii"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {emailError && (
                  <div className="text-red-600 mt-1 text-sm">{emailError}</div>
                )}
              </div>
            )}
          </div>

          {/* Lista wybranych adresów jako tagi */}
          <div className="mb-6">
            <div className="mb-1 font-medium">Adresy do wysyłki:</div>
            <div className="flex flex-wrap gap-2 mb-1">
              {selectedRecipients.length === 0 && (
                <span className="text-gray-400">Nie dodano adresów</span>
              )}
              {selectedRecipients.map(email => (
                <span
                  key={email}
                  className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {email}
                  <button
                    className="ml-2 text-blue-400 hover:text-red-600 text-lg leading-none"
                    title="Usuń z wysyłki"
                    onClick={() => handleRemoveRecipient(email)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Podgląd wiadomości z zawijaniem linku */}
          <div className="mb-6">
            <div className="mb-1 font-medium">Podgląd wiadomości:</div>
            <div className="border rounded p-3 bg-gray-50 text-xs text-gray-800 whitespace-pre-wrap break-words" style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
              <b>Tytuł:</b> {title} <br />
              <b>Treść:</b> {description} <br />
              {location && (<><b>Lokalizacja:</b> {location}<br /></>)}
              <b>Dowody:</b>{" "}
              <a href={folderUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 break-all">
                {folderUrl}
              </a>
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
