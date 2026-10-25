'use client';

import React, { useState } from 'react';
import { X, Shield, Sparkles, Image as ImageIcon } from 'lucide-react';

interface CreateGuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGuild: (data: { name: string; description: string; emblem_url: string }) => { success: boolean; error?: string };
}

const SAMPLE_EMBLEMS = [
  { name: 'Iron Wolves', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop&q=80' },
  { name: 'Kerala Titans', url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=300&auto=format&fit=crop&q=80' },
  { name: 'Beast Mode', url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300&auto=format&fit=crop&q=80' },
  { name: 'The Last Rep', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&auto=format&fit=crop&q=80' },
];

export const CreateGuildModal: React.FC<CreateGuildModalProps> = ({
  isOpen,
  onClose,
  onCreateGuild,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emblemUrl, setEmblemUrl] = useState(SAMPLE_EMBLEMS[0].url);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = onCreateGuild({
      name: name.trim(),
      description: description.trim(),
      emblem_url: emblemUrl.trim(),
    });

    if (result.success) {
      setName('');
      setDescription('');
      onClose();
    } else {
      setError(result.error || 'Failed to create Guild');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Shield className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Found a New Guild</h2>
              <p className="text-xs text-zinc-400">Form a private lifting team with accepted friends</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Guild Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Iron Wolves, Kerala Titans, Beast Mode"
              required
              minLength={3}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Description & Motto
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does your team stand for? High volume, heavy squats, or dawn lifts?"
              rows={2}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Select Team Emblem
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {SAMPLE_EMBLEMS.map((emblem, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setEmblemUrl(emblem.url)}
                  className={`p-1 rounded-xl border text-center transition ${
                    emblemUrl === emblem.url
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-500/10'
                      : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={emblem.url}
                    alt={emblem.name}
                    className="w-full h-12 rounded-lg object-cover mb-1"
                  />
                  <span className="text-[10px] text-zinc-300 font-bold block truncate">
                    {emblem.name}
                  </span>
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="url"
                value={emblemUrl}
                onChange={(e) => setEmblemUrl(e.target.value)}
                placeholder="Or paste custom emblem image URL..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
            <span className="font-bold text-white flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Captaincy & Privacy:
            </span>
            <p>
              As creator, you will automatically become the Guild Captain. Guilds are private: you can invite any of your accepted GymBro friends once founded.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-500/25 transition hover:scale-105 active:scale-95"
            >
              <Shield className="w-4 h-4" />
              <span>Found Guild</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
