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
];
