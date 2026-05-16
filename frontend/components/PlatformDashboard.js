import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function PlatformDashboard({ platform, title, botLink }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [botStats, setBotStats] = useState([]);
  const [trendData, setTrendData] = useState({ labels: [], counts: [] });
  const [announcements, setAnnouncements] = useState([]);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [msgsRes, statsRes, trendRes, annRes, creditsRes] = await Promise.all([
        api.get(`/api/user/messages/${platform}?limit=20`),
        api.get(`/api/user/bot-stats/${platform}`),
        api.get(`/api/user/message-trend/${platform}`),
        api.get('/api/announcements'),
        api.get('/api/user/credits')
      ]);
      setMessages(msgsRes.data);
      setBotStats(statsRes.data);
      setTrendData(trendRes.data);
      setAnnouncements(annRes.data.announcements || []);
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
  }, [platform]);

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
    <div>
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.username}</h1>
          <p className="text-gray-600">Your {title.toLowerCase()} moderation overview</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 rounded-xl shadow-md">
          <p className="text-sm">Credits Remaining</p>
          <p className="text-2xl font-bold">{credits}</p>
        </div>
      </div>

      {announcements.length > 0 && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-sm">
          <p className="font-semibold text-yellow-800">📢 Announcement</p>
          {announcements.map((ann, idx) => <p key={idx}>{ann.message}</p>)}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm uppercase">Total Messages</p>
          <p className="text-3xl font-bold">{totalMessages}</p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <p className="text-gray-500 text-sm uppercase">Toxic Messages</p>
          <p className="text-3xl font-bold">{totalToxic}</p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <p className="text-gray-500 text-sm uppercase">Toxicity Rate</p>
          <p className="text-3xl font-bold">{toxicRate}%</p>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
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
                  <th className="text-left text-xs font-medium text-gray-500 py-2">Owner</th>
                </tr>
              </thead>
              <tbody>
                {messages.slice(0, 10).map(msg => (
                  <tr key={msg.id} className={msg.is_toxic ? 'bg-red-50' : ''}>
                    <td className="text-sm py-2">{new Date(msg.timestamp).toLocaleTimeString()}</td>
                    <td className="text-sm truncate max-w-xs">{msg.text.slice(0, 50)}</td>
                    <td className="text-sm">{msg.is_toxic ? '⚠️ Yes' : '✅ No'}</td>
                    <td className="text-sm">{msg.owner || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={() => window.location.href = `/api/user/export-logs/${platform}`} className="mt-4 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
            Export CSV
          </button>
        </div>
      </div>

      <div className="text-right">
        <a href={botLink} className="text-purple-600 hover:underline">Manage {title} Bots →</a>
      </div>
    </div>
  );
}