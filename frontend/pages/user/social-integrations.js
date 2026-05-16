import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import { motion } from 'framer-motion';

export default function SocialIntegrations() {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState([
    { platform: 'Telegram', icon: 'fab fa-telegram', connected: true, username: 'MyBot', description: 'Already integrated via Bots page.' },
    { platform: 'Discord', icon: 'fab fa-discord', connected: false, username: '', description: 'Coming soon – monitor Discord servers.' },
    { platform: 'WhatsApp', icon: 'fab fa-whatsapp', connected: false, username: '', description: 'Coming soon – business API integration.' },
    { platform: 'Twitter', icon: 'fab fa-twitter', connected: false, username: '', description: 'Coming soon – monitor mentions and DMs.' },
  ]);

  return (
    <Layout title="Social Integrations">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Social Integrations
        </h1>
        <p className="text-gray-600 mt-2">Connect ToxiGuard to other platforms to expand your moderation reach.</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {integrations.map((integration, idx) => (
          <motion.div
            key={integration.platform}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <i className={`${integration.icon} text-3xl text-gray-700`}></i>
                  <h2 className="text-xl font-bold">{integration.platform}</h2>
                </div>
                {integration.connected ? (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Connected</span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">Not Connected</span>
                )}
              </div>
              <p className="text-gray-600 mb-4">{integration.description}</p>
              {integration.connected ? (
                <div className="border-t pt-4 mt-2">
                  <p className="text-sm text-gray-500">Bot username: <span className="font-mono">{integration.username}</span></p>
                  <button className="mt-3 text-red-500 hover:text-red-700 text-sm">Disconnect</button>
                </div>
              ) : (
                <button
                  disabled={!integration.connected && integration.platform !== 'Telegram'}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => alert(`${integration.platform} integration will be available soon.`)}
                >
                  {integration.platform === 'Telegram' ? 'Configure on Bots Page' : 'Coming Soon'}
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </Layout>
  );
}