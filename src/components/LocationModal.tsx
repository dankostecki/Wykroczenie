// src/components/LocationModal.tsx
import React, { useState, useEffect, useRef } from 'react';

declare global {
  interface Window { L: any; }
}

export interface Location {
  address: string;
  coordinates: { lat: number; lng: number };
}

export interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: Location) => void;
  /** Jeśli chcesz domyślnie pokazać już wybraną lokalizację */
  initialLocation?: Location;
  /** Opcjonalny e-mail do Nominatim (jeśli używasz) */
  userEmail?: string;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  initialLocation,
  userEmail
}) => {
  const [tempLocation, setTempLocation] = useState<Location | null>(initialLocation || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Kiedy modal się otworzy, ustawiamy ewentualne initialLocation
  useEffect(() => {
    if (isOpen && initialLocation) {
      setTempLocation(initialLocation);
    }
  }, [isOpen, initialLocation]);

  // 1) Ładowanie Leaflet
  useEffect(() => {
    if (!isOpen) return;
    if (window.L) {
      setMapLoaded(true);
      return;
    }
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);
  }, [isOpen]);

  // 2) Inicjalizacja mapy
  useEffect(() => {
    if (!isOpen || !mapLoaded || !mapRef.current) return;

    // usuń starą instancję
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    }

    const center: [number, number] = tempLocation
      ? [tempLocation.coordinates.lat, tempLocation.coordinates.lng]
      : [52.2297, 21.0122];

    const map = window.L.map(mapRef.current).setView(center, 13);

    window.L
      .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      })
      .addTo(map);

    // od razu pobierz adres z centrum
    {
      const c = map.getCenter();
      fetchAddress(c.lat, c.lng);
    }

    // jeśli mamy już tempLocation, puść marker i obsłuż drag
    if (tempLocation) {
      const m = window.L.marker(center, { draggable: true }).addTo(map);
      markerRef.current = m;
      m.on('dragend', () => {
        const pos = m.getLatLng();
        fetchAddress(pos.lat, pos.lng);
      });
    }

    mapInstanceRef.current = map;
  }, [isOpen, mapLoaded]);

  // 3) przesunięcie/wrzucenie markera
  const placeMarker = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([lat, lng], 16);
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const m = window.L.marker([lat, lng], { draggable: true }).addTo(mapInstanceRef.current);
      markerRef.current = m;
      m.on('dragend', () => {
        const pos = m.getLatLng();
        fetchAddress(pos.lat, pos.lng);
      });
    }
    fetchAddress(lat, lng);
  };

  // 4) Reverse-geocoding
  const fetchAddress = async (lat: number, lng: number) => {
    setIsLoadingAddress(true);
    try {
      const email = userEmail || '';
      const url =
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}` +
        `&addressdetails=1&accept-language=pl` +
        (email ? `&email=${encodeURIComponent(email)}` : '');
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('Nominatim error');
      const data = await resp.json();
      let formatted = `📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      if (data.address) {
        const a = data.address as any;
        const parts: string[] = [];
        if (a.road) {
          const r = a.house_number ? `${a.road} ${a.house_number}` : a.road;
          parts.push(r);
        }
        const town = a.city || a.town || a.village || a.hamlet;
        if (town) parts.push(town);
        if (a.state) parts.push(a.state);
        if (parts.length) formatted = parts.join(', ');
        else if (data.display_name) formatted = data.display_name;
      }
      setTempLocation({ address: formatted, coordinates: { lat, lng } });
    } catch {
      setTempLocation({ address: `📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`, coordinates: { lat, lng } });
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // 5) Wyszukiwanie
  const searchByAddress = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const email = userEmail || '';
      const url =
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}` +
        `&limit=1&addressdetails=1&accept-language=pl&countrycodes=pl` +
        (email ? `&email=${encodeURIComponent(email)}` : '');
      const resp = await fetch(url);
      if (!resp.ok) throw new Error();
      const results = await resp.json();
      if (results.length) {
        const r = results[0];
        placeMarker(parseFloat(r.lat), parseFloat(r.lon));
        setSearchQuery('');
      } else {
        alert('Nie znaleziono adresu');
      }
    } catch {
      alert('Błąd wyszukiwania');
    } finally {
      setIsSearching(false);
    }
  };

  // 6) Moja lokalizacja
  const locateUser = () => {
    if (!navigator.geolocation) {
      alert('Brak geolokalizacji');
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        placeMarker(pos.coords.latitude, pos.coords.longitude);
        setIsGettingLocation(false);
      },
      () => {
        alert('Nie udało się pobrać lokalizacji');
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
    );
  };

  // 7) Potwierdź / Anuluj
  const confirm = () => {
    if (!tempLocation) {
      alert('Wybierz lokalizację');
      return;
    }
    onLocationSelect(tempLocation);
    onClose();
  };
  const cancel = () => {
    setTempLocation(initialLocation || null);
    setSearchQuery('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="text-lg font-medium">📍 Wybierz lokalizację</h3>
          <button onClick={cancel} className="p-1 hover:bg-gray-100 rounded-full">✕</button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium">Adres ręcznie:</label>
            <div className="flex gap-2 mt-1">
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyPress={e => e.key==='Enter' && searchByAddress()}
                placeholder="np. Plac Defilad 1, Warszawa"
                className="flex-1 px-3 py-2 border rounded"
              />
              <button
                onClick={searchByAddress}
                disabled={isSearching||!searchQuery.trim()}
                className="px-4 bg-blue-600 text-white rounded disabled:opacity-50"
              >{isSearching?'…':'Szukaj'}</button>
            </div>
          </div>
          <button
            onClick={locateUser}
            disabled={isGettingLocation}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          >{isGettingLocation?'GPS…':'Moja lokalizacja'}</button>
          <div className="h-64 bg-gray-100 relative">
            {!mapLoaded && <div className="absolute inset-0 flex items-center justify-center">Ładowanie mapy…</div>}
            <div ref={mapRef} className="w-full h-full"></div>
          </div>
          <div className="p-3 bg-gray-50 border rounded">
            {isLoadingAddress
              ? '⏳ Pobieranie adresu…'
              : tempLocation?.address || 'Brak lokalizacji'}
          </div>
        </div>
        <div className="flex justify-end gap-2 p-3 border-t">
          <button onClick={cancel} className="px-4 py-2 border rounded">Anuluj</button>
          <button onClick={confirm} disabled={!tempLocation} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">Potwierdź</button>
        </div>
      </div>
    </div>
  );
};
