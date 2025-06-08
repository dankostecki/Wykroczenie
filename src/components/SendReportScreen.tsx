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
];

interface SendReportScreenProps {
  title: string;
  description: string;
  location?: string;
  folderUrl: string;
  userData?: { name: string; address: string; phone: string } | null;
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
    <div className="min-h-[100dvh] bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header
        title="Wyślij zgłoszenie"
        onSignOut={onSignOut}
        showBack={!!onBack}
        onBack={onBack}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Sekcja nagłówka - zgodna z pozostałymi komponentami */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <p className="text-blue-100 text-sm">
              Wybierz odbiorców zgłoszenia
            </p>
          </div>

          {/* Formularz wyboru odbiorców */}
          <div className="p-6 space-y-6">
            {/* Wybór typu odbiorcy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Rodzaj zdarzenia
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className={`flex items-center justify-center py-3 px-4 rounded-lg border-2 w-full transition font-medium ${
                    recipientType === "police"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setRecipientType("police")}
                >
                  Agresja drogowa
                </button>
                <button
                  type="button"
                  className={`flex items-center justify-center py-3 px-4 rounded-lg border-2 w-full transition font-medium ${
                    recipientType === "custom"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setRecipientType("custom")}
                >
                  Inny incydent
                </button>
              </div>
            </div>

            {/* Pole wyboru - zależnie od typu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {recipientType === "police" ? "Komenda policji" : "Adres e-mail"}
              </label>
              {recipientType === "police" ? (
                <div className="space-y-2 sm:space-y-0 sm:flex sm:gap-2">
                  <select
                    className="w-full sm:flex-1 sm:min-w-0 px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Dodaj
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="email"
                    ref={inputRef}
                    placeholder="email odbiorcy"
                    value={customEmailInput}
                    onChange={e => {
                      setCustomEmailInput(e.target.value);
                      setEmailError(null);
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    onKeyDown={handleInputKey}
                    autoComplete="off"
                  />
                  <button
                    className="absolute right-2 top-2 text-blue-600 text-sm px-2 py-1 hover:text-blue-700 font-medium"
                    type="button"
                    disabled={!customEmailInput || !isValidEmail(customEmailInput)}
                    onClick={() => handleAddCustomEmail(customEmailInput.trim())}
                  >
                    Dodaj
                  </button>
                  
                  {/* Sugestie z historii */}
                  {customSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-40 overflow-auto">
                      {customSuggestions.map(email => (
                        <div
                          key={email}
                          className="flex items-center justify-between px-3 py-2 hover:bg-blue-50 transition"
                        >
                          <span
                            className="flex-1 cursor-pointer text-sm"
                            onClick={() => handleAddCustomEmail(email)}
                          >
                            {email}
                          </span>
                          <button
                            onClick={() => handleRemoveCustomHistory(email)}
                            className="text-red-400 ml-2 px-1 hover:text-red-600 text-sm"
                            title="Usuń z historii"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {emailError && (
                    <div className="text-red-600 mt-2 text-sm">{emailError}</div>
                  )}
                </div>
              )}
            </div>

            {/* Lista wybranych adresów */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Odbiorcy ({selectedRecipients.length})
              </label>
              <div className="min-h-[3rem] p-3 border rounded-lg bg-gray-50">
                {selectedRecipients.length === 0 ? (
                  <span className="text-gray-500 text-sm">Nie dodano odbiorców</span>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedRecipients.map(email => (
                      <span
                        key={email}
                        className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {email}
                        <button
                          className="ml-2 text-blue-600 hover:text-red-600 text-lg leading-none"
                          title="Usuń z listy"
                          onClick={() => handleRemoveRecipient(email)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Podgląd wiadomości */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Podgląd wiadomości
              </label>
              <div className="border rounded-lg p-4 bg-gray-50 text-sm text-gray-800 space-y-2">
                <div><strong>Tytuł:</strong> {title}</div>
                <div><strong>Treść:</strong> {description}</div>
                {location && <div><strong>Lokalizacja:</strong> {location}</div>}
                <div>
                  <strong>Dowody:</strong>{" "}
                  <a 
                    href={folderUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:text-blue-700 underline break-all"
                  >
                    {folderUrl}
                  </a>
                </div>

                {userData && (
  <div>
    <strong>Dane zgłaszającego:</strong>
    <div className="ml-4 mt-1 text-sm">
      <div><strong>Imię i nazwisko:</strong> {userData.name}</div>
      <div><strong>Adres:</strong> {userData.address}</div>
      <div><strong>Telefon:</strong> {userData.phone}</div>
    </div>
  </div>
)}
              </div>
            </div>

            {/* Błąd wysyłania */}
            {sendError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-600 text-sm">{sendError}</div>
              </div>
            )}

            {/* Przycisk wysłania */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleSend}
                disabled={isSending || selectedRecipients.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? "Wysyłanie..." : "Wyślij zgłoszenie"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
