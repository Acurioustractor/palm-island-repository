'use client';

import React;
import AppLayout from '@/components/AppLayout';
import React, { useState } from 'react';
import { ChevronRight, Users, Heart, TrendingUp, Globe, BookOpen, Target, Star, Building, Phone, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const [activeSection, setActiveSection] = useState('vision');
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);

  const sections = [
    { id: 'vision', label: 'Transformative Vision', icon: Star },
    { id: 'journey', label: 'Journey of Resilience', icon: Globe },
    { id: 'people', label: 'Community Champions', icon: Users },
    { id: 'services', label: 'Ecosystem of Care', icon: Heart },
    { id: 'impact', label: 'Living Impact', icon: TrendingUp },
    { id: 'stories', label: 'Voices of Transformation', icon: BookOpen },
    { id: 'future', label: 'Horizons of Possibility', icon: Target }
  ];

  const boardMembers = [
    {
      name: "Luella Bligh",
      position: "Chair - Guardian of Transformation",
      bio: "Leading PICC through its historic transition to full community control, Luella embodies the spirit of self-determination. Her leadership philosophy centers on the profound truth that transformation succeeds when it emerges from within the community itself.",
      vision: "A future where Palm Island's governance reflects the wisdom of its people"
    },
    {
      name: "Allan Palm Island",
      position: "Traditional Owner Director - Cultural Navigator",
      bio: "Holding the inaugural position of Traditional Owner Director for the Manbarra people, Allan bridges ancient wisdom with contemporary innovation. Learning culture from age 8, he now guides PICC with stories of the Nanggarra Wanggarra people.",
      vision: "Creating spaces where young people reconnect with their cultural strength"
    },
    {
      name: "Rhonda Phillips",
      position: "Director - Architect of Systems",
      bio: "With PICC since its 2007 inception, Rhonda brings four decades of transformative experience. Her expertise in Indigenous governance has shaped PICC's evolution from a government initiative to a beacon of community control.",
      vision: "Systems that serve people, not the other way around"
    },
    {
      name: "Harriet Hulthen",
      position: "Director - Voice of Justice",
      bio: "Born and raised on Palm Island, Harriet's journey from Field Officer to Manager of Field Operations exemplifies homegrown leadership. Her 12+ years as Official Visitor to correctional facilities reflects deep commitment to justice and healing.",
      vision: "Every Palm Islander having pathways to justice and opportunity"
    },
    {
      name: "Raymond W. Palmer Snr",
      position: "Director - Community Heartbeat",
      bio: "A proud Bwgcolman man who has never left his island home, Raymond brings the perspective of deep roots. Father to nine and grandfather to many, his work spans aged care, education, and community building.",
      vision: "Our children learning on Country, from Country"
    },
    {
      name: "Matthew Lindsay",
      position: "Company Secretary - Financial Steward",
      bio: "As a Fellow CPA and Graduate of AICD, Matthew ensures PICC's vision is supported by robust financial governance. His strategic expertise transforms community aspirations into sustainable realities.",
      vision: "Financial systems that enable community dreams"
    },
    {
      name: "Cassie Lang",
      position: "Director - Legal Pathfinder",
      bio: "Bringing 14 years of expertise in Native Title and Indigenous Cultural Heritage, Cassie ensures PICC's growth honors traditional rights while navigating contemporary legal landscapes.",
      vision: "Law as a tool for cultural preservation and progress"
    }
  ];

  const leadership = {
    name: "Rachel Atkinson",
    position: "Chief Executive Officer - Transformational Architect",
    bio: "A proud Yorta Yorta woman carrying the legacy of activists William Cooper and Sir Douglas Nicholls, Rachel has transformed PICC from a single-employee operation to Palm Island's largest non-government employer. Her greatest triumph: achieving full community control in 2021.",
    vision: "Everything we do is for, with, and because of the people of this beautiful community",
    achievements: [
      "Grew organization from 1 to 197 employees",
      "Achieved 80%+ Aboriginal and Torres Strait Islander workforce",
      "Secured full community control after years of advocacy",
      "Generated $5.8 million in local wages annually",
      "Reduced Aboriginal child removals through integrated services"
    ]
  };

  const services = {
    "Healing & Wellbeing": [
      {
        name: "Bwgcolman Healing Service",
        tagline: "Where Western Medicine Meets Ancient Wisdom",
        description: "Our renamed Primary Health Centre embodies the fusion of clinical excellence with cultural healing. Serving 2,283 clients with 17,488 episodes of care, we don't just treat illness—we nurture wholeness.",
        stats: { clients: "2,283", episodes: "17,488", healthChecks: "779" },
        contact: "07 4445 4401 | medicaladmin@picc.com.au"
      },
      {
        name: "Social and Emotional Wellbeing",
        tagline: "Healing the Spirit, Strengthening the Mind",
        description: "Mental health support grounded in cultural understanding, recognizing that true wellbeing flows from connection to Country, culture, and community.",
        integrated: true
      }
    ],
    "Family Constellation": [
      {
        name: "Children and Family Centre",
        tagline: "Nurturing Tomorrow's Leaders from Birth",
        description: "More than childcare—a sacred space where culture is transmitted through play, where parents find support, and where every child's potential is recognized and cultivated.",
        programs: ["Playgroup 5 days/week", "Early childhood education", "Maternal health support"],
        contact: "07 4791 4018"
      },
      {
        name: "Family Wellbeing Centre",
        tagline: "Strengthening the Fabric of Community",
        description: "Supporting families through life's challenges with practical skills, kinship connections, and emergency relief. Because strong families create strong communities.",
        services: ["Parenting skills", "Budgeting support", "Emergency relief", "Kinship connection"],
        contact: "07 4791 4050"
      },
      {
        name: "Bwgcolman Way",
        tagline: "Revolutionary Self-Determination in Child Protection",
        description: "A groundbreaking delegated authority model where Palm Islanders make decisions about their own children. No longer will outsiders determine the fate of our young ones.",
        status: "Launching 2024",
        impact: "First community-controlled child protection decision-making in Queensland"
      }
    ],
    "Safety & Justice": [
      {
        name: "Safe House",
        tagline: "24/7 Sanctuary for Vulnerable Youth",
        description: "When children need protection, they find it here—not in institutions far from home, but in their community, surrounded by their culture.",
        availability: "24-hour service",
        placements: "1,439 nights of care",
        contact: "07 4791 4020"
      },
      {
        name: "Women's Service",
        tagline: "From Crisis to Empowerment",
        description: "Providing immediate safety and long-term healing for women and children escaping violence. Our 24-hour shelter is a bridge from trauma to transformation.",
        availability: "24-hour service",
        support: "Accommodation + counseling + advocacy",
        contact: "07 4791 4010"
      },
      {
        name: "Women's Healing Service",
        tagline: "Breaking Cycles, Building Futures",
        description: "Reimagined in 2024 to prevent incarceration and support reintegration. Operating from Palm Island to Townsville, we address the roots of justice involvement.",
        programs: ["Re-entry support", "Remand assistance", "Early intervention"],
        locations: "Palm Island + Townsville office"
      }
    ],
    "Economic Sovereignty": [
      {
        name: "Digital Service Centre",
        tagline: "Palm Island Connecting Australia",
        description: "21 local workers now provide customer service to First Nations people nationwide. From a remote island to a digital hub—this is economic transformation in action.",
        employees: "21 full-time positions",
        impact: "Second Indigenous digital center in Australia",
        training: "12-week TAFE course + ongoing Certificate III"
      },
      {
        name: "Social Enterprises",
        tagline: "Community Wealth Through Community Work",
        description: "Our bakery, fuel station, mechanics shop, and retail center keep money circulating locally while providing essential services. Economic sovereignty starts with meeting our own needs.",
        employees: "44 staff (record high)",
        services: ["Bakery", "Fuel station", "Mechanics", "Coffee shop", "Variety store"]
      }
    ]
  };

  const impactMetrics = [
    {
      metric: "197",
      label: "Community Members Employed",
      growth: "+30% from 2023",
      narrative: "Each job represents a family lifted, a young person seeing possibility"
    },
    {
      metric: "80%+",
      label: "Indigenous Workforce",
      sustained: "Maintained since establishment",
      narrative: "True self-determination means our people serving our people"
    },
    {
      metric: "$5.8M",
      label: "Annual Local Wages",
      impact: "$9.75M total economic output",
      narrative: "Money that stays on Palm Island, building generational wealth"
    },
    {
      metric: "2,283",
      label: "Health Clients Served",
      detail: "17,488 episodes of care",
      narrative: "Every number is a life touched, a family strengthened"
    },
    {
      metric: "16+",
      label: "Integrated Services",
      approach: "Holistic support ecosystem",
      narrative: "Because human needs don't fit in bureaucratic boxes"
    },
    {
      metric: "2021",
      label: "Community Control Achieved",
      significance: "Historic self-determination milestone",
      narrative: "The year we took our destiny into our own hands"
    }
  ];

  const historicalJourney = [
    {
      era: "Ancient Foundations",
      period: "Time Immemorial",
      description: "The Manbarra people live in harmony with the Palm Islands, their Dreamtime stories telling of Rainbow Serpent fragments forming the archipelago.",
      significance: "Cultural bedrock that sustains us still"
    },
    {
      era: "Colonial Disruption",
      period: "1914-1918",
      description: "Palm Island designated as Aboriginal reserve, then transformed into a place of forced relocation for 'troublesome' Aboriginal people from across Queensland.",
      significance: "From 57 language groups, the Bwgcolman identity emerges: 'Many tribes, one people'"
    },
    {
      era: "Resistance & Resilience",
      period: "1957",
      description: "The Magnificent Seven lead a five-day strike against oppressive conditions, facing exile but igniting a movement for dignity and rights.",
      significance: "Courage that echoes through generations"
    },
    {
      era: "Transition Period",
      period: "1975-2005",
      description: "Dormitories close, Protection Act ends, community gains local government status. Slow dismantling of colonial control structures.",
      significance: "Each victory building toward self-governance"
    },
    {
      era: "PICC Genesis",
      period: "2007",
      description: "Palm Island Community Company established with dual government-community ownership. Rachel Atkinson appointed as sole employee.",
      significance: "Planting seeds of transformation"
    },
    {
      era: "Community Sovereignty",
      period: "2021-Present",
      description: "Full community control achieved. PICC now wholly owned by Palm Islanders, becoming the island's second-largest employer.",
      significance: "Self-determination realized, but the journey continues"
    }
  ];

  const storyThemes = {
    "Hope & Aspiration": {
      description: "Forward-looking energy that positions Palm Island as a place of infinite possibility",
      voices: ["Young rangers planning marine biology careers", "Elders envisioning cultural camps", "Innovation spreading through family networks"],
      impact: "Creates aspirational momentum that draws people home"
    },
    "Pride & Accomplishment": {
      description: "Recognition that excellence isn't exceptional here—it's expected",
      voices: ["'If I can do it, you can'", "'Country provides and we witness it'", "'We feel powerful as an all-woman team'"],
      impact: "Demonstrates capability that counters every deficit narrative"
    },
    "Connection & Belonging": {
      description: "The magnetic pull of place and people that transcends geography",
      voices: ["'No place like home'", "'Every visit feels like returning'", "'We're all one people'"],
      impact: "Illustrates why investment in Palm Island multiplies through networks"
    },
    "Transformative Resilience": {
      description: "Not just surviving but alchemically transforming challenges into innovations",
      voices: ["Cost barriers become innovation catalysts", "Youth programs become leadership pipelines", "Cultural knowledge becomes contemporary solutions"],
      impact: "Positions Palm Island as a laboratory for Indigenous innovation"
    }
  };

  const futureInitiatives = [
    {
      initiative: "Storytelling Sovereignty Project",
      investment: "$50,000",
      timeline: "6 months",
      vision: "Document and preserve community narratives that reshape external perceptions and strengthen internal identity. 20-30 recorded stories will create an archive of resilience.",
      outcomes: ["Digital story archive", "6 trained community storytellers", "Foundation for expanded cultural documentation"]
    },
    {
      initiative: "Youth Digital Futures",
      investment: "$180,000",
      vision: "Expand digital literacy and create pathways from classroom to career in technology sectors. Building on Digital Service Centre success.",
      outcomes: ["60 youth trained", "Direct employment pathways", "Technology infrastructure"]
    },
    {
      initiative: "Bwgcolman Way Implementation",
      investment: "$250,000",
      vision: "Fully operationalize community-controlled child protection decision-making, keeping families together and children connected to culture.",
      outcomes: ["Trained case workers", "Cultural protocols", "Reduced child removals"]
    },
    {
      initiative: "Cultural Heritage Living Centre",
      investment: "$120,000",
      vision: "Create spaces where knowledge transmission happens naturally, where Elders teach and youth learn in culturally grounded ways.",
      outcomes: ["Documented cultural practices", "Intergenerational programs", "Cultural tourism opportunities"]
    }
  ];

  const renderVisionSection = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-8 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold mb-4">A Living Testament to Transformation</h2>
        <p className="text-xl italic leading-relaxed">
          "In the heart of the Coral Sea lies an island that refuses to be defined by its colonial past. Palm Island Community Company
          stands as proof that when a community takes control of its own destiny, transformation isn't just possible—it's inevitable.
          We see each challenge not as a barrier but as an invitation to innovate, each service not as charity but as sovereignty in action."
        </p>
        <p className="mt-4 text-lg">
          — Where ancient wisdom meets contemporary innovation, where every job created is a family strengthened, where every child
          protected is a future secured. This is PICC: Community control as revolutionary act.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-ocean-600">
          <h3 className="text-xl font-bold text-blue-900 mb-3">Our Philosophy</h3>
          <p className="text-earth-dark">
            We operate from abundance, not deficit. Every Palm Islander carries strengths, knowledge, and potential.
            Our role is to create conditions where these gifts flourish.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-green-600">
          <h3 className="text-xl font-bold text-green-900 mb-3">Our Method</h3>
          <p className="text-earth-dark">
            Integrated services that wrap around families like a warm embrace. No wrong door, no gaps to fall through—just
            seamless support that honors the complexity of human need.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-coral-600">
          <h3 className="text-xl font-bold text-purple-900 mb-3">Our Promise</h3>
          <p className="text-earth-dark">
            Every decision, every service, every innovation emerges from and returns to community. This is sovereignty
            in practice—Palm Islanders determining Palm Island futures.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-2xl font-bold text-blue-900 mb-4">The Numbers Tell a Story of Transformation</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {impactMetrics.map((metric, idx) => (
            <div key={idx} className="text-center">
              <div className="text-3xl font-bold text-blue-700">{metric.metric}</div>
              <div className="text-sm font-medium text-earth-dark">{metric.label}</div>
              <div className="text-xs text-earth-medium mt-1">{metric.growth || metric.sustained || metric.impact || metric.detail || metric.significance}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderJourneySection = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-blue-900 mb-6">From Colonial Control to Community Sovereignty</h2>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <p className="text-lg text-earth-dark leading-relaxed mb-6">
          The journey of Palm Island Community Company cannot be separated from the journey of Palm Island itself—a
          story of resilience that transforms historical trauma into contemporary triumph. Each milestone below
          represents not just an event, but a reclamation of power, dignity, and self-determination.
        </p>
      </div>

      <div className="relative">
        {historicalJourney.map((era, idx) => (
          <div key={idx} className="mb-8 flex">
            <div className="flex flex-col items-center mr-4">
              <div className="w-12 h-12 bg-ocean-medium rounded-full flex items-center justify-center text-white font-bold">
                {idx + 1}
              </div>
              {idx < historicalJourney.length - 1 && (
                <div className="w-0.5 h-full bg-blue-300 mt-2"></div>
              )}
            </div>
            <div className="flex-1 bg-white p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-blue-900">{era.era}</h3>
                <span className="text-sm font-medium bg-blue-100 text-ocean-deep px-3 py-1 rounded-full">
                  {era.period}
                </span>
              </div>
              <p className="text-earth-dark mb-2">{era.description}</p>
              <p className="text-sm italic text-earth-medium">
                <strong>Significance:</strong> {era.significance}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border-l-4 border-green-600">
        <h3 className="text-xl font-bold text-gray-800 mb-3">The Transformation Continues</h3>
        <p className="text-earth-dark">
          Today, PICC stands as the institutional embodiment of Palm Island's resilience. From a single employee
          in 2007 to nearly 200 staff in 2024, from government control to community ownership, from service
          recipient to service provider—this is what self-determination looks like in practice.
        </p>
        <p className="mt-3 font-medium text-gray-800">
          But we're not finished. The journey from survival to thrival continues, and every Palm Islander is part of writing the next chapter.
        </p>
      </div>
    </div>
  );

  // Continue with remaining render functions...
  const renderPeopleSection = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-blue-900 mb-6">The Architects of Transformation</h2>

      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <p className="text-lg text-earth-dark leading-relaxed">
          Behind every statistic is a story. Behind every service is a servant leader. These are the people who
          transform vision into reality, who carry both the weight of history and the hope of the future.
        </p>
      </div>

      {/* CEO Feature */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-8 rounded-lg shadow-xl mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-purple-900 mb-2">{leadership.name}</h3>
            <p className="text-lg font-medium text-purple-700 mb-4">{leadership.position}</p>
            <p className="text-earth-dark mb-4">{leadership.bio}</p>
            <p className="italic text-lg text-ocean-deep mb-4">"{leadership.vision}"</p>
            <div className="mt-4">
              <h4 className="font-bold text-gray-800 mb-2">Transformational Achievements:</h4>
              <ul className="space-y-1">
                {leadership.achievements.map((achievement, idx) => (
                  <li key={idx} className="flex items-start">
                    <ChevronRight className="h-4 w-4 text-coral-warm mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-sm text-earth-dark">{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Board Members Grid */}
      <h3 className="text-2xl font-bold text-ocean-deep mb-4">Board of Directors: Guardians of Community Vision</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {boardMembers.map((member, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-ocean-500 hover:shadow-xl transition-all cursor-pointer"
            onClick={() => setSelectedPerson(selectedPerson?.name === member.name ? null : member)}
          >
            <h4 className="text-lg font-bold text-blue-900">{member.name}</h4>
            <p className="text-sm font-medium text-blue-700 mb-2">{member.position}</p>
            <p className="text-sm text-earth-dark mb-2">{member.bio}</p>
            {selectedPerson?.name === member.name && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm italic text-earth-medium">
                  <strong>Vision:</strong> "{member.vision}"
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderServicesSection = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-blue-900 mb-6">An Ecosystem of Care & Capability</h2>

      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <p className="text-lg text-earth-dark leading-relaxed">
          PICC's services form an interconnected web of support that recognizes the wholeness of human experience.
          From birth to elder years, from crisis to celebration, from healing to economic empowerment—we meet our
          community wherever they are on their journey.
        </p>
      </div>

      {Object.entries(services).map(([category, categoryServices]) => (
        <div key={category} className="mb-8">
          <h3 className="text-2xl font-bold text-ocean-deep mb-4 pb-2 border-b-2 border-ocean-200">
            {category}
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {categoryServices.map((service: any, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all cursor-pointer hover:shadow-xl ${
                  expandedService === `${category}-${idx}` ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setExpandedService(expandedService === `${category}-${idx}` ? null : `${category}-${idx}`)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-xl font-bold text-blue-900">{service.name}</h4>
                      <p className="text-sm font-medium text-ocean-medium italic">{service.tagline}</p>
                    </div>
                    <ChevronRight
                      className={`h-5 w-5 text-blue-500 transition-transform ${
                        expandedService === `${category}-${idx}` ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                  <p className="text-earth-dark mt-2">{service.description}</p>

                  {expandedService === `${category}-${idx}` && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                      {service.stats && (
                        <div className="grid grid-cols-3 gap-4">
                          {Object.entries(service.stats).map(([key, value]) => (
                            <div key={key} className="text-center">
                              <div className="text-2xl font-bold text-blue-700">{value as string}</div>
                              <div className="text-xs text-earth-medium capitalize">{key}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      {service.contact && (
                        <div className="flex items-center text-sm text-earth-medium">
                          <Phone className="h-4 w-4 mr-2" />
                          {service.contact}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderImpactSection = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-blue-900 mb-6">Living Impact: Where Numbers Meet Narratives</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {impactMetrics.map((metric, idx) => (
          <div key={idx} className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-4xl font-bold text-blue-700">{metric.metric}</div>
                <div className="text-lg font-medium text-gray-800">{metric.label}</div>
              </div>
            </div>
            <div className="text-sm text-earth-dark italic mt-3 pt-3 border-t border-gray-200">
              {metric.narrative}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStoriesSection = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-blue-900 mb-6">Voices of Transformation</h2>

      {Object.entries(storyThemes).map(([theme, details]) => (
        <div key={theme} className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4">
            <h3 className="text-xl font-bold">{theme}</h3>
          </div>
          <div className="p-6">
            <p className="text-earth-dark mb-4">{details.description}</p>
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-earth-dark">{details.impact}</p>
            </div>
          </div>
        </div>
      ))}

      <div className="mt-6 text-center">
        <Link href="/stories/submit" className="inline-block bg-ocean-medium hover:bg-ocean-deep text-white px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg">
          Share Your Story
        </Link>
      </div>
    </div>
  );

  const renderFutureSection = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-blue-900 mb-6">Horizons of Possibility: The Next Chapter</h2>

      {futureInitiatives.map((initiative, idx) => (
        <div key={idx} className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">{initiative.initiative}</h3>
              <span className="bg-white text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                {initiative.investment}
              </span>
            </div>
          </div>
          <div className="p-6">
            <p className="text-earth-dark mb-4">{initiative.vision}</p>
          </div>
        </div>
      ))}

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Contact PICC</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <Phone className="h-5 w-5 text-ocean-medium mr-3" />
            <div>
              <div className="font-medium">Phone</div>
              <div className="text-sm text-earth-medium">(07) 4421 4300</div>
            </div>
          </div>
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-ocean-medium mr-3" />
            <div>
              <div className="font-medium">Email</div>
              <div className="text-sm text-earth-medium">recruitment@picc.com.au</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Palm Island Community Company</h1>
              <p className="text-xl italic">From Colonial Control to Community Sovereignty</p>
            </div>
            <div className="flex gap-4">
              <Link href="/" className="bg-white text-blue-900 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-all">
                Home
              </Link>
              <Link href="/dashboard" className="bg-blue-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-ocean-deep transition-all">
                Story Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap transition-all ${
                    activeSection === section.id
                      ? 'text-ocean-deep border-b-3 border-ocean-800 bg-blue-50'
                      : 'text-earth-medium hover:text-ocean-deep hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {activeSection === 'vision' && renderVisionSection()}
          {activeSection === 'journey' && renderJourneySection()}
          {activeSection === 'people' && renderPeopleSection()}
          {activeSection === 'services' && renderServicesSection()}
          {activeSection === 'impact' && renderImpactSection()}
          {activeSection === 'stories' && renderStoriesSection()}
          {activeSection === 'future' && renderFutureSection()}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">Palm Island Community Company</p>
            <p className="text-sm text-gray-300 italic mb-4">
              "Deeply committed to the principles of community control and self-determination."
            </p>
            <p className="text-xs text-gray-400">ACN 640 793 728 | Manbarra & Bwgcolman Country</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
