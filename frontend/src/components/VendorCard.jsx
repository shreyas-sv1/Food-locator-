import { Link } from 'react-router-dom';
import StarRating from './StarRating';

export default function VendorCard({ vendor, compact = false }) {
  const distance = vendor.distance != null
    ? vendor.distance < 1
      ? `${Math.round(vendor.distance * 1000)}m`
      : `${vendor.distance.toFixed(1)}km`
    : null;

  const categoryColors = {
    'street-food': 'bg-orange-100 text-orange-700',
    restaurant: 'bg-blue-100 text-blue-700',
    mess: 'bg-green-100 text-green-700',
    homemade: 'bg-purple-100 text-purple-700',
    cafe: 'bg-pink-100 text-pink-700',
  };

  const colorClass = categoryColors[vendor.category] || 'bg-gray-100 text-gray-700';

  if (compact) {
    return (
      <Link to={`/vendor/${vendor.id}`} className="block">
        <div className="bg-white rounded-lg shadow-md p-3 hover:shadow-lg transition">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{vendor.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={Math.round(vendor.rating || 0)} size="sm" />
                <span className="text-xs text-gray-500">({vendor.review_count || 0})</span>
              </div>
            </div>
            {distance && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {distance}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${colorClass}`}>
              {vendor.category}
            </span>
            {vendor.is_veg && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                Veg
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/vendor/${vendor.id}`} className="block">
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg text-gray-900">{vendor.name}</h3>
              {vendor.description && (
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">{vendor.description}</p>
              )}
            </div>
            {distance && (
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap ml-2">
                {distance}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-3">
            <StarRating rating={Math.round(vendor.rating || 0)} size="sm" />
            <span className="text-sm text-gray-500">
              {vendor.rating ? parseFloat(vendor.rating).toFixed(1) : '0.0'} ({vendor.review_count || 0} reviews)
            </span>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${colorClass}`}>
              {vendor.category}
            </span>
            {vendor.is_veg && (
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                Pure Veg
              </span>
            )}
            {vendor.address && (
              <span className="text-xs text-gray-400 truncate">{vendor.address}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
