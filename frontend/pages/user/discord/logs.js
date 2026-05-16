import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Layout from '../../../components/Layout';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../lib/api';

export default function DiscordLogs() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toxicOnly, setToxicOnly] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/user/messages/discord?limit=100&toxic_only=${toxicOnly}`);
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
    window.location.href = '/api/user/export-logs/discord';
  };

  return (
    <ProtectedRoute>
      <Layout title="Discord Message Logs">
        <div className="space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold">Discord Message Logs</h1>
              <p className="text-gray-600 mt-1">View and analyze all messages processed by your Discord bots</p>
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
                Export CSV
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
                <p className="text-gray-500">No messages logged yet for Discord.</p>
                <p className="text-sm text-gray-400 mt-2">Start your Discord bot and send messages to see logs.</p>
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
                        <td className="px-6 py-4 text-sm whitespace-nowrap">{new Date(msg.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm break-all max-w-md">{msg.text}</td>
                        <td className="px-6 py-4 text-sm">{msg.language || '-'}</td>
                        <td className="px-6 py-4 text-sm">{msg.owner || '-'}</td>
                        <td className="px-6 py-4 text-sm">
                          {msg.toxicity_level ? `${(msg.toxicity_level * 100).toFixed(1)}%` : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {msg.is_toxic ? (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Yes</span>
                          ) : (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">No</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">{msg.toxic_categories?.join(', ') || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}