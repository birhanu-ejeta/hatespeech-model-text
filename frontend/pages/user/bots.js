import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import Layout from '../../components/Layout';
import api from '../../lib/api';

export default function ManageBots() {
  const [bots, setBots] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [form, setForm] = useState({ token: '', username: '', api_key_id: '', blocked_words: '' });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [botsRes, keysRes] = await Promise.all([
        api.get('/api/user/bots'),
        api.get('/api/user/api-keys')
      ]);
      setBots(botsRes.data);
      setApiKeys(keysRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/user/bots', form);
      await fetchData();
      setForm({ token: '', username: '', api_key_id: '', blocked_words: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startBot = async (id) => {
    try {
      await api.post(`/api/user/bots/${id}/start`);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const stopBot = async (id) => {
    try {
      await api.post(`/api/user/bots/${id}/stop`);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteBot = async (id) => {
    if (confirm('Delete this bot?')) {
      try {
        await api.delete(`/api/user/bots/${id}`);
        await fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <ProtectedRoute>
      <Layout title="Manage Bots">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Add New Bot</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Bot Token</label>
                <input
                  type="text"
                  name="token"
                  value={form.token}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Bot Username</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">API Key</label>
                <select
                  name="api_key_id"
                  value={form.api_key_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="">Select API Key</option>
                  {apiKeys.map(key => (
                    <option key={key.id} value={key.id}>{key.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Blocked Words (comma-separated)</label>
                <textarea
                  name="blocked_words"
                  value={form.blocked_words}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Adding...' : 'Add Bot'}
              </button>
            </form>
          </div>
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Your Bots</h2>
            {bots.length === 0 ? (
              <p className="text-gray-500">No bots added yet.</p>
            ) : (
              <div className="space-y-4">
                {bots.map(bot => (
                  <div key={bot.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{bot.username}</h3>
                        <p className="text-sm text-gray-500">{bot.token.slice(0, 10)}...</p>
                        <p className="text-sm text-gray-500">Status: <span className={`font-medium ${bot.status === 'running' ? 'text-green-600' : 'text-gray-600'}`}>{bot.status}</span></p>
                      </div>
                      <div className="space-x-2">
                        {bot.status === 'running' ? (
                          <button onClick={() => stopBot(bot.id)} className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600">Stop</button>
                        ) : (
                          <button onClick={() => startBot(bot.id)} className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600">Start</button>
                        )}
                        <button onClick={() => deleteBot(bot.id)} className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}