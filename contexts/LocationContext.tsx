import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Location from 'expo-location';
// Pour fetch
import { Platform } from 'react-native';

interface LocationContextType {
    address: string;
    coords: { latitude: number; longitude: number } | null;
    loading: boolean;
    error: string | null;
    latitude: number | null;
    longitude: number | null;
    city: string | null;
    country: string | null;
    region: string | null;
    street: string | null;
    postalCode: string | null;
}

const LocationContext = createContext<LocationContextType>({
    address: '',
    coords: null,
    loading: true,
    error: null,
    latitude: null,
    longitude: null,
    city: null,
    country: null,
    region: null,
    street: null,
    postalCode: null,
});

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [address, setAddress] = useState('');
    const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [city, setCity] = useState<string | null>(null);
    const [country, setCountry] = useState<string | null>(null);
    const [region, setRegion] = useState<string | null>(null);
    const [street, setStreet] = useState<string | null>(null);
    const [postalCode, setPostalCode] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setError('Localisation non autorisée');
                    setAddress('Localisation non autorisée');
                    setLoading(false);
                    return;
                }
                const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
                setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
                setLatitude(loc.coords.latitude);
                setLongitude(loc.coords.longitude);
                // 1. Essaye d'abord Nominatim (OpenStreetMap)
                let nominatimAddress = '';
                let nominatimCity = null, nominatimCountry = null, nominatimRegion = null, nominatimStreet = null, nominatimPostal = null;
                try {
                    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${loc.coords.latitude}&lon=${loc.coords.longitude}`;
                    const response = await fetch(url, {
                        headers: {
                            'User-Agent': Platform.OS === 'web' ? 'Mozilla/5.0' : 'ExpoApp',
                            'Accept-Language': 'fr',
                        },
                    });
                    const data = await response.json();
                    console.log('Nominatim reverse result:', data);
                    if (data && data.display_name) {
                        nominatimAddress = data.display_name;
                    }
                    if (data && data.address) {
                        nominatimCity = data.address.city || data.address.town || data.address.village || null;
                        nominatimCountry = data.address.country || null;
                        nominatimRegion = data.address.state || data.address.region || null;
                        nominatimStreet = data.address.road || data.address.street || null;
                        nominatimPostal = data.address.postcode || null;
                    }
                } catch (err) {
                    console.log('Erreur Nominatim:', err);
                }

                if (nominatimAddress) {
                    setAddress(nominatimAddress);
                    setCity(nominatimCity);
                    setCountry(nominatimCountry);
                    setRegion(nominatimRegion);
                    setStreet(nominatimStreet);
                    setPostalCode(nominatimPostal);
                } else {
                    // Fallback Expo
                    const geo = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
                    if (geo && geo.length > 0) {
                        const g = geo[0];
                        // Log des champs pour debug
                        console.log('Reverse geocode fields:', {
                            street: g.street,
                            name: g.name,
                            city: g.city,
                            region: g.region,
                            country: g.country,
                            postalCode: g.postalCode
                        });
                        const parts = [g.street, g.name, g.city, g.region, g.country].filter(Boolean);
                        // Filtre les doublons consécutifs
                        const uniqueParts = parts.filter((item, idx) => item && parts.indexOf(item) === idx);
                        const addr = uniqueParts.join(', ');
                        setAddress(addr || `${loc.coords.latitude},${loc.coords.longitude}`);
                        setCity(g.city || null);
                        setCountry(g.country || null);
                        setRegion(g.region || null);
                        setStreet(g.street || null);
                        setPostalCode(g.postalCode || null);
                    } else {
                        setAddress(`${loc.coords.latitude},${loc.coords.longitude}`);
                        setCity(null);
                        setCountry(null);
                        setRegion(null);
                        setStreet(null);
                        setPostalCode(null);
                    }
                }
                setError(null);
            } catch (e) {
                setError('Erreur localisation');
                setAddress('Erreur localisation');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <LocationContext.Provider value={{ address, coords, loading, error, latitude, longitude, city, country, region, street, postalCode }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocationContext = () => useContext(LocationContext);
