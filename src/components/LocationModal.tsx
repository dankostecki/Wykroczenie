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
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;

    const { lat, lng } = selectedLocation.coordinates;

    // Utwórz mapę
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
    let timeoutId: NodeJS.Timeout;
    const debouncedReverseGeocode = (lat: number, lng: number) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        updateLocationFromCoordinates(lat, lng);
      }, 500); // 500ms opóźnienie
    };

    // Event listener dla zakończenia przesuwania mapy
    map.on('moveend', () => {
      const center = map.getCenter();
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
      }, 1000); // Daj czas na załadowanie mapy
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapLoaded]);

  // Reset stanu przy zamknięciu
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSelectedLocation({
        address: 'Przesuwaj mapę aby wybrać lokalizację...',
        coordinates: { lat: 52.2297, lng: 21.0122 }
      });
      setHasAutoLocalized(false);
    }
  }, [isOpen]);

  // Aktualizacja lokalizacji na podstawie współrzędnych
  const updateLocationFromCoordinates = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=pl`
      );
      
      if (!response.ok) throw new Error('API error');
      
      const data = await response.json();
      
      // Formatuj adres z polskimi szczegółami
      const parts = [];
      if (data.address) {
        // Numer domu i ulica
        if (data.address.house_number && data.address.road) {
          parts.push(`${data.address.road} ${data.address.house_number}`);
        } else if (data.address.road) {
          parts.push(data.address.road);
        }
        
        // Dzielnica/osiedle
        if (data.address.city_district || data.address.suburb) {
          parts.push(data.address.city_district || data.address.suburb);
        }
        
        // Miasto
        if (data.address.city || data.address.town || data.address.village) {
          parts.push(data.address.city || data.address.town || data.address.village);
        }
      }
      
      const formattedAddress = parts.length > 0 ? parts.join(', ') : data.display_name;
      
      setSelectedLocation({
        address: formattedAddress,
        coordinates: { lat, lng }
      });
    } catch (error) {
      console.error('Błąd reverse geocoding:', error);
      setSelectedLocation({
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        coordinates: { lat, lng }
      });
    }
  };

  // Wyszukiwanie miejsca
  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&accept-language=pl&countrycodes=pl&addressdetails=1`
      );
      
      if (!response.ok) throw new Error('Search API error');
      
      const data = await response.json();
      if (data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        // Przenieś mapę do znalezionej lokalizacji
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 17);
        }
        
        // Formatuj adres
        const parts = [];
        if (result.address) {
          if (result.address.house_number && result.address.road) {
            parts.push(`${result.address.road} ${result.address.house_number}`);
          } else if (result.address.road) {
            parts.push(result.address.road);
          }
          
          if (result.address.city_district || result.address.suburb) {
            parts.push(result.address.city_district || result.address.suburb);
          }
          
          if (result.address.city || result.address.town) {
            parts.push(result.address.city || result.address.town);
          }
        }
        
        setSelectedLocation({
          address: parts.length > 0 ? parts.join(', ') : result.display_name,
          coordinates: { lat, lng }
        });
        
        setSearchQuery(''); // Wyczyść pole wyszukiwania po sukcesie
      } else {
        alert('Nie znaleziono miejsca. Spróbuj bardziej szczegółowego wyszukiwania.');
      }
    } catch (error) {
      console.error('Błąd wyszukiwania:', error);
      alert('Błąd podczas wyszukiwania. Sprawdź połączenie internetowe.');
    } finally {
      setIsSearching(false);
    }
  };

  // Pobierz aktualną lokalizację
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolokalizacja nie jest obsługiwana w tej przeglądarce');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Przenieś mapę do aktualnej lokalizacji z wysokim zoomem
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 17);
        }
        
        // Aktualizuj lokalizację - reverse geocoding zostanie wywołany automatycznie
        setSelectedLocation(prev => ({
          ...prev,
          coordinates: { lat: latitude, lng: longitude }
        }));
        
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Błąd geolokalizacji:', error);
        
        let message = 'Nie udało się pobrać lokalizacji.';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Dostęp do lokalizacji został zablokowany. Możesz wyszukać adres ręcznie.';
        } else if (error.code === error.TIMEOUT) {
          message = 'Przekroczono czas oczekiwania na lokalizację. Spróbuj ponownie.';
        }
        
        alert(message);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
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
                • Zoom dla większej dokładności
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
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{selectedLocation.address}</p>
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
