import React, { useEffect, useRef, useState } from 'react';
import { Input } from '../../../components/ui/input';
import { MapPin } from 'lucide-react';
import { ifs } from '@ifs/shared/api/ifsClient';

// Global promise to track script loading to prevent duplicate scripts
let googleMapsScriptLoadingPromise = null;

const loadGoogleMapsScript = async () => {
    if (window.google && window.google.maps) return Promise.resolve();
    if (googleMapsScriptLoadingPromise) return googleMapsScriptLoadingPromise;

    googleMapsScriptLoadingPromise = new Promise(async (resolve, reject) => {
        try {
            const response = await ifs.functions.invoke('getGoogleMapsApiKey');
            const apiKey = response.data?.key || response.key;

            if (!apiKey) {
                reject(new Error("No API key found"));
                return;
            }

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => resolve();
            script.onerror = (err) => reject(err);
            document.head.appendChild(script);
        } catch (error) {
            reject(error);
        }
    });

    return googleMapsScriptLoadingPromise;
};

export default function LocationSearchInput({ value, onChange, placeholder = "Search location...", className }) {
    const inputRef = useRef(null);
    const autocompleteRef = useRef(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        loadGoogleMapsScript()
            .then(() => setScriptLoaded(true))
            .catch(err => console.error("Failed to load Google Maps", err));
    }, []);

    const onChangeRef = useRef(onChange);
    
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        if (scriptLoaded && inputRef.current && !autocompleteRef.current && window.google) {
            const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
                types: ['(cities)'],
            });

            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (onChangeRef.current) {
                    onChangeRef.current({
                        name: place.name || place.formatted_address,
                        formatted_address: place.formatted_address,
                        geometry: place.geometry ? {
                            location: {
                                lat: place.geometry.location.lat(),
                                lng: place.geometry.location.lng()
                            }
                        } : null
                    });
                }
            });
            
            autocompleteRef.current = autocomplete;
        }
    }, [scriptLoaded]);

    return (
        <div className={`relative ${className || ''}`}>
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
                ref={inputRef}
                className="pl-10 bg-white"
                placeholder={placeholder}
                value={value === 'all' ? '' : value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}