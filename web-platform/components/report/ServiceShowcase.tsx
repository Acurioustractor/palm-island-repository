'use client';

import { useState } from 'react';
import { ScrollReveal, StaggerContainer } from './ScrollReveal';
import {
  Heart, Users, Home, Shield, Briefcase, GraduationCap,
  Baby, TreePine, Stethoscope, Scale, Building, Car,
  ChevronRight, ExternalLink, LucideIcon
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description?: string;
  category?: string;
  icon?: string;
  color?: string;
  stats?: {
    label: string;
    value: string | number;
  }[];
  highlights?: string[];
}

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  heart: Heart,
  users: Users,
  home: Home,
  shield: Shield,
  briefcase: Briefcase,
  graduation: GraduationCap,
  baby: Baby,
  tree: TreePine,
  health: Stethoscope,
  justice: Scale,
  building: Building,
  transport: Car,
};

interface ServiceShowcaseProps {
  services: Service[];
  title?: string;
  subtitle?: string;
  layout?: 'grid' | 'list' | 'featured';
  showStats?: boolean;
}

export function ServiceShowcase({
  services,
  title,
  subtitle,
  layout = 'grid',
  showStats = true,
}: ServiceShowcaseProps) {
  const [activeService, setActiveService] = useState<string | null>(null);

  if (layout === 'featured') {
    // Group services by category
    const groupedServices = services.reduce((acc, service) => {
      const category = service.category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(service);
      return acc;
    }, {} as Record<string, Service[]>);

    return (
      <div className="space-y-12">
        {Object.entries(groupedServices).map(([category, categoryServices]) => (
          <div key={category}>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-[#2d6a4f] rounded-full" />
              {category}
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryServices.map((service, index) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  index={index}
                  showStats={showStats}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (layout === 'list') {
    return (
      <div className="space-y-4">
        {services.map((service, index) => (
          <ScrollReveal key={service.id} animation="fadeRight" delay={index * 50}>
            <div
              className={`p-6 rounded-xl border transition-all cursor-pointer ${
                activeService === service.id
                  ? 'border-[#2d6a4f] bg-[#f0fdf4] shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }`}
              onClick={() => setActiveService(activeService === service.id ? null : service.id)}
            >
              <div className="flex items-start gap-4">
                <ServiceIcon
                  icon={service.icon}
                  color={service.color}
                  size="lg"
                />
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900 mb-1">{service.name}</h4>
                  {service.category && (
                    <span className="text-sm text-[#2d6a4f] font-medium">{service.category}</span>
                  )}
                  {service.description && (
                    <p className="mt-2 text-gray-600">{service.description}</p>
                  )}

                  {activeService === service.id && service.highlights && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h5 className="font-medium text-gray-900 mb-2">Highlights</h5>
                      <ul className="space-y-1">
                        {service.highlights.map((highlight, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <ChevronRight className="w-4 h-4 text-[#2d6a4f] flex-shrink-0 mt-0.5" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {showStats && service.stats && service.stats.length > 0 && (
                  <div className="flex gap-6 pl-4 border-l border-gray-200">
                    {service.stats.slice(0, 2).map((stat, i) => (
                      <div key={i} className="text-center">
                        <div className="text-2xl font-bold text-[#1e3a5f]">{stat.value}</div>
                        <div className="text-xs text-gray-500">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    );
  }

  // Default grid layout
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service, index) => (
        <ServiceCard
          key={service.id}
          service={service}
          index={index}
          showStats={showStats}
        />
      ))}
    </div>
  );
}

// Individual service card
interface ServiceCardProps {
  service: Service;
  index: number;
  showStats?: boolean;
}

function ServiceCard({ service, index, showStats }: ServiceCardProps) {
  return (
    <ScrollReveal animation="fadeUp" delay={index * 75}>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all h-full flex flex-col">
        <div className="flex items-start gap-4 mb-4">
          <ServiceIcon icon={service.icon} color={service.color} />
          <div>
            <h4 className="font-bold text-gray-900 leading-tight">{service.name}</h4>
            {service.category && (
              <span className="text-sm text-gray-500">{service.category}</span>
            )}
          </div>
        </div>

        {service.description && (
          <p className="text-gray-600 text-sm mb-4 flex-grow">{service.description}</p>
        )}

        {showStats && service.stats && service.stats.length > 0 && (
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 mt-auto">
            {service.stats.slice(0, 2).map((stat, i) => (
              <div key={i} className="text-center bg-gray-50 rounded-lg p-2">
                <div className="text-lg font-bold text-[#1e3a5f]">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ScrollReveal>
  );
}

// Service icon component
interface ServiceIconProps {
  icon?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

function ServiceIcon({ icon, color = '#2d6a4f', size = 'md' }: ServiceIconProps) {
  const Icon = icon ? iconMap[icon.toLowerCase()] || Heart : Heart;

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-xl flex items-center justify-center flex-shrink-0`}
      style={{ backgroundColor: `${color}20` }}
    >
      <Icon className={iconSizes[size]} style={{ color }} />
    </div>
  );
}

// Service impact summary
interface ServiceImpactProps {
  services: Service[];
  totalClients?: number;
  totalPrograms?: number;
  totalStaff?: number;
}

export function ServiceImpact({
  services,
  totalClients,
  totalPrograms,
  totalStaff,
}: ServiceImpactProps) {
  const categories = Array.from(new Set(services.map((s) => s.category).filter(Boolean))) as string[];

  return (
    <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] rounded-3xl p-8 md:p-12 text-white">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-bold mb-2">Our Impact at a Glance</h3>
        <p className="text-white/70">Serving our community across multiple areas</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <div className="text-center">
          <div className="text-4xl font-bold mb-1">{services.length}</div>
          <div className="text-white/70">Services</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold mb-1">{categories.length}</div>
          <div className="text-white/70">Categories</div>
        </div>
        {totalClients && (
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{totalClients.toLocaleString()}</div>
            <div className="text-white/70">Clients Served</div>
          </div>
        )}
        {totalStaff && (
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{totalStaff}</div>
            <div className="text-white/70">Dedicated Staff</div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((category) => (
          <span
            key={category}
            className="px-4 py-2 bg-white/10 rounded-full text-sm font-medium"
          >
            {category}
          </span>
        ))}
      </div>
    </div>
  );
}

// Compact service list
interface ServiceListCompactProps {
  services: Service[];
  columns?: 2 | 3 | 4;
}

export function ServiceListCompact({ services, columns = 3 }: ServiceListCompactProps) {
  const colClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  };

  return (
    <div className={`grid grid-cols-1 ${colClass[columns]} gap-4`}>
      {services.map((service, index) => (
        <ScrollReveal key={service.id} animation="fadeUp" delay={index * 30}>
          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
            <ServiceIcon icon={service.icon} color={service.color} size="sm" />
            <span className="font-medium text-gray-900">{service.name}</span>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}
