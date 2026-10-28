'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const portals = [
  {
    role: 'citizen',
    title: 'Citizen Portal',
    subtitle: 'CLIENT PORTAL',
    color: '#2563EB',
    icon: '👤',
    features: [
      { name: 'My Dashboard', path: '/citizen/dashboard' },

      { name: 'My Active Cases', path: '/user/complaints' },
      { name: 'Find a Lawyer', path: '/lawyers' },
    ],
    modules: [
      { name: 'New Case & Upload', path: '/user/complaints/new', icon: '📁' },
      { name: 'AI Legal Assistant', path: '/chat', icon: '🤖' },
      { name: 'Track Complaint', path: '/tracking', icon: '📍' },
    ],
  },
  {
    role: 'lawyer',
    title: 'Lawyer Portal',
    subtitle: 'PROFESSIONAL TOOLS',
    color: '#059669',
    icon: '⚖️',
    features: [
      { name: 'Lawyer Dashboard', path: '/lawyer/dashboard' },
      { name: 'Client Management', path: '/lawyer/cases' },
      { name: 'Calendar & Tasks', path: '/lawyer/workspace' },
    ],
    modules: [
      { name: 'Case Review', path: '/lawyer/cases', icon: '📋' },
      { name: 'AI Case Analysis', path: '/chat', icon: '🧠' },
      { name: 'Client Messages', path: '/lawyer/workspace', icon: '💬' },
    ],
  },
  {
    role: 'admin',
    title: 'System Admin',
    subtitle: 'PLATFORM CONSOLE',
    color: '#1e293b',
    icon: '🛡️',
    features: [
      { name: 'Admin Dashboard', path: '/admin/dashboard' },
      { name: 'User Approvals', path: '/admin/users' },
      { name: 'Platform Settings', path: '/admin/cases' },
    ],
    modules: [
      { name: 'Infrastructure', path: '/admin/dashboard', icon: '🖥️' },
      { name: 'Error Logs', path: '/admin/audit', icon: '📊' },
      { name: 'Finance & Billing', path: '/admin/dashboard', icon: '💰' },
    ],
  },
];

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#050B18',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '18px',
      }}>
        Loading...
      </div>
    );
  }

  const userRole = user?.role === 'user' ? 'citizen' : (user?.role || 'citizen');
  const visiblePortals = userRole === 'admin'
    ? portals
    : portals.filter(p => p.role === userRole);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050B18',
      color: 'white',
      padding: '32px 24px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        <div style={{ marginBottom: '40px' }}>
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.4)',
            marginBottom: '16px',
          }}>
            <span>Welcome Page</span>
            <span>→</span>
            <span>Login</span>
            <span>→</span>
            <span>Onboarding</span>
            <span>→</span>
            <span style={{ color: '#C9A84C' }}>Dashboard</span>
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#C9A84C',
            margin: '0 0 8px',
          }}>
            Neethivaan AI Platform
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            Welcome back, {user?.full_name || user?.email} —{' '}
            <span style={{ color: '#C9A84C', textTransform: 'capitalize' }}>
              {userRole}
            </span>
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${visiblePortals.length}, 1fr)`,
          gap: '24px',
          marginBottom: '48px',
        }}>
          {visiblePortals.map(portal => (
            <div
              key={portal.role}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${portal.color}44`,
                borderRadius: '16px',
                padding: '28px',
                cursor: 'pointer',
              }}
              onClick={() => router.push(portal.features[0].path)}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
              }}>
                <div style={{
                  width: '48px', height: '48px',
                  background: portal.color,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                }}>
                  {portal.icon}
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '18px' }}>
                    {portal.title}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: portal.color,
                    letterSpacing: '1px',
                  }}>
                    {portal.subtitle}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                {portal.features.map(f => (
                  <div
                    key={f.name}
                    onClick={e => { e.stopPropagation(); router.push(f.path); }}
                    style={{
                      padding: '8px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      fontSize: '14px',
                      color: 'rgba(255,255,255,0.7)',
                      cursor: 'pointer',
                    }}
                  >
                    {f.name}
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
                FEATURES
              </div>
              {portal.modules.map(m => (
                <div
                  key={m.name}
                  onClick={e => { e.stopPropagation(); router.push(m.path); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    marginBottom: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  <span>{m.icon}</span>
                  <span>{m.name}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
