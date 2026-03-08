import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserVendors, getUserReviews } from '../services/api';
import VendorCard from '../components/VendorCard';
import StarRating from '../components/StarRating';

export default function Profile() {
  const { user } = useAuth();
  const [tab, setTab] = useState('vendors');
  const [vendors, setVendors] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [vendorsRes, reviewsRes] = await Promise.all([
          getUserVendors(),
          getUserReviews(),
        ]);
        setVendors(vendorsRes.data);
        setReviews(reviewsRes.data);
      } catch (err) {
        console.error('Failed to fetch profile data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Profile header */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-2xl font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
            <p className="text-gray-500">{user?.email}</p>
            <p className="text-sm text-gray-400 mt-1">
              Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex gap-6 mt-6 border-t pt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600">{vendors.length}</p>
            <p className="text-sm text-gray-500">Vendors Added</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600">{reviews.length}</p>
            <p className="text-sm text-gray-500">Reviews</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => setTab('vendors')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            tab === 'vendors' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
          }`}
        >
          My Vendors ({vendors.length})
        </button>
        <button
          onClick={() => setTab('reviews')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            tab === 'reviews' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
          }`}
        >
          My Reviews ({reviews.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <>
          {tab === 'vendors' && (
            <div className="space-y-3">
              {vendors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg font-medium">No vendors added yet</p>
                  <p className="text-sm mt-1">Start by adding your favorite street food spot!</p>
                </div>
              ) : (
                vendors.map((vendor) => <VendorCard key={vendor.id} vendor={vendor} />)
              )}
            </div>
          )}

          {tab === 'reviews' && (
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg font-medium">No reviews yet</p>
                  <p className="text-sm mt-1">Explore vendors and share your experience!</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-xl shadow-md p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{review.vendor_name}</h3>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-600 text-sm mt-2">{review.comment}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
