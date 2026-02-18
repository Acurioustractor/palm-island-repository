'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Building2, Loader2, Plus, Search, Trash2, Users, X
} from 'lucide-react'
import type { ServiceData } from './ServiceAdminDetail'

type Partner = {
  id: string
  name: string
  partner_type: string | null
  logo_url: string | null
  website: string | null
}

type PartnerLink = {
  id: string
  service_id: string
  partner_id: string
  link_type: string | null
  fiscal_year: string | null
  notes: string | null
  partners: Partner
}

type TeamMember = {
  id: string
  full_name: string | null
  community_role: string | null
  avatar_url: string | null
  bio: string | null
  role: string | null
  title: string | null
}

type ProfileOption = {
  id: string
  full_name: string | null
  community_role: string | null
  avatar_url: string | null
}

type Props = {
  service: ServiceData
}

const LINK_TYPES = [
  { value: 'funds', label: 'Funds', color: 'bg-green-100 text-green-700' },
  { value: 'collaborates', label: 'Collaborates', color: 'bg-blue-100 text-blue-700' },
  { value: 'refers', label: 'Refers', color: 'bg-purple-100 text-purple-700' },
]

const PARTNER_TYPES = ['funder', 'government', 'service', 'research', 'community', 'other']

const TEAM_ROLES = [
  { value: 'team_member', label: 'Team Member', color: 'bg-blue-100 text-blue-700' },
  { value: 'manager', label: 'Manager', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'coordinator', label: 'Coordinator', color: 'bg-purple-100 text-purple-700' },
  { value: 'volunteer', label: 'Volunteer', color: 'bg-green-100 text-green-700' },
  { value: 'community_contact', label: 'Community Contact', color: 'bg-amber-100 text-amber-700' },
  { value: 'elder_advisor', label: 'Elder Advisor', color: 'bg-rose-100 text-rose-700' },
]

function getInitials(name: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getRoleStyle(role: string | null): string {
  return TEAM_ROLES.find(r => r.value === role)?.color || 'bg-gray-100 text-gray-600'
}

function getRoleLabel(role: string | null): string {
  return TEAM_ROLES.find(r => r.value === role)?.label || role || 'Team Member'
}

export default function PeoplePartnersTab({ service }: Props) {
  const [links, setLinks] = useState<PartnerLink[]>([])
  const [loading, setLoading] = useState(true)
  const [allPartners, setAllPartners] = useState<Partner[]>([])
  const [showAddModal, setShowAddModal] = useState(false)

  const [team, setTeam] = useState<TeamMember[]>([])
  const [teamLoading, setTeamLoading] = useState(true)
  const [showAddTeamModal, setShowAddTeamModal] = useState(false)
  const [removingMember, setRemovingMember] = useState<string | null>(null)

  const [deleting, setDeleting] = useState<string | null>(null)

  const loadTeam = useCallback(async () => {
    setTeamLoading(true)
    try {
      const res = await fetch(`/api/services/${service.id}/team`)
      if (res.ok) {
        const data = await res.json()
        setTeam(data.team || [])
      }
    } catch { /* ignore */ }
    setTeamLoading(false)
  }, [service.id])

  const loadLinks = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/services/${service.id}/partners`)
      if (res.ok) {
        const data = await res.json()
        setLinks(data.links || [])
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [service.id])

  const loadAllPartners = useCallback(async () => {
    try {
      const res = await fetch('/api/data-intelligence/network')
      if (res.ok) {
        const data = await res.json()
        setAllPartners(data.partners || [])
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    loadTeam()
    loadLinks()
    loadAllPartners()
  }, [loadTeam, loadLinks, loadAllPartners])

  const handleRemoveMember = async (profileId: string) => {
    if (!confirm('Remove this team member from the service?')) return
    setRemovingMember(profileId)
    try {
      const res = await fetch(`/api/services/${service.id}/team?profileId=${profileId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setTeam(prev => prev.filter(m => m.id !== profileId))
      }
    } catch { /* ignore */ }
    setRemovingMember(null)
  }

  const handleDelete = async (linkId: string) => {
    if (!confirm('Remove this partner link?')) return
    setDeleting(linkId)
    try {
      const res = await fetch(`/api/services/${service.id}/partners?linkId=${linkId}`, { method: 'DELETE' })
      if (res.ok) {
        setLinks(prev => prev.filter(l => l.id !== linkId))
      }
    } catch { /* ignore */ }
    setDeleting(null)
  }

  const getLinkTypeStyle = (type: string | null) => {
    return LINK_TYPES.find(t => t.value === type)?.color || 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Team Members Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Team Members <span className="text-gray-400 font-normal">({team.length})</span>
          </h2>
          <button
            onClick={() => setShowAddTeamModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-picc-red rounded-full hover:bg-picc-red/90 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Team Member
          </button>
        </div>

        {teamLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
          </div>
        ) : team.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No team members linked to this service</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {team.map(member => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="text-sm font-medium text-gray-500">{getInitials(member.full_name)}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-gray-900 text-sm truncate">
                      {member.full_name || 'Unknown'}
                    </span>
                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${getRoleStyle(member.role)}`}>
                      {getRoleLabel(member.role)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {member.title || member.community_role || ''}
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  disabled={removingMember === member.id}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                  title="Remove"
                >
                  {removingMember === member.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Partners List */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Partners & Funders <span className="text-gray-400 font-normal">({links.length})</span>
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-picc-red rounded-full hover:bg-picc-red/90 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Partner
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
          </div>
        ) : links.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No partners linked to this service</p>
          </div>
        ) : (
          <div className="space-y-3">
            {links.map(link => (
              <div
                key={link.id}
                className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {/* Logo/Icon */}
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {link.partners?.logo_url ? (
                    <img src={link.partners.logo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-gray-900 text-sm truncate">
                      {link.partners?.name || 'Unknown Partner'}
                    </span>
                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${getLinkTypeStyle(link.link_type)}`}>
                      {link.link_type || 'linked'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {link.partners?.partner_type && (
                      <span className="capitalize">{link.partners.partner_type}</span>
                    )}
                    {link.fiscal_year && <span>FY {link.fiscal_year}</span>}
                    {link.notes && <span className="truncate">{link.notes}</span>}
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => handleDelete(link.id)}
                  disabled={deleting === link.id}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                  title="Remove"
                >
                  {deleting === link.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Team Member Modal */}
      {showAddTeamModal && (
        <AddTeamMemberModal
          serviceId={service.id}
          existingTeamIds={team.map(m => m.id)}
          onClose={() => setShowAddTeamModal(false)}
          onAdded={() => {
            loadTeam()
            setShowAddTeamModal(false)
          }}
        />
      )}

      {/* Add Partner Modal */}
      {showAddModal && (
        <AddPartnerModal
          serviceId={service.id}
          existingPartners={allPartners}
          onClose={() => setShowAddModal(false)}
          onAdded={() => {
            loadLinks()
            setShowAddModal(false)
          }}
        />
      )}
    </div>
  )
}

/* ─── Add Team Member Modal ─── */

function AddTeamMemberModal({
  serviceId,
  existingTeamIds,
  onClose,
  onAdded,
}: {
  serviceId: string
  existingTeamIds: string[]
  onClose: () => void
  onAdded: () => void
}) {
  const [profiles, setProfiles] = useState<ProfileOption[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProfile, setSelectedProfile] = useState<ProfileOption | null>(null)
  const [role, setRole] = useState('team_member')
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    async function loadProfiles() {
      setLoadingProfiles(true)
      try {
        const res = await fetch(`/api/services/${serviceId}/team?allProfiles=true`)
        if (res.ok) {
          const data = await res.json()
          setProfiles(data.profiles || [])
        }
      } catch { /* ignore */ }
      setLoadingProfiles(false)
    }
    loadProfiles()
  }, [serviceId])

  const filteredProfiles = profiles
    .filter(p => !existingTeamIds.includes(p.id))
    .filter(p => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        (p.full_name || '').toLowerCase().includes(q) ||
        (p.community_role || '').toLowerCase().includes(q)
      )
    })

  const handleSave = async () => {
    if (!selectedProfile) {
      setError('Select a profile')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/services/${serviceId}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: selectedProfile.id,
          role,
          title: title.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to add team member')
      }
      onAdded()
    } catch (e: any) {
      setError(e?.message || 'Failed')
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Add Team Member</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Profile Search */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Select Person</label>
            <div className="relative">
              {selectedProfile ? (
                <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {selectedProfile.avatar_url ? (
                      <img src={selectedProfile.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="text-[10px] font-medium text-gray-500">{getInitials(selectedProfile.full_name)}</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-900 flex-1">{selectedProfile.full_name}</span>
                  <button
                    onClick={() => { setSelectedProfile(null); setSearchQuery('') }}
                    className="p-0.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      value={searchQuery}
                      onChange={e => { setSearchQuery(e.target.value); setShowDropdown(true) }}
                      onFocus={() => setShowDropdown(true)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder={loadingProfiles ? 'Loading profiles...' : 'Search by name...'}
                      disabled={loadingProfiles}
                    />
                  </div>
                  {showDropdown && !loadingProfiles && (
                    <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredProfiles.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-gray-400">No profiles found</div>
                      ) : (
                        filteredProfiles.map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setSelectedProfile(p)
                              setShowDropdown(false)
                              setSearchQuery('')
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left"
                          >
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {p.avatar_url ? (
                                <img src={p.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                              ) : (
                                <span className="text-[10px] font-medium text-gray-500">{getInitials(p.full_name)}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm text-gray-900 truncate">{p.full_name || 'Unknown'}</div>
                              {p.community_role && (
                                <div className="text-xs text-gray-500 truncate">{p.community_role}</div>
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Role & Title */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                {TEAM_ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Title (optional)</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="e.g. Case Worker"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-5 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !selectedProfile}
            className="px-4 py-2 text-sm text-white bg-picc-red rounded-lg hover:bg-picc-red/90 disabled:opacity-50 inline-flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Add Member
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Add Partner Modal ─── */

function AddPartnerModal({
  serviceId,
  existingPartners,
  onClose,
  onAdded,
}: {
  serviceId: string
  existingPartners: Partner[]
  onClose: () => void
  onAdded: () => void
}) {
  const [mode, setMode] = useState<'existing' | 'new'>('existing')
  const [partnerId, setPartnerId] = useState('')
  const [linkType, setLinkType] = useState('funds')
  const [fiscalYear, setFiscalYear] = useState('2024-25')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // New partner fields
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('funder')
  const [newWebsite, setNewWebsite] = useState('')

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const body: Record<string, unknown> = {
        link_type: linkType,
        fiscal_year: fiscalYear || null,
        notes: notes || null,
      }
      if (mode === 'existing') {
        if (!partnerId) { setError('Select a partner'); setSaving(false); return }
        body.partner_id = partnerId
      } else {
        if (!newName.trim()) { setError('Partner name required'); setSaving(false); return }
        body.new_partner = {
          name: newName.trim(),
          partner_type: newType,
          website: newWebsite.trim() || null,
        }
      }

      const res = await fetch(`/api/services/${serviceId}/partners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to add partner')
      }
      onAdded()
    } catch (e: any) {
      setError(e?.message || 'Failed')
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Add Partner</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode('existing')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                mode === 'existing' ? 'bg-picc-red text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Existing Partner
            </button>
            <button
              onClick={() => setMode('new')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                mode === 'new' ? 'bg-picc-red text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              New Partner
            </button>
          </div>

          {mode === 'existing' ? (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Select Partner</label>
              <select
                value={partnerId}
                onChange={e => setPartnerId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="">Choose...</option>
                {existingPartners.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.partner_type})</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Partner Name</label>
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="e.g. Queensland Health"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    {PARTNER_TYPES.map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Website</label>
                  <input
                    value={newWebsite}
                    onChange={e => setNewWebsite(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Link details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Relationship</label>
              <select
                value={linkType}
                onChange={e => setLinkType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                {LINK_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fiscal Year</label>
              <input
                value={fiscalYear}
                onChange={e => setFiscalYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="e.g. 2024-25"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Optional notes about this partnership..."
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-5 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm text-white bg-picc-red rounded-lg hover:bg-picc-red/90 disabled:opacity-50 inline-flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Add Partner
          </button>
        </div>
      </div>
    </div>
  )
}
