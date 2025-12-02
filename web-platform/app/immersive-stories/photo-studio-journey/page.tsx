import {
  StoryContainer,
  HeroSection,
  TextSection,
  SideBySideSection,
  QuoteSection,
  ParallaxSection,
  TimelineSection,
  FullBleedImage,
  ImageGallery,
  ScrollReveal,
} from '@/components/story-scroll';
import Link from 'next/link';
import { ArrowLeft, Camera } from 'lucide-react';

export const metadata = {
  title: 'Palm Island Photo Studio - Our Journey',
  description: 'The story of how Palm Island built an on-Country professional photography studio, capturing our stories on our terms.',
};

export default function PhotoStudioJourneyPage() {
  const timelineEvents = [
    {
      date: 'January 2023',
      title: 'Community Consultation',
      description: 'Elders and community members gathered to discuss the vision for an on-Country photography studio. The consensus was clear: we needed to control how our stories are told.',
      isComplete: true,
    },
    {
      date: 'March 2023',
      title: 'Funding Secured',
      description: 'After presenting our vision to local and federal funding bodies, we secured the resources needed to bring the studio to life.',
      isComplete: true,
    },
    {
      date: 'June 2023',
      title: 'Equipment Arrives',
      description: 'Professional cameras, lighting equipment, and editing workstations arrived on Palm Island. Community members trained in photography celebrated this milestone.',
      isComplete: true,
    },
    {
      date: 'September 2023',
      title: 'First Portrait Sessions',
      description: 'The studio opened its doors for community portrait sessions. Over 50 families had professional photos taken in the first month.',
      isComplete: true,
    },
    {
      date: 'December 2023',
      title: 'Youth Training Program',
      description: 'Young community members completed their first photography training module, learning both technical skills and cultural protocols.',
      isComplete: true,
    },
    {
      date: 'March 2024',
      title: 'First Exhibition',
      description: 'Community photographs were exhibited at the mainland gallery, showcasing Palm Island life through our own lens.',
      isComplete: true,
    },
  ];

  const galleryImages = [
    {
      url: '/images/placeholder-1.jpg',
      alt: 'Elder with grandchildren',
      caption: 'Three generations captured together for the first time',
    },
    {
      url: '/images/placeholder-2.jpg',
      alt: 'Youth photography student',
      caption: 'Young photographer learning the craft',
    },
    {
      url: '/images/placeholder-3.jpg',
      alt: 'Studio interior',
      caption: 'Professional lighting setup in the studio',
    },
    {
      url: '/images/placeholder-4.jpg',
      alt: 'Community portrait',
      caption: 'Family portrait session',
    },
    {
      url: '/images/placeholder-5.jpg',
      alt: 'Cultural photography',
      caption: 'Traditional ceremony documented with respect',
    },
    {
      url: '/images/placeholder-6.jpg',
      alt: 'Landscape photo',
      caption: 'Palm Island through our lens',
    },
  ];

  return (
    <StoryContainer>
      {/* Back button */}
      <div className="fixed top-8 left-8 z-50">
        <Link
          href="/picc/projects/photo-studio"
          className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg transition-all text-gray-900 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Project</span>
        </Link>
      </div>

      {/* Hero Section */}
      <HeroSection
        title="Our Stories, Our Lens"
        subtitle="How Palm Island built a professional photography studio on Country"
        backgroundImage="/images/hero-placeholder.jpg"
        height="screen"
        overlay="gradient"
        textPosition="center"
      >
        <div className="mt-8">
          <Camera className="w-16 h-16 text-white mx-auto" />
        </div>
      </HeroSection>

      {/* Opening Text */}
      <TextSection
        title="A New Chapter in Visual Storytelling"
        content={
          <>
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              For too long, our stories have been told through someone else's camera,
              filtered through someone else's perspective. The Palm Island Photo Studio
              changes that forever.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              This isn't just about photography—it's about sovereignty. It's about
              controlling our narrative, preserving our culture, and showing the world
              who we really are, on our own terms.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              This is the story of how a community came together to build something
              extraordinary: a professional photography studio on Palm Island, run by
              our people, for our people.
            </p>
          </>
        }
        backgroundColor="bg-white"
        maxWidth="medium"
      />

      {/* First Quote */}
      <QuoteSection
        quote="Every photo tells two stories: what you see, and who's behind the camera. Now both stories are ours."
        author="Elder Mary Johnson"
        role="Community Storyteller & Studio Patron"
        size="large"
      />

      {/* Parallax Break */}
      <ParallaxSection
        backgroundImage="/images/landscape-placeholder.jpg"
        speed={0.5}
        height="h-[60vh]"
      >
        <div className="text-center">
          <ScrollReveal direction="up">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Professional Equipment
            </h2>
            <p className="text-2xl text-white/90">
              On Country, For Country
            </p>
          </ScrollReveal>
        </div>
      </ParallaxSection>

      {/* Side by Side: The Vision */}
      <SideBySideSection
        title="The Vision Was Clear"
        mediaUrl="/images/meeting-placeholder.jpg"
        mediaType="image"
        mediaPosition="right"
        backgroundColor="bg-gray-50"
        content={
          <>
            <p className="mb-4">
              In early 2023, community elders gathered to discuss a pressing concern:
              our stories were being told, but not by us. Journalists would visit,
              take photos, and leave. We rarely saw the final stories, and when we
              did, they often missed the mark.
            </p>
            <p className="mb-4">
              "We need our own camera," one elder said. "Our own studio. Our own way
              of showing the world who we are."
            </p>
            <p>
              That simple statement sparked a movement. Within weeks, a committee
              formed. Funding applications were written. Training programs were
              designed. The Palm Island Photo Studio was more than a dream—it was
              becoming a plan.
            </p>
          </>
        }
      />

      {/* Timeline */}
      <TimelineSection
        title="The Journey to Opening Day"
        events={timelineEvents}
        backgroundColor="bg-white"
      />

      {/* Full Bleed Image */}
      <FullBleedImage
        imageUrl="/images/equipment-placeholder.jpg"
        alt="Professional photography equipment"
        caption="$120,000 worth of professional equipment, all operated by trained community members"
        height="tall"
        parallax={true}
      />

      {/* Side by Side: The Impact */}
      <SideBySideSection
        title="More Than Just Photos"
        mediaUrl="/images/family-placeholder.jpg"
        mediaType="image"
        mediaPosition="left"
        backgroundColor="bg-white"
        content={
          <>
            <p className="mb-4">
              Within the first three months, over 200 families had professional
              portraits taken. Many were first-time professional photos for families
              who had never had the opportunity—or the $500+ cost—to have them taken
              elsewhere.
            </p>
            <p className="mb-4">
              But the studio's impact goes deeper than portraits. It's become a hub
              for cultural documentation. Ceremonies, previously off-limits to outside
              photographers, are now being carefully documented by trained community
              members who understand protocols and respect.
            </p>
            <p>
              Young people are learning skills that translate to careers. Three youth
              have already secured photography internships off-island, armed with
              professional portfolios built right here.
            </p>
          </>
        }
      />

      {/* Second Quote */}
      <QuoteSection
        quote="My great-grandmother never had a photo. My grandmother has one. My mother has a few. Now my children have hundreds—all taken with respect, all telling our truth."
        author="Sarah Williams"
        role="Mother of four & Studio Volunteer"
        backgroundColor="bg-gradient-to-br from-purple-50 to-pink-50"
        size="medium"
      />

      {/* Gallery */}
      <ImageGallery
        title="Through Our Lens: First Year Highlights"
        images={galleryImages}
        columns={3}
        backgroundColor="bg-gray-50"
      />

      {/* Text Section: Looking Forward */}
      <TextSection
        title="Looking to the Future"
        subtitle="This is just the beginning"
        content={
          <>
            <p className="text-lg mb-4">
              The Photo Studio is already expanding. A mobile unit will soon travel
              to outstations, bringing professional photography to elders who can't
              make it to the main facility. A darkroom is being built for film
              photography enthusiasts who want to learn traditional techniques.
            </p>
            <p className="text-lg mb-4">
              Plans are underway for a photo archive—a digital repository of Palm
              Island life, controlled by the community, with strict protocols around
              who can access what. Cultural knowledge holders are working with
              photographers to ensure sensitive material is protected while
              important stories are preserved.
            </p>
            <p className="text-lg mb-4">
              The studio is also becoming a model. Three other communities have
              visited to learn how we did it. The blueprint is being shared, the
              lessons documented. What started as one community's vision is becoming
              a movement.
            </p>
            <p className="text-lg font-semibold text-gray-900">
              This is what sovereignty looks like. This is what self-determination
              means. Through a camera lens, Palm Island is writing its own story.
            </p>
          </>
        }
        backgroundColor="bg-white"
        maxWidth="medium"
      />

      {/* Parallax Closing */}
      <ParallaxSection
        backgroundImage="/images/sunset-placeholder.jpg"
        speed={0.3}
        height="h-screen"
      >
        <div className="text-center">
          <ScrollReveal direction="up">
            <h2 className="text-6xl md:text-7xl font-bold text-white mb-6">
              Our Land
            </h2>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-8">
              Our Stories
            </h3>
            <h3 className="text-4xl md:text-5xl font-bold text-white">
              Our Camera
            </h3>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.6}>
            <div className="mt-12">
              <Link
                href="/picc/projects/photo-studio"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 font-bold text-lg rounded-full shadow-2xl transition-all"
              >
                <span>Visit the Project Page</span>
                <Camera className="w-5 h-5" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </ParallaxSection>

      {/* Footer Note */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <ScrollReveal direction="up">
            <p className="text-gray-400 mb-4">
              The Palm Island Photo Studio is a community initiative supported by
              local and federal funding, with ongoing operations managed entirely by
              community members.
            </p>
            <p className="text-gray-500 text-sm">
              All photographs used with permission from the families pictured.
              Cultural protocols observed in all documentation.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </StoryContainer>
  );
}
