import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import Layout from '../../components/Layout';
import api from '../../lib/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userMessages, setUserMessages] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (userId) => {
    try {
      await api.put(`/api/admin/users/${userId}/role`);
      setUsers(users.map(u => u.id === userId ? { ...u, role: u.role === 'admin' ? 'user' : 'admin' } : u));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update role');
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Delete this user? All their bots and messages will be deleted.')) return;
    try {
      await api.delete(`/api/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const resetApiKeys = async (userId) => {
    if (!confirm('Reset all API keys for this user?')) return;
    try {
      await api.post(`/api/admin/users/${userId}/reset-keys`);
      alert('API keys reset');
    } catch (err) {
      alert('Failed to reset keys');
    }
  };

  const viewUserMessages = async (user) => {
    setSelectedUser(user);
    try {
      const res = await api.get(`/api/admin/users/${user.id}/messages?limit=50`);
      setUserMessages(res.data);
      setShowModal(true);
    } catch (err) {
      alert('Failed to load messages');
    }
  };

  return (
    <ProtectedRoute adminOnly>
      <Layout title="Manage Users">
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">All Users</h2>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Username</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Role</th>
                    <th className="px-4 py-2 text-left">Created</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b">
                      <td className="px-4 py-2">{user.id}</td>
                      <td className="px-4 py-2">{user.username}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-2">{new Date(user.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-2 space-x-2">
                        <button onClick={() => toggleRole(user.id)} className="text-sm text-blue-600 hover:underline">Toggle Role</button>
                        <button onClick={() => resetApiKeys(user.id)} className="text-sm text-yellow-600 hover:underline">Reset Keys</button>
                        <button onClick={() => viewUserMessages(user)} className="text-sm text-green-600 hover:underline">View Messages</button>
                        <button onClick={() => deleteUser(user.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal for user messages */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Messages by {selectedUser.username}</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">Close</button>
              </div>
              {userMessages.length === 0 ? (
                <p>No messages from this user.</p>
              ) : (
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-2 py-1 text-left">Time</th>
                      <th className="px-2 py-1 text-left">Message</th>
                      <th className="px-2 py-1 text-left">Language</th>
                      <th className="px-2 py-1 text-left">Toxic?</th>
                      <th className="px-2 py-1 text-left">Toxicity Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userMessages.map(msg => (
                      <tr key={msg.id} className="border-b">
                        <td className="px-2 py-1 text-sm">{new Date(msg.timestamp).toLocaleString()}</td>
                        <td className="px-2 py-1 text-sm">{msg.text.slice(0, 100)}...</td>
                        <td className="px-2 py-1 text-sm">{msg.language}</td>
                        <td className="px-2 py-1 text-sm">{msg.is_toxic ? 'Yes' : 'No'}</td>
                        <td className="px-2 py-1 text-sm">{msg.toxicity_level ? (msg.toxicity_level * 100).toFixed(1) + '%' : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
}