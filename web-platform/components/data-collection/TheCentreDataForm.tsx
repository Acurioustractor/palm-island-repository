/**
 * The Centre Data Collection Form
 * 
 * Collects baseline metrics for:
 * - Plastic recycling bed manufacturing
 * - Kitchen services & youth employment
 * 
 * Data feeds into: services, service_metrics, innovation_projects tables
 */

'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Check } from 'lucide-react';

interface FormData {
  project: 'recycling-beds' | 'kitchen-services';
  reportingPeriod: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  
  // Manufacturing metrics
  bedsManufactured?: number;
  plasticKgRecycled?: number;
  plasticTonsRecycled?: number;
  manufacturingJobs?: number;
  
  // Kitchen metrics
  youthTrained?: number;
  youthEmployed?: number;
  cateringEvents?: number;
  mealsServed?: number;
  certificationsAchieved?: number;
  
  // Common metrics
  revenueGenerated?: number;
  photosTaken: boolean;
  storiesCollected: boolean;
  challengesFaced: string;
  keyAchievements: string;
  nextQuarterGoals: string;
}

export default function TheCentreDataForm() {
  const [formData, setFormData] = useState<FormData>({
    project: 'recycling-beds',
    reportingPeriod: '2024-25',
    quarter: 'Q3',
    photosTaken: false,
    storiesCollected: false,
    challengesFaced: '',
    keyAchievements: '',
    nextQuarterGoals: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    try {
      // 1. Insert into service_metrics
      const serviceId = formData.project === 'recycling-beds' 
        ? 'the-centre-recycling' 
        : 'the-centre-kitchen';
      
      const metricsData = {
        service_id: serviceId,
        fiscal_year: formData.reportingPeriod,
        quarter: formData.quarter,
        clients_served: formData.project === 'recycling-beds' 
          ? formData.bedsManufactured 
          : formData.youthTrained,
        occasions_of_service: formData.project === 'recycling-beds'
          ? formData.plasticKgRecycled
          : formData.mealsServed,
        key_achievements: formData.keyAchievements,
        metadata: {
          project: formData.project,
          revenue: formData.revenueGenerated,
          photos_taken: formData.photosTaken,
          stories_collected: formData.storiesCollected,
          challenges: formData.challengesFaced,
          next_goals: formData.nextQuarterGoals,
          ...(formData.project === 'recycling-beds' ? {
            plastic_tons: formData.plasticTonsRecycled,
            beds_made: formData.bedsManufactured,
            manufacturing_jobs: formData.manufacturingJobs
          } : {
            youth_employed: formData.youthEmployed,
            catering_events: formData.cateringEvents,
            certifications: formData.certificationsAchieved
          })
        }
      };
      
      await supabase.from('service_metrics').insert(metricsData);
      
      // 2. Update innovation_projects
      await supabase.from('innovation_projects')
        .update({
          people_impacted: formData.project === 'recycling-beds'
            ? formData.bedsManufactured
            : formData.youthTrained,
          jobs_created: formData.project === 'recycling-beds'
            ? formData.manufacturingJobs
            : formData.youthEmployed,
          revenue_generated: formData.revenueGenerated,
          updated_at: new Date().toISOString()
        })
        .eq('slug', formData.project);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Error saving data. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-2">The Centre - Data Collection</h2>
      <p className="text-gray-600 mb-6">
        Record quarterly metrics for recycling manufacturing and kitchen services
      </p>
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
          <Check className="h-5 w-5" />
          Data saved successfully!
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Project</label>
          <select
            value={formData.project}
            onChange={(e) => setFormData({...formData, project: e.target.value as any})}
            className="w-full border rounded px-3 py-2"
          >
            <option value="recycling-beds">Recycling Bed Manufacturing</option>
            <option value="kitchen-services">Kitchen & Youth Employment</option>
          </select>
        </div>
        
        {/* Reporting Period */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Fiscal Year</label>
            <select
              value={formData.reportingPeriod}
              onChange={(e) => setFormData({...formData, reportingPeriod: e.target.value})}
              className="w-full border rounded px-3 py-2"
            >
              <option value="2024-25">2024-25</option>
              <option value="2025-26">2025-26</option>
              <option value="2026-27">2026-27</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Quarter</label>
            <select
              value={formData.quarter}
              onChange={(e) => setFormData({...formData, quarter: e.target.value as any})}
              className="w-full border rounded px-3 py-2"
            >
              <option value="Q1">Q1 (Jul-Sep)</option>
              <option value="Q2">Q2 (Oct-Dec)</option>
              <option value="Q3">Q3 (Jan-Mar)</option>
              <option value="Q4">Q4 (Apr-Jun)</option>
            </select>
          </div>
        </div>
        
        {/* Manufacturing Metrics */}
        {formData.project === 'recycling-beds' && (
          <div className="bg-warm-50 p-4 rounded space-y-4">
            <h3 className="font-semibold text-picc-earth">Manufacturing Metrics</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Beds Manufactured</label>
                <input
                  type="number"
                  value={formData.bedsManufactured || ''}
                  onChange={(e) => setFormData({...formData, bedsManufactured: parseInt(e.target.value)})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Jobs Created</label>
                <input
                  type="number"
                  value={formData.manufacturingJobs || ''}
                  onChange={(e) => setFormData({...formData, manufacturingJobs: parseInt(e.target.value)})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Plastic Recycled (kg)</label>
                <input
                  type="number"
                  value={formData.plasticKgRecycled || ''}
                  onChange={(e) => setFormData({...formData, plasticKgRecycled: parseInt(e.target.value)})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Plastic Recycled (tons)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.plasticTonsRecycled || ''}
                  onChange={(e) => setFormData({...formData, plasticTonsRecycled: parseFloat(e.target.value)})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="0.0"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Kitchen Metrics */}
        {formData.project === 'kitchen-services' && (
          <div className="bg-orange-50 p-4 rounded space-y-4">
            <h3 className="font-semibold text-orange-900">Kitchen & Employment Metrics</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Youth Trained</label>
                <input
                  type="number"
                  value={formData.youthTrained || ''}
                  onChange={(e) => setFormData({...formData, youthTrained: parseInt(e.target.value)})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Youth Employed</label>
                <input
                  type="number"
                  value={formData.youthEmployed || ''}
                  onChange={(e) => setFormData({...formData, youthEmployed: parseInt(e.target.value)})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Catering Events</label>
                <input
                  type="number"
                  value={formData.cateringEvents || ''}
                  onChange={(e) => setFormData({...formData, cateringEvents: parseInt(e.target.value)})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Meals Served</label>
                <input
                  type="number"
                  value={formData.mealsServed || ''}
                  onChange={(e) => setFormData({...formData, mealsServed: parseInt(e.target.value)})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm mb-1">Certifications Achieved</label>
              <input
                type="number"
                value={formData.certificationsAchieved || ''}
                onChange={(e) => setFormData({...formData, certificationsAchieved: parseInt(e.target.value)})}
                className="w-full border rounded px-3 py-2"
                placeholder="Food safety, hospitality, etc."
              />
            </div>
          </div>
        )}
        
        {/* Common Fields */}
        <div>
          <label className="block text-sm font-medium mb-1">Revenue Generated ($)</label>
          <input
            type="number"
            value={formData.revenueGenerated || ''}
            onChange={(e) => setFormData({...formData, revenueGenerated: parseFloat(e.target.value)})}
            className="w-full border rounded px-3 py-2"
            placeholder="0.00"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.photosTaken}
              onChange={(e) => setFormData({...formData, photosTaken: e.target.checked})}
              className="rounded"
            />
            <span className="text-sm">Photos taken this quarter</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.storiesCollected}
              onChange={(e) => setFormData({...formData, storiesCollected: e.target.checked})}
              className="rounded"
            />
            <span className="text-sm">Stories collected</span>
          </label>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Key Achievements</label>
          <textarea
            value={formData.keyAchievements}
            onChange={(e) => setFormData({...formData, keyAchievements: e.target.value})}
            className="w-full border rounded px-3 py-2 h-20"
            placeholder="What went well this quarter?"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Challenges Faced</label>
          <textarea
            value={formData.challengesFaced}
            onChange={(e) => setFormData({...formData, challengesFaced: e.target.value})}
            className="w-full border rounded px-3 py-2 h-20"
            placeholder="What obstacles did you encounter?"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Next Quarter Goals</label>
          <textarea
            value={formData.nextQuarterGoals}
            onChange={(e) => setFormData({...formData, nextQuarterGoals: e.target.value})}
            className="w-full border rounded px-3 py-2 h-20"
            placeholder="What are you aiming for next quarter?"
          />
        </div>
        
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-picc-red text-white py-3 rounded font-medium hover:bg-picc-red disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Save Quarterly Data'}
        </button>
      </form>
    </div>
  );
}
