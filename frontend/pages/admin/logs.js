import { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/api/admin/analytics');
        setAnalytics(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <Layout title="Analytics"><div>Loading...</div></Layout>;
  if (!analytics) return <Layout title="Analytics"><div>Error loading data</div></Layout>;

  // Prepare chart data
  const dailyLabels = analytics.daily_trend.map(d => d.date.slice(5)); // MM-DD
  const totalData = analytics.daily_trend.map(d => d.total);
  const toxicData = analytics.daily_trend.map(d => d.toxic);

  const lineData = {
    labels: dailyLabels,
    datasets: [
      {
        label: 'Total Messages',
        data: totalData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
      },
      {
        label: 'Toxic Messages',
        data: toxicData,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        tension: 0.4,
      },
    ],
  };

  // Top toxic users bar chart
  const topUsersLabels = analytics.top_toxic_users.map(u => u.username);
  const topUsersToxic = analytics.top_toxic_users.map(u => u.toxic_messages);
  const barData = {
    labels: topUsersLabels,
    datasets: [
      {
        label: 'Toxic Messages',
        data: topUsersToxic,
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
      },
    ],
  };

  return (
    <ProtectedRoute adminOnly>
      <Layout title="Moderation Analytics">
        <h1 className="text-3xl font-bold mb-6">Moderation Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded shadow text-center">
            <h3 className="text-lg font-semibold">Total Messages</h3>
            <p className="text-4xl font-bold text-blue-600">{analytics.total_messages}</p>
          </div>
          <div className="bg-white p-6 rounded shadow text-center">
            <h3 className="text-lg font-semibold">Toxic Messages</h3>
            <p className="text-4xl font-bold text-red-600">{analytics.toxic_messages}</p>
          </div>
          <div className="bg-white p-6 rounded shadow text-center">
            <h3 className="text-lg font-semibold">Non-Toxic</h3>
            <p className="text-4xl font-bold text-green-600">{analytics.non_toxic}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow mb-8">
          <h2 className="text-xl font-bold mb-4">Daily Message Trend (Last 30 Days)</h2>
          <Line data={lineData} />
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Top Toxic Users</h2>
          {topUsersLabels.length === 0 ? (
            <p>No toxic messages yet.</p>
          ) : (
            <Bar data={barData} />
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}