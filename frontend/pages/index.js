import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import CountUp from 'react-countup';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [demoText, setDemoText] = useState('');
  const [demoResult, setDemoResult] = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [statsStarted, setStatsStarted] = useState(false);
  const statsRef = useRef(null);
  const isStatsInView = useInView(statsRef, { once: true, margin: "-100px" });

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push(user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (isStatsInView) setStatsStarted(true);
  }, [isStatsInView]);

  const handleDemoSubmit = async (e) => {
    e.preventDefault();
    if (!demoText.trim()) return;
    setDemoLoading(true);
    try {
      const res = await api.post('/api/predict', { text: demoText });
      setDemoResult(res.data);
    } catch (err) {
      console.error(err);
      setDemoResult({ error: 'Prediction service unavailable. Please try again later.' });
    } finally {
      setDemoLoading(false);
    }
  };

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };
  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <Layout title="ToxiGuard">
        <div className="flex justify-center items-center h-64">Loading...</div>
      </Layout>
    );
  }

  // Don't render landing page for authenticated users
  if (user) return null;

  return (
    <Layout title="ToxiGuard – AI-Powered Moderation">
      {/* Hero Section with Animated Background */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-indigo-100 py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">
                  ToxiGuard
                </span>
              </h1>
              <p className="text-xl text-gray-700 mt-6 leading-relaxed">
                Real‑time multilingual toxicity detection for Telegram, Discord, WhatsApp, and more. 
                Keep your communities safe with AI.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/signup" className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700 transition shadow-lg hover:shadow-xl transform hover:scale-105 text-center">
                  Get Started Free
                </Link>
                <a href="#demo" className="border border-purple-600 text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-purple-50 transition text-center">
                  Try Demo
                </a>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex justify-center"
            >
              <div className="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-3xl rotate-6 shadow-2xl"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-32 h-32 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </section>

      {/* Live Demo Section */}
      <section id="demo" className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Try ToxiGuard Now</h2>
            <p className="text-gray-600">Enter any text – we'll analyze it for toxicity in real time.</p>
          </motion.div>

          <motion.form
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            onSubmit={handleDemoSubmit}
            className="space-y-4"
          >
            <textarea
              value={demoText}
              onChange={(e) => setDemoText(e.target.value)}
              placeholder="Type a message in English, Amharic, or Afan Oromo..."
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
            <button
              type="submit"
              disabled={demoLoading}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition disabled:opacity-50 shadow-md"
            >
              {demoLoading ? 'Analyzing...' : 'Analyze Toxicity'}
            </button>
          </motion.form>

          {demoResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-5 rounded-xl bg-gray-50 border shadow-sm"
            >
              {demoResult.error ? (
                <p className="text-red-600">{demoResult.error}</p>
              ) : (
                <div>
                  <p className="font-semibold">Detected language: <span className="text-purple-600">{demoResult.language}</span></p>
                  <p className="mt-3 font-medium">Toxicity scores:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {Object.entries(demoResult.probabilities).map(([cat, prob]) => (
                      <div key={cat} className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{cat.replace('_', ' ')}</span>
                          <span className="font-semibold">{(prob * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${prob * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {demoResult.is_toxic && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-red-700 font-semibold">⚠️ Toxic message detected! ToxiGuard would delete it and warn the sender.</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Model Performance / Stats Section with CountUp */}
      <section ref={statsRef} className="py-20 bg-gradient-to-r from-purple-700 to-indigo-700 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold">Trusted by Group Admins</h2>
            <p className="text-purple-100 mt-2">Industry‑leading performance across three languages</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-5xl font-bold">
                {statsStarted && <CountUp end={95} duration={2} suffix="%" />}
              </div>
              <p className="text-lg mt-2">Accuracy</p>
              <p className="text-purple-100 text-sm">On multilingual test set</p>
            </motion.div>
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-5xl font-bold">
                {statsStarted && <CountUp end={3} duration={2} suffix="+" />}
              </div>
              <p className="text-lg mt-2">Languages</p>
              <p className="text-purple-100 text-sm">English, Amharic, Afan Oromo</p>
            </motion.div>
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-5xl font-bold">
                {statsStarted && <CountUp end={500} duration={2} suffix="ms" prefix="&lt;" />}
              </div>
              <p className="text-lg mt-2">Response Time</p>
              <p className="text-purple-100 text-sm">Real‑time moderation</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <p className="max-w-2xl mx-auto text-purple-100">
              ToxiGuard uses a fine‑tuned XLM‑RoBERTa model, trained on thousands of annotated examples. 
              It detects toxic, severe toxic, obscene, threat, insult, and identity hate categories.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              <span className="px-3 py-1 bg-purple-800/50 rounded-full text-sm">98% precision</span>
              <span className="px-3 py-1 bg-purple-800/50 rounded-full text-sm">96% recall</span>
              <span className="px-3 py-1 bg-purple-800/50 rounded-full text-sm">F1: 0.94</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Highlights with Icons */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold">Powerful Features</h2>
            <p className="text-gray-600 mt-2">Everything you need to keep your community safe</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-purple-800 to-indigo-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to protect your community?</h2>
          <p className="text-xl mb-8 text-purple-100">Join hundreds of group admins who trust ToxiGuard.</p>
          <Link href="/signup" className="inline-block bg-white text-purple-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg transform hover:scale-105">
            Start Free – No Credit Card Required
          </Link>
        </div>
      </section>
    </Layout>
  );
}

const features = [
  {
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.66 0 3-4 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4-3-9s1.34-9 3-9" /></svg>,
    title: "Multilingual Support",
    description: "Detects toxicity in English, Amharic, and Afan Oromo with high accuracy."
  },
  {
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    title: "Real‑time Moderation",
    description: "Instant warnings and customizable content filters to protect your groups."
  },
  {
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    title: "Detailed Analytics",
    description: "View message logs, toxicity scores, and trends in your dashboard."
  }
];