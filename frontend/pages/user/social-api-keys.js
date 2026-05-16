// pages/user/social-api-keys.js
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import { motion } from 'framer-motion';

export default function SocialApiKeys() {
  const { user } = useAuth();
  const [keys, setKeys] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchKeys = async () => {
    try {
      const res = await api.get('/api/user/api-keys');
      setKeys(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);
    try {
      await api.post('/api/user/api-keys', { name });
      setName('');
      await fetchKeys();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteKey = async (id) => {
    if (confirm('Delete this API key? It will break any social media integration using it.')) {
      try {
        await api.delete(`/api/user/api-keys/${id}`);
        await fetchKeys();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <Layout title="Social Media API Keys">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Social Media Integration</h1>
        <p className="text-gray-600 mb-6">
          Create API keys to use ToxiGuard with your social media app. Each API call consumes 1 credit.
        </p>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Create New API Key</h2>
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Social Media App"
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600"
              required
            />
            <button type="submit" disabled={loading} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
              {loading ? 'Creating...' : 'Create Key'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Your API Keys</h2>
          {keys.length === 0 ? (
            <p className="text-gray-500">No API keys yet. Create one to integrate with your social media app.</p>
          ) : (
            <div className="space-y-4">
              {keys.map((key) => (
                <div key={key.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{key.name}</p>
                    <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">{key.key}</code>
                    <p className="text-xs text-gray-400 mt-1">Created: {new Date(key.created_at).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => deleteKey(key.id)} className="text-red-500 hover:text-red-700">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800">How to Use</h3>
          <p className="text-sm text-blue-700 mt-1">
            1. Copy an API key. <br />
            2. In your social media app, set the environment variable <code className="bg-blue-100 px-1">TOXIGUARD_API_KEY</code> to this key.<br />
            3. Set <code className="bg-blue-100 px-1">TOXIGUARD_API_URL</code> to your ToxiGuard backend URL (e.g., <code>http://localhost:5000/api/social-media/check</code>).<br />
            4. Before posting any content, call the ToxiGuard API to check toxicity. If toxic, block the content and warn the user.
          </p>
        </div>
      </div>
    </Layout>
  );
}