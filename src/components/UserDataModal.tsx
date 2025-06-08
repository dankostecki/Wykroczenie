import React, { useState, useEffect } from 'react';
import { X, User, MapPin, Phone, Info } from 'lucide-react';

interface UserData {
  name: string;
  address: string;
  phone: string;
}

interface UserDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserData) => void;
  onDelete?: () => void;
  initialData?: UserData | null;
}

export const UserDataModal: React.FC<UserDataModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData
}) => {
  const [formData, setFormData] = useState<UserData>({
    name: '',
    address: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Partial<UserData>>({});

  // Załaduj dane przy otwarciu modala
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({ name: '', address: '', phone: '' });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<UserData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Imię i nazwisko jest wymagane';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Adres do korespondencji jest wymagany';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon kontaktowy jest wymagany';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleInputChange = (field: keyof UserData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Usuń błąd dla tego pola gdy użytkownik zaczyna pisać
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleDelete = () => {
    if (window.confirm('Czy na pewno chcesz usunąć zapisane dane?')) {
      if (onDelete) {
        onDelete();
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  const isEditMode = !!initialData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-lg">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-white" />
            <h2 className="text-lg font-semibold text-white">
              {isEditMode ? 'Edytuj dane zgłaszającego' : 'Dodaj dane zgłaszającego'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white hover:bg-white hover:bg-opacity-20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Imię i nazwisko */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="w-4 h-4 inline mr-1" />
                Imię i nazwisko
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="np. Jan Kowalski"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Adres */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                Adres do korespondencji
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="np. ul. Przykładowa 123, 00-001 Warszawa"
                rows={2}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
              )}
            </div>

            {/* Telefon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-4 h-4 inline mr-1" />
                Telefon kontaktowy
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="np. +48 123 456 789"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>
          </form>

          {/* Informacja o prywatności */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-800">
                Dane są przechowywane wyłącznie na urządzeniu zgłaszającego i służą do dodania ich w wiadomości email wysyłanej służbom.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-lg space-y-2">
          {/* Przycisk zapisz */}
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            {isEditMode ? 'Zapisz zmiany' : 'Zapisz dane'}
          </button>
          
          {/* Przycisk usuń (tylko w trybie edycji) */}
          {isEditMode && onDelete && (
            <button
              onClick={handleDelete}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Usuń zapisane dane
            </button>
          )}
          
          {/* Przycisk anuluj */}
          <button
            onClick={onClose}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
};
