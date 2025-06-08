import React from 'react';
import { Header } from './Header';

interface PrivacyPolicyProps {
  onBack?: () => void;
  onSignOut?: () => void;
  showHeader?: boolean;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({
  onBack,
  onSignOut,
  showHeader = true
}) => {
  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-blue-50 to-indigo-100">
      {showHeader && (
        <Header
          title="Polityka Prywatności"
          onSignOut={onSignOut || (() => {})}
          showBack={!!onBack}
          onBack={onBack}
        />
      )}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Nagłówek */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h1 className="text-white text-xl font-semibold">Polityka Prywatności aplikacji !ncydent</h1>
            <p className="text-blue-100 text-sm mt-1">
              Informacje o przetwarzaniu danych osobowych
            </p>
          </div>

          {/* Treść polityki prywatności */}
          <div className="p-6 prose prose-sm max-w-none">
            <div className="text-sm text-gray-600 mb-6">
              <strong>Obowiązuje od:</strong> 08.06.2025 r.<br />
              <strong>Wersja:</strong> 1.0
            </div>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">1. DOSTAWCA APLIKACJI</h2>
              <div className="text-sm text-gray-700 space-y-2">
                <p><strong>Dostawca aplikacji:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>Nazwa:</strong> https://x.com/Dan_Kostecki</li>
                </ul>
                <p className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <strong>UWAGA:</strong> Aplikacja działa w modelu client-side. Dostawca nie jest administratorem danych osobowych użytkowników w rozumieniu RODO, ponieważ nie przetwarza ani nie przechowuje danych osobowych na własnych serwerach.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">2. MODEL DZIAŁANIA APLIKACJI</h2>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-3">3. ZAKRES ZBIERANYCH DANYCH</h2>
              
              <div className="mb-4">
                <h3 className="text-md font-semibold text-gray-800 mb-2">3.1 Dane z konta Google</h3>
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
                <h3 className="text-md font-semibold text-gray-800 mb-2">3.2 Dane zgłoszeń</h3>
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
                <h3 className="text-md font-semibold text-gray-800 mb-2">3.3 Dane techniczne</h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <p><strong>Zbierane automatycznie:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Adres IP</li>
                    <li>Typ przeglądarki i urządzenia</li>
                    <li>Logi dostępu do aplikacji</li>
                    <li>Historia adresów email (localStorage)</li>
                  </ul>
                  <p><strong>Cel:</strong> Zapewnienie bezpieczeństwa i funkcjonalności</p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-md font-semibold text-gray-800 mb-2">3.4 Dane kontaktowe</h3>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-3">4. SPOSÓB DZIAŁANIA APLIKACJI</h2>
              
              <div className="mb-4">
                <h3 className="text-md font-semibold text-gray-800 mb-2">4.1 Dane lokalne (w przeglądarce użytkownika)</h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>localStorage:</strong> Historia adresów email, ustawienia użytkownika</li>
                    <li><strong>Sesja przeglądarki:</strong> Tokeny dostępu Google (tylko czasowo)</li>
                    <li><strong>Pamięć przeglądarki:</strong> Pliki przed wysłaniem na Drive</li>
                  </ul>
                  <p className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                    <strong>Dostawca aplikacji NIE MA dostępu do tych danych.</strong>
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-md font-semibold text-gray-800 mb-2">4.2 Usługi Google (konto użytkownika)</h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Google Drive:</strong> Materiały dowodowe w folderach użytkownika</li>
                    <li><strong>Gmail API:</strong> Wysyłanie z konta użytkownika</li>
                    <li><strong>Google OAuth:</strong> Uwierzytelnienie przez Google</li>
                  </ul>
                  <p className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                    <strong>Administrator: Google LLC zgodnie z ich polityką prywatności.</strong>
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-md font-semibold text-gray-800 mb-2">4.3 Usługi zewnętrzne (anonimowe)</h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>OpenStreetMap/Nominatim:</strong> Geokodowanie adresów (bez danych osobowych)</li>
                    <li><strong>GitHub Pages:</strong> Hosting kodu aplikacji (statyczny)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">5. ODBIORCY DANYCH</h2>
              <div className="text-sm text-gray-700 space-y-4">
                <div>
                  <h3 className="font-medium">5.1 Usługi Google LLC</h3>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li><strong>Zakres:</strong> Wszystkie dane przetwarzane przez Google APIs</li>
                    <li><strong>Podstawa:</strong> Świadczenie usług</li>
                    <li><strong>Lokalizacja:</strong> USA</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium">5.2 Odbiorcy zgłoszeń</h3>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li><strong>Zakres:</strong> Treść zgłoszenia wraz z materiałami</li>
                    <li><strong>Podstawa:</strong> Zgoda użytkownika lub prawnie uzasadniony interes</li>
                    <li><strong>Odbiorcy:</strong> Komendy policji, wybrane instytucje</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium">5.3 Dostawcy usług technicznych</h3>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li><strong>GitHub Pages:</strong> Hosting aplikacji</li>
                    <li><strong>CDN CloudFlare:</strong> Dostarczanie bibliotek JavaScript</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">6. OKRES PRZECHOWYWANIA DANYCH</h2>
              <div className="text-sm text-gray-700">
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Konto Google:</strong> Do momentu wylogowania</li>
                  <li><strong>Materiały na Google Drive:</strong> Zgodnie z ustawieniami użytkownika</li>
                  <li><strong>localStorage:</strong> Do wyczyszczenia przez użytkownika</li>
                  <li><strong>Logi dostępu:</strong> 12 miesięcy</li>
                  <li><strong>Dane w ustawieniach:</strong> Do usunięcia przez użytkownika</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">7. KONTROLA NAD DANYMI</h2>
              
              <div className="mb-4">
                <h3 className="text-md font-semibold text-gray-800 mb-2">7.1 Dane lokalne (pełna kontrola użytkownika)</h3>
                <div className="text-sm text-gray-700">
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Usuwanie:</strong> Wyczyszczenie localStorage w przeglądarce</li>
                    <li><strong>Modyfikacja:</strong> Edycja ustawień w aplikacji</li>
                    <li><strong>Eksport:</strong> Możliwość kopiowania danych</li>
                  </ul>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-md font-semibold text-gray-800 mb-2">7.2 Dane w usługach Google</h3>
                <div className="text-sm text-gray-700">
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Administrator:</strong> Google LLC</li>
                    <li><strong>Kontrola:</strong> Przez ustawienia konta Google</li>
                    <li><strong>Usuwanie:</strong> Przez interfejs Google Drive/Gmail</li>
                    <li><strong>Prawa:</strong> Zgodnie z polityką Google</li>
                  </ul>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-md font-semibold text-gray-800 mb-2">7.3 Kontakt z dostawcą aplikacji</h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>W sprawach dotyczących aplikacji (nie danych osobowych):</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Kontakt:</strong> https://x.com/Dan_Kostecki]</li>
                    <li><strong>Zakres:</strong> Błędy, sugestie, funkcjonalność</li>
                  </ul>
                  <p className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <strong>Uwaga:</strong> Dostawca nie może usuwać danych z konta Google użytkownika.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">8. BEZPIECZEŃSTWO DANYCH</h2>
              <div className="text-sm text-gray-700">
                <p className="mb-2">Stosowane środki bezpieczeństwa:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>Szyfrowanie HTTPS:</strong> Cała komunikacja szyfrowana</li>
                  <li><strong>OAuth 2.0:</strong> Bezpieczne uwierzytelnienie</li>
                  <li><strong>Brak przechowywania:</strong> Tokeny tylko w sesji przeglądarki</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">9. PRZEKAZYWANIE DANYCH POZA UE</h2>
              
              <div className="mb-4">
                <h3 className="text-md font-semibold text-gray-800 mb-2">9.1 Google LLC (USA)</h3>
                <div className="text-sm text-gray-700">
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Podstawa:</strong> Decyzja adequacyjna Komisji Europejskiej</li>
                    <li><strong>Zabezpieczenia:</strong> Google Workspace for Business</li>
                  </ul>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-md font-semibold text-gray-800 mb-2">9.2 GitHub Inc. (USA)</h3>
                <div className="text-sm text-gray-700">
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Podstawa:</strong> Klauzule standardowe</li>
                    <li><strong>Zakres:</strong> Tylko kod aplikacji (bez danych osobowych)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">10. PLIKI COOKIES</h2>
              <div className="text-sm text-gray-700">
                <p className="mb-2">Aplikacja może używać:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>Cookies funkcjonalne:</strong> Niezbędne do działania</li>
                  <li><strong>localStorage:</strong> Przechowywanie ustawień lokalnie</li>
                  <li><strong>Brak cookies marketingowych:</strong> Nie są używane</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">11. KONTAKT</h2>
              
              <div className="mb-4">
                <h3 className="text-md font-semibold text-gray-800 mb-2">11.1 Sprawy techniczne aplikacji</h3>
                <div className="text-sm text-gray-700">
                  <p>W sprawach dotyczących funkcjonalności aplikacji:</p>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li><strong>Kontakt:</strong> https://x.com/Dan_Kostecki</li>
                  </ul>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-md font-semibold text-gray-800 mb-2">11.2 Sprawy ochrony danych</h3>
                <div className="text-sm text-gray-700">
                  <p><strong>Dane lokalne:</strong> Użytkownik ma pełną kontrolę</p>
                  <p><strong>Dane Google:</strong> Kontakt z Google LLC przez ich kanały wsparcia</p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-md font-semibold text-gray-800 mb-2">11.3 Prawo wniesienia skargi</h3>
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

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">12. ZMIANY POLITYKI PRYWATNOŚCI</h2>
              <div className="text-sm text-gray-700">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Dostawca zastrzega sobie prawo do wprowadzania zmian w Polityce Prywatności.</li>
                  <li>Kontynuowanie korzystania z aplikacji oznacza akceptację zmian.</li>
                </ol>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">13. POSTANOWIENIA KOŃCOWE</h2>
              <div className="text-sm text-gray-700">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Polityka Prywatności uwzględnia model client-side aplikacji zgodny z RODO.</li>
                  <li>W sprawach nieuregulowanych zastosowanie mają przepisy prawa powszechnie obowiązującego.</li>
                  <li>Polityka Prywatności jest dostępna na stałe w aplikacji.</li>
                </ol>
              </div>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 italic">
                Poprzez korzystanie z aplikacji użytkownik potwierdza, że zapoznał się z Polityką Prywatności i rozumie model działania aplikacji client-side.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
