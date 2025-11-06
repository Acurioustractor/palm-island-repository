'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Users, Heart, Award, MapPin, BookOpen } from 'lucide-react';

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-teal-50">
      {/* Hero with Video Background Support */}
      <div className="relative bg-gradient-to-r from-blue-900 to-purple-900 text-white overflow-hidden">
        {/* Future: Add video background here */}
        <div className="absolute inset-0 bg-black opacity-40"></div>

        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Bwgcolman • Palm Island
            </h1>
            <p className="text-2xl md:text-3xl mb-4 text-blue-100">
              Manbarra & Bwgcolman Country
            </p>
            <p className="text-xl md:text-2xl text-purple-200 italic">
              65,000+ years of continuous connection to Country
            </p>
            <p className="text-lg mt-6 text-blue-100 max-w-3xl mx-auto">
              From ancestral custodians to forced removal, from resistance to self-determination—
              this is our story of resilience, strength, and reclaiming sovereignty.
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-ocean-deep">
            Our Journey Through Time
          </h2>

          <div className="space-y-12">
            {/* Pre-Contact */}
            <TimelineItem
              year="65,000+ Years"
              title="Ancestral Custodianship"
              icon={<MapPin className="w-6 h-6" />}
              color="from-green-600 to-teal-600"
            >
              <p className="text-earth-dark mb-4">
                The <strong>Manbarra</strong> (mainland) and <strong>Bwgcolman</strong> (island) peoples have cared for this Country since time immemorial.
                The island was known as <strong>Bwgcolman</strong>, a place of ceremony, gathering, and deep spiritual connection.
              </p>
              <p className="text-earth-dark">
                Traditional custodians maintained intricate knowledge systems, managed the land through cultural burning,
                and passed down stories, songs, and laws through countless generations.
              </p>
            </TimelineItem>

            {/* 1918 - "Discovery" and Naming */}
            <TimelineItem
              year="1918"
              title="Colonial Naming: 'Palm Island'"
              icon={<Calendar className="w-6 h-6" />}
              color="from-gray-600 to-gray-700"
            >
              <p className="text-earth-dark mb-4">
                Captain Cook sailed past and named it "Palm Island" in 1770, but the island had been Bwgcolman for tens of thousands of years.
                The colonial name erased our identity, language, and connection to Country.
              </p>
              <p className="text-earth-dark">
                In 1918, the Queensland government established a "Aboriginal settlement"—the beginning of what would become
                Australia's largest forced removal program.
              </p>
            </TimelineItem>

            {/* 1918-1930s - Forced Removals */}
            <TimelineItem
              year="1918-1930s"
              title="Forced Removals: The Stolen Generations"
              icon={<Users className="w-6 h-6" />}
              color="from-red-700 to-pink-700"
            >
              <p className="text-earth-dark mb-4">
                Palm Island became a <strong>dumping ground</strong> for Aboriginal people forcibly removed from over 50 different tribal areas across Queensland.
                Families were torn apart. Children stolen. Languages suppressed. Culture criminalized.
              </p>
              <div className="bg-red-50 border-l-4 border-red-600 p-4 my-4">
                <p className="text-red-900 font-medium">
                  "If you were Aboriginal, 'difficult,' or didn't fit the government's idea of civilization—you were sent to Palm Island."
                </p>
              </div>
              <p className="text-earth-dark">
                By the 1930s, Palm Island had become one of the largest Aboriginal settlements in Australia,
                housing people from Wakka Wakka, Tagalaka, Jirrbal, Guugu Yimithirr, Wulgurukaba, and dozens more nations—
                each with their own language, law, and Country.
              </p>
            </TimelineItem>

            {/* 1957 - The Strike */}
            <TimelineItem
              year="1957"
              title="The 1957 Strike: First Uprising"
              icon={<Award className="w-6 h-6" />}
              color="from-orange-600 to-red-600"
            >
              <p className="text-earth-dark mb-4">
                <strong>The 1957 Palm Island Strike</strong> marked one of the first major acts of resistance against the oppressive "Aboriginal Protection Acts."
                Led by <strong>Albie Geia, Eddie Mabo's uncle</strong>, workers went on strike demanding fair wages, better conditions, and basic human rights.
              </p>
              <div className="bg-orange-50 border-l-4 border-orange-600 p-4 my-4">
                <p className="text-orange-900 font-medium">
                  "We were paid in rations and tokens, not real wages. Our children were taken. We had no freedom.
                  The strike was our way of saying: we are human beings, not property."
                </p>
              </div>
              <p className="text-earth-dark mb-4">
                The strike was violently suppressed. Leaders were imprisoned. But the seed of resistance had been planted.
              </p>
              <p className="text-earth-dark">
                <strong>Legacy:</strong> This strike influenced the 1967 Referendum and inspired Eddie Mabo, who grew up on Palm Island,
                to later fight for—and win—Native Title rights in the historic <em>Mabo v Queensland</em> case (1992).
              </p>
            </TimelineItem>

            {/* 1984 - End of "The Act" */}
            <TimelineItem
              year="1984"
              title="Freedom from 'The Act'"
              icon={<Heart className="w-6 h-6" />}
              color="from-blue-600 to-purple-600"
            >
              <p className="text-earth-dark mb-4">
                The oppressive <strong>Aboriginal Protection Acts</strong> (which controlled every aspect of Aboriginal people's lives)
                were finally repealed in Queensland. For the first time since 1918, Palm Island residents could move freely,
                work without permission, and make decisions about their own lives.
              </p>
              <p className="text-earth-dark">
                But 66 years of trauma, dispossession, and cultural suppression left deep wounds.
                The fight for self-determination was only beginning.
              </p>
            </TimelineItem>

            {/* 2004 - Death in Custody: Mulrunji */}
            <TimelineItem
              year="2004"
              title="Mulrunji Doomadgee: Justice Denied"
              icon={<BookOpen className="w-6 h-6" />}
              color="from-gray-800 to-black"
            >
              <p className="text-earth-dark mb-4">
                <strong>Cameron Doomadgee (Mulrunji)</strong>, a 36-year-old Palm Island man, died in police custody after being arrested for "public nuisance"
                (allegedly swearing). His injuries were so severe—broken ribs, ruptured portal vein, liver split in two—that the
                pathologist compared them to a "car crash victim."
              </p>
              <div className="bg-gray-100 border-l-4 border-gray-800 p-4 my-4">
                <p className="text-ocean-deep font-medium">
                  "The police officer was acquitted. No one was held accountable. Our community erupted in protest—
                  not out of violence, but out of generations of injustice boiling over."
                </p>
              </div>
              <p className="text-earth-dark mb-4">
                The riots that followed led to mass arrests and further trauma. But Mulrunji's death became a rallying cry:
                <strong> "What's the difference between us and white people?"</strong>
              </p>
              <p className="text-earth-dark">
                His death remains one of Australia's most notorious cases of Indigenous deaths in custody.
                To this day, we fight for justice and accountability.
              </p>
            </TimelineItem>

            {/* 2016 - PICC Established */}
            <TimelineItem
              year="2016"
              title="Palm Island Community Company (PICC) Established"
              icon={<Award className="w-6 h-6" />}
              color="from-green-600 to-teal-600"
            >
              <p className="text-earth-dark mb-4">
                After decades of external control by government and NGOs, the community said: <strong>"Enough. We will run our own services."</strong>
              </p>
              <p className="text-earth-dark mb-4">
                <strong>Palm Island Community Company (PICC)</strong> was established to take back control of health, family services,
                employment, youth programs, and cultural preservation. For the first time since 1918, Palm Island was managing its own destiny.
              </p>
              <div className="bg-green-50 border-l-4 border-green-600 p-4 my-4">
                <p className="text-green-900 font-medium">
                  "We proved that Indigenous communities can run world-class services when we're in control.
                  Not as clients. Not as victims. As leaders."
                </p>
              </div>
            </TimelineItem>

            {/* 2021 - Full Community Control */}
            <TimelineItem
              year="2021"
              title="100% Community Controlled"
              icon={<Heart className="w-6 h-6" />}
              color="from-purple-600 to-pink-600"
            >
              <p className="text-earth-dark mb-4">
                PICC achieved <strong>full community control</strong>—taking over government contracts and proving that
                Indigenous-led organizations deliver better outcomes at lower costs than external consultants.
              </p>
              <ul className="list-disc list-inside text-earth-dark space-y-2 mb-4">
                <li><strong>197 staff members</strong> (majority from Palm Island)</li>
                <li><strong>16+ integrated services</strong> (health, family, youth, employment, culture)</li>
                <li><strong>$40k-115k annual savings</strong> by eliminating external consultants</li>
                <li><strong>Better outcomes</strong> measured by community wellbeing, employment, cultural connection</li>
              </ul>
              <p className="text-earth-dark">
                PICC became a model for Indigenous self-determination across Australia.
              </p>
            </TimelineItem>

            {/* 2024-Present - This Platform! */}
            <TimelineItem
              year="2024-Present"
              title="Palm Island Story Server: Reclaiming Our Narrative"
              icon={<BookOpen className="w-6 h-6" />}
              color="from-blue-600 to-purple-600"
            >
              <p className="text-earth-dark mb-4">
                For too long, our stories have been told <em>about</em> us, not <em>by</em> us.
                Researchers extract data. Consultants write reports. The media sensationalizes trauma.
              </p>
              <div className="bg-blue-50 border-l-4 border-ocean-600 p-4 my-4">
                <p className="text-blue-900 font-medium">
                  "The Palm Island Story Server is our platform. Our voices. Our data. Our sovereignty.
                  We control how our stories are told, who sees them, and how they're used."
                </p>
              </div>
              <p className="text-earth-dark mb-4">
                This platform embodies <strong>Indigenous data sovereignty</strong>—the CARE and OCAP® principles in action.
                Every story, every photo, every voice recording is controlled by the community, not outsiders.
              </p>
              <p className="text-earth-dark">
                <strong>We are proving that technology can serve self-determination, not colonization.</strong>
              </p>
            </TimelineItem>

            {/* Future */}
            <TimelineItem
              year="Future"
              title="Our Vision: Healing, Prosperity, Sovereignty"
              icon={<Heart className="w-6 h-6" />}
              color="from-purple-600 to-blue-600"
            >
              <p className="text-earth-dark mb-4">
                <strong>We survived genocide. We resisted oppression. We reclaimed control.</strong>
              </p>
              <p className="text-earth-dark mb-4">
                Our vision for the future:
              </p>
              <ul className="list-disc list-inside text-earth-dark space-y-2">
                <li><strong>Economic independence</strong> through community-owned enterprises</li>
                <li><strong>Cultural revitalization</strong> of languages, ceremonies, and knowledge systems</li>
                <li><strong>Healing from intergenerational trauma</strong> on our own terms</li>
                <li><strong>Youth leadership</strong> grounded in both culture and contemporary skills</li>
                <li><strong>A model for Indigenous self-determination</strong> that inspires communities worldwide</li>
              </ul>
              <div className="bg-purple-50 border-l-4 border-coral-600 p-4 my-4">
                <p className="text-purple-900 font-medium text-lg">
                  "Our ancestors survived so we could thrive. Our children will lead because we are building the foundation today."
                </p>
              </div>
            </TimelineItem>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-4xl font-bold mb-6">Share Your Story</h2>
          <p className="text-xl mb-8 text-purple-100">
            You are part of this history. Your voice matters. Your story strengthens our community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-white text-purple-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-2xl"
            >
              Join the Community
            </Link>
            <Link
              href="/storytellers"
              className="bg-purple-800 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-ocean-medium transition-all border-2 border-white"
            >
              Read Community Stories
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TimelineItemProps {
  year: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
}

function TimelineItem({ year, title, icon, color, children }: TimelineItemProps) {
  return (
    <div className="relative pl-8 md:pl-12 pb-8 border-l-4 border-coral-300">
      {/* Timeline Dot */}
      <div className={`absolute left-0 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg`}>
        {icon}
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-xl p-6 md:p-8 ml-4 md:ml-8">
        <div className="mb-4">
          <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${color} text-white font-bold text-sm mb-2`}>
            {year}
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-ocean-deep">{title}</h3>
        </div>
        <div className="prose prose-lg max-w-none">
          {children}
        </div>
      </div>
    </div>
  );
}
