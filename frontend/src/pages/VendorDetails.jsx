import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getVendorById, addReview, uploadPhoto } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import ImageGallery from '../components/ImageGallery';

export default function VendorDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review form
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Photo upload
  const [uploading, setUploading] = useState(false);

  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      setUserLat(pos.coords.latitude);
      setUserLng(pos.coords.longitude);
    });
  }, []);

  const fetchVendor = async () => {
    try {
      const params = {};
      if (userLat && userLng) {
        params.lat = userLat;
        params.lng = userLng;
      }
      const { data } = await getVendorById(id, params);
      setVendor(data);
    } catch (err) {
      setError('Failed to load vendor details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendor();
  }, [id, userLat, userLng]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (reviewForm.rating === 0) {
      setReviewError('Please select a rating');
      return;
    }
    setReviewLoading(true);
    setReviewError('');
    try {
      await addReview({
        vendor_id: id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      setReviewForm({ rating: 0, comment: '' });
      await fetchVendor();
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('vendor_id', id);
      await uploadPhoto(formData);
      await fetchVendor();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to upload photo');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-red-500 text-lg">{error || 'Vendor not found'}</p>
      </div>
    );
  }

  const distance = vendor.distance != null
    ? vendor.distance < 1
      ? `${Math.round(vendor.distance * 1000)}m away`
      : `${vendor.distance.toFixed(1)}km away`
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{vendor.name}</h1>
            {vendor.description && (
              <p className="text-gray-500 mt-2">{vendor.description}</p>
            )}
            <div className="flex items-center gap-3 mt-3">
              <StarRating rating={Math.round(vendor.rating || 0)} />
              <span className="text-gray-600">
                {vendor.rating ? parseFloat(vendor.rating).toFixed(1) : '0.0'} ({vendor.review_count || 0} reviews)
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
                {vendor.category}
              </span>
              {vendor.is_veg && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                  Pure Veg
                </span>
              )}
              {distance && (
                <span className="text-sm text-gray-500">{distance}</span>
              )}
            </div>
            {vendor.address && (
              <p className="text-sm text-gray-400 mt-2">{vendor.address}</p>
            )}
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Menu</h2>
        {vendor.menu && vendor.menu.length > 0 ? (
          <div className="grid gap-3">
            {vendor.menu.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50"
              >
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.item_name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{item.item_name}</h3>
                    {item.is_veg && (
                      <span className="w-4 h-4 border-2 border-green-500 rounded-sm flex items-center justify-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      </span>
                    )}
                  </div>
                </div>
                <span className="font-semibold text-primary-600">
                  ₹{parseFloat(item.price).toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No menu items yet</p>
        )}
      </div>

      {/* Photos */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Photos</h2>
          {user && (
            <label className="cursor-pointer bg-primary-50 text-primary-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-100 transition">
              {uploading ? 'Uploading...' : 'Add Photo'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}
        </div>
        {vendor.photos && vendor.photos.length > 0 ? (
          <ImageGallery photos={vendor.photos} />
        ) : (
          <p className="text-gray-400">No photos yet. Be the first to add one!</p>
        )}
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews</h2>

        {/* Add review form */}
        {user ? (
          <form onSubmit={handleReviewSubmit} className="mb-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-medium text-gray-900 mb-3">Write a review</h3>
            {reviewError && (
              <p className="text-red-500 text-sm mb-2">{reviewError}</p>
            )}
            <div className="mb-3">
              <StarRating
                rating={reviewForm.rating}
                interactive
                size="lg"
                onChange={(val) => setReviewForm({ ...reviewForm, rating: val })}
              />
            </div>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              placeholder="Share your experience..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm resize-none"
            />
            <button
              type="submit"
              disabled={reviewLoading}
              className="mt-2 bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition text-sm font-medium disabled:opacity-50"
            >
              {reviewLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-500 mb-4">
            <a href="/login" className="text-primary-600 hover:underline">Sign in</a> to leave a review
          </p>
        )}

        {/* Review list */}
        {vendor.reviews && vendor.reviews.length > 0 ? (
          <div className="space-y-4">
            {vendor.reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-sm">
                    {review.user_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{review.user_name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="ml-11">
                  <StarRating rating={review.rating} size="sm" />
                  {review.comment && (
                    <p className="text-gray-600 text-sm mt-1">{review.comment}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
}
