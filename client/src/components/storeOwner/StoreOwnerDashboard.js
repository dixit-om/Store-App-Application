import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Store, Star, Users, BarChart3, Settings } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import PasswordUpdateModal from '../user/PasswordUpdateModal';

const StoreOwnerDashboard = () => {
  const { user } = useAuth();
  const [storeData, setStoreData] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/store-owner/dashboard');
      setStoreData(response.data.store);
      setRatings(response.data.ratings);
    } catch (error) {
      console.error('Error fetching store data:', error);
      toast.error('Failed to load store data');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="card text-center py-12">
        <Store className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No store found</h3>
        <p className="mt-1 text-sm text-gray-500">
          You don't have any stores assigned to your account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Store Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>
        <button
          onClick={() => setShowPasswordModal(true)}
          className="btn-secondary flex items-center space-x-2"
        >
          <Settings className="h-4 w-4" />
          <span>Update Password</span>
        </button>
      </div>

      {/* Store Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Store Name</p>
              <p className="text-lg font-semibold text-gray-900">{storeData.name}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-500">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <div className="flex items-center">
                <p className="text-lg font-semibold text-gray-900">
                  {storeData.averageRating.toFixed(1)}
                </p>
                <div className="ml-2 flex">
                  {renderStars(Math.round(storeData.averageRating))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Ratings</p>
              <p className="text-lg font-semibold text-gray-900">{storeData.totalRatings}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Store Details */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Store Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{storeData.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <p className="mt-1 text-sm text-gray-900">{storeData.address}</p>
          </div>
        </div>
      </div>

      {/* Ratings List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Customer Ratings</h2>
          <div className="text-sm text-gray-600">
            {ratings.length} {ratings.length === 1 ? 'rating' : 'ratings'}
          </div>
        </div>

        {ratings.length === 0 ? (
          <div className="text-center py-8">
            <Star className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No ratings yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your store hasn't received any ratings yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {ratings.map((rating) => (
              <div key={rating.userId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex">
                        {renderStars(rating.rating)}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {rating.rating}/5 stars
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Customer:</span>
                        <span className="ml-1 font-medium text-gray-900">{rating.userName}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <span className="ml-1 text-gray-900">{rating.userEmail}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Rated on:</span>
                        <span className="ml-1 text-gray-900">
                          {new Date(rating.ratedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-gray-600">Address:</span>
                      <span className="ml-1 text-gray-900">{rating.userAddress}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rating Distribution */}
      {ratings.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Rating Distribution</h2>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratings.filter(r => r.rating === star).length;
              const percentage = (count / ratings.length) * 100;
              
              return (
                <div key={star} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-16">
                    <span className="text-sm text-gray-600">{star}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-12 text-right">
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Password Update Modal */}
      {showPasswordModal && (
        <PasswordUpdateModal
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  );
};

export default StoreOwnerDashboard; 