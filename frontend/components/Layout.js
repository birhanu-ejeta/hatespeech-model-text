// frontend/components/Layout.js
import Head from 'next/head';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Layout({ children, title = 'ToxiGuard' }) {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const isDashboard = user && (user.role === 'user' || user.role === 'admin');
  const sidebarWidth = sidebarCollapsed ? 80 : 256;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="AI-powered multilingual toxicity detection" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {!isDashboard ? (
        <>
          <Navbar />
          <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="container mx-auto px-4 py-8">{children}</div>
          </main>
          <footer className="bg-gray-800 text-white text-center py-4 mt-8">
            <p>&copy; {new Date().getFullYear()} ToxiGuard – AI‑Powered Multilingual Toxicity Detection</p>
          </footer>
        </>
      ) : (
        <div className="flex min-h-screen">
          <Sidebar onCollapseChange={setSidebarCollapsed} />
          <div 
            className="flex-1 transition-all duration-300 bg-gray-100 min-h-screen"
            style={{ marginLeft: sidebarWidth }}
          >
            <main className="p-6">{children}</main>
          </div>
        </div>
      )}
    </>
  );
}