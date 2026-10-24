'use client';

import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Check, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { isSupabaseConfigured, getSupabase } from '@/lib/supabase/client';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetData: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onResetData,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'schema' | 'reset'>('status');
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const handleCopySchemaNotice = () => {
    navigator.clipboard.writeText(`-- GymBro Supabase Schema is available at supabase/schema.sql in your project directory.`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      if (!isSupabaseConfigured) {
        setTestResult('Supabase credentials are not detected in .env.local yet. Currently running in zero-friction Local Persistent Demo Mode!');
        setIsTesting(false);
        return;
      }
      const sb = getSupabase();
      if (!sb) {
        setTestResult('Client initialization failed. Please check your Supabase URL & Key.');
        setIsTesting(false);
        return;
      }
      const { data, error } = await sb.from('profiles').select('count', { count: 'exact', head: true });
      if (error) {
        setTestResult(`Connected to Supabase project, but query returned: ${error.message}. Make sure to run supabase/schema.sql in your Supabase SQL Editor.`);
      } else {
        setTestResult('Success! Connected to Supabase PostgreSQL database.');
      }
    } catch (e: any) {
      setTestResult(`Connection error: ${e?.message || 'Check network / project URL'}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Database & Supabase Status</h2>
              <p className="text-xs text-zinc-400">PostgreSQL backend, Supabase Auth & Storage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex space-x-2 mt-4 pb-3 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'status'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Connection Status
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'schema'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            SQL Schema & Tables
          </button>
          <button
            onClick={() => setActiveTab('reset')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'reset'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Demo Data Control
          </button>
        </div>

        <div className="mt-4">
          {activeTab === 'status' && (
            <div className="space-y-4 text-xs">
              {/* Status banner */}
              <div
                className={`p-4 rounded-2xl border flex items-start space-x-3 ${
                  isSupabaseConfigured
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : 'bg-zinc-950 border-amber-500/30 text-zinc-300'
                }`}
              >
                <div className="mt-0.5">
                  {isSupabaseConfigured ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-sm text-white">
                    {isSupabaseConfigured
                      ? 'Live Supabase Credentials Active'
                      : 'Interactive Local Demo Mode Active'}
                  </div>
                  <p className="mt-1 leading-relaxed text-zinc-400">
                    {isSupabaseConfigured
                      ? 'Your app is configured to synchronize feed posts, workouts, PRs, and reactions with your remote Supabase instance.'
                      : 'GymBro works completely out of the box with persistent local state. Any workouts, memes, and reactions you add are saved in real-time!'}
                  </p>
                </div>
              </div>

              {/* Instructions to connect Supabase */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                <div className="font-bold text-white text-xs uppercase tracking-wider">
                  How to link your own Supabase project:
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-zinc-400 leading-relaxed">
                  <li>Create a project at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline">supabase.com</a></li>
                  <li>Copy the SQL script from <code className="text-emerald-300 bg-zinc-900 px-1 py-0.5 rounded">supabase/schema.sql</code> and run it in the Supabase SQL Editor</li>
                  <li>Add your project credentials to <code className="text-emerald-300 bg-zinc-900 px-1 py-0.5 rounded">.env.local</code>:</li>
                </ol>

                <div className="p-3 rounded-xl bg-zinc-900 font-mono text-[11px] text-zinc-300 space-y-1 select-all">
                  <div>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</div>
                  <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here</div>
                </div>
              </div>

              {testResult && (
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300">
                  {testResult}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center space-x-1.5 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>Test Connection</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3 text-xs">
              <p className="text-zinc-400">
                The database schema includes 10 production-ready tables with full Row Level Security (RLS) policies, foreign keys, and indexes:
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="font-bold text-white">profiles</div>
                  <div className="text-zinc-500">Streaks, PR stats, hometown vs distant gym</div>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="font-bold text-white">squads & members</div>
                  <div className="text-zinc-500">Private gym bro circles & invite codes</div>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="font-bold text-white">workouts & exercises</div>
                  <div className="text-zinc-500">Sets, reps, weight, volume, RPE</div>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="font-bold text-white">personal_records</div>
                  <div className="text-zinc-500">The Iron Wall hall of fame & 1RM calculator</div>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="font-bold text-white">feed_posts & reactions</div>
                  <div className="text-zinc-500">Fist bumps, fire, hype, memes, and comments</div>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="font-bold text-white">bro_nudges</div>
                  <div className="text-zinc-500">Distance accountability & workout reminders</div>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <span className="text-zinc-500 text-[11px]">File: supabase/schema.sql</span>
                <button
                  onClick={handleCopySchemaNotice}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center space-x-1.5 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Path!' : 'Copy Schema Info'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'reset' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                <div className="font-bold text-white text-sm">Reset Demo State</div>
                <p className="text-zinc-400 mt-1 leading-relaxed">
                  Resetting clears your locally cached test posts and restores the default brotherhood data (Alex, Marcus, Leo, Jordan, Sam with sample workouts and memes).
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    onResetData();
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset All Local Data</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
