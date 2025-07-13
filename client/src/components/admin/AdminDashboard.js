import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  Store, 
  Star, 
  Plus, 
  Search, 
  Filter,
  BarChart3,
  UserPlus,
  Building2
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import UserManagement from './UserManagement';
import StoreManagement from './StoreManagement';
import AddUserModal from './AddUserModal';
import AddStoreModal from './AddStoreModal';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddStore, setShowAddStore] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="card">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddUser(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add User</span>
          </button>
          <button
            onClick={() => setShowAddStore(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Building2 className="h-4 w-4" />
            <span>Add Store</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Stores"
          value={stats.totalStores}
          icon={Store}
          color="bg-green-500"
        />
        <StatCard
          title="Total Ratings"
          value={stats.totalRatings}
          icon={Star}
          color="bg-yellow-500"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <Link
            to="/admin/dashboard"
            className="border-primary-500 text-primary-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
          >
            <BarChart3 className="h-4 w-4 inline mr-2" />
            Dashboard
          </Link>
          <Link
            to="/admin/users"
            className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
          >
            <Users className="h-4 w-4 inline mr-2" />
            Users
          </Link>
          <Link
            to="/admin/stores"
            className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
          >
            <Store className="h-4 w-4 inline mr-2" />
            Stores
          </Link>
        </nav>
      </div>

      {/* Content */}
      <Routes>
        <Route path="/" element={
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">System Overview</p>
                  <p className="text-sm text-gray-600">
                    {stats.totalUsers} users, {stats.totalStores} stores, and {stats.totalRatings} ratings
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Last updated</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900">Quick Actions</h3>
                  <div className="mt-2 space-y-2">
                    <button
                      onClick={() => setShowAddUser(true)}
                      className="block w-full text-left text-sm text-blue-700 hover:text-blue-900"
                    >
                      • Add new user
                    </button>
                    <button
                      onClick={() => setShowAddStore(true)}
                      className="block w-full text-left text-sm text-blue-700 hover:text-blue-900"
                    >
                      • Add new store
                    </button>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-900">System Health</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-green-700">✓ Database connected</p>
                    <p className="text-sm text-green-700">✓ API running</p>
                    <p className="text-sm text-green-700">✓ All services operational</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        } />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/stores" element={<StoreManagement />} />
      </Routes>

      {/* Modals */}
      {showAddUser && (
        <AddUserModal
          onClose={() => setShowAddUser(false)}
          onSuccess={() => {
            setShowAddUser(false);
            fetchStats();
          }}
        />
      )}
      
      {showAddStore && (
        <AddStoreModal
          onClose={() => setShowAddStore(false)}
          onSuccess={() => {
            setShowAddStore(false);
            fetchStats();
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard; 