import { useState, useCallback } from 'react';

interface Coordinates {
  lat: number;
  lng: number;
}

interface LocationData {
  address: string;
  coordinates: Coordinates;
}

interface UseGeolocationReturn {
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  getCurrentLocation: () => void;
  clearLocation: () => void;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=pl`
      );
      
      if (!response.ok) {
        throw new Error('Błąd API geokodowania');
      }
      
      const data = await response.json();
      
      // Formatuj adres
      const parts = [];
      if (data.locality) parts.push(data.locality);
      if (data.principalSubdivision) parts.push(data.principalSubdivision);
      if (data.countryName) parts.push(data.countryName);
      
      return parts.length > 0 
        ? parts.join(', ') 
        : `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error('Błąd reverse geocoding:', error);
      // Fallback do współrzędnych
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolokalizacja nie jest obsługiwana w tej przeglądarce');
      return;
    }

    setIsLoading(true);
    setError(null);

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minut cache
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const address = await reverseGeocode(latitude, longitude);
          
          setLocation({
            address,
            coordinates: { lat: latitude, lng: longitude }
          });
        } catch (geocodeError) {
          console.error('Błąd geokodowania:', geocodeError);
          // Ustaw lokalizację tylko ze współrzędnymi
          setLocation({
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            coordinates: { lat: latitude, lng: longitude }
          });
        }
        
        setIsLoading(false);
      },
      (positionError) => {
        console.error('Błąd geolokalizacji:', positionError);
        
        let errorMessage = 'Nie udało się pobrać lokalizacji';
        switch (positionError.code) {
          case positionError.PERMISSION_DENIED:
            errorMessage = 'Dostęp do lokalizacji został odrzucony';
            break;
          case positionError.POSITION_UNAVAILABLE:
            errorMessage = 'Lokalizacja jest niedostępna';
            break;
          case positionError.TIMEOUT:
            errorMessage = 'Przekroczono czas oczekiwania na lokalizację';
            break;
        }
        
        setError(errorMessage);
        setIsLoading(false);
      },
      options
    );
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
  }, []);

  return {
    location,
    isLoading,
    error,
    getCurrentLocation,
    clearLocation
  };
};
