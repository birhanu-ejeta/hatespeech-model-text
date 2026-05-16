import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Layout from '../../../components/Layout';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../lib/api';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

export default function SocialMediaAnalytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMessages: 0,
    toxicMessages: 0,
    nonToxic: 0,
    toxicRate: 0,
    dailyTrend: [],
    categories: [],
    languages: [],
    peakHours: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [trendRes, categoriesRes, languagesRes, peakRes, messagesRes] = await Promise.all([
        api.get('/api/user/message-trend/social-media'),
        api.get('/api/user/social-media/toxic-categories'),
        api.get('/api/user/social-media/languages'),
        api.get('/api/user/social-media/peak-hours'),
        api.get('/api/user/messages/social-media?limit=500')
      ]);
      
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
        categories: categoriesRes.data.categories || [],
        languages: languagesRes.data.languages || [],
        peakHours: peakRes.data.peak_hours || []
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

  const categoryBarData = stats.categories.length > 0 ? {
    labels: stats.categories.map(c => c.name),
    datasets: [{
      label: 'Count',
      data: stats.categories.map(c => c.count),
      backgroundColor: 'rgba(239, 68, 68, 0.7)',
    }]
  } : null;

  const peakHoursBarData = stats.peakHours.length > 0 ? {
    labels: stats.peakHours.map(h => h.hour),
    datasets: [{
      label: 'Messages',
      data: stats.peakHours.map(h => h.messages),
      backgroundColor: 'rgba(139, 92, 246, 0.7)',
    }]
  } : null;

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title="Social Media Analytics">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout title="Social Media Analytics">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">📱 Social Media Analytics</h1>
            <p className="text-gray-600 mt-1">Comprehensive statistics for your social media content moderation</p>
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
              <p className="text-gray-500 text-sm uppercase">Languages</p>
              <p className="text-3xl font-bold">{stats.languages.length}</p>
            </motion.div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">📈 7-Day Message Trend</h2>
              <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: true }} />
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">🥧 Toxicity Distribution</h2>
              <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: true }} />
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

          {/* Charts Row 2 */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Toxic Categories */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">🎯 Toxic Categories</h2>
              {categoryBarData ? (
                <Bar data={categoryBarData} options={{ 
                  responsive: true, 
                  maintainAspectRatio: true,
                  plugins: {
                    legend: { display: false }
                  }
                }} />
              ) : (
                <p className="text-center text-gray-500 py-8">No toxic messages detected yet</p>
              )}
            </div>

            {/* Peak Hours */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">⏰ Peak Activity Hours</h2>
              {peakHoursBarData ? (
                <Bar data={peakHoursBarData} options={{ 
                  responsive: true, 
                  maintainAspectRatio: true,
                  plugins: {
                    legend: { display: false }
                  }
                }} />
              ) : (
                <p className="text-center text-gray-500 py-8">No activity data yet</p>
              )}
            </div>
          </div>

          {/* Language Performance Table */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">🌍 Language Analysis</h2>
            {stats.languages.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No messages detected yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Language</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Total Messages</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Toxic Messages</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Toxicity Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.languages.map((lang, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium uppercase">{lang.language}</td>
                        <td className="px-4 py-3 text-sm">{lang.total}</td>
                        <td className="px-4 py-3 text-sm text-red-600">{lang.toxic}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2 w-24">
                              <div 
                                className="bg-purple-600 h-2 rounded-full" 
                                style={{ width: `${Math.min(lang.rate, 100)}%` }}
                              ></div>
                            </div>
                            <span>{lang.rate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Category Breakdown Table */}
          {stats.categories.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">📊 Category Breakdown</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Count</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.categories.map((cat, idx) => {
                      const percentage = ((cat.count / stats.toxicMessages) * 100).toFixed(1);
                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium capitalize">{cat.name}</td>
                          <td className="px-4 py-3 text-sm">{cat.count}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2 w-24">
                                <div 
                                  className="bg-red-600 h-2 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span>{percentage}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-2">💡 Insights & Recommendations</h3>
            {stats.toxicRate > 10 ? (
              <p className="text-gray-700">
                Your social media content has a toxicity rate of <span className="font-bold text-red-600">{stats.toxicRate}%</span>. 
                Consider implementing stricter moderation rules or auto-filtering to improve content quality.
              </p>
            ) : stats.toxicRate > 0 ? (
              <p className="text-gray-700">
                Good job! Your social media content has a moderate toxicity rate of <span className="font-bold text-yellow-600">{stats.toxicRate}%</span>. 
                Continue monitoring and improving content quality.
              </p>
            ) : (
              <p className="text-gray-700">
                Excellent! Your social media content has a very low toxicity rate of <span className="font-bold text-green-600">{stats.toxicRate}%</span>. 
                Keep up the great moderation work!
              </p>
            )}
            
            {stats.categories.length > 0 && (
              <p className="text-gray-700 mt-2">
                Most common toxic category: <span className="font-bold">{stats.categories[0].name}</span> ({stats.categories[0].count} occurrences)
              </p>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}