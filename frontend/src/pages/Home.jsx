import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { getVendors } from '../services/api';
import VendorCard from '../components/VendorCard';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'street-food', label: 'Street Food' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'mess', label: 'Mess' },
  { value: 'homemade', label: 'Homemade' },
  { value: 'cafe', label: 'Cafe' },
];

const defaultCenter = { lat: 12.9716, lng: 77.5946 }; // Bangalore fallback

export default function Home() {
  const [userLocation, setUserLocation] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    is_veg: false,
    radius: 10,
    sort: 'distance',
    min_price: '',
    max_price: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const searchTimeout = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          setUserLocation(defaultCenter);
        }
      );
    } else {
      setUserLocation(defaultCenter);
    }
  }, []);

  // Fetch vendors
  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (userLocation) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
        params.radius = filters.radius;
      }
      if (filters.category) params.category = filters.category;
      if (filters.is_veg) params.is_veg = 'true';
      if (filters.sort) params.sort = filters.sort;
      if (filters.min_price) params.min_price = filters.min_price;
      if (filters.max_price) params.max_price = filters.max_price;
      if (search) params.search = search;

      const { data } = await getVendors(params);
      setVendors(data);
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
    } finally {
      setLoading(false);
    }
  }, [userLocation, filters, search]);

  useEffect(() => {
    if (userLocation) {
      fetchVendors();
    }
  }, [userLocation, filters, fetchVendors]);

  // Debounced search
  const handleSearchChange = (value) => {
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchVendors();
    }, 400);
  };

  const mapCenter = userLocation || defaultCenter;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-full md:w-96' : 'w-0'
        } transition-all duration-300 overflow-hidden bg-white border-r border-gray-200 flex flex-col`}
      >
        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search dishes, vendors..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="mt-2 text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            {showFilters ? 'Hide Filters' : 'Filters'}
          </button>

          {/* Filters panel */}
          {showFilters && (
            <div className="mt-3 space-y-3">
              {/* Categories */}
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setFilters({ ...filters, category: cat.value })}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      filters.category === cat.value
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Veg toggle */}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.is_veg}
                  onChange={(e) => setFilters({ ...filters, is_veg: e.target.checked })}
                  className="rounded text-primary-500 focus:ring-primary-500"
                />
                Veg only
              </label>

              {/* Price range */}
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min price"
                  value={filters.min_price}
                  onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
                  className="w-1/2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-primary-500"
                />
                <input
                  type="number"
                  placeholder="Max price"
                  value={filters.max_price}
                  onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
                  className="w-1/2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Distance */}
              <div>
                <label className="text-xs text-gray-500">Distance: {filters.radius} km</label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={filters.radius}
                  onChange={(e) => setFilters({ ...filters, radius: parseInt(e.target.value) })}
                  className="w-full accent-primary-500"
                />
              </div>

              {/* Sort */}
              <select
                value={filters.sort}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="distance">Sort by Distance</option>
                <option value="rating">Sort by Rating</option>
              </select>
            </div>
          )}
        </div>

        {/* Vendor list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg font-medium">No vendors found</p>
              <p className="text-sm mt-1">Try adjusting your filters or search</p>
            </div>
          ) : (
            vendors.map((vendor) => (
              <div
                key={vendor.id}
                onClick={() => setSelectedVendor(vendor)}
                className="cursor-pointer"
              >
                <VendorCard vendor={vendor} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Toggle sidebar button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="hidden md:flex items-center justify-center w-6 bg-gray-100 hover:bg-gray-200 border-r border-gray-200 transition"
      >
        <svg
          className={`w-4 h-4 text-gray-500 transition ${sidebarOpen ? '' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Map */}
      <div className="flex-1 relative">
        {isLoaded ? (
          <GoogleMap
            mapContainerClassName="w-full h-full"
            center={mapCenter}
            zoom={13}
            options={{
              disableDefaultUI: false,
              zoomControl: true,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: true,
            }}
          >
            {/* User location marker */}
            {userLocation && (
              <Marker
                position={userLocation}
                icon={{
                  path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                  scale: 8,
                  fillColor: '#4285F4',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                }}
                title="Your location"
              />
            )}

            {/* Vendor markers */}
            {vendors.map((vendor) => (
              <Marker
                key={vendor.id}
                position={{ lat: vendor.latitude, lng: vendor.longitude }}
                onClick={() => setSelectedVendor(vendor)}
                title={vendor.name}
              />
            ))}

            {/* Info window */}
            {selectedVendor && (
              <InfoWindow
                position={{
                  lat: selectedVendor.latitude,
                  lng: selectedVendor.longitude,
                }}
                onCloseClick={() => setSelectedVendor(null)}
              >
                <div className="max-w-[250px]">
                  <VendorCard vendor={selectedVendor} compact />
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading map...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
