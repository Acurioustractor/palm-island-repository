import React, { useState } from 'react';

const PICCDashboard = () => {
  const [activeTab, setActiveTab] = useState('about');

  const tabs = [
    { id: 'about', label: 'About PICC' },
    { id: 'people', label: 'People' },
    { id: 'programs', label: 'Programs' },
    { id: 'history', label: 'Palm Island Journey' }
  ];

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <header className="bg-blue-800 text-white p-4 rounded-t-lg shadow">
        <h1 className="text-2xl font-bold text-center">Palm Island Community Company (PICC)</h1>
        <p className="text-center italic mt-1">Community-Controlled Organization Serving Great Palm Island</p>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-gray-300 bg-white">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === tab.id 
                ? 'text-blue-800 border-b-2 border-blue-800 font-bold' 
                : 'text-gray-600 hover:text-blue-800'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white p-6 rounded-b-lg shadow">
        {activeTab === 'about' && <AboutTab />}
        {activeTab === 'people' && <PeopleTab />}
        {activeTab === 'programs' && <ProgramsTab />}
        {activeTab === 'history' && <HistoryTab />}
      </div>
    </div>
  );
};

const AboutTab = () => {
  const stats = [
    { label: 'Staff Members', value: '197', prevValue: '151', year: '2024', prevYear: '2023' },
    { label: 'Aboriginal Staff', value: '80%+', description: 'of staff identify as Aboriginal or Torres Strait Islander' },
    { label: 'Local Residents', value: '70%+', description: 'of staff live on Palm Island' },
    { label: 'Services Provided', value: '16+', description: 'different services across health, family, and community' },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-blue-800 mb-4">About PICC</h2>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
        <p className="italic">
          "Everything we do is for, with, and because of the people of this beautiful community."
          <span className="font-bold block mt-1">— Rachel Atkinson, CEO</span>
        </p>
      </div>

      <p className="mb-4">
        The Palm Island Community Company (PICC) was established in 2007 and has grown to become a key service provider and employer on Palm Island. In 2021, PICC achieved full community control, becoming completely owned by community members - a significant milestone in the journey toward self-determination.
      </p>

      <h3 className="text-lg font-bold text-blue-700 mt-6 mb-2">Mission</h3>
      <p className="mb-4">
        PICC's mission is to deliver human and social services, build community capacity, and stimulate economic development on Palm Island while honoring the cultural heritage of both the Manbarra (traditional owners) and Bwgcolman peoples.
      </p>

      <h3 className="text-lg font-bold text-blue-700 mt-6 mb-2">Key Achievements</h3>
      <ul className="list-disc list-inside mb-4 ml-4 space-y-1">
        <li>Transition to full community control in September 2021</li>
        <li>Growth from a single employee to nearly 200 staff members</li>
        <li>Renamed the Primary Health Centre to Bwgcolman Healing Service</li>
        <li>Established the Palm Island Digital Service Centre in 2023</li>
        <li>Development of the delegated authority "Bwgcolman Way" service</li>
        <li>Remodelled Women's Healing Service to better serve women</li>
      </ul>

      <h3 className="text-lg font-bold text-blue-700 mt-6 mb-3">PICC By The Numbers</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <div className="text-3xl font-bold text-blue-800">{stat.value}</div>
            <div className="text-sm font-medium text-gray-600">{stat.label}</div>
            {stat.description && <div className="text-xs text-gray-500 mt-1">{stat.description}</div>}
            {stat.prevValue && (
              <div className="text-xs text-gray-500 mt-1">
                Up from {stat.prevValue} in {stat.prevYear}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-bold text-blue-700 mb-2">Acknowledgement of Country</h3>
        <p className="text-sm italic">
          "The Palm Island Community Company acknowledges the Traditional Owners of Palm Island, the Manbarra people. We also acknowledge the many First Nations persons who were forcibly removed to Palm Island, and we recognise these persons and their descendants as the historical Bwgcolman people. We recognise the continued connection of the Manbarra and Bwgcolman peoples to the land and waters of this beautiful island. We pay respect to Manbarra and Bwgcolman Elders, their ancestors, all First Nations peoples, and our ancestors who walk in the Dreamtime."
        </p>
      </div>
    </div>
  );
};

const PeopleTab = () => {
  const boardMembers = [
    {
      name: "Luella Bligh",
      position: "Chair",
      description: "As PICC Chairperson, Luella played a pivotal role in the organization's transition to community control. She emphasized that the transition was successful because 'PICC was already operating with a majority local board and up to 90% local workforce.'"
    },
    {
      name: "Allan Palm Island",
      position: "Traditional Owner Director (Manbarra)",
      description: "Holds the significant position of Traditional Owner Director representing the Manbarra people. Born into the cultural traditions of the Palm Island area, he began learning about his culture from his father at age eight, particularly the stories of the Nanggarra Wanggarra people."
    },
    {
      name: "Rhonda Phillips",
      position: "Director",
      description: "With PICC since its 2007 establishment, Rhonda brings over 40 years of experience across community, public, and academic sectors. Her expertise in indigenous governance and service integration has proven invaluable, particularly as she has chaired both the Governance Committee and Finance and Risk Committee."
    },
    {
      name: "Harriet Hulthen",
      position: "Director",
      description: "Born and raised on Palm Island, Harriet brings extensive experience from her work with the Townsville Aboriginal and Islander Legal Service. She has served on numerous boards and was appointed Official Visitor to Stuart Creek Correctional Facility for over 12 years."
    },
    {
      name: "Raymond W. Palmer Snr",
      position: "Director",
      description: "A proud Bwgcolman man who has lived on Palm Island his entire life. Raymond is a father to nine children and grandfather to many. His work history includes Aged Care, Road Works, and Education. He is currently employed as a Teachers Aide at Bwgcolman Community School."
    },
    {
      name: "Matthew Lindsay",
      position: "Company Secretary",
      description: "A Certified Practicing Accountant–Fellow (FCPA) and Graduate of the Australian Institute of Company Directors. His strategic advice and support complement the community knowledge of other board members."
    },
    {
      name: "Cassie Lang",
      position: "Director",
      description: "Contributes 14 years of legal expertise in Native Title and Indigenous Cultural Heritage matters as Founder & Principal Solicitor at Parallax Legal."
    }
  ];

  const executiveTeam = [
    {
      name: "Rachel Atkinson",
      position: "Chief Executive Officer",
      description: "A proud Yorta Yorta woman with deep connections to her Aboriginal heritage, Rachel has served as PICC's CEO since its inception in 2007, transforming it from a single-employee operation to the island's largest non-government employer. Her leadership philosophy stems from her family lineage of tireless activists, including her great uncle William Cooper and Sir Douglas Nicholls."
    }
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-blue-800 mb-4">People of PICC</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-bold text-blue-700 mb-3">Executive Leadership</h3>
        <div className="grid grid-cols-1 gap-4">
          {executiveTeam.map((person, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <h4 className="text-lg font-bold text-blue-800">{person.name}</h4>
                  <p className="text-sm font-medium text-gray-600">{person.position}</p>
                </div>
              </div>
              <p className="mt-2 text-sm">{person.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-blue-700 mb-3">Board Members</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {boardMembers.map((person, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div>
                <h4 className="text-md font-bold text-blue-800">{person.name}</h4>
                <p className="text-sm font-medium text-gray-600">{person.position}</p>
              </div>
              <p className="mt-2 text-sm">{person.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProgramsTab = () => {
  const serviceCategories = [
    {
      category: "Health Services",
      services: [
        {
          name: "Bwgcolman Healing Service",
          description: "Primary healthcare services providing comprehensive medical care to the Palm Island community. The service passed a Quality Practice Accreditation assessment in 2024, with special mention of outstanding cleanliness and professional standards."
        },
        {
          name: "Social and Emotional Wellbeing Service",
          description: "Mental health and wellbeing support integrated with the Bwgcolman Healing Service."
        },
        {
          name: "NDIS Service",
          description: "Support for individuals with disabilities, connecting participants to community resources and providing assistance with NDIS planning."
        }
      ]
    },
    {
      category: "Family and Children Services",
      services: [
        {
          name: "Children and Family Centre (CFC)",
          description: "Offers playgroup sessions, early childhood education, family and parenting support, and child and maternal health services. Located at Beach Road in the Blue Building."
        },
        {
          name: "Family Wellbeing Centre",
          description: "Provides support for families in need, including parenting skills development, kinship connection, budgeting assistance, household skills training, and Emergency Relief Payments."
        },
        {
          name: "Family Care Service",
          description: "Support services for families experiencing challenges, with a focus on maintaining family unity and well-being."
        },
        {
          name: "Family Participation Program",
          description: "Family-focused program aimed at strengthening family relationships and building parenting capacity."
        }
      ]
    },
    {
      category: "Safety and Support Services",
      services: [
        {
          name: "Safe House",
          description: "Provides 24-hour residential care for children and young people in need of protection and support."
        },
        {
          name: "Safe Haven",
          description: "A supportive environment for children and young people to access services and activities that promote well-being and safety."
        },
        {
          name: "Women's Service (Women's Shelter)",
          description: "Offers temporary accommodation for women and children experiencing domestic and family violence, operating 24 hours a day."
        },
        {
          name: "Women's Healing Service",
          description: "Remodeled in 2024, this service provides support to women who are in, or at risk of entering, the Townsville Women's Correctional Centre through various programs including Re-entry, Women on Remand, and Early Intervention."
        },
        {
          name: "Specialist Domestic and Family Violence Service",
          description: "A dedicated team focused on reducing domestic and family violence, working with both victims and users of violence to provide counseling and support programs."
        },
        {
          name: "Community Justice Group",
          description: "Provides legal and justice support services to Palm Island residents navigating the criminal justice system."
        },
        {
          name: "Diversionary Service",
          description: "Intervention and diversion programs aimed at reducing contact with the criminal justice system."
        },
        {
          name: "Youth Service",
          description: "Programs for young people including the Young Offenders Support Service, Indigenous Youth Connection to Culture Program, and Tackling Indigenous Smoking program."
        }
      ]
    },
    {
      category: "Employment and Economic Development",
      services: [
        {
          name: "Digital Service Centre",
          description: "Established in 2023, this Telstra call center employs Palm Island residents to provide sales and customer service for Telstra products to Aboriginal and Torres Strait Islander customers across Australia."
        },
        {
          name: "Social Enterprises",
          description: "Includes a bakery, fuel station, mechanics workshop, and the Community Coffee Shop and Variety Store, providing essential services and employment opportunities on the island."
        },
        {
          name: "Blue Card Liaison Officer",
          description: "Created in 2024, this position supports organizations and community members with all matters relating to Blue Cards, helping to increase engagement with the Blue Card system."
        }
      ]
    }
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-blue-800 mb-4">PICC Programs and Services</h2>
      
      <p className="mb-6">
        Palm Island Community Company offers a comprehensive range of services designed to meet the needs of the Palm Island community. From healthcare to family support, safety services to economic development, PICC's programs aim to improve quality of life and create opportunities for Palm Islanders.
      </p>
      
      {serviceCategories.map((category, index) => (
        <div key={index} className="mb-6">
          <h3 className="text-lg font-bold text-blue-700 mb-3 border-b border-blue-200 pb-1">{category.category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {category.services.map((service, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <h4 className="text-md font-bold text-blue-800">{service.name}</h4>
                <p className="mt-2 text-sm">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 mt-6">
        <h4 className="font-bold text-blue-800">New "Bwgcolman Way" Service</h4>
        <p className="text-sm mt-1">
          PICC is developing a groundbreaking service called "Bwgcolman Way: Empowered and Resilient" that brings delegated authority to Palm Island. This approach will allow Palm Islanders to make decisions about children in care within their community, strengthening family and cultural connections. This service represents a significant step forward in self-determination and contributes to the goal of reducing the disproportionate number of Aboriginal and Torres Strait Islander children in out-of-home care.
        </p>
      </div>
    </div>
  );
};

const HistoryTab = () => {
  const timelineEvents = [
    {
      year: "Pre-European",
      title: "Traditional Ownership",
      description: "The Manbarra people (also known as Wulgurukaba) are the traditional owners of Great Palm Island. In their Dreamtime beliefs, the Palm Island group was formed when fragments of the Rainbow Serpent broke apart. They spoke two dialects: Buluguyban and Mulgu."
    },
    {
      year: "1770",
      title: "European Naming",
      description: "Captain James Cook named the 'Palm Isles' during his exploration of Australia's east coast."
    },
    {
      year: "1914",
      title: "Aboriginal Reserve Establishment",
      description: "Palm Island was officially gazetted as an Aboriginal reserve on June 20, though few Aboriginal people lived there initially."
    },
    {
      year: "1918",
      title: "Forced Relocation Begins",
      description: "The formal settlement was established when residents from the Hull River Aboriginal Settlement, destroyed by a cyclone, were relocated to Palm Island. From this point, Palm Island became a place where Aboriginal people from throughout Queensland were forcibly relocated."
    },
    {
      year: "1920s-30s",
      title: "Growth as a Penal Colony",
      description: "Queensland's Chief Protector J.W. Bleakley designated Palm Island as 'a penitentiary for troublesome cases.' The population grew from 200 to 1,630 individuals, representing at least 57 different language groups from across Queensland and the Torres Strait Islands."
    },
    {
      year: "1957",
      title: "Strike 57: Resistance",
      description: "The 1957 strike marked a watershed moment in Palm Island's history. Seven men (Albie Geia, Willie Thaiday, Eric Lymburner, Sonny Sibley, Bill Congoo, George Watson, and Gordon Tapau) organized a community-wide strike against harsh conditions. They were arrested at gunpoint and exiled to different settlements across Queensland."
    },
    {
      year: "1975",
      title: "Children's Dormitories Closed",
      description: "The children's dormitories, which had operated since 1922, were officially closed."
    },
    {
      year: "1985",
      title: "End of Government Control",
      description: "The Queensland Government relinquished control and passed title to the Palm Island Community Council via a Deed of Grant in Trust (DOGIT). Palm Island Aboriginal Council was established with five elected councillors."
    },
    {
      year: "2005",
      title: "Local Government Status",
      description: "The Council became the Palm Island Aboriginal Shire Council, gaining the same legal status as other local councils in Queensland."
    },
    {
      year: "2007",
      title: "PICC Established",
      description: "Palm Island Community Company was established through a dual shareholder model, with the Queensland Government and Palm Island Aboriginal Shire Council each holding 50% ownership. Rachel Atkinson was appointed as the first CEO and sole employee."
    },
    {
      year: "2014-2021",
      title: "PICC Growth Period",
      description: "PICC expanded significantly, growing to approximately 100 staff with 95% being local Palm Islanders. The organization began working toward full community control."
    },
    {
      year: "2021",
      title: "Full Community Control Achieved",
      description: "On September 30, after years of lobbying, all services, workforce, and assets were transferred to a new company that maintained the Palm Island Community Company name but was now fully owned by Palm Islanders. This represented a significant advancement toward self-determination."
    },
    {
      year: "2023",
      title: "Digital Service Centre Opens",
      description: "PICC established the Palm Island Digital Service Centre, creating new employment opportunities for Palm Islanders in telecommunications."
    },
    {
      year: "2024",
      title: "Continued Growth",
      description: "PICC continues to expand, with 197 staff members (up from 151 in 2023) and 16+ services across health, family support, and community development. The organization is developing the 'Bwgcolman Way' delegated authority service, representing another step toward self-determination."
    }
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-blue-800 mb-4">Palm Island's Journey</h2>
      
      <p className="mb-6">
        The story of Palm Island and PICC exemplifies the journey from colonial control to Indigenous self-determination. 
        Despite facing ongoing challenges stemming from historical injustices, the community demonstrates remarkable 
        resilience and determination in building a future grounded in cultural strength and self-governance.
      </p>

      <div className="relative border-l-2 border-blue-500 ml-4">
        {timelineEvents.map((event, index) => (
          <div key={index} className="mb-8 ml-6">
            <div className="absolute -left-3 mt-1.5 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white text-xs">{index + 1}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold bg-blue-100 text-blue-800 inline-block px-2 py-1 rounded w-fit">
                {event.year}
              </span>
              <h3 className="text-lg font-bold text-blue-700 mt-1">{event.title}</h3>
              <p className="text-sm mt-1">{event.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mt-6">
        <h3 className="text-lg font-bold text-blue-700 mb-2">The Bwgcolman People</h3>
        <p className="text-sm">
          The diverse group of displaced people from at least 57 different language groups who were forcibly relocated 
          to Palm Island became known collectively as the Bwgcolman people—meaning "many tribes – one people." 
          Today, Palm Island's population is about 2,138 people, with 89.7% identifying as Indigenous Australians. 
          The cultural significance of the island is multifaceted—for the Manbarra people, it has deep spiritual 
          significance as part of their Dreamtime story; for the Bwgcolman people, it represents both a place of 
          historical trauma and a symbol of resilience and survival.
        </p>
      </div>
    </div>
  );
};

export default PICCDashboard;
