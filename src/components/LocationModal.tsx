import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Search, Navigation, Check } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: { address: string; coordinates: { lat: number; lng: number } }) => void;
  initialLocation?: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
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
  onLocationSelect,
  initialLocation
}) => {
  const [selectedLocation, setSelectedLocation] = useState(
    initialLocation || {
      address: '',
      coordinates: { lat: 52.2297, lng: 21.0122 } // Warszawa jako default
    }
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

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
    const map = window.L.map(mapRef.current).setView([lat, lng], 15);

    // Dodaj kafelki OpenStreetMap
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Dodaj marker
    const marker = window.L.marker([lat, lng], {
      draggable: true
    }).addTo(map);

    // Event listener dla przeciągania markera
    marker.on('dragend', async (e: any) => {
      const position = e.target.getLatLng();
      await updateLocationFromCoordinates(position.lat, position.lng);
    });

    // Event listener dla kliknięcia na mapę
    map.on('click', async (e: any) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      await updateLocationFromCoordinates(lat, lng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Automatycznie pobierz lokalizację gdy mapa się załaduje
    setTimeout(() => {
      getCurrentLocation();
    }, 500);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [mapLoaded]);

  // Aktualizacja lokalizacji na podstawie współrzędnych
  const updateLocationFromCoordinates = async (lat: number, lng: number) => {
    try {
      const address = await reverseGeocode(lat, lng);
      setSelectedLocation({
        address,
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

  // Reverse geocoding
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=pl`
      );
      
      if (!response.ok) throw new Error('API error');
      
      const data = await response.json();
      
      // Formatuj adres z dokładnymi szczegółami
      const parts = [];
      if (data.address) {
        if (data.address.house_number) parts.push(data.address.house_number);
        if (data.address.road) parts.push(data.address.road);
        if (data.address.city_district) parts.push(data.address.city_district);
        if (data.address.city || data.address.town || data.address.village) {
          parts.push(data.address.city || data.address.town || data.address.village);
        }
      }
      
      return parts.length > 0 
        ? parts.join(', ') 
        : data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      throw new Error('Geocoding failed');
    }
  };

  // Wyszukiwanie miejsca
  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&accept-language=pl&countrycodes=pl`
      );
      
      if (!response.ok) throw new Error('Search API error');
      
      const data = await response.json();
      if (data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        // Przenieś mapę i marker
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 17);
          markerRef.current.setLatLng([lat, lng]);
        }
        
        setSelectedLocation({
          address: result.display_name,
          coordinates: { lat, lng }
        });
      } else {
        alert('Nie znaleziono miejsca. Spróbuj innego wyszukiwania.');
      }
    } catch (error) {
      console.error('Błąd wyszukiwania:', error);
      alert('Błąd podczas wyszukiwania. Spróbuj ponownie.');
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
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Przenieś mapę i marker
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 17);
          markerRef.current.setLatLng([latitude, longitude]);
        }
        
        await updateLocationFromCoordinates(latitude, longitude);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Błąd geolokalizacji:', error);
        let errorMessage = 'Nie udało się pobrać lokalizacji';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Dostęp do lokalizacji został odrzucony. Możesz wyszukać adres lub kliknąć na mapę.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Lokalizacja jest niedostępna. Możesz wyszukać adres lub kliknąć na mapę.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Przekroczono czas oczekiwania na lokalizację. Możesz wyszukać adres lub kliknąć na mapę.';
            break;
        }
        alert(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Potwierdzenie wyboru lokalizacji
  const handleConfirm = () => {
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
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Wybierz dokładną lokalizację</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Search bar */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            {/* Search input - szeroki nad przyciskami */}
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
                  placeholder="Wyszukaj adres (np. ul. Marszałkowska 1, Warszawa)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* Przyciski akcji */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={searchLocation}
                disabled={isSearching || !searchQuery.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSearching ? 'Wyszukuję...' : 'Wyszukaj'}
              </button>
              <button
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <Navigation className="w-4 h-4 mr-1" />
                {isGettingLocation ? 'Lokalizuję...' : 'Moja lokalizacja'}
              </button>
            </div>
            
            {/* Current address display */}
            <div className="bg-white rounded-md p-3 border">
              <div className="flex items-start">
                <MapPin className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Wybrana lokalizacja:</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedLocation.address}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Współrzędne: {selectedLocation.coordinates.lat.toFixed(6)}, {selectedLocation.coordinates.lng.toFixed(6)}
                  </p>
                </div>
              </div>
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
            
            {/* Instructions overlay */}
            <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-md p-3 shadow-lg max-w-xs">
              <p className="text-xs text-gray-700">
                💡 <strong>Wskazówka:</strong> Kliknij na mapę lub przeciągnij pinezkę, aby dokładnie określić miejsce incydentu
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Anuluj
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
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
