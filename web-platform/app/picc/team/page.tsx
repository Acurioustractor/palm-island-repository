'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Users, Plus, Mail, Shield, Edit, Trash2, ArrowLeft, Crown, User } from 'lucide-react';
import Link from 'next/link';

interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: string;
  permissions: string[];
  created_at: string;
  last_login?: string;
}

export default function TeamPage() {
  const supabase = createClientComponentClient();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    full_name: '',
    role: 'editor'
  });

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    // Simulate loading team members
    const mockTeam: TeamMember[] = [
      {
        id: '1',
        email: 'admin@picc.org',
        full_name: 'PICC Admin',
        role: 'admin',
        permissions: ['all'],
        created_at: '2023-01-01',
        last_login: '2024-01-15'
      },
      {
        id: '2',
        email: 'editor@picc.org',
        full_name: 'Story Editor',
        role: 'editor',
        permissions: ['edit_stories', 'publish_stories'],
        created_at: '2023-06-15',
        last_login: '2024-01-14'
      },
      {
        id: '3',
        email: 'viewer@picc.org',
        full_name: 'Content Viewer',
        role: 'viewer',
        permissions: ['view_stories'],
        created_at: '2023-09-01',
        last_login: '2024-01-10'
      }
    ];

    setTeamMembers(mockTeam);
  };

  const handleInvite = () => {
    if (!inviteData.email || !inviteData.full_name) {
      alert('Please fill in all fields');
      return;
    }

    alert(`Invitation sent to ${inviteData.email}!\n\nRole: ${inviteData.role}\n\nNote: This is a demo - actual invitation system will be implemented with Supabase Auth.`);

    setInviteData({ email: '', full_name: '', role: 'editor' });
    setShowInviteForm(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'editor':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4" />;
      case 'editor':
        return <Edit className="h-4 w-4" />;
      case 'viewer':
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/picc/settings" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </Link>

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            </div>
            <button
              onClick={() => setShowInviteForm(!showInviteForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Invite Member
            </button>
          </div>
          <p className="text-gray-600">Manage team members and their permissions</p>
        </div>

        {/* Invite Form */}
        {showInviteForm && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Invite New Team Member</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={inviteData.full_name}
                  onChange={(e) => setInviteData({ ...inviteData, full_name: e.target.value })}
                  placeholder="John Smith"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  placeholder="john@picc.org"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleInvite}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all"
              >
                Send Invitation
              </button>
              <button
                onClick={() => setShowInviteForm(false)}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Role Descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Admin</h3>
            </div>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Full platform access</li>
              <li>• Manage team members</li>
              <li>• Configure settings</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Edit className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Editor</h3>
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Create & edit stories</li>
              <li>• Publish content</li>
              <li>• Manage storytellers</li>
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Viewer</h3>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• View all content</li>
              <li>• Read analytics</li>
              <li>• Export reports</li>
            </ul>
          </div>
        </div>

        {/* Team Members List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Current Team Members</h2>
            <p className="text-sm text-gray-600 mt-1">{teamMembers.length} active members</p>
          </div>

          <div className="divide-y divide-gray-200">
            {teamMembers.map((member) => (
              <div key={member.id} className="p-6 hover:bg-gray-50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {member.full_name.charAt(0)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{member.full_name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded border flex items-center gap-1 ${getRoleColor(member.role)}`}>
                          {getRoleIcon(member.role)}
                          <span className="capitalize">{member.role}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {member.email}
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        Joined {new Date(member.created_at).toLocaleDateString()} •
                        {member.last_login ? ` Last active ${new Date(member.last_login).toLocaleDateString()}` : ' Never logged in'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Edit member"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Remove member"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-900 font-medium mb-1">Team Management</div>
          <p className="text-xs text-blue-700">
            Team members will receive an email invitation to join the platform. They'll need to
            create a password and verify their email before gaining access.
          </p>
        </div>
      </div>
    </div>
  );
}
