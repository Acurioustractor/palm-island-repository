'use client';

import React;
import AppLayout from '@/components/AppLayout';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  Heart, Users, Briefcase, GraduationCap, Baby, HomeIcon,
  Activity, BookOpen, Globe, TrendingUp, Award, Target, CheckCircle
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  slug: string;
  service_category: string;
  description?: string;
}

const CATEGORY_ICONS: Record<string, any> = {
  health: Activity,
  family: Heart,
  youth: Users,
  education: GraduationCap,
  employment: Briefcase,
  culture: BookOpen,
  community: HomeIcon,
};

const CATEGORY_COLORS: Record<string, string> = {
  health: 'from-red-500 to-pink-500',
  family: 'from-purple-500 to-pink-500',
  youth: 'from-blue-500 to-cyan-500',
  education: 'from-green-500 to-teal-500',
  employment: 'from-orange-500 to-yellow-500',
  culture: 'from-indigo-500 to-purple-500',
  community: 'from-teal-500 to-green-500',
};

export default function PICCPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      const supabase = createClient();
      const { data } = await supabase
        .from('organization_services')
        .select('*')
        .eq('organization_id', '3c2011b9-f80d-4289-b300-0cd383cff479')
        .order('name');

      setServices(data || []);
      setLoading(false);
    }
    fetchServices();
  }, []);

  const servicesByCategory = services.reduce((acc, service) => {
    const category = service.service_category || 'community';
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-teal-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>

        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                Palm Island Community Company
              </h1>
              <p className="text-2xl md:text-3xl text-purple-100 mb-4">
                PICC • Established 2016
              </p>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                <strong>100% Community Controlled</strong> • Proving that Indigenous self-determination delivers better outcomes at lower costs
              </p>
            </div>

            {/* Key Stats */}
            <div className="grid md:grid-cols-4 gap-6 mt-12">
              <StatCard
                number="197"
                label="Staff Members"
                sublabel="Majority from Palm Island"
                icon={<Users className="w-8 h-8" />}
              />
              <StatCard
                number="16+"
                label="Services"
                sublabel="Fully integrated"
                icon={<Award className="w-8 h-8" />}
              />
              <StatCard
                number="$115k"
                label="Annual Savings"
                sublabel="No external consultants"
                icon={<TrendingUp className="w-8 h-8" />}
              />
              <StatCard
                number="100%"
                label="Community Control"
                sublabel="Since 2021"
                icon={<Target className="w-8 h-8" />}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-center mb-8 text-ocean-deep">
            Our Story: From Dependence to Self-Determination
          </h2>

          <div className="space-y-6 text-lg text-earth-dark">
            <p className="leading-relaxed">
              For over a century, Palm Island was controlled by external governments and NGOs who claimed to "help" but really
              perpetuated dependence. Services were fragmented. Consultants cost $40k-115k annually. Outcomes were poor.
              <strong> Our community had no say in our own services.</strong>
            </p>

            <div className="bg-red-50 border-l-4 border-red-600 p-6 my-6">
              <p className="text-red-900 font-medium text-xl">
                "We were sick of being told what we needed by people who didn't live here, didn't understand us, and left when the contract ended."
              </p>
            </div>

            <p className="leading-relaxed">
              In <strong>2016</strong>, the community said: <strong>"Enough. We'll run our own services."</strong>
            </p>

            <p className="leading-relaxed">
              <strong>Palm Island Community Company (PICC)</strong> was born—a community-controlled organization designed to take back
              health, family services, youth programs, employment, cultural preservation, and community development.
            </p>

            <p className="leading-relaxed">
              By <strong>2021</strong>, PICC achieved <strong>100% community control</strong>, taking over government contracts
              and proving what Indigenous communities have always known: <strong>we know what's best for us.</strong>
            </p>

            <div className="bg-green-50 border-l-4 border-green-600 p-6 my-6">
              <h3 className="text-2xl font-bold text-green-900 mb-4">What We've Achieved:</h3>
              <ul className="space-y-2 text-green-900">
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 mr-2 flex-shrink-0 mt-1" />
                  <span><strong>197 staff members</strong> employed (majority from Palm Island) compared to external NGOs who flew in consultants</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 mr-2 flex-shrink-0 mt-1" />
                  <span><strong>16+ integrated services</strong> working together, not in silos</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 mr-2 flex-shrink-0 mt-1" />
                  <span><strong>$40k-115k annual savings</strong> by eliminating external consultants</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 mr-2 flex-shrink-0 mt-1" />
                  <span><strong>Better outcomes</strong> measured by community wellbeing, employment rates, and cultural connection</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 mr-2 flex-shrink-0 mt-1" />
                  <span><strong>A model for self-determination</strong> across Australia and globally</span>
                </li>
              </ul>
            </div>

            <p className="leading-relaxed text-xl font-medium text-purple-900">
              PICC proves that <strong>Indigenous communities don't need to be "helped"—we need to be in control.</strong>
            </p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-ocean-deep">
            Our Services: Holistic, Integrated, Community-Led
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-coral-600 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(servicesByCategory).map(([category, categoryServices]) => {
                const Icon = CATEGORY_ICONS[category] || HomeIcon;
                const colorClass = CATEGORY_COLORS[category] || 'from-gray-500 to-gray-600';

                return (
                  <div key={category} className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div className={`bg-gradient-to-r ${colorClass} text-white p-6`}>
                      <div className="flex items-center">
                        <Icon className="w-10 h-10 mr-4" />
                        <h3 className="text-3xl font-bold capitalize">{category} Services</h3>
                      </div>
                    </div>

                    <div className="p-8">
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categoryServices.map((service) => (
                          <div
                            key={service.id}
                            className="border-2 border-gray-200 rounded-lg p-6 hover:border-coral-400 hover:shadow-lg transition-all"
                          >
                            <h4 className="text-xl font-bold text-ocean-deep mb-2">
                              {service.name}
                            </h4>
                            {service.description && (
                              <p className="text-earth-medium text-sm">
                                {service.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Impact Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-center mb-8">
              Why Community Control Matters
            </h2>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <TrendingUp className="w-6 h-6 mr-2" />
                  Before PICC (2016)
                </h3>
                <ul className="space-y-2 text-blue-100">
                  <li>❌ Fragmented services in silos</li>
                  <li>❌ External consultants ($40k-115k/year)</li>
                  <li>❌ High turnover (consultants leave)</li>
                  <li>❌ No community input or control</li>
                  <li>❌ Poor outcomes, no accountability</li>
                  <li>❌ Cultural disconnection</li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <Award className="w-6 h-6 mr-2" />
                  After PICC (2021+)
                </h3>
                <ul className="space-y-2 text-green-100">
                  <li>✅ Integrated holistic services</li>
                  <li>✅ Community-employed staff (197+)</li>
                  <li>✅ Local knowledge & continuity</li>
                  <li>✅ 100% community control</li>
                  <li>✅ Better outcomes, full transparency</li>
                  <li>✅ Cultural grounding in every service</li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold mb-6">
                Result: <span className="text-yellow-300">Better Services. Lower Costs. Community Sovereignty.</span>
              </p>
              <Link
                href="/history"
                className="inline-block bg-white text-purple-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-2xl"
              >
                Read Our Full History →
              </Link>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="max-w-4xl mx-auto mt-16 text-center">
          <h2 className="text-4xl font-bold mb-6 text-ocean-deep">
            Be Part of Our Story
          </h2>
          <p className="text-xl text-earth-dark mb-8">
            PICC is more than an organization—it's a movement toward Indigenous self-determination.
            Share your story, connect with services, and help build our community's future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-2xl"
            >
              Join the Community
            </Link>
            <Link
              href="/storytellers"
              className="bg-white border-2 border-coral-600 text-purple-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-purple-50 transition-all"
            >
              Read Community Stories
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ number, label, sublabel, icon }: {
  number: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl p-6 text-center">
      <div className="flex justify-center mb-3">{icon}</div>
      <div className="text-4xl font-bold mb-2">{number}</div>
      <div className="text-lg font-medium">{label}</div>
      <div className="text-sm text-blue-100 mt-1">{sublabel}</div>
    </div>
  );
}
