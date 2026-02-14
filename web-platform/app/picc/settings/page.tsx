'use client';

import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, ArrowLeft, Globe, Shield, Bell, Image, Database } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'Palm Island Community Company',
    siteTagline: 'Community-controlled storytelling and impact',
    defaultLanguage: 'en',
    timezone: 'Australia/Brisbane',
    enablePublicSubmissions: true,
    requireApproval: true,
    allowAnonymous: true,
    enableFaceRecognition: false,
    emailNotifications: true,
    weeklyDigest: true,
    storageLimit: 10, // GB
    autoBackup: true,
    backupFrequency: 'daily'
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Simulate save
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/picc/dashboard" className="animated-underline inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 transition-colors duration-300 mb-4">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>

          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">Configuration</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-[-0.02em] mt-1">General Settings</h1>
          <p className="text-gray-500 text-sm mt-2">Configure platform settings and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Site Information */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-picc-red" />
              <h2 className="text-lg font-semibold text-gray-900">Site Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-ochre-300 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Tagline
                </label>
                <input
                  type="text"
                  value={settings.siteTagline}
                  onChange={(e) => setSettings({ ...settings, siteTagline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-ochre-300 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Language
                  </label>
                  <select
                    value={settings.defaultLanguage}
                    onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-ochre-300 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="mua">Mua (Bwgcolman)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-ochre-300 focus:border-transparent"
                  >
                    <option value="Australia/Brisbane">Brisbane (AEST)</option>
                    <option value="Australia/Sydney">Sydney (AEDT)</option>
                    <option value="Australia/Perth">Perth (AWST)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Community Submissions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-picc-ochre" />
              <h2 className="text-lg font-semibold text-gray-900">Community Submissions</h2>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900">Public Submissions</div>
                  <div className="text-sm text-gray-600">Allow community members to submit stories</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enablePublicSubmissions}
                  onChange={(e) => setSettings({ ...settings, enablePublicSubmissions: e.target.checked })}
                  className="h-5 w-5 rounded text-picc-ochre focus:ring-2 focus:ring-picc-ochre-300"
                />
              </label>

              <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900">Require Approval</div>
                  <div className="text-sm text-gray-600">Stories need admin approval before publishing</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.requireApproval}
                  onChange={(e) => setSettings({ ...settings, requireApproval: e.target.checked })}
                  className="h-5 w-5 rounded text-picc-ochre focus:ring-2 focus:ring-picc-ochre-300"
                />
              </label>

              <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900">Allow Anonymous Stories</div>
                  <div className="text-sm text-gray-600">Community can share stories without attribution</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allowAnonymous}
                  onChange={(e) => setSettings({ ...settings, allowAnonymous: e.target.checked })}
                  className="h-5 w-5 rounded text-picc-ochre focus:ring-2 focus:ring-picc-ochre-300"
                />
              </label>
            </div>
          </div>

          {/* Privacy & Cultural Safety */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-picc-ochre" />
              <h2 className="text-lg font-semibold text-gray-900">Privacy & Cultural Safety</h2>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900">Face Recognition Warnings</div>
                  <div className="text-sm text-gray-600">Warn about face recognition when uploading photos</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableFaceRecognition}
                  onChange={(e) => setSettings({ ...settings, enableFaceRecognition: e.target.checked })}
                  className="h-5 w-5 rounded text-picc-ochre focus:ring-2 focus:ring-picc-ochre-300"
                />
              </label>

              <div className="bg-warm-50 border border-warm-200 rounded-lg p-4">
                <div className="text-sm text-picc-earth font-medium mb-1">Cultural Protocols Active</div>
                <ul className="text-xs text-picc-ochre space-y-1">
                  <li>• Elder approval required for cultural stories</li>
                  <li>• Traditional knowledge marked as sensitive</li>
                  <li>• Community voice submissions tracked separately</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-picc-ochre" />
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900">Email Notifications</div>
                  <div className="text-sm text-gray-600">Receive emails for new submissions</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="h-5 w-5 rounded text-picc-ochre focus:ring-2 focus:ring-picc-ochre-300"
                />
              </label>

              <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900">Weekly Digest</div>
                  <div className="text-sm text-gray-600">Weekly summary of platform activity</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.weeklyDigest}
                  onChange={(e) => setSettings({ ...settings, weeklyDigest: e.target.checked })}
                  className="h-5 w-5 rounded text-picc-ochre focus:ring-2 focus:ring-picc-ochre-300"
                />
              </label>
            </div>
          </div>

          {/* Storage & Backup */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-5 w-5 text-sage-600" />
              <h2 className="text-lg font-semibold text-gray-900">Storage & Backup</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Storage Limit (GB)
                </label>
                <input
                  type="number"
                  value={settings.storageLimit}
                  onChange={(e) => setSettings({ ...settings, storageLimit: Number(e.target.value) })}
                  min="1"
                  max="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-300 focus:border-transparent"
                />
              </div>

              <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900">Automatic Backups</div>
                  <div className="text-sm text-gray-600">Enable automatic database backups</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoBackup}
                  onChange={(e) => setSettings({ ...settings, autoBackup: e.target.checked })}
                  className="h-5 w-5 rounded text-sage-600 focus:ring-2 focus:ring-sage-300"
                />
              </label>

              {settings.autoBackup && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Frequency
                  </label>
                  <select
                    value={settings.backupFrequency}
                    onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-300 focus:border-transparent"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="sticky bottom-6 bg-white rounded-lg border border-gray-200 p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {saved ? (
                  <span className="text-sage-600 font-medium">✓ Settings saved successfully</span>
                ) : (
                  <span>Make sure to save your changes</span>
                )}
              </div>
              <button
                onClick={handleSave}
                className="bg-picc-red text-white px-6 py-2 rounded-lg font-medium hover:bg-picc-red-700 transition-all flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
