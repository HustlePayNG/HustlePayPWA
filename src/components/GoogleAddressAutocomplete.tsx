import React, { useEffect, useRef } from 'react';

interface GoogleAddressAutocompleteProps {
  value: string;
  onChange: (address: string, lat?: number, lng?: number) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
}

export const GoogleAddressAutocomplete: React.FC<GoogleAddressAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Search address or location...",
  className = "",
  id,
  name
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    let listener: any = null;

    const initAutocomplete = () => {
      if (!inputRef.current || !(window as any).google?.maps?.places) {
        return false;
      }
      if (autocompleteRef.current) return true;

      try {
        const autocomplete = new (window as any).google.maps.places.Autocomplete(inputRef.current, {
          types: ['geocode', 'establishment'],
          componentRestrictions: { country: 'ng' }
        });
        autocompleteRef.current = autocomplete;

        listener = autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place && place.formatted_address) {
            const lat = place.geometry?.location?.lat();
            const lng = place.geometry?.location?.lng();
            onChange(place.formatted_address, lat, lng);
          } else if (place && place.name) {
            onChange(place.name);
          } else if (inputRef.current?.value) {
            onChange(inputRef.current.value);
          }
        });
        return true;
      } catch (e) {
        console.warn('Google Places Autocomplete initialization error:', e);
        return false;
      }
    };

    if (!initAutocomplete()) {
      const interval = setInterval(() => {
        if (initAutocomplete()) {
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }

    return () => {
      if (listener && (window as any).google?.maps?.event?.removeListener) {
        (window as any).google.maps.event.removeListener(listener);
      }
    };
  }, [onChange]);

  return (
    <input
      ref={inputRef}
      id={id}
      name={name}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
      autoComplete="off"
    />
  );
};

export default GoogleAddressAutocomplete;
