import React, { useState, useEffect, useRef } from 'react';
import { Header } from './Header';

const LOCAL_KEY = "custom_report_emails";

interface Recipient {
  label: string;
  email: string;
}

const POLICE_DEPARTMENTS: Recipient[] = [
  { label: "Białystok:", email: "stopagresjidrogowej.kwp@bk.policja.gov.pl" },
  { label: "Bydgoszcz:", email: "stopagresjidrogowej-kwp@bg.policja.gov.pl" },
  { label: "Gdańsk:", email: "stopagresjidrogowej@gd.policja.gov.pl" },
  { label: "Gorzów Wlkp.:", email: "stopagresjidrogowej@go.policja.gov.pl" },
  { label: "Katowice:", email: "stopagresjidrogowej@ka.policja.gov.pl" },
  { label: "Kielce:", email: "stopagresjidrogowej@ki.policja.gov.pl" },
  { label: "Kraków:", email: "stopagresjidrogowej@malopolska.policja.gov.pl" },
  { label: "Lublin:", email: "stopagresjidrogowej@lu.policja.gov.pl" },
  { label: "Łódź:", email: "stopagresjidrogowej@ld.policja.gov.pl" },
  { label: "Olsztyn:", email: "stopagresjidrogowej@ol.policja.gov.pl" },
  { label: "Opole:", email: "problemdrogowy@op.policja.gov.pl" },
  { label: "Poznań:", email: "stopagresjidrogowej@po.policja.gov.pl" },
  { label: "Radom:", email: "stopagresjidrogowej@ra.policja.gov.pl" },
  { label: "Rzeszów:", email: "stopagresjidrogowej@rz.policja.gov.pl" },
  { label: "Szczecin:", email: "stopagresjidrogowej@sc.policja.gov.pl" },
  { label: "Wrocław:", email: "stopagresjidrogowej@wr.policja.gov.pl" },
  { label: "Warszawa:", email: "stopagresjidrogowej@ksp.policja.gov.pl" }
  // ...dodaj więcej jeśli trzeba
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

type RecipientType = 'police' | 'custom';

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
  // Nowy wybór trybu
  const [recipientType, setRecipientType] = useState<RecipientType>('police');
  // Do wyboru komendy policji
  const [selectedPolice, setSelectedPolice] = useState<string>('');
  // Do wpisania własnego maila
  const [customEmailInput, setCustomEmailInput] = useState('');
  // Lista adresów do wysyłki
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  // Historia własnych maili
  const [customEmailList, setCustomEmailList] = useState<string[]>([]);
  // Sugestie podpowiedzi
  const [customSuggestions, setCustomSuggestions] = useState<string[]>([]);
  // Error emaila
  const [emailError, setEmailError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCustomEmailList(getLocalEmails());
  }, []);

  useEffect(() => {
    if (customEmailInput.length > 1) {
      setCustomSuggestions(
        customEmailList
          .filter(email =>
            email.toLowerCase().includes(customEmailInput.toLowerCase()) &&
            !selectedRecipients.includes(email)
          )
          .slice(0, 5)
      );
    } else {
      setCustomSuggestions([]);
    }
  }, [customEmailInput, customEmailList, selectedRecipients]);

  // Dodaj wybraną komendę policji
  const handleAddPolice = () => {
    if (selectedPolice && !selectedRecipients.includes(selectedPolice)) {
      setSelectedRecipients(prev => [...prev, selectedPolice]);
    }
    setSelectedPolice('');
  };

  // Dodaj własny e-mail
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

  // Usuwanie adresu z historii (localStorage)
  const handleRemoveCustomHistory = (email: string) => {
    const updated = customEmailList.filter(e => e !== email);
    setCustomEmailList(updated);
    setLocalEmails(updated);
    setCustomSuggestions(suggestions => suggestions.filter(e => e !== email));
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

      <div className="flex-1 flex items-center justify-start px-4">
        <div className="bg-blue-600 text-white text-xl font-bold px-6 py-4 rounded-t-xl flex items-center gap-2 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
         <p className="text-blue-100 text-sm">
                Wybierz odbiorce zgłoszenia
              </p>
</div>

          {/* Nowy wybór odbiorcy */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                type="button"
                className={`flex items-center justify-center py-2 rounded-xl border w-full transition ${recipientType === "police"
                  ? "border-blue-600 bg-blue-50 font-semibold"
                  : "border-gray-300 bg-white"
                  }`}
                onClick={() => setRecipientType("police")}
              >
                Agresja drogowa
              </button>
              <button
                type="button"
                className={`flex items-center justify-center py-2 rounded-xl border w-full transition ${recipientType === "custom"
                  ? "border-blue-600 bg-blue-50 font-semibold"
                  : "border-gray-300 bg-white"
                  }`}
                onClick={() => setRecipientType("custom")}
              >
                Podaj email
              </button>
            </div>
            {/* Jedno pole, zależnie od wyboru */}
            {recipientType === "police" ? (
              <div className="flex gap-2">
                <select
                  className="w-full border rounded-lg p-2 text-gray-700"
                  value={selectedPolice}
                  onChange={(e) => setSelectedPolice(e.target.value)}
                >
                  <option value="">Wybierz komendę...</option>
                  {POLICE_DEPARTMENTS.map((dept) => (
                    <option key={dept.email} value={dept.email}>
                      {dept.label} ({dept.email})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddPolice}
                  disabled={!selectedPolice}
                  className={`px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold transition ${!selectedPolice ? "opacity-50 pointer-events-none" : ""}`}
                >
                  Dodaj
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="email"
                  ref={inputRef}
                  placeholder="Twój adres email"
                  value={customEmailInput}
                  onChange={e => {
                    setCustomEmailInput(e.target.value);
                    setEmailError(null);
                  }}
                  className="w-full border rounded-lg px-3 py-2 mb-1"
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
