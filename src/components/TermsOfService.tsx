import React from 'react';
import { Header } from './Header';

interface TermsOfServiceProps {
  onBack?: () => void;
  onSignOut?: () => void;
  showHeader?: boolean;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({
  onBack,
  onSignOut,
  showHeader = true
}) => {
  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-blue-50 to-indigo-100">
      {showHeader && (
        <Header
          title="Regulamin"
          onSignOut={onSignOut || (() => {})}
          showBack={!!onBack}
          onBack={onBack}
        />
      )}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Nagłówek */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h1 className="text-white text-xl font-semibold">Regulamin aplikacji !ncydent</h1>
            <p className="text-blue-100 text-sm mt-1">
              Zasady korzystania z aplikacji
            </p>
          </div>

          {/* Treść regulaminu */}
          <div className="p-6 prose prose-sm max-w-none">
            <div className="text-sm text-gray-600 mb-6">
              <strong>Obowiązuje od:</strong> [DATA]<br />
              <strong>Wersja:</strong> 1.0
            </div>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">§ 1. POSTANOWIENIA OGÓLNE</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li><strong>Regulamin</strong> określa zasady korzystania z aplikacji internetowej "!ncydent".</li>
                <li><strong>Aplikacja</strong> to narzędzie klienckie służące do tworzenia i wysyłania zgłoszeń incydentów (np. agresji drogowej) wraz z materiałami dowodowymi.</li>
                <li><strong>Dostawca</strong> aplikacji: https://x.com/Dan_Kostecki.</li>
                <li><strong>Model działania:</strong> Aplikacja działa w przeglądarce użytkownika (client-side) i nie przechowuje danych na serwerach Dostawcy.</li>
                <li>Korzystanie z Aplikacji oznacza akceptację niniejszego Regulaminu oraz Polityki Prywatności.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">§ 2. WYMAGANIA TECHNICZNE</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Do korzystania z Aplikacji wymagane jest:
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>Aktywne konto Google</li>
                    <li>Przeglądarka internetowa obsługująca JavaScript</li>
                    <li>Połączenie z internetem</li>
                  </ul>
                </li>
                <li>Aplikacja może wymagać dostępu do:
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>Aparatu i mikrofonu urządzenia</li>
                    <li>Lokalizacji</li>
                    <li>Plików na urządzeniu</li>
                  </ul>
                </li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">§ 3. ZAKRES USŁUG</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Aplikacja umożliwia:
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>Zbieranie materiałów dowodowych (zdjęcia, filmy, dokumenty)</li>
                    <li>Opisanie incydentu wraz z lokalizacją</li>
                    <li>Przechowywanie materiałów na własnym Google Drive użytkownika aplikacji</li>
                    <li>Wysyłanie zgłoszeń na wybrane adresy email</li>
                  </ul>
                </li>
                <li>Aplikacja integruje się z usługami:
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>Google OAuth (logowanie)</li>
                    <li>Google Drive (przechowywanie plików)</li>
                    <li>Gmail API (wysyłanie wiadomości)</li>
                    <li>OpenStreetMap (mapy)</li>
                  </ul>
                </li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">§ 4. OBOWIĄZKI UŻYTKOWNIKA</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Użytkownik zobowiązuje się:
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>Podawać prawdziwe informacje</li>
                    <li>Używać Aplikacji zgodnie z prawem</li>
                    <li>Nie naruszać praw osób trzecich</li>
                    <li>Nie przesyłać treści bezprawnych, obraźliwych lub szkodliwych</li>
                  </ul>
                </li>
                <li><strong>Zakazane jest:</strong>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>Zgłaszanie fałszywych incydentów</li>
                    <li>Używanie Aplikacji do nękania lub szkalowania</li>
                    <li>Naruszanie prywatności osób trzecich</li>
                    <li>Przesyłanie materiałów chronionych prawem autorskim bez zgody</li>
                  </ul>
                </li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">§ 5. ODPOWIEDZIALNOŚĆ</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li><strong>Dostawca nie ponosi odpowiedzialności za:</strong>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>Treść zgłoszeń tworzonych przez Użytkowników</li>
                    <li>Działania podjęte przez odbiorców zgłoszeń</li>
                    <li>Czasowe niedostępności usług Google lub innych zewnętrznych</li>
                    <li>Utratę danych przechowywanych lokalnie lub w usługach Google</li>
                    <li>Funkcjonowanie usług Google (Drive, Gmail, OAuth)</li>
                  </ul>
                </li>
                <li><strong>Użytkownik ponosi pełną odpowiedzialność za:</strong>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>Treść i prawdziwość swoich zgłoszeń</li>
                    <li>Konsekwencje wysyłania zgłoszeń</li>
                    <li>Przestrzeganie prawa przy nagrywaniu materiałów</li>
                    <li>Zabezpieczenie swojego konta Google</li>
                    <li>Zarządzanie danymi w localStorage przeglądarki</li>
                  </ul>
                </li>
                <li><strong>Aplikacja to narzędzie:</strong> Dostawca udostępnia oprogramowanie, ale nie kontroluje danych użytkowników.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">§ 6. DANE OSOBOWE I PRYWATNOŚĆ</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Przetwarzanie danych osobowych reguluje odrębna Polityka Prywatności.</li>
                <li><strong>Dostawca nie administruje danymi osobowymi</strong> - aplikacja działa w modelu client-side.</li>
                <li><strong>Administratorami danych są:</strong>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>Użytkownik (dane lokalne)</li>
                    <li>Google LLC (dane w usługach Google)</li>
                  </ul>
                </li>
                <li>Użytkownik ma pełną kontrolę nad swoimi danymi lokalnymi i danymi w usługach Google.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">§ 7. WŁASNOŚĆ INTELEKTUALNA</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Prawa autorskie do Aplikacji należą do Dostawcy.</li>
                <li>Użytkownik zachowuje prawa do przesyłanych przez siebie materiałów.</li>
                <li>Przesyłając materiały, Użytkownik udziela Dostawcy licencji na ich przetwarzanie w zakresie niezbędnym do świadczenia usług.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">§ 8. MODYFIKACJE I ZAKOŃCZENIE</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Dostawca zastrzega sobie prawo do:
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>Modyfikacji Regulaminu</li>
                    <li>Wprowadzania zmian w Aplikacji</li>
                    <li>Czasowego lub trwałego wyłączenia Aplikacji</li>
                  </ul>
                </li>
                <li>Użytkownik może zaprzestać korzystania z Aplikacji w każdym czasie.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">§ 9. POSTANOWIENIA KOŃCOWE</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>W sprawach nieuregulowanych zastosowanie mają przepisy prawa polskiego.</li>
                <li>Spory rozstrzygane są przez sądy powszechne właściwe dla siedziby Dostawcy.</li>
                <li>Jeśli którekolwiek postanowienie Regulaminu zostanie uznane za nieważne, pozostałe postanowienia zachowują moc.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">§ 10. KONTAKT</h2>
              <div className="text-sm text-gray-700 space-y-2">
                <p>W sprawach związanych z funkcjonalnością Aplikacji można kontaktować się przez https://x.com/Dan_Kostecki</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                </ul>
                <p className="mt-3"><strong>Uwaga:</strong> W sprawach dotyczących danych osobowych w usługach Google należy kontaktować się bezpośrednio z Google LLC.</p>
              </div>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 italic">
                Akceptując Regulamin, Użytkownik potwierdza, że zapoznał się z jego treścią, rozumie model działania aplikacji client-side i zobowiązuje się do przestrzegania Regulaminu.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
