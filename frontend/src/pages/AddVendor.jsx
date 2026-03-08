import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { createVendor, addMenuItem, uploadMenuImage } from '../services/api';

const CATEGORIES = [
  { value: 'street-food', label: 'Street Food' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'mess', label: 'Mess' },
  { value: 'homemade', label: 'Homemade' },
  { value: 'cafe', label: 'Cafe' },
];

export default function AddVendor() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdVendor, setCreatedVendor] = useState(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'street-food',
    is_veg: false,
    address: '',
    latitude: null,
    longitude: null,
  });

  const [menuItems, setMenuItems] = useState([]);
  const [menuForm, setMenuForm] = useState({ item_name: '', price: '', is_veg: false });
  const [menuImage, setMenuImage] = useState(null);
  const [menuLoading, setMenuLoading] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const handleMapClick = useCallback((e) => {
    setForm((prev) => ({
      ...prev,
      latitude: e.latLng.lat(),
      longitude: e.latLng.lng(),
    }));
  }, []);

  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    if (!form.latitude || !form.longitude) {
      setError('Please select a location on the map');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await createVendor(form);
      setCreatedVendor(data);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to create vendor');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    if (!menuForm.item_name || !menuForm.price) return;
    setMenuLoading(true);
    try {
      let image_url = null;
      if (menuImage) {
        const fd = new FormData();
        fd.append('image', menuImage);
        const { data } = await uploadMenuImage(fd);
        image_url = data.image_url;
      }
      const { data } = await addMenuItem({
        vendor_id: createdVendor.id,
        item_name: menuForm.item_name,
        price: parseFloat(menuForm.price),
        is_veg: menuForm.is_veg,
        image_url,
      });
      setMenuItems([...menuItems, data]);
      setMenuForm({ item_name: '', price: '', is_veg: false });
      setMenuImage(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add menu item');
    } finally {
      setMenuLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {step === 1 ? 'Add New Vendor' : 'Add Menu Items'}
      </h1>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        <div className={`h-1 flex-1 rounded ${step >= 1 ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
        <div className={`h-1 flex-1 rounded ${step >= 2 ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
      </div>

      {step === 1 && (
        <form onSubmit={handleVendorSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="e.g., Sharma Ji Ki Chaat"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                placeholder="Tell us about this place..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm pb-2">
                  <input
                    type="checkbox"
                    checked={form.is_veg}
                    onChange={(e) => setForm({ ...form, is_veg: e.target.checked })}
                    className="rounded text-green-500 focus:ring-green-500"
                  />
                  Pure Veg
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="Street address"
              />
            </div>
          </div>

          {/* Map for location picking */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pick Location on Map *
            </label>
            <p className="text-xs text-gray-500 mb-3">Click on the map to set the vendor's location</p>
            {isLoaded ? (
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '350px' }}
                  center={{ lat: 12.9716, lng: 77.5946 }}
                  zoom={12}
                  onClick={handleMapClick}
                  options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                  }}
                >
                  {form.latitude && form.longitude && (
                    <Marker position={{ lat: form.latitude, lng: form.longitude }} />
                  )}
                </GoogleMap>
              </div>
            ) : (
              <div className="h-[350px] bg-gray-100 rounded-xl flex items-center justify-center">
                <p className="text-gray-400">Loading map...</p>
              </div>
            )}
            {form.latitude && (
              <p className="text-xs text-gray-400 mt-2">
                Selected: {form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 text-white py-3 rounded-xl hover:bg-primary-600 transition font-medium disabled:opacity-50"
          >
            {loading ? 'Creating Vendor...' : 'Create Vendor & Add Menu'}
          </button>
        </form>
      )}

      {step === 2 && createdVendor && (
        <div className="space-y-6">
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">
            Vendor "{createdVendor.name}" created. Now add menu items.
          </div>

          {/* Add menu item form */}
          <form
            onSubmit={handleAddMenuItem}
            className="bg-white rounded-2xl shadow-md p-6 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={menuForm.item_name}
                  onChange={(e) => setMenuForm({ ...menuForm, item_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="e.g., Masala Dosa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={menuForm.price}
                  onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="50"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={menuForm.is_veg}
                  onChange={(e) => setMenuForm({ ...menuForm, is_veg: e.target.checked })}
                  className="rounded text-green-500 focus:ring-green-500"
                />
                Veg
              </label>
              <label className="cursor-pointer text-sm text-primary-600 hover:text-primary-700">
                {menuImage ? menuImage.name : 'Add image (optional)'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setMenuImage(e.target.files[0] || null)}
                  className="hidden"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={menuLoading}
              className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition text-sm font-medium disabled:opacity-50"
            >
              {menuLoading ? 'Adding...' : 'Add Item'}
            </button>
          </form>

          {/* Added items */}
          {menuItems.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-medium text-gray-900 mb-3">Added Items</h3>
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">{item.item_name}</span>
                    <span className="text-sm font-medium text-primary-600">₹{parseFloat(item.price).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => navigate(`/vendor/${createdVendor.id}`)}
            className="w-full bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 transition font-medium"
          >
            Done - View Vendor Page
          </button>
        </div>
      )}
    </div>
  );
}
