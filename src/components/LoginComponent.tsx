import React, { useState } from 'react';
import { X } from 'lucide-react';
import Icon from '../assets/icon-nobg.png';

interface LoginComponentProps {
  onSignIn: () => void;
  loading: boolean;
}

export const LoginComponent: React.FC<LoginComponentProps> = ({ onSignIn, loading }) => {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-start p-6">
      {/* Ikona u góry */}
      <img src={Icon} alt="!ncydent logo" className="w-24 h-24 mb-6 mt-10" />

      {/* Box logowania */}
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">!ncydent App</h1>
          <p className="text-gray-600">Wymagane logowanie przez Google</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={onSignIn}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-6 py-3 text-lg shadow transition"
          >
            {loading ? 'Logowanie...' : 'Zaloguj się przez Google'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 mb-4">
            Kontynuując, akceptujesz uzyskanie przez aplikację dostępu do kamery, plików i lokalizacji, aby utworzyć kompletne zgłoszenie
          </p>
          
          {/* Linki do dokumentów prawnych */}
          <div className="flex justify-center items-center space-x-4 text-xs">
            <button
              onClick={() => setShowTerms(true)}
              className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              Regulamin
            </button>
            
            <span className="text-gray-300">•</span>
            
            <button
              onClick={() => setShowPrivacy(true)}
              className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              Polityka Prywatności
            </button>
          </div>
        </div>
      </div>

      {/* Footer z informacją prawną */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500 max-w-md">
          Korzystając z aplikacji akceptujesz warunki użytkowania. 
          Aplikacja działa w modelu client-side i nie przechowuje Twoich danych na naszych serwerach.
        </p>
      </div>

      {/* Modal Regulamin */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header modala */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-white text-xl font-semibold">Regulamin aplikacji !ncydent</h2>
              <button
                onClick={() => setShowTerms(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Treść modala ze scrollem */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] prose prose-sm max-w-none">
              <div className="text-sm text-gray-600 mb-6">
                <strong>Obowiązuje od:</strong> 08.06.2025 r.<br />
                <strong>Wersja:</strong> 1.0
              </div>

              <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">§ 1. POSTANOWIENIA OGÓLNE</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li><strong>Regulamin</strong> określa zasady korzystania z aplikacji internetowej "!ncydent".</li>
                  <li><strong>Aplikacja</strong> to narzędzie klienckie służące do tworzenia i wysyłania zgłoszeń incydentów (np. agresji drogowej) wraz z materiałami dowodowymi.</li>
                  <li><strong>Dostawca</strong> aplikacji: https://x.com/Dan_Kostecki.</li>
                  <li><strong>Model działania:</strong> Aplikacja działa w przeglądarce użytkownika (client-side) i nie przechowuje danych na serwerach Dostawcy.</li>
                  <li>Korzystanie z Aplikacji oznacza akceptację niniejszego Regulaminu oraz Polityki Prywatności.</li>
                </ol>
              </section>

              <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">§ 2. WYMAGANIA TECHNICZNE</h3>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">§ 3. ZAKRES USŁUG</h3>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">§ 4. OBOWIĄZKI UŻYTKOWNIKA</h3>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">§ 5. ODPOWIEDZIALNOŚĆ</h3>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">§ 6. DANE OSOBOWE I PRYWATNOŚĆ</h3>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">§ 7. WŁASNOŚĆ INTELEKTUALNA</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Prawa autorskie do Aplikacji należą do Dostawcy.</li>
                  <li>Użytkownik zachowuje prawa do przesyłanych przez siebie materiałów.</li>
                  <li>Przesyłając materiały, Użytkownik udziela Dostawcy licencji na ich przetwarzanie w zakresie niezbędnym do świadczenia usług.</li>
                </ol>
              </section>

              <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">§ 8. MODYFIKACJE I ZAKOŃCZENIE</h3>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">§ 9. POSTANOWIENIA KOŃCOWE</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>W sprawach nieuregulowanych zastosowanie mają przepisy prawa polskiego.</li>
                  <li>Spory rozstrzygane są przez sądy powszechne właściwe dla siedziby Dostawcy.</li>
                  <li>Jeśli którekolwiek postanowienie Regulaminu zostanie uznane za nieważne, pozostałe postanowienia zachowują moc.</li>
                </ol>
              </section>

              <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">§ 10. KONTAKT</h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>W sprawach związanych z funkcjonalnością Aplikacji można kontaktować się przez https://x.com/Dan_Kostecki</p>
                  <p className="mt-3"><strong>Uwaga:</strong> W sprawach dotyczących danych osobowych w usługach Google należy kontaktować się bezpośrednio z Google LLC.</p>
                </div>
              </section>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 italic">
                  Korzystając z aplikacji Użytkownik akceptuje Regulamin, Użytkownik potwierdza, że zapoznał się z jego treścią, rozumie model działania aplikacji client-side i zobowiązuje się do przestrzegania Regulaminu.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Polityka Prywatności */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header modala */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-white text-xl font-semibold">Polityka Prywatności aplikacji !ncydent</h2>
              <button
                onClick={() => setShowPrivacy(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Treść modala ze scrollem */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] prose prose-sm max-w-none">
              <div className="text-sm text-gray-600 mb-6">
                <strong>Obowiązuje od:</strong> 08.06.2025<br />
                <strong>Wersja:</strong> 1.0
              </div>

              <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">1. DOSTAWCA APLIKACJI</h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <p><strong>Dostawca aplikacji:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Nazwa:</strong> https://x.com/Dan_Kostecki</li>
                  </ul>
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <strong>UWAGA:</strong> Aplikacja działa w modelu client-side. Dostawca nie jest administratorem danych osobowych użytkowników w rozumieniu RODO, ponieważ nie przetwarza ani nie przechowuje danych osobowych na własnych serwerach.
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">2. MODEL DZIAŁANIA APLIKACJI</h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <p><strong>Aplikacja działa w modelu client-side:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Wszystkie operacje wykonywane są w przeglądarce użytkownika</li>
                    <li>Brak centralnego serwera zbierającego dane</li>
                    <li>Dane przechowywane są lokalnie (localStorage) lub w usługach Google użytkownika</li>
                    <li>Dostawca nie ma dostępu do danych osobowych użytkowników</li>
                  </ul>
                  <p className="mt-3"><strong>Administratorami danych są:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Użytkownik</strong> - dla swoich danych lokalnych</li>
                    <li><strong>Google LLC</strong> - dla danych w usługach Google (Drive, Gmail)</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">3. ZAKRES ZBIERANYCH DANYCH</h3>
                
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-2">3.1 Dane z konta Google</h4>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p><strong>Zbierane automatycznie przy logowaniu:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Adres email</li>
                      <li>Imię i nazwisko</li>
                      <li>Zdjęcie profilowe (jeśli dostępne)</li>
                      <li>Identyfikator konta Google</li>
                    </ul>
                    <p><strong>Cel:</strong> Uwierzytelnienie i identyfikacja użytkownika</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-2">3.2 Dane zgłoszeń</h4>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p><strong>Zbierane dobrowolnie:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Tytuł i opis incydentu</li>
                      <li>Materiały dowodowe (zdjęcia, filmy, dokumenty)</li>
                      <li>Lokalizacja (współrzędne GPS i adres)</li>
                      <li>Data i czas zgłoszenia</li>
                    </ul>
                    <p><strong>Cel:</strong> Tworzenie i przetwarzanie zgłoszeń incydentów</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-2">3.3 Dane kontaktowe (planowane)</h4>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p><strong>Zbierane dobrowolnie w ustawieniach:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Imię i nazwisko zgłaszającego</li>
                      <li>Numer telefonu</li>
                      <li>Adres do korespondencji</li>
                    </ul>
                    <p><strong>Cel:</strong> Automatyczne dołączanie do zgłoszeń</p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">4. KONTROLA NAD DANYMI</h3>
                
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-2">4.1 Dane lokalne (pełna kontrola użytkownika)</h4>
                  <div className="text-sm text-gray-700">
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li><strong>Usuwanie:</strong> Wyczyszczenie localStorage w przeglądarce</li>
                      <li><strong>Modyfikacja:</strong> Edycja ustawień w aplikacji</li>
                      <li><strong>Eksport:</strong> Możliwość kopiowania danych</li>
                    </ul>
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                      <strong>Dostawca aplikacji NIE MA dostępu do tych danych.</strong>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-2">4.2 Dane w usługach Google</h4>
                  <div className="text-sm text-gray-700">
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li><strong>Administrator:</strong> Google LLC</li>
                      <li><strong>Kontrola:</strong> Przez ustawienia konta Google</li>
                      <li><strong>Usuwanie:</strong> Przez interfejs Google Drive/Gmail</li>
                      <li><strong>Prawa:</strong> Zgodnie z polityką Google</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">5. KONTAKT</h3>
                
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-2">5.1 Sprawy techniczne aplikacji</h4>
                  <div className="text-sm text-gray-700">
                    <p>W sprawach dotyczących funkcjonalności aplikacji:</p>
                    <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                      <li><strong>Kontakt:</strong> https://x.com/Dan_Kostecki</li>
                    </ul>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-2">5.2 Prawo wniesienia skargi</h4>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p>Użytkownik ma prawo wniesienia skargi do organu nadzorczego:</p>
                    <div className="p-3 bg-gray-50 border rounded">
                      <p><strong>Urząd Ochrony Danych Osobowych</strong></p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li><strong>Adres:</strong> ul. Stawki 2, 00-193 Warszawa</li>
                        <li><strong>Email:</strong> kancelaria@uodo.gov.pl</li>
                        <li><strong>Telefon:</strong> 22 531 03 00</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 italic">
                  Poprzez korzystanie z aplikacji użytkownik potwierdza, że zapoznał się z Polityką Prywatności i rozumie model działania aplikacji client-side.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
