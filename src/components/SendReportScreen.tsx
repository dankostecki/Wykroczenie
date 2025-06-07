import React, { useState, useEffect, useRef } from "react";

// Przykładowe komendy policji — możesz podmienić na własne lub pobierać z backendu
const POLICE_DEPARTMENTS = [
  { name: "Komenda Miejska Policji w Warszawie", email: "warszawa@policja.gov.pl" },
  { name: "Komenda Miejska Policji w Krakowie", email: "krakow@policja.gov.pl" },
  { name: "Komenda Powiatowa Policji w Łomży", email: "lomza@policja.gov.pl" },
  // ...więcej
];

const LOCAL_KEY = "uzywaneAdresy";

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

const MOCK_MESSAGE =
  "Twoje zgłoszenie zostanie przekazane do odpowiednich służb.\nZałączony folder Drive:\nhttps://drive.google.com/drive/folders/abcd1234567890verylonglinkabcdef1234567";

export const SendReportScreen: React.FC = () => {
  const [recipientType, setRecipientType] = useState<"police" | "custom">("police");
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [customEmailInput, setCustomEmailInput] = useState("");
  const [addressesToSend, setAddressesToSend] = useState<string[]>([]);
  const [localEmails, setLocalEmailsState] = useState<string[]>([]);
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [emailError, setEmailError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalEmailsState(getLocalEmails());
  }, []);

  useEffect(() => {
    if (customEmailInput.length > 1) {
      setEmailSuggestions(
        localEmails
          .filter(
            (email) =>
              email.includes(customEmailInput) && !addressesToSend.includes(email)
          )
          .slice(0, 5)
      );
    } else {
      setEmailSuggestions([]);
    }
  }, [customEmailInput, localEmails, addressesToSend]);

  const updateLocalEmails = (emails: string[]) => {
    setLocalEmailsState(emails);
    setLocalEmails(emails);
  };

  const handleAddEmail = (email: string) => {
    if (!isValidEmail(email)) {
      setEmailError("Niepoprawny adres email.");
      return;
    }
    setEmailError(null);
    if (!addressesToSend.includes(email)) {
      setAddressesToSend((prev) => [...prev, email]);
    }
    if (!localEmails.includes(email)) {
      const updated = [...localEmails, email];
      updateLocalEmails(updated);
    }
    setCustomEmailInput("");
    inputRef.current?.focus();
  };

  const handleAddPolice = (email: string) => {
    if (!addressesToSend.includes(email)) {
      setAddressesToSend((prev) => [...prev, email]);
    }
    setSelectedDept("");
  };

  const handleRemoveAddress = (email: string) => {
    setAddressesToSend((prev) => prev.filter((e) => e !== email));
  };

  const handleRemoveLocalEmail = (email: string) => {
    const updated = localEmails.filter((e) => e !== email);
    updateLocalEmails(updated);
  };

  const handleEmailInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && customEmailInput.length > 3) {
      handleAddEmail(customEmailInput.trim());
    }
  };

  return (
    <div className="max-w-xl mx-auto my-10 bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-6">
      <h2 className="text-2xl font-semibold mb-1">Wyślij zgłoszenie</h2>
      <p className="text-gray-600 mb-3">Wybierz, gdzie ma trafić Twoje zgłoszenie</p>

      {/* Typ odbiorcy */}
      <div className="flex gap-3 mb-2">
        <button
          className={`flex-1 px-4 py-2 rounded-xl border transition ${recipientType === "police"
              ? "border-blue-600 bg-blue-50 font-semibold"
              : "border-gray-300 bg-white"
            }`}
          onClick={() => setRecipientType("police")}
          type="button"
        >
          Komenda Policji
        </button>
        <button
          className={`flex-1 px-4 py-2 rounded-xl border transition ${recipientType === "custom"
              ? "border-blue-600 bg-blue-50 font-semibold"
              : "border-gray-300 bg-white"
            }`}
          onClick={() => setRecipientType("custom")}
          type="button"
        >
          Własny email
        </button>
      </div>

      {/* Wybór komendy policji */}
      {recipientType === "police" && (
        <div className="mb-2">
          <label className="block mb-1 font-medium text-gray-700">
            Wybierz komendę policji
          </label>
          <select
            className="w-full border rounded-lg p-2 text-gray-700"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="">Wybierz komendę...</option>
            {POLICE_DEPARTMENTS.map((dept) => (
              <option key={dept.email} value={dept.email}>
                {dept.name}
              </option>
            ))}
          </select>
          <button
            className={`mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition ${selectedDept ? "" : "opacity-50 pointer-events-none"
              }`}
            type="button"
            onClick={() => selectedDept && handleAddPolice(selectedDept)}
          >
            Dodaj do wysyłki
          </button>
        </div>
      )}

      {/* Pole własny adres email */}
      {recipientType === "custom" && (
        <div className="mb-2 relative">
          <label className="block mb-1 font-medium text-gray-700">
            Podaj adres email
          </label>
          <input
            ref={inputRef}
            type="email"
            className={`w-full border rounded-lg p-2 pr-20 ${emailError ? "border-red-400" : ""}`}
            placeholder="np. kontakt@instytucja.pl"
            value={customEmailInput}
            onChange={(e) => {
              setCustomEmailInput(e.target.value);
              setEmailError(null);
            }}
            onKeyDown={handleEmailInputKey}
            autoComplete="off"
          />
          <button
            className="absolute top-1.5 right-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition text-sm"
            type="button"
            disabled={!customEmailInput || !isValidEmail(customEmailInput)}
            onClick={() => handleAddEmail(customEmailInput.trim())}
          >
            Dodaj
          </button>

          {/* Sugestie z localStorage */}
          {emailSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow-lg z-10 max-h-40 overflow-auto">
              {emailSuggestions.map((email) => (
                <div
                  key={email}
                  className="flex items-center justify-between px-3 py-1 hover:bg-blue-50 transition"
                >
                  <span
                    className="flex-1 cursor-pointer"
                    onClick={() => handleAddEmail(email)}
                  >
                    {email}
                  </span>
                  <button
                    onClick={() => handleRemoveLocalEmail(email)}
                    className="text-red-400 ml-2 px-2 hover:text-red-600"
                    title="Usuń z historii"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Komunikat o błędzie */}
          {emailError && (
            <div className="text-red-600 mt-1 text-sm">{emailError}</div>
          )}
        </div>
      )}

      {/* Lista adresatów (jako tagi) */}
      <div className="mb-2">
        <label className="block font-medium text-gray-700 mb-1">Adresy do wysyłki:</label>
        <div className="flex flex-wrap gap-2">
          {addressesToSend.length === 0 && (
            <span className="text-gray-400">Nie dodano adresów</span>
          )}
          {addressesToSend.map((email) => (
            <span
              key={email}
              className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
            >
              {email}
              <button
                className="ml-2 text-blue-400 hover:text-red-600 text-lg leading-none"
                title="Usuń z wysyłki"
                onClick={() => handleRemoveAddress(email)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Podgląd wiadomości */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">Podgląd wiadomości:</label>
        <div className="rounded-xl border bg-gray-50 p-4 whitespace-pre-wrap break-words" style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
          {MOCK_MESSAGE.split(/\s/).map((word, idx) => {
            if (word.startsWith("http")) {
              return (
                <a
                  key={idx}
                  href={word}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline break-all"
                  style={{ wordBreak: 'break-all' }}
                >
                  {word + " "}
                </a>
              );
            }
            return word + " ";
          })}
        </div>
      </div>

      {/* Przycisk Wyślij zgłoszenie */}
      <button
        className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition ${addressesToSend.length === 0 ? "opacity-60 pointer-events-none" : ""
          }`}
        type="button"
        disabled={addressesToSend.length === 0}
        // onClick={handleSend} // <- podłącz tu wysyłkę
      >
        Wyślij zgłoszenie
      </button>
    </div>
  );
};
