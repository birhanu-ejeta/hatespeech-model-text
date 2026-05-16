import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import api from '../../lib/api';

export default function ApiKeys() {
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
    if (confirm('Delete this API key? This will break any integrations using it.')) {
      try {
        await api.delete(`/api/user/api-keys/${id}`);
        await fetchKeys();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <Layout title="API Keys">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-gray-600 mt-1">
            API keys are used to authenticate your Telegram and Discord bots. 
            Each key can be used with multiple bots.
          </p>
        </div>

        <div className="grid gap-8">
          {/* Create API Key Form */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Create New API Key</h2>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Production Bot Key"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Key'}
              </button>
            </form>
          </div>

          {/* API Keys List */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">Your API Keys</h2>
            </div>
            {keys.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">No API keys yet.</p>
                <p className="text-sm text-gray-400 mt-2">Create your first API key to start adding bots.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {keys.map((key) => (
                  <div key={key.id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{key.name}</h3>
                        <div className="flex items-center space-x-2">
                          <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">{key.key}</code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(key.key);
                              alert('API key copied to clipboard!');
                            }}
                            className="text-gray-400 hover:text-gray-600"
                            title="Copy to clipboard"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-xs text-gray-400">
                          Created: {new Date(key.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteKey(key.id)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Usage Info */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">💡 How to Use API Keys</h3>
            <div className="space-y-2 text-sm text-blue-700">
              <p>1. Create an API key above with a descriptive name.</p>
              <p>2. When adding a Telegram or Discord bot, select this API key from the dropdown.</p>
              <p>3. All messages processed by bots using this key will deduct credits from your account.</p>
              <p>4. You can use the same API key for multiple bots across different platforms.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}