import type { PageContext } from './types';

export interface PageSlot {
  page: PageContext;
  section: string;
  label: string;
  slots: number;
  ordered?: boolean;
}

export const PAGE_SLOTS: PageSlot[] = [
  { page: 'home', section: 'hero', label: 'Home — Hero', slots: 1 },
  { page: 'about', section: 'hero', label: 'About — Hero', slots: 1 },
  { page: 'about', section: 'timeline', label: 'About — Timeline', slots: 6, ordered: true },
  { page: 'about', section: 'leadership', label: 'About — Leadership', slots: 10 },
  { page: 'impact', section: 'hero', label: 'Impact — Hero', slots: 1 },
  { page: 'community', section: 'hero', label: 'Community — Hero', slots: 1 },
  { page: 'services', section: 'hero', label: 'Services — Hero', slots: 1 },
  { page: 'innovation', section: 'hero', label: 'Innovation — Hero', slots: 1 },
  { page: 'explore', section: 'hero', label: 'Explore — Hero', slots: 1 },
  { page: '20-years', section: 'hero', label: '20 Years — Hero', slots: 1 },

  // Annual Report Pages
  { page: 'annual-report', section: 'cover', label: 'Annual Report — Cover', slots: 1 },
  { page: 'annual-report', section: 'acknowledgement', label: 'Annual Report — Acknowledgement', slots: 1 },
  { page: 'annual-report', section: 'messages', label: 'Annual Report — Chair & CEO', slots: 2, ordered: true },
  { page: 'annual-report', section: 'numbers', label: 'Annual Report — Year in Numbers', slots: 1 },
  { page: 'annual-report', section: 'community-voices', label: 'Annual Report — Community Voices', slots: 4 },
  { page: 'annual-report', section: 'youth-voices', label: 'Annual Report — Youth Voices', slots: 2 },
  { page: 'annual-report', section: 'services', label: 'Annual Report — Our Services', slots: 2 },
  { page: 'annual-report', section: 'governance', label: 'Annual Report — Governance', slots: 1 },
  { page: 'annual-report', section: 'photos', label: 'Annual Report — Photo Spread', slots: 6, ordered: true },
  { page: 'annual-report', section: 'journey', label: 'Annual Report — Journey Timeline', slots: 1 },
  { page: 'annual-report', section: 'next-20', label: 'Annual Report — Next 20 Years', slots: 1 },
  { page: 'annual-report', section: 'highlights', label: 'Annual Report — Key Highlights', slots: 4 },
];
