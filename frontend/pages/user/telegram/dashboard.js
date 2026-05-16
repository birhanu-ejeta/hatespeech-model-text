import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Layout from '../../../components/Layout';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../lib/api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function TelegramDashboard() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [botStats, setBotStats] = useState([]);
  const [trendData, setTrendData] = useState({ labels: [], counts: [] });
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [msgsRes, statsRes, trendRes, creditsRes] = await Promise.all([
        api.get('/api/user/messages/telegram?limit=20'),
        api.get('/api/user/bot-stats/telegram'),
        api.get('/api/user/message-trend/telegram'),
        api.get('/api/user/credits')
      ]);
      setMessages(msgsRes.data);
      setBotStats(statsRes.data);
      setTrendData(trendRes.data);
      setCredits(creditsRes.data.credits);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: trendData.labels,
    datasets: [{
      label: 'Messages',
      data: trendData.counts,
      borderColor: '#8B5CF6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      tension: 0.4,
      fill: true,
    }],
  };

  const totalMessages = botStats.reduce((sum, bot) => sum + bot.message_count, 0);
  const totalToxic = botStats.reduce((sum, bot) => sum + bot.toxic_count, 0);
  const toxicRate = totalMessages ? ((totalToxic / totalMessages) * 100).toFixed(1) : 0;

  if (loading) return <div className="text-center py-20">Loading dashboard...</div>;

  return (
    <ProtectedRoute>
      <Layout title="Telegram Dashboard">
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Telegram Dashboard</h1>
                <p className="text-purple-100 mt-1">Monitor your Telegram bots and groups</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-purple-100">Available Credits</p>
                <p className="text-3xl font-bold">{credits}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <p className="text-gray-500 text-sm uppercase">Total Messages</p>
              <p className="text-3xl font-bold">{totalMessages}</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
              <p className="text-gray-500 text-sm uppercase">Toxic Messages</p>
              <p className="text-3xl font-bold text-red-600">{totalToxic}</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
              <p className="text-gray-500 text-sm uppercase">Toxicity Rate</p>
              <p className="text-3xl font-bold">{toxicRate}%</p>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">📈 7-Day Message Trend</h2>
              <Line data={chartData} options={{ responsive: true }} />
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">🕒 Recent Messages</h2>
              <div className="overflow-auto max-h-96">
                <table className="min-w-full">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 py-2">Time</th>
                      <th className="text-left text-xs font-medium text-gray-500 py-2">Message</th>
                      <th className="text-left text-xs font-medium text-gray-500 py-2">Toxic</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.slice(0, 10).map(msg => (
                      <tr key={msg.id} className={msg.is_toxic ? 'bg-red-50' : ''}>
                        <td className="text-sm py-2">{new Date(msg.timestamp).toLocaleTimeString()}</td>
                        <td className="text-sm truncate max-w-xs">{msg.text.slice(0, 50)}</td>
                        <td className="text-sm">{msg.is_toxic ? '⚠️ Yes' : '✅ No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">🤖 Your Telegram Bots</h2>
            {botStats.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No Telegram bots added yet.</p>
            ) : (
              <div className="grid gap-4">
                {botStats.map((bot) => (
                  <div key={bot.bot_id} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{bot.username}</h3>
                      <p className="text-sm text-gray-500">{bot.message_count} messages • {bot.toxic_count} toxic</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-purple-600">{bot.toxic_rate.toFixed(1)}% toxicity rate</p>
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