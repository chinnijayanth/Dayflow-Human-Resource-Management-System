import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Save, Edit2, X } from 'lucide-react';

const Profile = () => {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [originalProfile, setOriginalProfile] = useState<any>(null);
  const isAdmin = user?.role === 'admin' || user?.role === 'hr';

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`/api/employees/${user?.id}`);
      setProfile(response.data);
      setOriginalProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setOriginalProfile({ ...profile });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfile({ ...originalProfile });
    setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await axios.put(`/api/employees/${user?.id}`, profile);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      await fetchProfile(); // Refresh profile data
      
      // Refresh user data in auth context to update username in navigation
      try {
        const authResponse = await axios.get('/api/auth/me');
        // Update localStorage with new user data
        const updatedUser = authResponse.data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // Reload to refresh auth context with updated username
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } catch (authError) {
        console.warn('Could not refresh auth context:', authError);
      }
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="btn btn-primary flex items-center"
            >
              <Edit2 className="w-5 h-5 mr-2" />
              Edit Profile
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="card max-w-3xl">
          {message && (
            <div
              className={`mb-4 p-4 rounded ${
                message.includes('success')
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                className={`input ${!isEditing && !isAdmin ? 'bg-gray-100' : ''}`}
                value={profile?.first_name || ''}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                disabled={!isEditing && !isAdmin}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                className={`input ${!isEditing && !isAdmin ? 'bg-gray-100' : ''}`}
                value={profile?.last_name || ''}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                disabled={!isEditing && !isAdmin}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                className="input bg-gray-100"
                value={profile?.email || ''}
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee ID
              </label>
              <input
                type="text"
                className="input bg-gray-100"
                value={profile?.employee_id || ''}
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                className="input bg-gray-100"
                value={profile?.username || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || ''}
                disabled
                title="Username is automatically generated from your name"
              />
              <p className="mt-1 text-xs text-gray-500">
                Username is based on your full name
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                className={`input ${!isEditing ? 'bg-gray-100' : ''}`}
                value={profile?.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                className={`input ${!isEditing ? 'bg-gray-100' : ''}`}
                value={profile?.address || ''}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            {isAdmin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={profile?.job_title || ''}
                    onChange={(e) => setProfile({ ...profile, job_title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={profile?.department || ''}
                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={profile?.salary || ''}
                    onChange={(e) => setProfile({ ...profile, salary: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employment Type
                  </label>
                  <select
                    className="input"
                    value={profile?.employment_type || ''}
                    onChange={(e) => setProfile({ ...profile, employment_type: e.target.value })}
                  >
                    <option value="">Select...</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Picture URL
              </label>
              <input
                type="url"
                className={`input ${!isEditing ? 'bg-gray-100' : ''}`}
                value={profile?.profile_picture || ''}
                onChange={(e) => setProfile({ ...profile, profile_picture: e.target.value })}
                placeholder="https://example.com/image.jpg"
                disabled={!isEditing}
              />
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary flex items-center"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="w-5 h-5 mr-2" />
                )}
                Save Changes
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="btn btn-secondary flex items-center"
              >
                <X className="w-5 h-5 mr-2" />
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
};

export default Profile;

