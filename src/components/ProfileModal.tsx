import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Sparkles, User } from 'lucide-react';
import { UserProfile } from '../types';
import { AncientTraditionLogo } from './AncientTraditionLogo';
import { VedicDatePicker } from './VedicDatePicker';
import { VedicTimePicker } from './VedicTimePicker';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
  initialProfile?: UserProfile | null;
  theme?: 'dark' | 'light';
}

export const PRESET_CITIES = [
  { name: 'New Delhi, India', lat: 28.6139, lng: 77.2090, tz: 5.5 },
  { name: 'Mumbai, India', lat: 19.0760, lng: 72.8777, tz: 5.5 },
  { name: 'Bengaluru, India', lat: 12.9716, lng: 77.5946, tz: 5.5 },
  { name: 'Chennai, India', lat: 13.0827, lng: 80.2707, tz: 5.5 },
  { name: 'Kolkata, India', lat: 22.5726, lng: 88.3639, tz: 5.5 },
  { name: 'Varanasi, India', lat: 25.3176, lng: 82.9739, tz: 5.5 },
  { name: 'Hyderabad, India', lat: 17.3850, lng: 78.4867, tz: 5.5 },
  { name: 'Ahmedabad, India', lat: 23.0225, lng: 72.5714, tz: 5.5 },
  { name: 'Jaipur, India', lat: 26.9124, lng: 75.7873, tz: 5.5 },
  { name: 'London, United Kingdom', lat: 51.5074, lng: -0.1278, tz: 0 },
  { name: 'New York, USA', lat: 40.7128, lng: -74.0060, tz: -5 },
  { name: 'San Francisco, USA', lat: 37.7749, lng: -122.4194, tz: -8 },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198, tz: 8 },
  { name: 'Dubai, UAE', lat: 25.2048, lng: 55.2708, tz: 4 },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProfile,
  theme = 'dark',
}) => {
  if (!isOpen) return null;

  const [fullName, setFullName] = useState(initialProfile?.fullName || '');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(initialProfile?.gender || 'male');
  const [birthDate, setBirthDate] = useState(initialProfile?.birthDate || '');
  const [birthTime, setBirthTime] = useState(initialProfile?.birthTime || '');
  const [birthPlace, setBirthPlace] = useState(initialProfile?.birthPlace || '');
  const [latitude, setLatitude] = useState<number | ''>(initialProfile?.latitude ? initialProfile.latitude : '');
  const [longitude, setLongitude] = useState<number | ''>(initialProfile?.longitude ? initialProfile.longitude : '');
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  React.useEffect(() => {
    if (isOpen && initialProfile) {
      setFullName(initialProfile.fullName || '');
      setGender(initialProfile.gender || 'male');
      setBirthDate(initialProfile.birthDate || '');
      setBirthTime(initialProfile.birthTime || '');
      setBirthPlace(initialProfile.birthPlace || '');
      setLatitude(initialProfile.latitude ? initialProfile.latitude : '');
      setLongitude(initialProfile.longitude ? initialProfile.longitude : '');
    }
  }, [isOpen, initialProfile]);

  const handleLocationSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsSearchingLocation(true);

    // Split the query by commas so we can progressively shorten it if Nominatim fails
    let parts = query.split(',').map(p => p.trim()).filter(Boolean);

    try {
      while (parts.length > 0) {
        const currentQuery = parts.join(', ');
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(currentQuery)}&format=json&limit=1`);
        const data = await res.json();

        if (data && data.length > 0) {
          setLatitude(parseFloat(data[0].lat));
          setLongitude(parseFloat(data[0].lon));
          return; // Success, exit
        }

        // If not found, remove the most specific part (the first part) and try again
        parts.shift();
      }

      // If we exhausted all parts and still nothing
      alert("Location not found. Please try providing just the city and state (e.g., 'Kolkata, West Bengal').");
    } catch (err) {
      console.error('Failed to fetch location coordinates', err);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleCitySelect = (city: typeof PRESET_CITIES[0]) => {
    setBirthPlace(city.name);
    setLatitude(city.lat);
    setLongitude(city.lng);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const profile: UserProfile = {
      id: initialProfile?.id || `profile-${Date.now()}`,
      fullName: fullName.trim(),
      gender,
      birthDate,
      birthTime,
      birthPlace,
      latitude: typeof latitude === 'number' ? latitude : (parseFloat(latitude as any) || 0),
      longitude: typeof longitude === 'number' ? longitude : (parseFloat(longitude as any) || 0),
      timezone: 5.5,
      focusAreas: initialProfile?.focusAreas || [],
      notes: initialProfile?.notes || '',
      createdAt: initialProfile?.createdAt || new Date().toISOString(),
      isPremium: initialProfile?.isPremium || false,
      horoscopeSystem: initialProfile?.horoscopeSystem || 'vedic',
    };

    onSave(profile);
    onClose();
  };

  return (
    <div className="astro-modal-backdrop">
      <div className="astro-modal-card astro-modal-card-lg">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="astro-modal-close"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className={`flex items-center space-x-3 mb-6 pb-4 border-b ${theme === 'light' ? 'border-[#E2DBD0]' : 'border-[#2A2A2E]'}`}>
          <AncientTraditionLogo size="md" isLight={theme === 'light'} />
          <div>
            <h2 className="astro-heading-lg font-serif">
              {initialProfile ? 'Edit Astrological Profile' : 'New Astrological & Numerology Profile'}
            </h2>
            <p className="astro-text-xs mt-0.5 astro-text-muted">
              Accurate birth date, time, and coordinates ensure mathematically exact Ascendant, houses, and forecasts.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="astro-label">
                Full Name (for Chaldean & Vedic Name Vibrations)
              </label>
              <div className="astro-input-icon-wrap">
                <User className="astro-input-icon" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="astro-input"
                />
              </div>
            </div>

            <div>
              <label className="astro-label">Gender</label>
              <select
                value={gender}
                onChange={(e: any) => setGender(e.target.value)}
                className="astro-input cursor-pointer"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Birth Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="astro-label flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Date of Birth</span>
              </label>
              <VedicDatePicker
                value={birthDate}
                onChange={(newDate) => setBirthDate(newDate)}
                theme={theme}
                placeholder="Select Date of Birth"
              />
            </div>

            <div>
              <label className="astro-label flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Exact Time of Birth</span>
                </span>
                <span className="text-[10px] font-normal astro-text-muted">(Optional)</span>
              </label>
              <VedicTimePicker
                value={birthTime}
                onChange={(newTime) => setBirthTime(newTime)}
                theme={theme}
                placeholder="HH:MM"
              />
            </div>
          </div>

          {/* Birth Place */}
          <div>
            <label className="astro-label flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Place of Birth (City, Country)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                placeholder="e.g. New Delhi, India"
                className="astro-input flex-1"
              />
              <button
                type="button"
                onClick={() => handleLocationSearch(birthPlace)}
                disabled={isSearchingLocation || !birthPlace.trim()}
                className="astro-btn astro-btn-secondary px-3 py-2 text-xs"
              >
                {isSearchingLocation ? 'Detecting...' : 'Auto Detect'}
              </button>
            </div>

            {/* Quick preset city chips */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="text-[11px] self-center mr-1 astro-text-muted">Quick Select:</span>
              {PRESET_CITIES.slice(0, 8).map((city) => (
                <button
                  type="button"
                  key={city.name}
                  onClick={() => handleCitySelect(city)}
                  className={`astro-chip ${birthPlace === city.name ? 'astro-chip-active' : ''}`}
                >
                  {city.name.split(',')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Coordinates (Auto-calculated / Advanced) */}
          <div className="grid grid-cols-2 gap-4 p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-inner)]">
            <div>
              <label className="astro-label text-[11px]">Latitude (°N/S)</label>
              <input
                type="number"
                step="any"
                min="-90"
                max="90"
                placeholder="e.g., 23.8103"
                required
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                className="astro-input py-1 text-xs"
              />
            </div>
            <div>
              <label className="astro-label text-[11px]">Longitude (°E/W)</label>
              <input
                type="number"
                step="any"
                min="-180"
                max="180"
                placeholder="e.g., 90.4125"
                required
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                className="astro-input py-1 text-xs"
              />
            </div>
          </div>


          {/* Submit Button */}
          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="astro-btn astro-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="astro-btn astro-btn-primary"
            >
              <Sparkles className="w-4 h-4" />
              <span>Save Profile & Update Chart</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
