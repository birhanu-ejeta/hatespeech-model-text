import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import Layout from '../../components/Layout';
import StatsCard from '../../components/StatsCard';
import api from '../../lib/api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <Layout title="Admin Dashboard"><div>Loading...</div></Layout>;

  const chartData = {
    labels: stats.daily_counts.map(d => d.date),
    datasets: [
      {
        label: 'Messages',
        data: stats.daily_counts.map(d => d.count),
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
    },
  };

  return (
    <ProtectedRoute adminOnly>
      <Layout title="Admin Dashboard">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Users" value={stats.total_users} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} color="border-blue-500" />
          <StatsCard title="Bots" value={stats.total_bots} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} color="border-green-500" />
          <StatsCard title="Messages" value={stats.total_messages} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>} color="border-yellow-500" />
          <StatsCard title="Toxic" value={stats.toxic_messages} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="border-red-500" />
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Messages per Day (Last 7 Days)</h2>
            <Line data={chartData} options={options} />
          </div>
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Recent Messages</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Time</th>
                    <th className="text-left py-2">User</th>
                    <th className="text-left py-2">Message</th>
                    <th className="text-left py-2">Toxic</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_messages.map(msg => (
                    <tr key={msg.id} className="border-b">
                      <td className="py-2 text-sm">{new Date(msg.timestamp).toLocaleString()}</td>
                      <td className="py-2 text-sm">{msg.user_id}</td>
                      <td className="py-2 text-sm">{msg.text}</td>
                      <td className="py-2 text-sm">{msg.is_toxic ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}