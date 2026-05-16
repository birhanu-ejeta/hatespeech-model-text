import { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import Layout from '../../components/Layout';
import api from '../../lib/api';

export default function SystemHealth() {
  const [health, setHealth] = useState(null);
  useEffect(() => {
    const fetchHealth = async () => {
      const res = await api.get('/api/admin/system-health');
      setHealth(res.data);
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);
  if (!health) return <div>Loading...</div>;
  return (
    <ProtectedRoute adminOnly>
      <Layout title="System Health">
        <h1 className="text-3xl font-bold mb-6">System Health</h1>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded shadow text-center">
            <h3 className="text-lg font-semibold">CPU Usage</h3>
            <p className="text-4xl font-bold">{health.cpu_percent}%</p>
          </div>
          <div className="bg-white p-6 rounded shadow text-center">
            <h3 className="text-lg font-semibold">Memory Usage</h3>
            <p className="text-4xl font-bold">{health.memory_percent}%</p>
          </div>
          <div className="bg-white p-6 rounded shadow text-center">
            <h3 className="text-lg font-semibold">Disk Usage</h3>
            <p className="text-4xl font-bold">{health.disk_usage}%</p>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}