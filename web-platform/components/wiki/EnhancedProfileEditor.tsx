'use client';

import React, { useState } from 'react';
import {
  User, MapPin, Globe, Heart, Camera, Eye, EyeOff,
  Save, X, Plus, Trash2, Check, AlertCircle
} from 'lucide-react';

interface ProfileData {
  full_name: string;
  preferred_name?: string;
  profile_image_url?: string;
  bio_short?: string;
  bio_long?: string;
  location: string;
  traditional_country?: string;
  language_group?: string;
  community_roles: string[];
  expertise_areas: string[];
  languages_spoken: string[];
  profile_visibility: 'public' | 'community' | 'private';
  show_in_directory: boolean;
  face_recognition_consent: boolean;
}

interface EnhancedProfileEditorProps {
  initialData: ProfileData;
  onSave: (data: ProfileData) => Promise<void>;
  onCancel: () => void;
}

export function EnhancedProfileEditor({
  initialData,
  onSave,
  onCancel,
}: EnhancedProfileEditorProps) {
  const [formData, setFormData] = useState<ProfileData>(initialData);
  const [activeTab, setActiveTab] = useState<'basic' | 'bio' | 'connections' | 'privacy'>('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof ProfileData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addToArray = (field: keyof ProfileData, value: string) => {
    if (!value.trim()) return;
    const currentArray = formData[field] as string[];
    if (!currentArray.includes(value.trim())) {
      updateField(field, [...currentArray, value.trim()]);
    }
  };

  const removeFromArray = (field: keyof ProfileData, index: number) => {
    const currentArray = formData[field] as string[];
    updateField(
      field,
      currentArray.filter((_, i) => i !== index)
    );
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrors({ general: 'Failed to save profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'bio', label: 'Biography', icon: Heart },
    { id: 'connections', label: 'Connections', icon: Globe },
    { id: 'privacy', label: 'Privacy', icon: Eye },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-teal-600">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all"
            >
              <Eye className="h-4 w-4" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errors.general && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-medium text-red-900">Error</div>
            <div className="text-sm text-red-700">{errors.general}</div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Tabs */}
        <div className="w-64 border-r border-gray-200 bg-gray-50">
          <nav className="p-4 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all
                    ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

              {/* Profile Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Photo
                </label>
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 rounded-full bg-gray-100 overflow-hidden border-2 border-gray-300">
                    {formData.profile_image_url ? (
                      <img
                        src={formData.profile_image_url}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400">
                        <Camera className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Upload Photo
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => updateField('full_name', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.full_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                )}
              </div>

              {/* Preferred Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Name
                </label>
                <input
                  type="text"
                  value={formData.preferred_name || ''}
                  onChange={(e) => updateField('preferred_name', e.target.value)}
                  placeholder="How you'd like to be called"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                )}
              </div>

              {/* Traditional Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Traditional Country
                </label>
                <input
                  type="text"
                  value={formData.traditional_country || ''}
                  onChange={(e) => updateField('traditional_country', e.target.value)}
                  placeholder="e.g., Manbarra Country"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Language Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language Group
                </label>
                <input
                  type="text"
                  value={formData.language_group || ''}
                  onChange={(e) => updateField('language_group', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Bio Tab */}
          {activeTab === 'bio' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Biography</h3>

              {/* Short Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Bio (280 characters)
                </label>
                <textarea
                  value={formData.bio_short || ''}
                  onChange={(e) => updateField('bio_short', e.target.value)}
                  maxLength={280}
                  rows={3}
                  placeholder="A brief introduction..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div className="mt-1 text-xs text-gray-600 text-right">
                  {(formData.bio_short || '').length}/280
                </div>
              </div>

              {/* Long Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Biography
                </label>
                <p className="text-sm text-gray-600 mb-2">
                  Use [[double brackets]] to link to other pages, people, or topics
                </p>
                <textarea
                  value={formData.bio_long || ''}
                  onChange={(e) => updateField('bio_long', e.target.value)}
                  rows={12}
                  placeholder="Tell your story... You can use wiki-style links like [[Women's Health Service]]"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                />
              </div>
            </div>
          )}

          {/* Connections Tab */}
          {activeTab === 'connections' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Connections & Expertise</h3>

              {/* Community Roles */}
              <ArrayFieldEditor
                label="Community Roles"
                items={formData.community_roles}
                onAdd={(value) => addToArray('community_roles', value)}
                onRemove={(index) => removeFromArray('community_roles', index)}
                placeholder="e.g., Elder, Cultural Advisor, Service Provider"
              />

              {/* Expertise Areas */}
              <ArrayFieldEditor
                label="Areas of Expertise"
                items={formData.expertise_areas}
                onAdd={(value) => addToArray('expertise_areas', value)}
                onRemove={(index) => removeFromArray('expertise_areas', index)}
                placeholder="e.g., Cultural Healing, Youth Mentoring"
              />

              {/* Languages Spoken */}
              <ArrayFieldEditor
                label="Languages Spoken"
                items={formData.languages_spoken}
                onAdd={(value) => addToArray('languages_spoken', value)}
                onRemove={(index) => removeFromArray('languages_spoken', index)}
                placeholder="e.g., English, Traditional Language"
              />
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Privacy & Permissions</h3>

              {/* Profile Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Profile Visibility
                </label>
                <div className="space-y-3">
                  {(['public', 'community', 'private'] as const).map((level) => (
                    <label key={level} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        value={level}
                        checked={formData.profile_visibility === level}
                        onChange={(e) => updateField('profile_visibility', e.target.value)}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium text-gray-900 capitalize">{level}</div>
                        <div className="text-sm text-gray-600">
                          {level === 'public' && 'Visible to everyone'}
                          {level === 'community' && 'Visible to community members only'}
                          {level === 'private' && 'Only visible to you'}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Show in Directory */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="show_in_directory"
                  checked={formData.show_in_directory}
                  onChange={(e) => updateField('show_in_directory', e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="show_in_directory" className="flex-1 cursor-pointer">
                  <div className="font-medium text-gray-900">Show in Community Directory</div>
                  <div className="text-sm text-gray-600">
                    Allow others to find your profile in the community directory
                  </div>
                </label>
              </div>

              {/* Face Recognition Consent */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="face_recognition_consent"
                  checked={formData.face_recognition_consent}
                  onChange={(e) => updateField('face_recognition_consent', e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="face_recognition_consent" className="flex-1 cursor-pointer">
                  <div className="font-medium text-gray-900">Face Recognition Consent</div>
                  <div className="text-sm text-gray-600">
                    Allow the system to identify you in photos (you can revoke this anytime)
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        <button
          onClick={onCancel}
          className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper component for array fields
function ArrayFieldEditor({
  label,
  items,
  onAdd,
  onRemove,
  placeholder,
}: {
  label: string;
  items: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
}) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    onAdd(inputValue);
    setInputValue('');
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="space-y-2">
        {/* Existing items */}
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg"
          >
            <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <span className="flex-1 text-sm text-gray-900">{item}</span>
            <button
              onClick={() => onRemove(index)}
              className="p-1 hover:bg-red-100 rounded transition-colors"
              title="Remove"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </button>
          </div>
        ))}

        {/* Add new */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder={placeholder}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleAdd}
            disabled={!inputValue.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default EnhancedProfileEditor;
