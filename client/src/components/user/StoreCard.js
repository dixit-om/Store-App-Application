import React, { useState } from 'react';
import { Store, Star, MapPin } from 'lucide-react';

const StoreCard = ({ store, onRatingSubmit }) => {
  const [selectedRating, setSelectedRating] = useState(store.userRating || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingClick = async (rating) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onRatingSubmit(store.id, rating);
      setSelectedRating(rating);
    } catch (error) {
      // Error is handled by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        disabled={!interactive || isSubmitting}
        onClick={() => interactive && handleRatingClick(i + 1)}
        className={`rating-star ${
          i < rating ? 'filled' : 'empty'
        } ${interactive ? 'hover:scale-110' : ''} ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <Star className="h-5 w-5" />
      </button>
    ));
  };

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Store className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{store.address}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Overall Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Overall Rating:</span>
            <div className="flex items-center space-x-1">
              {renderStars(Math.round(store.averageRating))}
              <span className="text-sm text-gray-600">
                ({store.averageRating.toFixed(1)})
              </span>
            </div>
          </div>
          <span className="text-sm text-gray-600">
            {store.totalRatings} {store.totalRatings === 1 ? 'review' : 'reviews'}
          </span>
        </div>

        {/* User Rating Section */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Your Rating:</span>
            {selectedRating > 0 && (
              <span className="text-sm text-gray-600">
                {selectedRating}/5 stars
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {renderStars(selectedRating, true)}
            {selectedRating === 0 && (
              <span className="text-sm text-gray-500 ml-2">
                Click to rate
              </span>
            )}
          </div>

          {selectedRating > 0 && (
            <button
              onClick={() => handleRatingClick(0)}
              disabled={isSubmitting}
              className="mt-2 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              Remove rating
            </button>
          )}
        </div>

        {/* Store Info */}
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Added:</span>
              <span className="ml-1 text-gray-900">
                {new Date(store.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <span className="ml-1 text-green-600 font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreCard; 