'use client';

import React from 'react';
import Link from 'next/link';
import { BarChart3, Shield, Database, Zap, Globe, Lightbulb, Award, Heart } from 'lucide-react';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';

export default function LocalServerPage() {
  const breadcrumbs = [
    { label: 'Wiki', href: '/wiki' },
    { label: 'Innovation', href: '/wiki/innovation' },
    { label: 'Local Server', href: '/wiki/innovation/local-server' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="h-10 w-10 text-emerald-600" />
          <h1 className="text-4xl font-bold text-gray-900">
            Palm Island Local Server
          </h1>
        </div>
        <p className="text-xl text-gray-600 mb-4">
          Community-controlled data infrastructure ensuring data sovereignty
        </p>
        <div className="flex flex-wrap gap-3">
          <span className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg border border-amber-300 font-medium">
            Status: Planning
          </span>
          <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-300 font-medium">
            Year Started: 2024
          </span>
          <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg border border-blue-300 font-medium">
            Impact: Data Sovereignty
          </span>
        </div>
      </div>

      {/* Vision Statement */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="h-6 w-6 text-emerald-600" />
          Vision: Community Data Sovereignty
        </h2>
        <p className="text-gray-700 text-lg mb-4">
          The Palm Island Local Server is physical computing infrastructure located on Palm Island,
          ensuring that community data is stored, managed, and controlled locally rather than on
          external cloud platforms or government systems.
        </p>
        <p className="text-gray-600">
          This embodies true data sovereignty - the community's right to control its own data,
          stories, knowledge, and information systems. It provides resilient local access even when
          internet connections fail, and ensures cultural protocols are enforced at the infrastructure
          level, not just the application level.
        </p>
      </div>

      {/* Why Data Sovereignty Matters */}
      <div className="bg-white rounded-lg border border-stone-300 shadow-sm overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-stone-100 to-emerald-50 border-b border-stone-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">Why Data Sovereignty Matters</h2>
        </div>
        <div className="p-6">
          <div className="bg-rose-50 border-l-4 border-rose-400 p-6 mb-6">
            <h3 className="font-bold text-rose-900 mb-2 flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              The Problem: External Control
            </h3>
            <p className="text-gray-700 text-sm mb-3">
              Most Indigenous communities store their data on external platforms: Google Cloud, AWS,
              Microsoft Azure, or government systems. This creates fundamental vulnerabilities:
            </p>
            <ul className="space-y-2 text-sm text-gray-700 ml-6">
              <li className="flex items-start gap-2">
                <span className="text-rose-600 mt-1">•</span>
                <span><strong>Privacy risks:</strong> External platforms can be subpoenaed, hacked,
                or accessed by government agencies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 mt-1">•</span>
                <span><strong>Cultural protocol failures:</strong> Cloud platforms don't understand
                or enforce cultural sensitivity around restricted knowledge</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 mt-1">•</span>
                <span><strong>Service dependencies:</strong> If the platform shuts down or changes
                pricing, communities lose access to their own data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 mt-1">•</span>
                <span><strong>Internet dependency:</strong> When internet fails (common in remote
                areas), communities can't access their own records</span>
              </li>
            </ul>
          </div>

          <div className="bg-emerald-50 border-l-4 border-emerald-400 p-6">
            <h3 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
              <span className="text-2xl">🏛️</span>
              The Solution: Local Infrastructure
            </h3>
            <p className="text-gray-700 text-sm mb-3">
              A local server on Palm Island puts control back in community hands:
            </p>
            <ul className="space-y-2 text-sm text-gray-700 ml-6">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-1">•</span>
                <span><strong>Physical sovereignty:</strong> Data lives on community-owned hardware
                in a community-controlled location</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-1">•</span>
                <span><strong>Cultural protocols enforced:</strong> Access controls and permissions
                built into the infrastructure itself</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-1">•</span>
                <span><strong>Resilient access:</strong> Local network works even when internet fails,
                ensuring continuity of services</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-1">•</span>
                <span><strong>No external dependencies:</strong> Community isn't beholden to cloud
                platforms or external technology companies</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Technical Architecture */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Database className="h-6 w-6 text-blue-600" />
          Technical Architecture
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <Database className="h-8 w-8 text-blue-600" />
              <h3 className="font-bold text-blue-900">Local Data Storage</h3>
            </div>
            <p className="text-gray-700 text-sm mb-3">
              High-capacity server hardware stores all community data locally: stories, photos,
              videos, documents, and service records.
            </p>
            <ul className="space-y-1 text-xs text-gray-600">
              <li>• Redundant storage (RAID configuration)</li>
              <li>• Automatic backups to secondary drives</li>
              <li>• Encrypted at rest for security</li>
              <li>• Regular cloud backup for disaster recovery</li>
            </ul>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="h-8 w-8 text-emerald-600" />
              <h3 className="font-bold text-emerald-900">Fast Local Network</h3>
            </div>
            <p className="text-gray-700 text-sm mb-3">
              Gigabit local network provides fast access to data for all PICC services and
              community members on the island.
            </p>
            <ul className="space-y-1 text-xs text-gray-600">
              <li>• 10x faster than internet access</li>
              <li>• Works during internet outages</li>
              <li>• Supports video/photo streaming</li>
              <li>• Multiple concurrent users</li>
            </ul>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="h-8 w-8 text-purple-600" />
              <h3 className="font-bold text-purple-900">Security & Permissions</h3>
            </div>
            <p className="text-gray-700 text-sm mb-3">
              Cultural protocols and access controls enforced at the infrastructure level,
              ensuring sensitive data is protected.
            </p>
            <ul className="space-y-1 text-xs text-gray-600">
              <li>• Role-based access controls</li>
              <li>• Elder approval workflows built-in</li>
              <li>• Restricted content protection</li>
              <li>• Audit trails for all access</li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="h-8 w-8 text-amber-600" />
              <h3 className="font-bold text-amber-900">Hybrid Cloud Model</h3>
            </div>
            <p className="text-gray-700 text-sm mb-3">
              Combines local server with selective cloud sync, giving best of both worlds:
              sovereignty and accessibility.
            </p>
            <ul className="space-y-1 text-xs text-gray-600">
              <li>• Public data syncs to cloud</li>
              <li>• Restricted data stays local only</li>
              <li>• Automatic failover if server down</li>
              <li>• Remote access for staff</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Innovation Elements */}
      <div className="bg-white rounded-lg border border-stone-300 shadow-sm overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-stone-100 to-amber-50 border-b border-stone-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-amber-600" />
            What Makes This Innovative
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-4">
            <Shield className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">True Indigenous Data Sovereignty</h3>
              <p className="text-sm text-gray-600">
                Most "Indigenous data sovereignty" projects still rely on external cloud platforms.
                This is one of the few examples globally where an Indigenous community owns and
                operates its own physical data infrastructure. It's actual sovereignty, not just
                governance policies on someone else's servers.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Database className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Cultural Protocols in Hardware</h3>
              <p className="text-sm text-gray-600">
                Instead of just software-level access controls that can be bypassed, cultural
                protocols are enforced at the infrastructure level. Restricted content is physically
                isolated from public content. Elder approval workflows are built into the data
                architecture, not just the application.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Zap className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Resilience by Design</h3>
              <p className="text-sm text-gray-600">
                Designed for the reality of remote community infrastructure: unreliable internet,
                power outages, limited technical support. The system continues to function locally
                even when external connections fail, ensuring continuity of essential services.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Award className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Replicable Model</h3>
              <p className="text-sm text-gray-600">
                Built using standard, affordable hardware and open-source software so other
                Indigenous communities can replicate it. Creates a template for Indigenous data
                sovereignty that doesn't require millions in funding or partnerships with tech
                giants.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Community Benefits</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg p-6 border border-blue-200">
            <div className="text-3xl mb-3">🏢</div>
            <h3 className="font-bold text-blue-900 mb-2">Service Continuity</h3>
            <p className="text-sm text-gray-700">
              PICC services can continue operating even during internet outages - accessing client
              records, service delivery data, and essential systems from local network.
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-6 border border-emerald-200">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-bold text-emerald-900 mb-2">Privacy Protection</h3>
            <p className="text-sm text-gray-700">
              Community members' personal information, health records, and sensitive data protected
              by physical isolation rather than just software permissions.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-bold text-purple-900 mb-2">Cost Savings</h3>
            <p className="text-sm text-gray-700">
              Reduces ongoing cloud hosting costs. One-time hardware investment replaces recurring
              monthly fees to external platforms.
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
            <div className="text-3xl mb-3">📚</div>
            <h3 className="font-bold text-amber-900 mb-2">Knowledge Preservation</h3>
            <p className="text-sm text-gray-700">
              Cultural knowledge, elder recordings, and traditional practices stored locally under
              community control, ensuring they're never lost or inaccessible.
            </p>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg p-6 border border-rose-200">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-bold text-rose-900 mb-2">Fast Access</h3>
            <p className="text-sm text-gray-700">
              Gigabit local network provides much faster access to photos, videos, and large files
              than internet connections, improving user experience.
            </p>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
            <div className="text-3xl mb-3">🎓</div>
            <h3 className="font-bold text-indigo-900 mb-2">Skills Development</h3>
            <p className="text-sm text-gray-700">
              Training community members in server administration, networking, and data management
              builds valuable technical skills and local capacity.
            </p>
          </div>
        </div>
      </div>

      {/* Implementation Roadmap */}
      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Implementation Roadmap</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-400">
              <span className="text-blue-700 font-bold text-sm">1</span>
            </div>
            <div>
              <h3 className="font-bold text-blue-900 mb-1">Hardware Procurement (Month 1-2)</h3>
              <p className="text-sm text-gray-700">
                Purchase server hardware, storage drives, networking equipment, and uninterruptible
                power supply (UPS) for protection against outages.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center border-2 border-emerald-400">
              <span className="text-emerald-700 font-bold text-sm">2</span>
            </div>
            <div>
              <h3 className="font-bold text-emerald-900 mb-1">Installation & Configuration (Month 2-3)</h3>
              <p className="text-sm text-gray-700">
                Set up server in secure location, install operating system and database software,
                configure network access and security protocols.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center border-2 border-purple-400">
              <span className="text-purple-700 font-bold text-sm">3</span>
            </div>
            <div>
              <h3 className="font-bold text-purple-900 mb-1">Data Migration (Month 3-4)</h3>
              <p className="text-sm text-gray-700">
                Migrate existing data from cloud platforms to local server, verify data integrity,
                set up synchronization with cloud backup.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center border-2 border-amber-400">
              <span className="text-amber-700 font-bold text-sm">4</span>
            </div>
            <div>
              <h3 className="font-bold text-amber-900 mb-1">Training & Handover (Month 4-5)</h3>
              <p className="text-sm text-gray-700">
                Train PICC IT staff in server management, backup procedures, troubleshooting, and
                security protocols. Establish ongoing maintenance schedule.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Links to Related Pages */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link
          href="/wiki/culture"
          className="block p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg hover:shadow-md transition-all group"
        >
          <Shield className="h-8 w-8 text-emerald-600 mb-2" />
          <h3 className="font-bold text-emerald-900 mb-2 group-hover:text-emerald-700">
            Culture & Language
          </h3>
          <p className="text-sm text-gray-700">
            See what knowledge we're protecting
          </p>
        </Link>
        <Link
          href="/wiki/services"
          className="block p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg hover:shadow-md transition-all group"
        >
          <Heart className="h-8 w-8 text-blue-600 mb-2" />
          <h3 className="font-bold text-blue-900 mb-2 group-hover:text-blue-700">
            Services & Programs
          </h3>
          <p className="text-sm text-gray-700">
            Services powered by local infrastructure
          </p>
        </Link>
        <Link
          href="/wiki/innovation"
          className="block p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg hover:shadow-md transition-all group"
        >
          <Lightbulb className="h-8 w-8 text-amber-600 mb-2" />
          <h3 className="font-bold text-amber-900 mb-2 group-hover:text-amber-700">
            All Innovation Projects
          </h3>
          <p className="text-sm text-gray-700">
            See other PICC innovations
          </p>
        </Link>
      </div>
    </div>
  );
}
