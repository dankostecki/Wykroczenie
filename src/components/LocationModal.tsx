import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Search, Navigation, Check } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: { address: string; coordinates: { lat: number; lng: number } }) => void;
}

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
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    coordinates: { lat: number; lng: number };
  }>({
    address: 'Przesuwaj mapę, aby wybrać lokalizację...',
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

  // Ładowanie Leaflet tylko gdy modal jest otwarty
  useEffect(() => {
    if (!isOpen) return;

    const loadLeaflet = async () => {
      if (window.L) {
        setMapLoaded(true);
        return;
      }
      // styl CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(cssLink);

      // skrypt JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    };

    loadLeaflet();
  }, [isOpen]);

  // Inicjalizacja/odświeżenie mapy
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    // Jeśli już jest instancja mapy, usuń ją (np. przy ponownym otwarciu modalu)
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
      }, 1000);
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

    // Przy pierwszym renderze automatycznie próbuj geolokalizacji użytkownika
    if (!hasAutoLocalized) {
      setHasAutoLocalized(true);
      setTimeout(() => {
        getCurrentLocation();
      }, 800);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [mapLoaded, isOpen]);

  // Reset stanu przy zamknięciu modalu
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSelectedLocation({
        address: 'Przesuwaj mapę, aby wybrać lokalizację...',
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

  // Funkcja reverse-geocoding, która zawsze próbuje wydobyć ulicę, nr domu i miejscowość
  const updateLocationFromCoordinates = async (lat: number, lng: number) => {
    console.log('🔍 Reverse geocoding dla:', lat, lng);
    setIsLoadingAddress(true);

    try {
      // Najpierw ustaw stan z “Pobieranie...” by dać feedback użytkownikowi
      setSelectedLocation(prev => ({
        ...prev,
        coordinates: { lat, lng },
        address: 'Pobieranie adresu...'
      }));

      // PRÓBA 1: geocoding BigDataCloud (może nie zawierać szczegółów ulicy)
      try {
        console.log('🔄 Próba BigDataCloud API...');
        const resp1 = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=pl`
        );
        if (resp1.ok) {
          const data1 = await resp1.json();
          console.log('📊 BigDataCloud data:', data1);
          // BigDataCloud zwraca locality, city, principalSubdivision – nie ma szczegółów ulicy/num domu
          if (data1 && (data1.locality || data1.city || data1.principalSubdivision)) {
            const parts1: string[] = [];
            // Nazwa dzielnicy lub osiedla (jeśli jest i różni się od city)
            if (data1.locality && data1.locality !== data1.city) {
              parts1.push(data1.locality);
            }
            // Wypisz miasto lub województwo
            if (data1.city) {
              parts1.push(data1.city);
            } else if (data1.principalSubdivision) {
              parts1.push(data1.principalSubdivision);
            }
            const formatted1 = parts1.length > 0 ? parts1.join(', ') : data1.locality || 'Nieznana lokalizacja';
            console.log('✅ BigDataCloud sukces:', formatted1);
            setSelectedLocation({
              address: formatted1,
              coordinates: { lat, lng }
            });
            setIsLoadingAddress(false);
            return;
          }
        }
      } catch (err) {
        console.log('❌ BigDataCloud nie powiodło się:', err);
      }

      // PRÓBA 2: geocode.maps.co – tu pobieramy ulice, nr domu i miejscowość
      try {
        console.log('🔄 Próba geocode.maps.co API...');
        const resp2 = await fetch(
          `https://geocode.maps.co/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        if (resp2.ok) {
          const data2 = await resp2.json();
          console.log('📊 geocode.maps.co data:', data2);
          if (data2 && data2.address) {
            const addr = data2.address;
            // Zbuduj adres w postaci: “ulica nr_dom, miejscowość”
            const parts2: string[] = [];
            if (addr.road) {
              if (addr.house_number) {
                parts2.push(`${addr.road} ${addr.house_number}`);
              } else {
                parts2.push(addr.road);
              }
            }
            // Jeśli jest miejscowość (city/town/village)
            const town = addr.city || addr.town || addr.village;
            if (town) {
              parts2.push(town);
            }
            // Jeśli nie udało się zebrać ani ulicy, ani miasta, użyj display_name jako fallback
            let formatted2 = parts2.length > 0 ? parts2.join(', ') : data2.display_name || 'Nieznana lokalizacja';
            console.log('✅ geocode.maps.co sukces:', formatted2);
            setSelectedLocation({
              address: formatted2,
              coordinates: { lat, lng }
            });
            setIsLoadingAddress(false);
            return;
          }
        }
      } catch (err) {
        console.log('❌ geocode.maps.co nie powiodło się:', err);
      }

      // Fallback: jeśli nic nie zadziałało, wyświetl same współrzędne
      console.log('🔧 Fallback: wyświetlam same współrzędne');
      const fallbackAddr = `📍 ${lat.toFixed(5)}°, ${lng.toFixed(5)}°`;
      setSelectedLocation({
        address: fallbackAddr,
        coordinates: { lat, lng }
      });
    } catch (err) {
      console.error('❌ Błąd w reverse geocoding:', err);
      const fallbackAddr = `📍 ${lat.toFixed(5)}°, ${lng.toFixed(5)}°`;
      setSelectedLocation({
        address: fallbackAddr,
        coordinates: { lat, lng }
      });
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Funkcja wyszukiwania adresu po wpisaniu
  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      console.log('🔍 Wyszukiwanie:', searchQuery);
      const resp = await fetch(
        `https://geocode.maps.co/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=3&countrycodes=pl`
      );
      if (resp.ok) {
        const results = await resp.json();
        console.log('📊 Wyniki wyszukiwania:', results);
        if (results.length > 0) {
          const result = results[0];
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lng], 18);
          }
          // Zbuduj “krótki” adres: weź pierwsze 3 fragmenty display_name
          let formatted = result.display_name;
          if (formatted.includes(',')) {
            const parts = formatted.split(',').slice(0, 3);
            formatted = parts.join(',').trim();
          }
          if (formatted.length > 100) {
            formatted = formatted.substring(0, 97) + '...';
          }
          console.log('✅ Wyszukiwanie sukces:', formatted);
          setSelectedLocation({
            address: formatted,
            coordinates: { lat, lng }
          });
          setSearchQuery('');
        } else {
          alert('Nie znaleziono miejsca. Spróbuj bardziej szczegółowego wyszukiwania.');
        }
      } else {
        console.log('❌ Błąd API wyszukiwania:', resp.status);
        alert('Błąd wyszukiwania. Spróbuj ponownie.');
      }
    } catch (err) {
      console.log('❌ Wyszukiwanie nie powiodło się:', err);
      alert('Błąd podczas wyszukiwania. Sprawdź połączenie internetowe.');
    } finally {
      setIsSearching(false);
    }
  };

  // Pobranie aktualnej lokalizacji użytkownika
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
        // Od razu ustaw “Pobieranie adresu...”
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

  // Potwierdzenie wyboru lokalizacji
  const handleConfirm = () => {
    if (selectedLocation.address === 'Przesuwaj mapę, aby wybrać lokalizację...') {
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

            {/* Pinezka z tooltipem (pointer-events-none na wrapper, pointer-events-auto na pinie) */}
            {mapLoaded && (
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ zIndex: 1000 }}
              >
                <div className="relative group pointer-events-auto">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 px-2 py-1 bg-white border rounded text-xs text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg">
                    <p className="font-medium">{selectedLocation.address}</p>
                    <p>
                      {selectedLocation.coordinates.lat.toFixed(5)}, {selectedLocation.coordinates.lng.toFixed(5)}
                    </p>
                  </div>
                  {/* Samy pin */}
                  <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center transform -translate-y-4">
                    <MapPin className="w-5 h-5 text-white fill-white" />
                  </div>
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-black bg-opacity-20 rounded-full blur-sm"></div>
                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                </div>
              </div>
            )}

            {/* Instrukcja */}
            <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded-md p-2 shadow-sm max-w-xs border">
              <p className="text-xs text-gray-700">
                <span className="font-medium text-blue-600">💡</span> Przesuń mapę, aby wybrać lokalizację.
                {isLoadingAddress && (
                  <span className="text-orange-600 font-medium block">⏳ Pobieranie adresu...</span>
                )}
              </p>
            </div>
          </div>

          {/* Wyświetlanie adresu i współrzędnych pod mapą */}
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
              disabled={selectedLocation.address === 'Przesuwaj mapę, aby wybrać lokalizację...'}
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
