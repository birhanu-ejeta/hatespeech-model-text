// components/Sidebar.js
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Navigation data with nested structure
const userNavigation = [
  {
    id: 'overview',
    title: '📊 Overview',
    color: 'yellow',
    items: [
      { name: 'Main Dashboard', href: '/user/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', badge: null },
    ]
  },
  {
    id: 'telegram',
    title: '💬 Telegram',
    color: 'blue',
    items: [
      { name: 'Dashboard', href: '/user/telegram/dashboard', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z', badge: null },
      { name: 'Bots', href: '/user/bots', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', badge: null },
      { name: 'Logs', href: '/user/telegram/logs', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', badge: null },
      { name: 'Analytics', href: '/user/telegram/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', badge: null },
    ]
  },
  {
    id: 'discord',
    title: '🎮 Discord',
    color: 'indigo',
    items: [
      { name: 'Dashboard', href: '/user/discord/dashboard', icon: 'M7 5v12M7 5a2 2 0 00-2 2v6a2 2 0 002 2m0-10l12-3v12l-12 3M17 7v12m0-12a2 2 0 00-2 2v6a2 2 0 002 2', badge: null },
      { name: 'Bots', href: '/user/discord-bots', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', badge: null },
      { name: 'Logs', href: '/user/discord/logs', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', badge: null },
      { name: 'Analytics', href: '/user/discord/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', badge: null },
    ]
  },
  {
    id: 'social',
    title: '📱 Social Media',
    color: 'pink',
    items: [
      { name: 'Dashboard', href: '/user/social-media/dashboard', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.66 0 3-4 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4-3-9s1.34-9 3-9', badge: null },
      { name: 'Logs', href: '/user/social-media/logs', icon: 'M9 12h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z', badge: null },
      { name: 'Analytics', href: '/user/social-media/analytics', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z', badge: null },
    ]
  },
  {
    id: 'tools',
    title: '🔧 Tools',
    color: 'emerald',
    items: [
      { name: 'API Keys', href: '/user/api-keys', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z', badge: null },
      { name: 'All Message Logs', href: '/user/logs', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', badge: null },
      { name: 'Social Integrations', href: '/user/social-integrations', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.66 0 3-4 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4-3-9s1.34-9 3-9', badge: null },
    ]
  },
];

const adminNavigation = [
  {
    id: 'admin',
    title: '⚡ Admin Panel',
    color: 'yellow',
    items: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', badge: null },
      { name: 'Users', href: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', badge: null },
      { name: 'All Logs', href: '/admin/logs', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', badge: null },
      { name: 'System Health', href: '/admin/health', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', badge: null },
      { name: 'Settings', href: '/admin/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', badge: null },
    ]
  },
];

// Color mappings for section headers
const sectionColors = {
  yellow: { bg: 'bg-yellow-400/20', text: 'text-yellow-300', border: 'border-yellow-400/30', dot: 'bg-yellow-400' },
  blue: { bg: 'bg-blue-400/20', text: 'text-blue-300', border: 'border-blue-400/30', dot: 'bg-blue-400' },
  indigo: { bg: 'bg-indigo-400/20', text: 'text-indigo-300', border: 'border-indigo-400/30', dot: 'bg-indigo-400' },
  pink: { bg: 'bg-pink-400/20', text: 'text-pink-300', border: 'border-pink-400/30', dot: 'bg-pink-400' },
  emerald: { bg: 'bg-emerald-400/20', text: 'text-emerald-300', border: 'border-emerald-400/30', dot: 'bg-emerald-400' },
  purple: { bg: 'bg-purple-400/20', text: 'text-purple-300', border: 'border-purple-400/30', dot: 'bg-purple-400' },
};

function NavItem({ name, href, icon, collapsed, isActive }) {
  return (
    <Link href={href} className="block">
      <div className={`flex items-center px-3 py-2.5 mx-2 my-0.5 rounded-lg cursor-pointer transition-all duration-200 group ${
        isActive 
          ? 'bg-gradient-to-r from-purple-500/30 to-indigo-500/30 border border-purple-400/30 shadow-lg shadow-purple-500/10' 
          : 'hover:bg-white/5 border border-transparent'
      }`}>
        <svg className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-purple-300 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
        </svg>
        {!collapsed && (
          <span className={`ml-3 text-sm font-medium truncate ${isActive ? 'text-white' : 'text-purple-100 group-hover:text-white'}`}>
            {name}
          </span>
        )}
        {isActive && !collapsed && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm shadow-white/50" />
        )}
      </div>
    </Link>
  );
}

function CollapsibleSection({ section, collapsed, router, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const colors = sectionColors[section.color] || sectionColors.purple;

  // Auto-collapse when sidebar is collapsed
  useEffect(() => {
    if (collapsed) setIsOpen(false);
  }, [collapsed]);

  // Check if any item in this section is active
  const hasActiveItem = section.items.some(item => router.pathname === item.href);

  // Auto-open if item is active
  useEffect(() => {
    if (hasActiveItem && !collapsed) setIsOpen(true);
  }, [hasActiveItem, collapsed]);

  if (collapsed) {
    // Show first item icon as representative when collapsed
    return (
      <div className="relative group">
        <Link href={section.items[0].href}>
          <div className={`flex items-center justify-center px-3 py-3 mx-2 my-1 rounded-lg cursor-pointer transition-all duration-200 ${
            hasActiveItem 
              ? 'bg-gradient-to-r from-purple-500/30 to-indigo-500/30 border border-purple-400/30' 
              : 'hover:bg-white/5 border border-transparent'
          }`}>
            <div className="relative">
              <svg className={`w-5 h-5 ${hasActiveItem ? 'text-white' : 'text-purple-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={section.items[0].icon} />
              </svg>
              <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${colors.dot}`} />
            </div>
          </div>
        </Link>
        {/* Tooltip on hover */}
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl">
          {section.title}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-1">
      {/* Section Header - Clickable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
          hasActiveItem ? colors.text : 'text-gray-400 hover:text-gray-300'
        }`}
      >
        <span className="flex-1 text-left">{section.title}</span>
        <motion.svg
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-3 h-3 ml-2 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </motion.svg>
      </button>

      {/* Section Items with animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {section.items.map((item) => (
              <NavItem
                key={item.href}
                {...item}
                collapsed={collapsed}
                isActive={router.pathname === item.href}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Sidebar({ onCollapseChange }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (onCollapseChange) onCollapseChange(collapsed);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { collapsed } }));
    }
  }, [collapsed, onCollapseChange]);

  if (!user) return null;

  const navigation = user.role === 'admin' ? adminNavigation : userNavigation;

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState);
  };

  return (
    <motion.aside
      initial={{ width: collapsed ? 80 : 260 }}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 text-white h-screen fixed left-0 top-0 z-50 flex flex-col shadow-2xl border-r border-purple-500/10"
    >
      {/* Logo / Brand */}
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        {!collapsed ? (
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
              <span className="text-white font-bold text-xs">TG</span>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
              ToxiGuard
            </span>
          </Link>
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20 mx-auto">
            <span className="text-white font-bold text-xs">TG</span>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={handleCollapse}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            title="Collapse sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {collapsed && (
          <button
            onClick={handleCollapse}
            className="w-full flex justify-center py-2 mb-2 hover:bg-white/5 transition-colors"
            title="Expand sidebar"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {navigation.map((section) => (
          <CollapsibleSection
            key={section.id}
            section={section}
            collapsed={collapsed}
            router={router}
            defaultOpen={section.id === 'overview' || section.id === 'admin'}
          />
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-white/5 p-3">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} gap-2`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : ''} gap-2.5 min-w-0`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-500/20">
              <span className="text-xs font-bold text-white">{user.username[0].toUpperCase()}</span>
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{user.username}</p>
                <p className="text-xs text-purple-300/70 capitalize truncate">{user.role}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors flex-shrink-0"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}