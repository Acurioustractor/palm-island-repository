/**
 * PICC Knowledge Base
 * Comprehensive data about Palm Island Community Company
 * Used for AI context, report generation, and the Empathy Ledger
 */

export const PICC_KNOWLEDGE_BASE = {
  // Organization Identity
  organization: {
    name: "Palm Island Community Company",
    short_name: "PICC",
    acn: "640 793 728",
    type: "Not-for-profit community-controlled organization",
    tagline: "Our Community, Our Future, Our Way",
    mission: "Making Palm Island a safer, stronger and more prosperous place to live",
    vision: "Palm Islanders determining their own futures with access to the services they need and deserve",
    website: "https://www.picc.com.au",
    location: {
      island: "Great Palm Island",
      region: "Palm Island Group",
      distance_from_townsville: "65km north",
      state: "Queensland",
      country: "Australia"
    },
    transition_to_community_control: "30 September 2021",
    founding_principle: "Aboriginal and Torres Strait Islander community-controlled organization"
  },

  // Historical Context
  history: {
    traditional_owners: "Manbarra (Manburra) people",
    bwgcolman_meaning: "Many tribes - 42 language groups brought together",
    reserve_gazetted: "20 June 1914",
    hull_river_connection: {
      original_settlement: "Hull River Aboriginal Settlement",
      location: "Present-day Mission Beach area",
      established: 1914,
      built_on: "Djiru people's land",
      population_peak: 490,
      malaria_deaths_1917: 200,
      cyclone_date: "10 March 1918",
      cyclone_details: "Category 5 cyclone crossed coast at Innisfail, winds 240-288 km/h, 305mm rain",
      transfer_to_palm: "June 1918"
    },
    removals_documented: {
      period: "1918-1972",
      total_documented: 3950,
      furthest_origins: ["Brisbane", "Cloncurry"],
      language_groups: 42
    },
    stolen_generations: {
      mentioned_in: "Bringing Them Home Report (1997)",
      description: "Institution that housed children removed from families"
    },
    key_dates: [
      { year: 1914, event: "Palm Island gazetted as Aboriginal reserve" },
      { year: 1914, event: "Hull River Settlement established" },
      { year: 1918, event: "Hull River destroyed by cyclone, residents transferred to Palm Island" },
      { year: 1972, event: "End of documented removals period" },
      { year: 2021, event: "PICC transitions to full community control" },
      { year: 2023, event: "Delegated Authority blueprint launched" },
      { year: 2024, event: "First 1,000 Days program established" }
    ]
  },

  // Leadership
  leadership: {
    board_members: [
      { name: "Luella Bligh", role: "Chair" },
      { name: "Rhonda Phillips", role: "Director" },
      { name: "Allan Palm Island", role: "Director" },
      { name: "Matthew Lindsay", role: "Company Secretary" },
      { name: "Harriet Hulthen", role: "Director" },
      { name: "Raymond W. Palmer Snr", role: "Director" },
      { name: "Cassie Lang", role: "Director" }
    ],
    ceo: "Rachel Atkinson",
    governance: "Community-controlled - only Palm Islanders as members"
  },

  // Services (18 programs)
  services: [
    {
      name: "Bwgcolman Healing Service",
      category: "health",
      description: "Culturally appropriate medical and healing services"
    },
    {
      name: "Community Justice Group",
      category: "justice",
      description: "Justice-focused community program"
    },
    {
      name: "Children and Family Centre",
      category: "family",
      description: "Family support tailored for Palm Island's young population",
      presentations: [
        "The Storyline of the Palm Island Children and Family Centre (SNAICC 2023)",
        "Proud Bwgcolman Youth (SNAICC 2023)"
      ]
    },
    {
      name: "Diversionary Service",
      category: "justice",
      description: "Intervention and diversion programs"
    },
    {
      name: "Family Care Service",
      category: "family",
      description: "Comprehensive family support services",
      metrics: {
        placement_nights_2024: 6698
      }
    },
    {
      name: "Family Participation Program",
      category: "family",
      description: "Community engagement and family participation initiative"
    },
    {
      name: "Family Wellbeing Centre",
      category: "health",
      description: "Wellness support for families"
    },
    {
      name: "Integrated Team Care",
      category: "health",
      description: "Coordinated care approach for chronic disease management"
    },
    {
      name: "NDIS Connector Service",
      category: "disability",
      description: "Remote Community Connector helping Palm Islanders access NDIS",
      location: "Upstairs in new Retail Centre, Palm Island",
      townsville_office: "Aitkenvale (collocated with Women's Healing Service)"
    },
    {
      name: "Safe Haven Service",
      category: "crisis",
      description: "Crisis support for children",
      metrics: {
        children_supported_2024: 1187
      }
    },
    {
      name: "Safe House",
      category: "crisis",
      description: "Residential safety program",
      metrics: {
        placement_nights_2024: 1439
      }
    },
    {
      name: "Social and Emotional Wellbeing",
      category: "health",
      description: "Mental health and wellbeing services"
    },
    {
      name: "Social Enterprises",
      category: "economic",
      description: "Employment and economic development programs",
      staff: 44
    },
    {
      name: "Specialist Domestic and Family Violence Service",
      category: "safety",
      description: "Violence prevention, intervention and support"
    },
    {
      name: "Telstra Digital Service Centre",
      category: "economic",
      description: "Employment program and digital connectivity",
      staff: 21,
      capacity: 30,
      partners: ["Telstra", "Advance Queensland", "Deadly Innovation Strategy", "State of Queensland Digital Economy Strategy"],
      training: "12-week TAFE + 5-week Telstra + Cert III Business",
      languages_supported: 50
    },
    {
      name: "Women's Healing Service",
      category: "health",
      description: "Gender-specific healing and support",
      locations: ["Palm Island", "Aitkenvale, Townsville"]
    },
    {
      name: "Women's Service",
      category: "family",
      description: "Women-focused support programs"
    },
    {
      name: "Youth Services",
      category: "youth",
      description: "Programs for young people"
    },
    {
      name: "Medical Services",
      category: "health",
      description: "Primary healthcare including GP services, child health, maternal health"
    },
    {
      name: "First 1,000 Days Program",
      category: "health",
      description: "Intensive support for families during critical first 1,000 days of child's life",
      launched: "April 2024",
      team: ["Child health nurse", "Aboriginal health worker", "GP (maternal and child health focus)"]
    }
  ],

  // Key Programs
  key_programs: {
    delegated_authority: {
      name: "Bwgcolman Way: Empowered and Resilient",
      vision: "All Manbarra and Bwgcolman children are safe and cared for by family, nurtured by strong and enduring connections to their community, culture and Country",
      legislative_reference: "Child Protection Act 1999 (Qld) Sections 148BA and 148BB(3)",
      significance: "Community now decides care arrangements for children who cannot stay at home",
      blueprint: "Reclaiming our Storyline (launched April 2023)",
      funding: "$107.8 million over 4 years (2023-2028)"
    },
    digital_service_centre: {
      name: "Telstra Digital Service Centre",
      partners: ["Telstra", "Advance Queensland", "Deadly Innovation Strategy", "State of Queensland Digital Economy Strategy"],
      training_pathway: "12-week TAFE + 5-week Telstra + Cert III Business",
      languages_supported: 50,
      staff: 21,
      capacity: 30
    },
    early_childhood: {
      children_supported_q1_q2: 711
    }
  },

  // Statistics (2023-2024)
  statistics: {
    staff: {
      total_2022: 152,
      total_2023: 151,
      total_2024: 197,
      growth_rate: "30%",
      growth_10_years: "3x increase",
      social_enterprises_staff: 44,
      digital_centre_staff: 21,
      aboriginal_tsi_percentage: "80%+",
      palm_island_residents_percentage: "70%+",
      note: "Three-quarters of workforce are Palm Islanders - extraordinarily high for remote communities"
    },
    financial: {
      income: 23400335,
      total_expenditure: 23678058,
      net_result: -277723,
      breakdown: {
        labour_costs: { amount: 14282962, percentage: 60 },
        admin_expenses: { amount: 5000820, percentage: 21 },
        travel_training: { amount: 1778367, percentage: 8 },
        client_costs: { amount: 1156713, percentage: 5 },
        property_energy: { amount: 1058084, percentage: 4 },
        motor_vehicle: { amount: 401112, percentage: 2 }
      },
      turnover_growth: "Quadrupled in 10 years"
    },
    balance_sheet: {
      total_assets: 10858764,
      current_assets: 8156480,
      non_current_assets: 2702284,
      total_liabilities: 7320523,
      current_liabilities: 5969264,
      non_current_liabilities: 1351259,
      net_assets: 3538241,
      total_equity: 3538241
    },
    health_service: {
      total_clients: 2283,
      aboriginal_tsi_clients: 1935,
      non_aboriginal_clients: 108,
      unknown_clients: 30,
      episodes_of_care: 17488,
      aboriginal_tsi_episodes: 16675,
      non_aboriginal_episodes: 627,
      unknown_episodes: 186,
      health_checks_715: 779,
      child_health_checks: 128,
      gp_management_plans: 293,
      team_care_arrangements: 308
    },
    service_metrics: {
      safe_house_placement_nights: 1439,
      family_care_placement_nights: 6698,
      safe_haven_children_supported: 1187,
      early_childhood_children_q1_q2: 711,
      total_services: 16
    },
    community_demographics: {
      youth_percentage: 32, // aged 14 or younger
      qld_average_youth: 19.4,
      elderly_percentage: 3.2, // aged 65+
      note: "Large youth population drives focus on children and family services"
    }
  },

  // Accreditations
  accreditations: [
    {
      name: "Human Services Quality Framework",
      status: "Accredited",
      interim_audit: "November 2023",
      full_audit_due: 2025
    },
    {
      name: "RACGP Quality Practice Accreditation",
      status: "Renewed 2024",
      next_renewal: 2027
    }
  ],

  // Conferences & Presentations
  conferences: [
    {
      name: "SNAICC Conference",
      year: 2023,
      location: "Darwin",
      presentations: [
        "The Storyline of the Palm Island Children and Family Centre",
        "Proud Bwgcolman Youth"
      ]
    }
  ],

  // Partnerships
  partnerships: [
    "Queensland Government",
    "NIAA (National Indigenous Australians Agency)",
    "Queensland Health",
    "Telstra",
    "Advance Queensland",
    "Northern Queensland Primary Health Network",
    "QATSICPP (Queensland Aboriginal and Torres Strait Islander Child Protection Peak)"
  ],

  // News & Media (2024)
  recent_news: [
    {
      date: "February 2024",
      title: "Annual General Meeting",
      description: "AGM held 27 February 2024, elections for Member-Elected Directors"
    },
    {
      date: "April 2024",
      title: "First 1,000 Days Program Launch",
      description: "New program ensuring Indigenous families get quicker access to care during crucial first 1,000 days",
      source: "https://nit.com.au/09-04-2024/10711/new-program-in-townsville-and-palm-island-ensures-timely-care-for-indigenous-families"
    },
    {
      date: "2023-2024",
      title: "Staff Growth",
      description: "Staff increased by 30% to 197 employees, three-quarters are Palm Islanders"
    },
    {
      date: "2023-2024",
      title: "Delegated Authority Implementation",
      description: "Community now decides care arrangements for children - decades-long goal achieved"
    }
  ],

  // Cultural Context
  cultural_context: {
    traditional_name: "Bwgcolman",
    meaning: "Many tribes",
    language_groups: 42,
    original_peoples: "Manbarra people",
    cultural_principles: [
      "Self-determination",
      "Community control",
      "Cultural connection",
      "Family-centered care",
      "Elder guidance",
      "Country connection"
    ],
    stolen_generations_impact: "Palm Island mentioned in Bringing Them Home Report as institution housing removed children"
  },

  // Contact Information
  contact: {
    address: "Palm Island, Queensland, Australia",
    phone: "Contact via website",
    website: "https://www.picc.com.au",
    townsville_office: "Aitkenvale (NDIS and Women's Healing Service)"
  }
};

// Helper function to get all service names
export function getAllServices(): string[] {
  return PICC_KNOWLEDGE_BASE.services.map(s => s.name);
}

// Helper function to get services by category
export function getServicesByCategory(category: string) {
  return PICC_KNOWLEDGE_BASE.services.filter(s => s.category === category);
}

// Helper function to get key statistics summary
export function getStatisticsSummary() {
  const stats = PICC_KNOWLEDGE_BASE.statistics;
  return {
    staff_2024: stats.staff.total_2024,
    palm_islander_staff_percentage: stats.staff.palm_island_residents_percentage,
    total_income: stats.financial.income,
    health_clients: stats.health_service.total_clients,
    episodes_of_care: stats.health_service.episodes_of_care,
    children_in_safe_haven: stats.service_metrics.safe_haven_children_supported,
    total_services: stats.service_metrics.total_services
  };
}

// Helper function to generate executive summary
export function generateExecutiveSummary(): string {
  return `Palm Island Community Company (PICC) has had another transformative year in 2023-2024. As the only Aboriginal and Torres Strait Islander community-controlled organisation on Palm Island, we continue to deliver essential services while advancing self-determination.

Key achievements this year include:
- Staff growth of 30% to ${PICC_KNOWLEDGE_BASE.statistics.staff.total_2024} employees, with ${PICC_KNOWLEDGE_BASE.statistics.staff.palm_island_residents_percentage} being Palm Islanders
- Implementation of Delegated Authority under the Child Protection Act - a decades-long goal achieved
- Launch of the First 1,000 Days program for maternal and child health
- Health service delivery to ${PICC_KNOWLEDGE_BASE.statistics.health_service.total_clients.toLocaleString()} clients with ${PICC_KNOWLEDGE_BASE.statistics.health_service.episodes_of_care.toLocaleString()} episodes of care
- Support for ${PICC_KNOWLEDGE_BASE.statistics.service_metrics.safe_haven_children_supported.toLocaleString()} children through Safe Haven
- Revenue of $${(PICC_KNOWLEDGE_BASE.statistics.financial.income / 1000000).toFixed(1)} million

Our ${PICC_KNOWLEDGE_BASE.statistics.service_metrics.total_services} services span health, family support, justice, disability, crisis intervention, and economic development - all delivered by community members for community members.

${PICC_KNOWLEDGE_BASE.organization.tagline}`;
}

export default PICC_KNOWLEDGE_BASE;
