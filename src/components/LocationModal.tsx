import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Search, Navigation, Check } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: { address: string; coordinates: { lat: number; lng: number } }) => void;
}

// Leaflet będzie ładowany dynamicznie
declare global {
  interface Window {
    L: any;
  }
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onLocationSelect
}) => {
  const [selectedLocation, setSelectedLocation] = useState({
    address: 'Przesuwaj mapę aby wybrać lokalizację...',
    coordinates: { lat: 52.2297, lng: 21.0122 } // Warszawa jako default
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hasAutoLocalized, setHasAutoLocalized] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Ładowanie Leaflet CSS i JS
  useEffect(() => {
    if (!isOpen) return;

    const loadLeaflet = async () => {
      // Sprawdź czy Leaflet już jest załadowany
      if (window.L) {
        setMapLoaded(true);
        return;
      }

      // Dodaj CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(cssLink);

      // Dodaj JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        setMapLoaded(true);
      };
      document.head.appendChild(script);
    };

    loadLeaflet();
  }, [isOpen]);

  // Inicjalizacja mapy i automatyczne pobieranie lokalizacji
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    // Usuń poprzednią mapę jeśli istnieje
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const { lat, lng } = selectedLocation.coordinates;

    // Utwórz nową mapę
    const map = window.L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: true
    }).setView([lat, lng], 13);

    // Dodaj kafelki OpenStreetMap
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Funkcja debounce dla lepszej wydajności
    let timeoutId: number;
    const debouncedReverseGeocode = (lat: number, lng: number) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        updateLocationFromCoordinates(lat, lng);
      }, 800); // Zwiększone opóźnienie dla stabilności
    };

    // Event listener dla zakończenia przesuwania mapy
    map.on('moveend', () => {
      const center = map.getCenter();
      console.log('Mapa przesunięta na:', center.lat, center.lng);
      debouncedReverseGeocode(center.lat, center.lng);
    });

    // Event listener dla zoomowania
    map.on('zoomend', () => {
      const center = map.getCenter();
      debouncedReverseGeocode(center.lat, center.lng);
    });

    mapInstanceRef.current = map;

    // Automatyczne pobieranie lokalizacji przy pierwszym otwarciu
    if (!hasAutoLocalized) {
      setHasAutoLocalized(true);
      setTimeout(() => {
        getCurrentLocation();
      }, 1500); // Więcej czasu na stabilizację mapy
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [mapLoaded, isOpen]); // Dodany isOpen jako dependency

  // Reset stanu przy zamknięciu
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSelectedLocation({
        address: 'Przesuwaj mapę aby wybrać lokalizację...',
        coordinates: { lat: 52.2297, lng: 21.0122 }
      });
      setHasAutoLocalized(false);
      setMapLoaded(false);
      setIsLoadingAddress(false);
      
      // Wyczyść mapę przy zamknięciu
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    }
  }, [isOpen]);

  // Aktualizacja lokalizacji na podstawie współrzędnych
  const updateLocationFromCoordinates = async (lat: number, lng: number) => {
    console.log('Rozpoczęcie reverse geocoding dla:', lat, lng);
    setIsLoadingAddress(true);
    
    try {
      // Ustaw najpierw współrzędne
      setSelectedLocation(prev => ({
        ...prev,
        coordinates: { lat, lng },
        address: 'Pobieranie adresu...'
      }));

      // Używamy BigDataCloud API - obsługuje CORS i jest darmowy
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=pl`;
      console.log('Wywołanie BigDataCloud API:', url);

      const response = await fetch(url);
      
      console.log('Odpowiedź API status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Dane z BigDataCloud API:', data);
      
      // Formatuj adres z danych BigDataCloud
      const parts = [];
      
      // Dodaj szczegóły adresu jeśli dostępne
      if (data.locality) {
        parts.push(data.locality);
      } else if (data.city) {
        parts.push(data.city);
      }
      
      if (data.principalSubdivision && data.principalSubdivision !== data.locality) {
        parts.push(data.principalSubdivision);
      }
      
      if (data.countryName && parts.length < 2) {
        parts.push(data.countryName);
      }
      
      let formattedAddress = parts.length > 0 ? parts.join(', ') : 'Nieznana lokalizacja';
      
      // Jeśli mamy bardziej szczegółowe dane, użyj ich
      if (data.label && data.label.length > formattedAddress.length) {
        formattedAddress = data.label;
      }
      
      // Ogranicz długość adresu
      if (formattedAddress.length > 100) {
        formattedAddress = formattedAddress.substring(0, 97) + '...';
      }
      
      console.log('Sformatowany adres:', formattedAddress);
      
      setSelectedLocation({
        address: formattedAddress,
        coordinates: { lat, lng }
      });
      
    } catch (error) {
      console.error('Błąd reverse geocoding:', error);
      
      // Fallback - spróbuj alternatywnego API
      try {
        console.log('Próba z alternatywnym API...');
        const fallbackUrl = `https://geocode.maps.co/reverse?lat=${lat}&lon=${lng}&format=json`;
        const fallbackResponse = await fetch(fallbackUrl);
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          console.log('Dane z fallback API:', fallbackData);
          
          if (fallbackData.display_name) {
            const shortAddress = fallbackData.display_name.split(',').slice(0, 3).join(', ');
            setSelectedLocation({
              address: shortAddress,
              coordinates: { lat, lng }
            });
            return;
          }
        }
      } catch (fallbackError) {
        console.error('Fallback API też nie działa:', fallbackError);
      }
      
      // Ostateczny fallback - współrzędne
      const fallbackAddress = `📍 ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
      console.log('Używam ostateczny fallback address:', fallbackAddress);
      
      setSelectedLocation({
        address: fallbackAddress,
        coordinates: { lat, lng }
      });
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Wyszukiwanie miejsca
  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Używamy geocode.maps.co API - obsługuje CORS i jest darmowy
      const url = `https://geocode.maps.co/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=3&countrycodes=pl`;
      console.log('Wywołanie search API:', url);
      
      const response = await fetch(url);
      
      console.log('Search API status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Search results:', data);
      
      if (data.length > 0) {
        const result = data[0]; // Weź pierwszy wynik
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        // Przenieś mapę do znalezionej lokalizacji
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 17);
        }
        
        // Użyj display_name jako adres
        let formattedAddress = result.display_name;
        
        // Skróć adres do pierwszych 3 części jeśli jest długi
        if (formattedAddress.includes(',')) {
          const parts = formattedAddress.split(',').slice(0, 3);
          formattedAddress = parts.join(',').trim();
        }
        
        // Ogranicz długość
        if (formattedAddress.length > 100) {
          formattedAddress = formattedAddress.substring(0, 97) + '...';
        }
        
        console.log('Found location:', formattedAddress);
        
        setSelectedLocation({
          address: formattedAddress,
          coordinates: { lat, lng }
        });
        
        setSearchQuery(''); // Wyczyść pole wyszukiwania po sukcesie
      } else {
        alert('Nie znaleziono miejsca. Spróbuj bardziej szczegółowego wyszukiwania (np. "Plac Defilad 1, Warszawa").');
      }
    } catch (error) {
      console.error('Błąd wyszukiwania:', error);
      
      // Fallback - spróbuj z prostszym API
      try {
        console.log('Próba z fallback search API...');
        const fallbackUrl = `https://api.bigdatacloud.net/data/forward-geocode-client?query=${encodeURIComponent(searchQuery)}&localityLanguage=pl`;
        const fallbackResponse = await fetch(fallbackUrl);
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          console.log('Fallback search results:', fallbackData);
          
          if (fallbackData.results && fallbackData.results.length > 0) {
            const result = fallbackData.results[0];
            const lat = result.latitude;
            const lng = result.longitude;
            
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView([lat, lng], 17);
            }
            
            setSelectedLocation({
              address: result.label || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
              coordinates: { lat, lng }
            });
            
            setSearchQuery('');
            return;
          }
        }
      } catch (fallbackError) {
        console.error('Fallback search też nie działa:', fallbackError);
      }
      
      alert('Błąd podczas wyszukiwania. Sprawdź połączenie internetowe i spróbuj ponownie.');
    } finally {
      setIsSearching(false);
    }
  };

  // Pobierz aktualną lokalizację
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolokalizacja nie jest obsługiwana w tej przeglądarce. Możesz wyszukać adres ręcznie.');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        console.log('Pobrano lokalizację:', latitude, longitude);
        
        // Przenieś mapę do aktualnej lokalizacji z wysokim zoomem
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 17);
        }
        
        // Ustaw lokalizację - reverse geocoding zostanie wywołany automatycznie przez moveend
        setSelectedLocation({
          address: 'Pobieranie adresu...',
          coordinates: { lat: latitude, lng: longitude }
        });
        
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Błąd geolokalizacji:', error);
        
        let message = 'Nie udało się pobrać lokalizacji.';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Dostęp do lokalizacji został zablokowany.\n\nAby włączyć lokalizację:\n• Kliknij ikonę 🔒 w pasku adresu\n• Wybierz "Zezwolić" dla lokalizacji\n• Odśwież stronę\n\nLub wyszukaj adres ręcznie.';
        } else if (error.code === error.TIMEOUT) {
          message = 'Przekroczono czas oczekiwania na lokalizację. Spróbuj ponownie lub wyszukaj adres ręcznie.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = 'Lokalizacja jest niedostępna. Sprawdź czy GPS jest włączony lub wyszukaj adres ręcznie.';
        }
        
        alert(message);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000 // 5 minut cache
      }
    );
  };

  // Potwierdzenie wyboru lokalizacji
  const handleConfirm = () => {
    if (selectedLocation.address === 'Przesuwaj mapę aby wybrać lokalizację...') {
      alert('Proszę wybrać lokalizację na mapie lub wyszukać adres');
      return;
    }
    
    onLocationSelect(selectedLocation);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50">
            <div>
              <h3 className="text-lg font-medium text-gray-900">📍 Wybierz lokalizację</h3>
              <p className="text-sm text-gray-600 mt-1">Przesuń mapę lub wyszukaj adres</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-50 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Search bar */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            {/* Search input */}
            <div className="mb-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                  placeholder="Wpisz adres (np. Plac Defilad 1, Warszawa)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>
            
            {/* Przyciski akcji */}
            <div className="flex gap-2">
              <button
                onClick={searchLocation}
                disabled={isSearching || !searchQuery.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {isSearching ? 'Wyszukuję...' : 'Wyszukaj adres'}
              </button>
              <button
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm font-medium"
              >
                <Navigation className="w-4 h-4 mr-1" />
                {isGettingLocation ? 'Lokalizuję...' : 'Moja lokalizacja'}
              </button>
            </div>
          </div>

          {/* Map container */}
          <div className="relative" style={{ height: '400px' }}>
            <div ref={mapRef} className="w-full h-full">
              {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Ładowanie mapy...</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Stała pinezka w środku mapy - Uber style */}
            {mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 1000 }}>
                <div className="relative">
                  {/* Animowana pinezka */}
                  <div className="w-12 h-12 bg-red-500 rounded-full border-4 border-white shadow-2xl flex items-center justify-center transform -translate-y-6 hover:scale-110 transition-transform">
                    <MapPin className="w-7 h-7 text-white fill-white" />
                  </div>
                  {/* Pulsujący cień */}
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-black bg-opacity-40 rounded-full blur-md animate-pulse"></div>
                  {/* Punkt precyzji */}
                  <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            )}
            
            {/* Instructions overlay */}
            <div className="absolute top-4 left-4 bg-white bg-opacity-95 rounded-lg p-3 shadow-lg max-w-sm border">
              <p className="text-xs text-gray-700">
                <span className="font-semibold text-blue-600">💡 Jak używać:</span><br />
                • Przesuń mapę palcem/myszą<br />
                • Pinezka zawsze wskazuje środek<br />
                • Zoom dla większej dokładności<br />
                {isLoadingAddress && (
                  <span className="text-orange-600 font-medium">• ⏳ Pobieranie adresu...</span>
                )}
                {selectedLocation.address.startsWith('📍') && (
                  <span className="text-red-600 font-medium">• ⚠️ Nie można pobrać adresu</span>
                )}
              </p>
            </div>
          </div>

          {/* Current address display */}
          <div className="p-4 bg-gray-50 border-t">
            <div className="bg-white rounded-md p-3 border">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Wybrana lokalizacja:</p>
                  <div className="flex items-center mt-1">
                    {isLoadingAddress && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    )}
                    <p className="text-sm text-gray-600 leading-relaxed flex-1">{selectedLocation.address}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Współrzędne: {selectedLocation.coordinates.lat.toFixed(6)}, {selectedLocation.coordinates.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-white">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Anuluj
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedLocation.address === 'Przesuwaj mapę aby wybrać lokalizację...'}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <Check className="w-4 h-4 mr-2" />
              Potwierdź lokalizację
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
