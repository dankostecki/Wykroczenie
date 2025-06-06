import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Search, Navigation, Check } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: { address: string; coordinates: { lat: number; lng: number } }) => void;
  userEmail?: string; // Dodany email dla identyfikacji API
}

declare global {
  interface Window {
    L: any;
  }
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  userEmail
}) => {
  const [selectedLocation, setSelectedLocation] = useState({
    address: 'Przesuwaj mapę aby wybrać lokalizację...',
    coordinates: { lat: 52.2297, lng: 21.0122 }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hasAutoLocalized, setHasAutoLocalized] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Ładowanie Leaflet
  useEffect(() => {
    if (!isOpen) return;

    const loadLeaflet = async () => {
      if (window.L) {
        setMapLoaded(true);
        return;
      }

      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(cssLink);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    };

    loadLeaflet();
  }, [isOpen]);

  // Inicjalizacja mapy
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const { lat, lng } = selectedLocation.coordinates;

    const map = window.L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: true
    }).setView([lat, lng], 16);

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    let timeoutId: number;
    const debouncedReverseGeocode = (lat: number, lng: number) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        updateLocationFromCoordinates(lat, lng);
      }, 1000); // Zwiększony timeout dla stabilności
    };

    map.on('moveend', () => {
      const center = map.getCenter();
      debouncedReverseGeocode(center.lat, center.lng);
    });

    map.on('zoomend', () => {
      const center = map.getCenter();
      debouncedReverseGeocode(center.lat, center.lng);
    });

    mapInstanceRef.current = map;

    if (!hasAutoLocalized) {
      setHasAutoLocalized(true);
      setTimeout(() => {
        getCurrentLocation();
      }, 800);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [mapLoaded, isOpen]);

  // Reset przy zamknięciu
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
      
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    }
  }, [isOpen]);

  // Nominatim reverse geocoding z email identyfikacją
  const updateLocationFromCoordinates = async (lat: number, lng: number) => {
    console.log('🔍 Nominatim reverse geocoding dla:', lat, lng);
    setIsLoadingAddress(true);
    
    try {
      setSelectedLocation(prev => ({
        ...prev,
        coordinates: { lat, lng },
        address: 'Pobieranie adresu...'
      }));

      // Używamy email użytkownika do identyfikacji (Nominatim policy)
      const email = userEmail || 'wykroczenie@app.com';
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=pl&email=${encodeURIComponent(email)}`;
      
      console.log('🌐 Nominatim URL:', nominatimUrl);
      
      const response = await fetch(nominatimUrl);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Nominatim data:', data);
        
        if (data && !data.error && data.display_name) {
          // Formatuj adres z polskimi szczegółami
          let formattedAddress = data.display_name;
          
          if (data.address) {
            const parts = [];
            
            // Numer domu i ulica - najważniejsze
            if (data.address.house_number && data.address.road) {
              parts.push(`${data.address.road} ${data.address.house_number}`);
            } else if (data.address.road) {
              parts.push(data.address.road);
            }
            
            // Dzielnica/osiedle
            if (data.address.city_district || data.address.suburb || data.address.neighbourhood) {
              parts.push(data.address.city_district || data.address.suburb || data.address.neighbourhood);
            }
            
            // Miasto
            if (data.address.city || data.address.town || data.address.village) {
              parts.push(data.address.city || data.address.town || data.address.village);
            }
            
            if (parts.length > 0) {
              formattedAddress = parts.join(', ');
            }
          }
          
          // Ogranicz długość dla czytelności
          if (formattedAddress.length > 100) {
            const parts = formattedAddress.split(',').slice(0, 3);
            formattedAddress = parts.join(',').trim();
          }
          
          console.log('✅ Nominatim sukces:', formattedAddress);
          
          setSelectedLocation({
            address: formattedAddress,
            coordinates: { lat, lng }
          });
          return;
        } else if (data.error) {
          console.log('❌ Nominatim error:', data.error);
        }
      } else {
        console.log('❌ Nominatim HTTP error:', response.status, response.statusText);
      }
      
      // Fallback - współrzędne
      console.log('🔧 Fallback do współrzędnych');
      const fallbackAddress = `📍 ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
      
      setSelectedLocation({
        address: fallbackAddress,
        coordinates: { lat, lng }
      });
      
    } catch (err) {
      console.error('❌ Nominatim błąd:', err);
      
      // Fallback - współrzędne
      const fallbackAddress = `📍 ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
      setSelectedLocation({
        address: fallbackAddress,
        coordinates: { lat, lng }
      });
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Nominatim search z email identyfikacją
  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const email = userEmail || 'wykroczenie@app.com';
      const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=3&accept-language=pl&countrycodes=pl&addressdetails=1&email=${encodeURIComponent(email)}`;
      
      console.log('🔍 Nominatim search:', searchUrl);
      const response = await fetch(searchUrl);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Nominatim search results:', data);
        
        if (data.length > 0) {
          const result = data[0];
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);
          
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lng], 18);
          }
          
          // Formatuj adres podobnie jak w reverse geocoding
          let formattedAddress = result.display_name;
          
          if (result.address) {
            const parts = [];
            
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
            
            if (parts.length > 0) {
              formattedAddress = parts.join(', ');
            }
          }
          
          if (formattedAddress.length > 100) {
            formattedAddress = formattedAddress.substring(0, 97) + '...';
          }
          
          console.log('✅ Nominatim search success:', formattedAddress);
          
          setSelectedLocation({
            address: formattedAddress,
            coordinates: { lat, lng }
          });
          
          setSearchQuery('');
        } else {
          alert('Nie znaleziono miejsca. Spróbuj bardziej szczegółowego wyszukiwania (np. "Plac Defilad 1, Warszawa").');
        }
      } else {
        console.log('❌ Nominatim search error:', response.status, response.statusText);
        alert('Błąd wyszukiwania. Spróbuj ponownie.');
      }
    } catch (err) {
      console.log('❌ Nominatim search failed:', err);
      alert('Błąd podczas wyszukiwania. Sprawdź połączenie internetowe.');
    } finally {
      setIsSearching(false);
    }
  };

  // Geolokalizacja
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolokalizacja nie jest obsługiwana w tej przeglądarce.');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 18);
        }
        
        setSelectedLocation({
          address: 'Pobieranie adresu...',
          coordinates: { lat: latitude, lng: longitude }
        });
        
        setIsGettingLocation(false);
      },
      (error) => {
        let message = 'Nie udało się pobrać lokalizacji.';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Dostęp do lokalizacji został zablokowany. Możesz wyszukać adres ręcznie.';
        }
        
        alert(message);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000
      }
    );
  };

  // Potwierdzenie
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
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        ></div>

        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-base font-medium text-gray-900">📍 Wybierz lokalizację</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white hover:bg-opacity-50 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="mb-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                  placeholder="Wpisz adres (np. Plac Defilad 1, Warszawa)"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={searchLocation}
                disabled={isSearching || !searchQuery.trim()}
                className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {isSearching ? 'Szukam...' : 'Szukaj'}
              </button>
              <button
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm font-medium"
              >
                <Navigation className="w-3 h-3 mr-1" />
                {isGettingLocation ? 'GPS...' : 'Moja lokalizacja'}
              </button>
            </div>
          </div>

          {/* Map */}
          <div className="relative" style={{ height: '320px' }}>
            <div ref={mapRef} className="w-full h-full">
              {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-xs text-gray-600">Ładowanie mapy...</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Pinezka */}
            {mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 1000 }}>
                <div className="relative">
                  <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center transform -translate-y-4">
                    <MapPin className="w-5 h-5 text-white fill-white" />
                  </div>
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-black bg-opacity-20 rounded-full blur-sm"></div>
                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                </div>
              </div>
            )}
            
            {/* Instructions */}
            <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded-md p-2 shadow-sm max-w-xs border">
              <p className="text-xs text-gray-700">
                <span className="font-medium text-blue-600">💡</span> Przesuń mapę aby wybrać lokalizację
                {isLoadingAddress && (
                  <span className="text-orange-600 font-medium block">⏳ Pobieranie adresu...</span>
                )}
              </p>
            </div>
          </div>

          {/* Address display */}
          <div className="p-3 bg-gray-50 border-t">
            <div className="bg-white rounded-md p-2 border">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    {isLoadingAddress && (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                    )}
                    <p className="text-sm text-gray-700 truncate">{selectedLocation.address}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedLocation.coordinates.lat.toFixed(5)}, {selectedLocation.coordinates.lng.toFixed(5)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-3 border-t border-gray-200 bg-white">
            <button
              onClick={onClose}
              className="px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
            >
              Anuluj
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedLocation.address === 'Przesuwaj mapę aby wybrać lokalizację...'}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center text-sm"
            >
              <Check className="w-4 h-4 mr-1" />
              Potwierdź
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
