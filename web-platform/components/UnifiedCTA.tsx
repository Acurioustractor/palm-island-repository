'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Camera, BookOpen, ArrowRight, Heart } from 'lucide-react';
import { STAFF, SERVICES } from '@/lib/stats/current-stats';

interface CTAProps {
  variant?: 'default' | 'compact' | 'hero';
  className?: string;
  servicesTotal?: number;
}

export function UnifiedCTA({ variant = 'default', className = '', servicesTotal = SERVICES.total }: CTAProps) {
  if (variant === 'hero') {
    return (
      <div className={`bg-gradient-to-r from-picc-earth-600 via-picc-earth to-picc-earth-600 text-white py-16 ${className}`}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See How PICC Supports Palm Island
          </h2>
          <p className="text-lg text-warm-200 mb-8 max-w-2xl mx-auto">
            Explore our services, view our impact, and discover the stories that make our community strong.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-picc-earth-600 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              <MapPin className="w-5 h-5" />
              Explore Services
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/impact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white border border-white/20 rounded-full font-semibold hover:bg-white/20 transition-colors"
            >
              <Heart className="w-5 h-5" />
              View Impact
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`bg-gray-50 border-y border-gray-200 py-6 ${className}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{STAFF.total}</div>
                <div className="text-xs text-gray-500">Staff</div>
              </div>
              <div className="w-px h-8 bg-gray-300" />
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{servicesTotal}</div>
                <div className="text-xs text-gray-500">Services</div>
              </div>
              <div className="w-px h-8 bg-gray-300" />
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">1,885</div>
                <div className="text-xs text-gray-500">Photos</div>
              </div>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 bg-picc-ochre text-white rounded-full font-medium hover:bg-picc-ochre transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Explore the Map
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-8 ${className}`}>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Be Part of the Story
        </h3>
        <p className="text-gray-600">
          Every Palm Islander has a voice. Share yours today.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4">
        <Link
          href="/services"
          className="group flex flex-col items-center p-6 bg-gray-50 rounded-xl hover:bg-warm-100 transition-colors"
        >
          <div className="w-12 h-12 bg-warm-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-warm-200 transition-colors">
            <MapPin className="w-6 h-6 text-picc-ochre" />
          </div>
          <span className="font-semibold text-gray-900">Explore Services</span>
          <span className="text-sm text-gray-500 mt-1">{servicesTotal} services mapped</span>
        </Link>

        <Link
          href="/media/gallery"
          className="group flex flex-col items-center p-6 bg-gray-50 rounded-xl hover:bg-warm-50 transition-colors"
        >
          <div className="w-12 h-12 bg-warm-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-warm-200 transition-colors">
            <Camera className="w-6 h-6 text-picc-red" />
          </div>
          <span className="font-semibold text-gray-900">Browse Photos</span>
          <span className="text-sm text-gray-500 mt-1">1,885 moments</span>
        </Link>

        <Link
          href="/share-voice"
          className="group flex flex-col items-center p-6 bg-gray-50 rounded-xl hover:bg-picc-red-50 transition-colors"
        >
          <div className="w-12 h-12 bg-picc-red-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-picc-red-200 transition-colors">
            <BookOpen className="w-6 h-6 text-picc-red" />
          </div>
          <span className="font-semibold text-gray-900">Share Your Story</span>
          <span className="text-sm text-gray-500 mt-1">Join 77+ storytellers</span>
        </Link>
      </div>
    </div>
  );
}

export default UnifiedCTA;
