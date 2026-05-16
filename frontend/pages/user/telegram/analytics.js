import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Layout from '../../../components/Layout';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../lib/api';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

export default function TelegramAnalytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMessages: 0,
    toxicMessages: 0,
    nonToxic: 0,
    toxicRate: 0,
    dailyTrend: [],
    botStats: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch messages for trend analysis (last 30 days)
      const trendRes = await api.get('/api/user/message-trend/telegram');
      
      // Fetch bot stats
      const botStatsRes = await api.get('/api/user/bot-stats/telegram');
      
      // Get detailed messages for stats
      const messagesRes = await api.get('/api/user/messages/telegram?limit=500');
      const messages = messagesRes.data;
      
      const totalMessages = messages.length;
      const toxicMessages = messages.filter(m => m.is_toxic).length;
      const nonToxic = totalMessages - toxicMessages;
      const toxicRate = totalMessages > 0 ? ((toxicMessages / totalMessages) * 100).toFixed(1) : 0;
      
      setStats({
        totalMessages,
        toxicMessages,
        nonToxic,
        toxicRate,
        dailyTrend: trendRes.data,
        botStats: botStatsRes.data
      });
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const lineChartData = {
    labels: stats.dailyTrend.labels || [],
    datasets: [
      {
        label: 'Total Messages',
        data: stats.dailyTrend.counts || [],
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ],
  };

  const pieChartData = {
    labels: ['Toxic Messages', 'Non-Toxic Messages'],
    datasets: [
      {
        data: [stats.toxicMessages, stats.nonToxic],
        backgroundColor: ['#EF4444', '#10B981'],
        borderWidth: 0,
      },
    ],
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title="Telegram Analytics">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout title="Telegram Analytics">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Telegram Analytics</h1>
            <p className="text-gray-600 mt-1">Comprehensive statistics for your Telegram bots</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
              <p className="text-gray-500 text-sm uppercase">Total Messages</p>
              <p className="text-3xl font-bold">{stats.totalMessages}</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
              <p className="text-gray-500 text-sm uppercase">Toxic Messages</p>
              <p className="text-3xl font-bold text-red-600">{stats.toxicMessages}</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
              <p className="text-gray-500 text-sm uppercase">Toxicity Rate</p>
              <p className="text-3xl font-bold">{stats.toxicRate}%</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <p className="text-gray-500 text-sm uppercase">Active Bots</p>
              <p className="text-3xl font-bold">{stats.botStats.length}</p>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">📈 7-Day Message Trend</h2>
              <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: true }} />
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">🥧 Toxicity Distribution</h2>
              <div className="flex justify-center">
                <div className="w-64 h-64 relative">
                  <canvas id="pieChart" className="w-full h-full"></canvas>
                </div>
              </div>
              <div className="mt-4 flex justify-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm">Toxic: {stats.toxicMessages}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm">Non-Toxic: {stats.nonToxic}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bot Performance Table */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">🤖 Bot Performance</h2>
            {stats.botStats.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No Telegram bots added yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Bot Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Total Messages</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Toxic Messages</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Toxicity Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.botStats.map((bot) => (
                      <tr key={bot.bot_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium">{bot.username}</td>
                        <td className="px-4 py-3 text-sm">{bot.message_count}</td>
                        <td className="px-4 py-3 text-sm text-red-600">{bot.toxic_count}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2 w-24">
                              <div 
                                className="bg-purple-600 h-2 rounded-full" 
                                style={{ width: `${bot.toxic_rate}%` }}
                              ></div>
                            </div>
                            <span>{bot.toxic_rate.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-2">💡 Insights & Recommendations</h3>
            {stats.toxicRate > 10 ? (
              <p className="text-gray-700">
                Your Telegram groups have a toxicity rate of <span className="font-bold text-red-600">{stats.toxicRate}%</span>. 
                Consider adding more blocked words or reviewing group rules to improve safety.
              </p>
            ) : (
              <p className="text-gray-700">
                Great job! Your Telegram groups have a low toxicity rate of <span className="font-bold text-green-600">{stats.toxicRate}%</span>. 
                Keep up the good moderation!
              </p>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}