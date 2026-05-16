import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Layout from '../../../components/Layout';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../lib/api';

export default function SocialMediaLogs() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toxicOnly, setToxicOnly] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/user/messages/social-media?limit=100&toxic_only=${toxicOnly}`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [toxicOnly]);

  const exportLogs = () => {
    window.location.href = '/api/user/export-logs/social-media';
  };

  return (
    <ProtectedRoute>
      <Layout title="Social Media Message Logs">
        <div className="space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold">📱 Social Media Message Logs</h1>
              <p className="text-gray-600 mt-1">View and analyze all messages processed from your social media platform</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setToxicOnly(!toxicOnly)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  toxicOnly 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {toxicOnly ? 'Show All Messages' : 'Show Only Toxic'}
              </button>
              <button
                onClick={exportLogs}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
              >
                📥 Export CSV
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500">No messages logged yet for Social Media.</p>
                <p className="text-sm text-gray-400 mt-2">
                  {toxicOnly 
                    ? 'No toxic messages detected yet. Great job!' 
                    : 'Integrate your social media platform and start moderating content.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toxicity Level</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toxic</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categories</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {messages.map((msg) => (
                      <tr key={msg.id} className={msg.is_toxic ? 'bg-red-50' : 'hover:bg-gray-50'}>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          {new Date(msg.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm break-all max-w-md">
                          {msg.text}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium uppercase">
                            {msg.language || 'unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">{msg.owner || '-'}</td>
                        <td className="px-6 py-4 text-sm">
                          {msg.toxicity_level ? (
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    msg.toxicity_level > 0.7 
                                      ? 'bg-red-600' 
                                      : msg.toxicity_level > 0.4 
                                      ? 'bg-yellow-500' 
                                      : 'bg-green-500'
                                  }`}
                                  style={{ width: `${msg.toxicity_level * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-xs">
                                {(msg.toxicity_level * 100).toFixed(1)}%
                              </span>
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {msg.is_toxic ? (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                              ⚠️ Yes
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              ✅ No
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {msg.toxic_categories && msg.toxic_categories.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {msg.toxic_categories.map((cat, idx) => (
                                <span 
                                  key={idx} 
                                  className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs"
                                >
                                  {cat}
                                </span>
                              ))}
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Stats Summary */}
          {messages.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-3">📊 Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Messages</p>
                  <p className="text-2xl font-bold">{messages.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Toxic Messages</p>
                  <p className="text-2xl font-bold text-red-600">
                    {messages.filter(m => m.is_toxic).length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Clean Messages</p>
                  <p className="text-2xl font-bold text-green-600">
                    {messages.filter(m => !m.is_toxic).length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Toxicity Rate</p>
                  <p className="text-2xl font-bold">
                    {((messages.filter(m => m.is_toxic).length / messages.length) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}