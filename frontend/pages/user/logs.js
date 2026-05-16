import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import Layout from '../../components/Layout';
import MessageTable from '../../components/MessageTable';
import api from '../../lib/api';

export default function Logs() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toxicOnly, setToxicOnly] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/user/messages?limit=100&toxic_only=${toxicOnly}`);
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

  return (
    <ProtectedRoute>
      <Layout title="Message Logs">
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Message Logs</h2>
            <button
              onClick={() => setToxicOnly(!toxicOnly)}
              className={`px-4 py-2 rounded ${toxicOnly ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              {toxicOnly ? 'Showing Toxic Only' : 'Show All Messages'}
            </button>
          </div>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : messages.length === 0 ? (
            <p className="text-gray-500">No messages found.</p>
          ) : (
            <MessageTable messages={messages} />
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}