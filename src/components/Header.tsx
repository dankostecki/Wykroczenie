
import React from "react";
import { LogOut, ArrowLeft } from "lucide-react";

interface HeaderProps {
  title: string;
  onSignOut: () => void;
  showBack?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onSignOut,
  showBack = false,
  onBack,
}) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            {showBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                title="Wstecz"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          </div>
          <button
            onClick={onSignOut}
            className="p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors"
            title="Wyloguj"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};
