'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  FileText, 
  Search, 
  PlusCircle, 
  MessageSquare, 
  MapPin,
  Clock,
  Shield,
  ArrowRight
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export default function CitizenDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ active: 0, pending: 0, resolved: 0 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get('complaints/my');

        const cases = res.data || [];
        setStats({
          active: cases.filter((c: any) => c.status === 'UNDER_REVIEW' || c.status === 'ASSIGNED').length,
          pending: cases.filter((c: any) => c.status === 'PENDING').length,
          resolved: cases.filter((c: any) => c.status === 'RESOLVED' || c.status === 'CLOSED').length,
        });
      } catch (err: any) {
        console.error("Failed to fetch dashboard stats", err);
        setError("Could not load your cases. Please check your connection.");
      }
    }
    if (user) fetchStats();
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#050B18] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050B18] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-[#C9A84C] mb-4"
          >
            <Shield className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Citizen Portal</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Welcome, <span className="text-[#C9A84C]">{user.full_name || 'Citizen'}</span>
          </motion.h1>
          <p className="text-gray-400 max-w-2xl">
            Access legal assistance, track your active complaints, and find qualified legal representation all in one place.
          </p>
        </header>

        {error && (
          <div style={{ padding: "12px", background: "rgba(255,0,0,0.1)", border: "1px solid red", color: "pink", borderRadius: "8px", marginBottom: "20px" }}>
             {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Active Cases', value: stats.active, icon: FileText, color: 'text-blue-400' },
            { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'text-amber-400' },
            { label: 'Resolved', value: stats.resolved, icon: Shield, color: 'text-emerald-400' },
          ].map((stat, i) => (
            <GlassPanel key={i} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </GlassPanel>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-[#C9A84C]" /> Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button 
                onClick={() => router.push('/user/complaints/new')}
                className="h-auto py-6 flex flex-col items-center gap-3 bg-white/5 border-white/10 hover:bg-white/10 text-white"
              >
                <PlusCircle className="h-8 w-8 text-[#C9A84C]" />
                <span>New Case</span>
              </Button>
              <Button 
                onClick={() => router.push('/chat')}
                className="h-auto py-6 flex flex-col items-center gap-3 bg-white/5 border-white/10 hover:bg-white/10 text-white"
              >
                <MessageSquare className="h-8 w-8 text-[#C9A84C]" />
                <span>AI Assistant</span>
              </Button>
              <Button 
                onClick={() => router.push('/lawyers')}
                className="h-auto py-6 flex flex-col items-center gap-3 bg-white/5 border-white/10 hover:bg-white/10 text-white"
              >
                <Search className="h-8 w-8 text-[#C9A84C]" />
                <span>Find Lawyer</span>
              </Button>
              <Button 
                onClick={() => router.push('/tracking')}
                className="h-auto py-6 flex flex-col items-center gap-3 bg-white/5 border-white/10 hover:bg-white/10 text-white"
              >
                <MapPin className="h-8 w-8 text-[#C9A84C]" />
                <span>Track Status</span>
              </Button>
            </div>
          </div>

          <GlassPanel className="p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold mb-4">Neethivaan Legal AI</h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Connect with our state-of-the-art legal assistant to understand sections, IPC clauses, and procedural requirements for your specific case.
              </p>
              <div className="space-y-3">
                {['How to file an FIR?', 'What are bail requirements?', 'Consumer court process'].map((q, i) => (
                  <div 
                    key={i} 
                    className="p-3 rounded-lg bg-white/5 border border-white/5 text-sm cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => router.push(`/chat?q=${encodeURIComponent(q)}`)}
                  >
                    {q}
                  </div>
                ))}
              </div>
            </div>
            <Button 
              onClick={() => router.push('/chat')}
              className="mt-8 bg-[#C9A84C] hover:bg-[#b09340] text-black font-bold"
            >
              Start Consultation <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
