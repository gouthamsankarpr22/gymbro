'use client';

import React, { useState } from 'react';
import { X, UserPlus, Check, AlertCircle, Shield, Sparkles } from 'lucide-react';
import { Guild, UserProfile } from '@/types';

interface InviteFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  guild: Guild;
  friends: UserProfile[];
  currentMemberUserIds: string[];
  onSendInvite: (guildId: string, friendId: string) => { success: boolean; error?: string };
}

export const InviteFriendModal: React.FC<InviteFriendModalProps> = ({
  isOpen,
  onClose,
  guild,
  friends,
  currentMemberUserIds,
  onSendInvite,
}) => {
  const [invitedIds, setInvitedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInvite = (friendId: string) => {
    setError(null);
    const result = onSendInvite(guild.id, friendId);
    if (result.success) {
      setInvitedIds(prev => [...prev, friendId]);
    } else {
      setError(result.error || 'Failed to send invitation');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <UserPlus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Invite GymBro Friend</h2>
              <p className="text-xs text-zinc-400">Add trusted partners to {guild.name}</p>
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
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-4 p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-[11px] text-zinc-400 flex items-start gap-2">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            Guilds are private brotherhood circles. Only accepted GymBro friends are eligible to receive invitations.
          </span>
        </div>

        <div className="mt-4 space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {friends.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-500">
              No accepted friends available to invite.
            </div>
          ) : (
            friends.map(friend => {
              const isAlreadyMember = currentMemberUserIds.includes(friend.id);
              const isJustInvited = invitedIds.includes(friend.id);

              return (
                <div
                  key={friend.id}
                  className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={friend.avatar_url}
                      alt={friend.full_name}
                      className="w-8 h-8 rounded-lg object-cover ring-1 ring-zinc-700"
                    />
                    <div className="truncate">
                      <div className="font-bold text-white truncate">{friend.full_name}</div>
                      <div className="text-[10px] text-zinc-500 truncate">@{friend.username} • {friend.current_location}</div>
                    </div>
                  </div>

                  <div>
                    {isAlreadyMember ? (
                      <span className="text-[10px] font-bold text-zinc-500 bg-zinc-900 px-2 py-1 rounded-md">
                        Active Member
                      </span>
                    ) : isJustInvited ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md flex items-center gap-1">
                        <Check className="w-3 h-3" /> Invited
                      </span>
                    ) : (
                      <button
                        onClick={() => handleInvite(friend.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition"
                      >
                        Invite
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-zinc-800 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
