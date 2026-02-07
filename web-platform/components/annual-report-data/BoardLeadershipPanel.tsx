'use client';

import { useState } from 'react';
import { Plus, Save, Trash2, Users, UserCog, GripVertical } from 'lucide-react';

interface BoardMember {
  id?: string;
  name: string;
  role: string | null;
  photo_url: string | null;
  start_date: string | null;
  end_date: string | null;
  display_order: number;
}

interface LeadershipMember {
  id?: string;
  name: string;
  position: string;
  leadership_type: string;
  photo_url: string | null;
  bio: string | null;
  position_order: number;
}

interface BoardLeadershipPanelProps {
  boardMembers: BoardMember[];
  leadershipMembers: LeadershipMember[];
  onBoardChange: (members: BoardMember[]) => void;
  onLeadershipChange: (members: LeadershipMember[]) => void;
}

export default function BoardLeadershipPanel({
  boardMembers,
  leadershipMembers,
  onBoardChange,
  onLeadershipChange,
}: BoardLeadershipPanelProps) {
  const [saving, setSaving] = useState<string | null>(null);
  const [editingBoard, setEditingBoard] = useState<string | null>(null);
  const [editingLeader, setEditingLeader] = useState<string | null>(null);

  // Board member CRUD
  const addBoardMember = () => {
    const newMember: BoardMember = {
      name: '',
      role: 'Director',
      photo_url: null,
      start_date: null,
      end_date: null,
      display_order: boardMembers.length,
    };
    onBoardChange([...boardMembers, newMember]);
    setEditingBoard('new');
  };

  const saveBoardMember = async (member: BoardMember, idx: number) => {
    setSaving(member.id || 'new-board');
    try {
      const isNew = !member.id;
      const res = await fetch('/api/annual-report-data/board', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'board_members',
          ...(isNew ? {} : { id: member.id }),
          name: member.name,
          role: member.role,
          photo_url: member.photo_url,
          start_date: member.start_date,
          end_date: member.end_date,
          display_order: member.display_order,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      const data = await res.json();
      const updated = [...boardMembers];
      updated[idx] = data.record;
      onBoardChange(updated);
      setEditingBoard(null);
    } catch (error) {
      console.error('Save board member error:', error);
    } finally {
      setSaving(null);
    }
  };

  const deleteBoardMember = async (id: string) => {
    setSaving(id);
    try {
      await fetch(`/api/annual-report-data/board?id=${id}&table=board_members`, {
        method: 'DELETE',
      });
      onBoardChange(boardMembers.filter(m => m.id !== id));
    } catch (error) {
      console.error('Delete board member error:', error);
    } finally {
      setSaving(null);
    }
  };

  const updateBoard = (idx: number, updates: Partial<BoardMember>) => {
    const updated = [...boardMembers];
    updated[idx] = { ...updated[idx], ...updates };
    onBoardChange(updated);
  };

  // Leadership CRUD
  const saveLeader = async (member: LeadershipMember) => {
    setSaving(member.id || 'new-leader');
    try {
      const isNew = !member.id;
      const res = await fetch('/api/annual-report-data/board', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'leadership',
          ...(isNew ? {} : { id: member.id }),
          full_name: member.name,
          position: member.position,
          leadership_type: member.leadership_type,
          photo_url: member.photo_url,
          bio: member.bio,
          position_order: member.position_order,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      const data = await res.json();
      onLeadershipChange(
        leadershipMembers.map(l => l.id === member.id ? data.record : l)
      );
      setEditingLeader(null);
    } catch (error) {
      console.error('Save leadership error:', error);
    } finally {
      setSaving(null);
    }
  };

  const updateLeader = (id: string, updates: Partial<LeadershipMember>) => {
    onLeadershipChange(
      leadershipMembers.map(l => l.id === id ? { ...l, ...updates } : l)
    );
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Board Members */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Board Members
          </h2>
          <button
            onClick={addBoardMember}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Member
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase w-8"></th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Photo</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {boardMembers.map((member, idx) => {
                const isEditing = editingBoard === (member.id || 'new');
                return (
                  <tr key={member.id || idx} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-300">
                      <GripVertical className="w-4 h-4" />
                    </td>
                    <td className="px-4 py-2.5">
                      {isEditing ? (
                        <input
                          type="text"
                          value={member.name}
                          onChange={e => updateBoard(idx, { name: e.target.value })}
                          className="px-2 py-1 border border-gray-200 rounded text-sm w-full focus:border-purple-400 focus:outline-none"
                          placeholder="Full name"
                        />
                      ) : (
                        <span
                          className="cursor-pointer hover:text-purple-600"
                          onClick={() => setEditingBoard(member.id || 'new')}
                        >
                          {member.name || 'Unnamed'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {isEditing ? (
                        <input
                          type="text"
                          value={member.role || ''}
                          onChange={e => updateBoard(idx, { role: e.target.value || null })}
                          className="px-2 py-1 border border-gray-200 rounded text-sm w-full focus:border-purple-400 focus:outline-none"
                          placeholder="Role"
                        />
                      ) : (
                        <span className="text-gray-600">{member.role || '--'}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {member.photo_url ? (
                        <img src={member.photo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                          ?
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isEditing && (
                          <button
                            onClick={() => saveBoardMember(member, idx)}
                            disabled={saving === (member.id || 'new-board')}
                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        )}
                        {member.id && (
                          <button
                            onClick={() => deleteBoardMember(member.id!)}
                            disabled={saving === member.id}
                            className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {boardMembers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                    No board members found. Click &ldquo;Add Member&rdquo; to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leadership */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <UserCog className="w-5 h-5" />
          Executive Leadership
        </h2>

        <div className="space-y-4">
          {leadershipMembers.map(leader => {
            const isEditing = editingLeader === leader.id;
            return (
              <div key={leader.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  {leader.photo_url ? (
                    <img src={leader.photo_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                      <Users className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={leader.name}
                        onChange={e => updateLeader(leader.id!, { name: e.target.value })}
                        className="px-2 py-1 border border-gray-200 rounded text-sm w-full font-medium focus:border-purple-400 focus:outline-none"
                      />
                    ) : (
                      <div
                        className="font-medium text-gray-900 cursor-pointer hover:text-purple-600"
                        onClick={() => setEditingLeader(leader.id!)}
                      >
                        {leader.name}
                      </div>
                    )}
                    <div className="text-sm text-gray-500">{leader.position}</div>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                    {leader.leadership_type}
                  </span>
                </div>

                {isEditing && (
                  <div className="space-y-3 mt-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Position</label>
                        <input
                          type="text"
                          value={leader.position}
                          onChange={e => updateLeader(leader.id!, { position: e.target.value })}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:border-purple-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                        <select
                          value={leader.leadership_type}
                          onChange={e => updateLeader(leader.id!, { leadership_type: e.target.value })}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:border-purple-400 focus:outline-none"
                        >
                          <option value="board">Board</option>
                          <option value="executive">Executive</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Bio</label>
                      <textarea
                        value={leader.bio || ''}
                        onChange={e => updateLeader(leader.id!, { bio: e.target.value || null })}
                        rows={3}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:border-purple-400 focus:outline-none"
                        placeholder="Short biography..."
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingLeader(null)}
                        className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveLeader(leader)}
                        disabled={saving === leader.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {leadershipMembers.length === 0 && (
            <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
              No leadership records found. Add leaders in the database first.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
