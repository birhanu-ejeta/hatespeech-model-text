import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function Analytics() {
  const { user } = useAuth();
  const [trendData, setTrendData] = useState({ labels: [], counts: [] });
  const [botStats, setBotStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendRes, statsRes] = await Promise.all([
          api.get('/api/user/message-trend'),
          api.get('/api/user/bot-stats')
        ]);
        setTrendData(trendRes.data);
        setBotStats(statsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Layout title="Analytics"><div>Loading...</div></Layout>;

  const lineData = {
    labels: trendData.labels,
    datasets: [{
      label: 'Messages',
      data: trendData.counts,
      borderColor: 'rgb(139, 92, 246)',
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      tension: 0.4,
    }],
  };

  const barData = {
    labels: botStats.map(b => b.username),
    datasets: [{
      label: 'Messages',
      data: botStats.map(b => b.message_count),
      backgroundColor: 'rgba(139, 92, 246, 0.6)',
    }, {
      label: 'Toxic',
      data: botStats.map(b => b.toxic_count),
      backgroundColor: 'rgba(239, 68, 68, 0.6)',
    }],
  };

  return (
    <Layout title="Analytics">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4">7-Day Message Trend</h2>
          <Line data={lineData} />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Bot Performance</h2>
          <Bar data={barData} />
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Bot Details</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Bot</th>
                <th className="text-left py-2">Messages</th>
                <th className="text-left py-2">Toxic</th>
                <th className="text-left py-2">Toxicity Rate</th>
              </tr>
            </thead>
            <tbody>
              {botStats.map(bot => (
                <tr key={bot.bot_id} className="border-b">
                  <td className="py-2">{bot.username}</td>
                  <td className="py-2">{bot.message_count}</td>
                  <td className="py-2">{bot.toxic_count}</td>
                  <td className="py-2">{bot.toxic_rate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}