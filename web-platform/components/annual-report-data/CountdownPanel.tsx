'use client';

import { useState, useEffect } from 'react';
import { Clock, Target, CheckCircle, Circle, TrendingUp, ExternalLink } from 'lucide-react';
import { STAFF, SERVICES, FINANCIALS } from '@/lib/stats/current-stats';

// August 2028 — 20th anniversary of PICC community control (est. August 2008)
const ANNIVERSARY_DATE = new Date('2028-08-01T00:00:00+10:00');
const START_DATE = new Date('2008-08-01T00:00:00+10:00'); // Community control date

interface CountdownPanelProps {
  milestones?: { id: string; label: string; achieved: boolean }[];
  onMilestoneToggle?: (id: string, achieved: boolean) => void;
}

function getTimeRemaining() {
  const now = new Date();
  const diff = ANNIVERSARY_DATE.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
}

function getYearsProgress() {
  const now = new Date();
  const totalMs = ANNIVERSARY_DATE.getTime() - START_DATE.getTime();
  const elapsedMs = now.getTime() - START_DATE.getTime();
  const yearsElapsed = elapsedMs / (1000 * 60 * 60 * 24 * 365.25);
  const percent = Math.min(100, (elapsedMs / totalMs) * 100);
  return { yearsElapsed: Math.floor(yearsElapsed * 10) / 10, percent: Math.round(percent) };
}

const DEFAULT_MILESTONES = [
  { id: '1', label: 'Community control established (2008)', achieved: true },
  { id: '2', label: 'First annual report published', achieved: true },
  { id: '3', label: '10-year milestone (2018)', achieved: true },
  { id: '4', label: 'Digital platform launched', achieved: true },
  { id: '5', label: '50+ staff employed', achieved: true },
  { id: '6', label: '100+ staff employed', achieved: true },
  { id: '7', label: 'Annual budget exceeds $10M', achieved: true },
  { id: '8', label: '8 services operating', achieved: true },
  { id: '9', label: '50+ community stories collected', achieved: true },
  { id: '10', label: '20-year anniversary celebration (2028)', achieved: false },
];

const COMPARISON_STATS = [
  { label: 'Staff', yearOne: '15', current: `${STAFF.total}` },
  { label: 'Services', yearOne: '4', current: `${SERVICES.total}` },
  { label: 'Annual Income', yearOne: '$2.5M', current: FINANCIALS.incomeDisplay },
  { label: 'Community Stories', yearOne: '0', current: '50+' },
];

export default function CountdownPanel({
  milestones: externalMilestones,
  onMilestoneToggle,
}: CountdownPanelProps) {
  const [time, setTime] = useState(getTimeRemaining());
  const [progress, setProgress] = useState(getYearsProgress());
  const [milestones, setMilestones] = useState(externalMilestones || DEFAULT_MILESTONES);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeRemaining());
      setProgress(getYearsProgress());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (externalMilestones) setMilestones(externalMilestones);
  }, [externalMilestones]);

  const toggleMilestone = (id: string) => {
    const milestone = milestones.find(m => m.id === id);
    if (!milestone) return;
    const newValue = !milestone.achieved;
    setMilestones(milestones.map(m => m.id === id ? { ...m, achieved: newValue } : m));
    onMilestoneToggle?.(id, newValue);
  };

  const achievedCount = milestones.filter(m => m.achieved).length;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Countdown Timer */}
      <div className="bg-gradient-to-br from-picc-ochre to-picc-earth rounded-2xl p-8 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-warm-200" />
          <h2 className="text-lg font-semibold text-warm-100">
            Road to 20 Years of Community Control
          </h2>
        </div>
        <p className="text-warm-200 text-sm mb-6">
          Countdown to August 2028
        </p>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { value: time.days, label: 'Days' },
            { value: time.hours, label: 'Hours' },
            { value: time.minutes, label: 'Minutes' },
            { value: time.seconds, label: 'Seconds' },
          ].map(item => (
            <div key={item.label} className="text-center">
              <div className="text-4xl md:text-5xl font-bold tabular-nums">
                {item.value.toLocaleString()}
              </div>
              <div className="text-xs text-warm-200 mt-1 uppercase tracking-wider">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Years progress bar */}
        <div className="bg-picc-earth/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-warm-200">
              {progress.yearsElapsed} years completed
            </span>
            <span className="text-sm font-bold text-warm-100">
              {progress.percent}% of 20 years
            </span>
          </div>
          <div className="h-3 bg-picc-earth/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sage-400 to-sage-300 rounded-full transition-all duration-1000"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Year 1 vs Now comparison */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5" />
          Year 1 vs Now
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {COMPARISON_STATS.map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-xs font-medium text-gray-500 mb-2">{stat.label}</div>
              <div className="flex items-center justify-center gap-3">
                <div>
                  <div className="text-lg font-semibold text-gray-400">{stat.yearOne}</div>
                  <div className="text-[10px] text-gray-400">Year 1</div>
                </div>
                <span className="text-gray-300">&rarr;</span>
                <div>
                  <div className="text-lg font-bold text-picc-ochre">{stat.current}</div>
                  <div className="text-[10px] text-gray-500">Now</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones checklist */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Milestones
          </h3>
          <span className="text-sm text-gray-500">
            {achievedCount}/{milestones.length} achieved
          </span>
        </div>

        <div className="space-y-2">
          {milestones.map(milestone => (
            <button
              key={milestone.id}
              onClick={() => toggleMilestone(milestone.id)}
              className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              {milestone.achieved ? (
                <CheckCircle className="w-5 h-5 text-sage-500 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
              )}
              <span className={`text-sm ${milestone.achieved ? 'text-gray-900' : 'text-gray-500'}`}>
                {milestone.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Link to public page */}
      <div className="bg-gray-50 rounded-xl p-4">
        <a
          href="/road-to-20-years"
          className="flex items-center justify-between group"
        >
          <div>
            <div className="text-sm font-medium text-gray-900 group-hover:text-picc-ochre transition-colors">
              View Public Countdown Page
            </div>
            <div className="text-xs text-gray-500">
              /road-to-20-years
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-picc-ochre transition-colors" />
        </a>
      </div>
    </div>
  );
}
