import { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import Layout from '../../components/Layout';
import api from '../../lib/api';

export default function AdminSettings() {
  const [thresholds, setThresholds] = useState([0.75, 0.75, 0.75, 0.75, 0.75, 0.75]);
  const [announcement, setAnnouncement] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const categories = ['toxic', 'severe_toxic', 'obscene', 'threat', 'insult', 'identity_hate'];

  useEffect(() => {
    const fetchData = async () => {
      const threshRes = await api.get('/api/admin/global-thresholds');
      setThresholds(threshRes.data.thresholds);
      const annRes = await api.get('/api/announcements');
      setAnnouncements(annRes.data.announcements || []);
    };
    fetchData();
  }, []);

  const saveThresholds = async () => {
    await api.put('/api/admin/global-thresholds', { thresholds });
    alert('Thresholds saved');
  };

  const postAnnouncement = async () => {
    if (!announcement) return;
    const newList = [...announcements, { message: announcement, date: new Date().toISOString() }];
    await api.post('/api/admin/announcements', { announcements: newList });
    setAnnouncements(newList);
    setAnnouncement('');
    alert('Announcement posted');
  };

  return (
    <ProtectedRoute adminOnly>
      <Layout title="Settings">
        <h1 className="text-3xl font-bold mb-6">Global Settings</h1>
        <div className="bg-white rounded shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Toxicity Thresholds</h2>
          {categories.map((cat, idx) => (
            <div key={cat} className="mb-2">
              <label>{cat}:</label>
              <input type="number" step="0.05" value={thresholds[idx]} onChange={e => {
                const newThresh = [...thresholds];
                newThresh[idx] = parseFloat(e.target.value);
                setThresholds(newThresh);
              }} className="ml-2 border rounded px-2" />
            </div>
          ))}
          <button onClick={saveThresholds} className="btn-primary mt-4">Save Thresholds</button>
        </div>
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-bold mb-4">Announcements</h2>
          <textarea value={announcement} onChange={e => setAnnouncement(e.target.value)} rows="3" className="w-full border rounded p-2 mb-2" placeholder="New announcement..."></textarea>
          <button onClick={postAnnouncement} className="btn-primary">Post Announcement</button>
          <div className="mt-4">
            <h3 className="font-semibold">Recent Announcements</h3>
            {announcements.map((ann, idx) => <p key={idx} className="text-sm mt-1">📢 {ann.message} <span className="text-gray-400">({new Date(ann.date).toLocaleString()})</span></p>)}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}