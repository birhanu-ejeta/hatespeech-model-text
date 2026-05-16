import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function PlatformLogs({ platform, title }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toxicOnly, setToxicOnly] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/user/messages/${platform}?limit=100&toxic_only=${toxicOnly}`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [toxicOnly, platform]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{title} Message Logs</h1>
        <button
          onClick={() => setToxicOnly(!toxicOnly)}
          className={`px-4 py-2 rounded-lg ${toxicOnly ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          {toxicOnly ? 'Show All' : 'Show Only Toxic'}
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : messages.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No messages logged yet for {title}.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Time</th>
                  <th className="px-4 py-2 text-left">Message</th>
                  <th className="px-4 py-2 text-left">Language</th>
                  <th className="px-4 py-2 text-left">Owner</th>
                  <th className="px-4 py-2 text-left">Toxicity Level</th>
                  <th className="px-4 py-2 text-left">Toxic</th>
                  <th className="px-4 py-2 text-left">Categories</th>
                </tr>
              </thead>
              <tbody>
                {messages.map(msg => (
                  <tr key={msg.id} className={msg.is_toxic ? 'bg-red-50' : ''}>
                    <td className="px-4 py-2 text-sm">{new Date(msg.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm break-all max-w-md">{msg.text.slice(0, 100)}...</td>
                    <td className="px-4 py-2 text-sm">{msg.language}</td>
                    <td className="px-4 py-2 text-sm">{msg.owner || '-'}</td>
                    <td className="px-4 py-2 text-sm">{msg.toxicity_level ? (msg.toxicity_level * 100).toFixed(1) + '%' : '-'}</td>
                    <td className="px-4 py-2 text-sm">
                      {msg.is_toxic ? <span className="px-2 py-1 bg-red-100 text-red-800 rounded">Yes</span> : <span className="px-2 py-1 bg-green-100 text-green-800 rounded">No</span>}
                    </td>
                    <td className="px-4 py-2 text-sm">{msg.toxic_categories?.join(', ') || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}