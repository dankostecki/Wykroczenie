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
  const [recipientType, setRecipientType] = useState<RecipientType>('police');
  const [selectedPolice, setSelectedPolice] = useState<string>('');
  const [customEmailInput, setCustomEmailInput] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [customEmailList, setCustomEmailList] = useState<string[]>([]);
  const [customSuggestions, setCustomSuggestions] = useState<string[]>([]);
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

  const handleAddPolice = () => {
    if (selectedPolice && !selectedRecipients.includes(selectedPolice)) {
      setSelectedRecipients(prev => [...prev, selectedPolice]);
    }
    setSelectedPolice('');
  };

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

  const handleRemoveRecipient = (email: string) => {
    setSelectedRecipients(prev => prev.filter(e => e !== email));
  };

  const handleRemoveCustomHistory = (email: string) => {
    const updated = customEmailList.filter(e => e !== email);
    setCustomEmailList(updated);
    setLocalEmails(updated);
    setCustomSuggestions(suggestions => suggestions.filter(e => e !== email));
  };

  const handleInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customEmailInput.length > 3) {
      handleAddCustomEmail(customEmailInput.trim());
    }
  };

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

      <div className="flex-1 flex flex-col items-center justify-start px-4 py-6">
        <div className="w-full max-w-md">
          <div className="bg-blue-600 text-white text-xl font-bold px-6 py-4 rounded-t-xl">
            Wyślij zgłoszenie
          </div>
          <div className="bg-white rounded-b-xl shadow-lg p-8">
            {/* ...tutaj pozostała zawartość formularza */}
          </div>
        </div>
      </div>
    </div>
  );
};
