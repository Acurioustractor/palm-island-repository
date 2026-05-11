'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

import AdminImage from '@/components/admin/AdminImage';
import AdminServiceCard from '@/components/admin/AdminServiceCard';
import {
  Users, Building2, BookOpen, Quote,
  MapPin, Camera, ArrowRight, ChevronDown,
  TrendingUp, Star, Sparkles
} from 'lucide-react';
import VideoBackground from '@/components/video/VideoBackground';
import { assetUrl } from '@/lib/media/asset-url';
import { CommunityQuotesSection } from '@/components/quotes/CommunityQuotesSection';
import { MILESTONES } from '@/lib/stats/current-stats';
import type { HomeServiceData, HomeStats, InnovationProject } from './page';
import { C } from '@/components/annual-report/2024-25/almanac/tokens';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

// Animated counter hook
function useCounter(end: number, duration: number = 2) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return { count, ref };
}

function AnimatedCounter({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const { count, ref } = useCounter(value);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

function ServiceCard({ service, index }: { service: HomeServiceData; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/services/${service.slug}`} className="group block">
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-500 ease-elegant">
          <div className="aspect-[4/3] relative overflow-hidden">
            {service.coverImage ? (
              <Image
                src={service.coverImage}
                alt={service.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-elegant"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-warm-50 to-warm-100" />
            )}
            <div className="gradient-overlay-subtle" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 frosted-glass-dark rounded-full text-white text-xs font-medium mb-3">
                {service.category}
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight">{service.name}</h3>
            </div>
          </div>
          <div className="p-5">
            <p className="text-gray-600 text-sm leading-relaxed mb-4">{service.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {service.staff != null ? (
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {service.staff} staff
                  </span>
                ) : null}
                {service.photos > 0 ? (
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    {service.photos} photos
                  </span>
                ) : null}
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 transition-all duration-300 ease-elegant" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function GalleryPhotoCard({ media, index }: { media: { id: string; public_url: string; title?: string | null; alt_text?: string | null }; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group relative aspect-square overflow-hidden rounded-2xl cursor-pointer"
    >
      <AdminImage pageContext="home" pageSection="gallery" mediaId={media.id}>
        <Image
          src={media.public_url}
          alt={media.alt_text || media.title || 'Community photo'}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-elegant"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </AdminImage>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white text-sm font-medium">{media.title || media.alt_text || 'Community photo'}</p>
        </div>
      </div>
    </motion.div>
  );
}

function TimelineEra({ era, isReversed }: { era: { year: string; years: string; title: string; description: string; highlights: string[] }; isReversed: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: isReversed ? 50 : -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`flex items-center gap-8 ${isReversed ? 'flex-row-reverse' : ''}`}
    >
      <div className="flex-1">
        <div className={`bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10 ${isReversed ? 'text-right' : ''}`}>
          <span className="inline-block px-4 py-1 bg-white/10 text-warm-200 rounded-full text-sm font-medium mb-4">
            {era.years}
          </span>
          <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{era.title}</h3>
          <p className="text-warm-200 mb-4 leading-relaxed">{era.description}</p>
          <ul className={`space-y-2 ${isReversed ? 'items-end' : ''}`}>
            {era.highlights.map((h: string, i: number) => (
              <li key={i} className={`flex items-center gap-2 text-sm text-warm-100 ${isReversed ? 'flex-row-reverse' : ''}`}>
                <Star className="w-3.5 h-3.5 text-picc-ochre-400 flex-shrink-0" />
                {h}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="relative hidden md:block">
        <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
          <span className="text-white font-bold text-sm">{era.year}</span>
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-white/30 to-transparent" />
      </div>
      <div className="flex-1 hidden md:block" />
    </motion.div>
  );
}

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: 'bg-green-100', text: 'text-green-700' },
  planning: { bg: 'bg-amber-100', text: 'text-amber-700' },
  completed: { bg: 'bg-blue-100', text: 'text-blue-700' },
};

function InnovationProjectCard({ project, index }: { project: InnovationProject; index: number }) {
  const colors = statusColors[project.status] || statusColors.active;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/innovation#${project.slug}`} className="group block">
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-picc-ochre-200 hover:shadow-lg transition-all duration-500 ease-elegant">
          {/* Cover image or gradient fallback */}
          {project.coverImage ? (
            <div className="aspect-[16/9] relative overflow-hidden">
              <Image
                src={project.coverImage}
                alt={project.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-elegant"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <span className={`absolute top-3 right-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                {project.status}
              </span>
            </div>
          ) : (
            <div className="aspect-[16/9] relative bg-gradient-to-br from-picc-ochre-400 to-picc-red-400 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white opacity-60" />
              <span className={`absolute top-3 right-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                {project.status}
              </span>
            </div>
          )}
          <div className="p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight group-hover:text-picc-ochre transition-colors">
              {project.name}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">{project.tagline}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export type GalleryPhoto = {
  id: string;
  public_url: string;
  title: string | null;
  alt_text: string | null;
};

interface HomeVoice {
  text: string;
  author: string;
  theme: string | null;
  count: number;
}

interface HomeELStats {
  quotes: number;
  transcripts: number;
  storytellers: number;
}

interface HomePageClientProps {
  services: HomeServiceData[];
  stats: HomeStats;
  innovationProjects: InnovationProject[];
  galleryPhotos: GalleryPhoto[];
  voices?: HomeVoice[];
  elStats?: HomeELStats;
}

export default function HomePageClient({ services, stats, innovationProjects, galleryPhotos, voices = [], elStats }: HomePageClientProps) {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 600], [1, 1.05]);

  const timelineEras = [
    {
      year: "2009",
      years: "2009-2012",
      title: "Foundation",
      description: "PICC established with a vision for community-controlled services",
      highlights: ["PICC founded", "First services delivered", "Community foundation built"]
    },
    {
      year: "2013",
      years: "2013-2018",
      title: "Growth",
      description: "Expanding services and building infrastructure across Palm Island",
      highlights: ["Service expansion", "Infrastructure development", "Staff growth to 100+"]
    },
    {
      year: "2021",
      years: "2019-2020",
      title: "Transition",
      description: "Achieving full community control and Indigenous-led governance",
      highlights: ["Delegated authority achieved", "Full community control", "Indigenous-led governance"]
    },
    {
      year: "2025",
      years: "2021-2029",
      title: "Innovation",
      description: "Pioneering AI-powered reporting, photo studio, and youth employment",
      highlights: ["AI-powered reports", "Photo studio on Country", "The Centre recycling"]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* HERO SECTION */}
      <VideoBackground
        videoSrc={assetUrl("/video/hero-desktop-web.mp4")}
        videoSrcMobile={assetUrl("/video/hero-mobile.mp4")}
        poster={assetUrl("/video/hero-poster.jpg")}
        overlay="gradient-brand"
        height="screen"
        parallax
        fadeOnScroll
        aria-label="Palm Island Community Company hero"
      >
        <motion.div
          style={{ opacity: heroOpacity }}
          className="min-h-screen flex flex-col items-center justify-center text-center text-white px-6"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-sm md:text-base font-medium tracking-[0.2em] uppercase text-white/70 mb-6"
          >
            Manbarra & Bwgcolman Country
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold leading-[0.95] tracking-[-0.02em] mb-8"
          >
            Palm Island
            <br />
            <span className="bg-gradient-to-r from-picc-red-300 via-picc-ochre-300 to-picc-red-300 bg-clip-text text-transparent">
              Community Company
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed mb-12"
          >
            We tell our own stories, measure our own impact, and control our own data — community-led since 2009.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link
              href="/stories"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-base hover:scale-[0.97] active:scale-95 transition-all duration-300 ease-elegant shadow-2xl shadow-black/20"
            >
              Our Stories
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300 ease-elegant" />
            </Link>
            <Link
              href="/share-voice"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full font-semibold text-base hover:bg-white/20 transition-all duration-300 ease-elegant"
            >
              Share Your Voice
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center text-white/40"
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </motion.div>
        </motion.div>
      </VideoBackground>

      {/* IMPACT NUMBERS */}
      <section style={{ backgroundColor: '#FFFFFF', borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
          >
            {[
              { value: stats.totalStaff, label: 'Staff members', icon: Users, color: C.turtleRed },
              { value: stats.serviceCount, label: 'Services', icon: Building2, color: C.ochre },
              { value: stats.totalPhotos, label: 'Photos captured', icon: Camera, color: C.turtleRed },
              { value: stats.storyCount, label: 'Community stories', suffix: '+', icon: BookOpen, color: C.ochre },
            ].map((stat) => (
              <motion.div key={stat.label} variants={fadeInUp} className="text-center">
                <stat.icon className="w-5 h-5 mx-auto mb-3" style={{ color: stat.color }} />
                <div
                  className="font-fraunces font-bold leading-none"
                  style={{ color: C.ocean, fontSize: 'clamp(36px, 5vw, 56px)' }}
                >
                  <AnimatedCounter value={stat.value} suffix={stat.suffix || ''} />
                </div>
                <div
                  className="font-bold uppercase mt-3"
                  style={{ color: C.driftwood, fontSize: 11, letterSpacing: '0.25em' }}
                >
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="editorial-section" style={{ backgroundColor: C.shell }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-3xl mb-16"
          >
            <p
              className="font-bold uppercase mb-4"
              style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
            >
              {stats.serviceCount} integrated services
            </p>
            <h2
              className="font-fraunces font-bold mb-5"
              style={{ color: C.ocean, fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1.1 }}
            >
              How PICC supports the community
            </h2>
            <p
              className="font-fraunces"
              style={{ color: C.driftwood, fontSize: 'clamp(16px, 2vw, 19px)', lineHeight: 1.55 }}
            >
              Comprehensive, culturally-informed support across every aspect of community life.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {services.map((service, index) => (
              <AdminServiceCard key={service.slug} serviceSlug={service.slug}>
                <ServiceCard service={service} index={index} />
              </AdminServiceCard>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ease: [0.22, 1, 0.36, 1] }}
            className="mt-12 text-center"
          >
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-bold uppercase text-xs hover:opacity-90 transition"
              style={{ backgroundColor: C.ocean, color: '#FBF8EE', letterSpacing: '0.15em' }}
            >
              See all {stats.serviceCount} services
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* COMMUNITY VOICES — Empathy Ledger */}
      {voices && voices.length > 0 && (
        <section
          className="editorial-section text-white overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${C.ocean}, #0a3f57 60%, ${C.midnight})` }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <p
                className="font-bold uppercase mb-4"
                style={{ color: C.ochre, fontSize: 11, letterSpacing: '0.3em' }}
              >
                Empathy Ledger · Sovereign voices
              </p>
              <h2
                className="font-fraunces font-bold mb-6"
                style={{ fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1.1 }}
              >
                Every voice belongs to its speaker
              </h2>
              <p
                className="font-fraunces max-w-2xl mx-auto"
                style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'clamp(16px, 2vw, 19px)', lineHeight: 1.6 }}
              >
                {elStats?.quotes || 525} community voices captured, analysed, and stored in
                sovereign infrastructure. The community owns the narrative.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {voices.slice(0, 6).map((voice, index) => (
                <motion.blockquote
                  key={`${voice.author}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-7 hover:bg-white/10 hover:border-picc-ochre/40 transition-all"
                >
                  <div className="text-picc-ochre text-5xl font-serif leading-none mb-2 absolute top-4 left-6 opacity-30">
                    &ldquo;
                  </div>
                  <p className="font-serif italic text-base md:text-lg leading-relaxed mb-4 mt-4 line-clamp-5">
                    {voice.text}
                  </p>
                  <footer className="flex items-center justify-between border-t border-white/10 pt-3">
                    <div>
                      <p className="text-sm font-semibold text-picc-ochre">{voice.author}</p>
                      {voice.theme && (
                        <p className="text-xs text-white/40 mt-0.5 capitalize">
                          {voice.theme.replace(/_/g, ' ')}
                        </p>
                      )}
                    </div>
                    {voice.count > 1 && (
                      <span className="text-xs text-white/30">{voice.count} quotes</span>
                    )}
                  </footer>
                </motion.blockquote>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-14 flex flex-col md:flex-row items-center justify-center gap-6 text-center"
            >
              <div className="grid grid-cols-3 gap-8 md:gap-12">
                <div>
                  <div className="font-fraunces font-bold leading-none" style={{ color: C.ochre, fontSize: 'clamp(28px, 4vw, 40px)' }}>{elStats?.quotes || 525}</div>
                  <div className="font-bold uppercase mt-3" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, letterSpacing: '0.3em' }}>Quotes</div>
                </div>
                <div>
                  <div className="font-fraunces font-bold leading-none" style={{ color: C.ochre, fontSize: 'clamp(28px, 4vw, 40px)' }}>{elStats?.transcripts || 116}</div>
                  <div className="font-bold uppercase mt-3" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, letterSpacing: '0.3em' }}>Transcripts</div>
                </div>
                <div>
                  <div className="font-fraunces font-bold leading-none" style={{ color: C.ochre, fontSize: 'clamp(28px, 4vw, 40px)' }}>{elStats?.storytellers || 50}+</div>
                  <div className="font-bold uppercase mt-3" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, letterSpacing: '0.3em' }}>Voices</div>
                </div>
              </div>
            </motion.div>

            <div className="mt-10 text-center">
              <Link
                href="/picc/pcap"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-md font-bold uppercase text-xs hover:opacity-90 transition"
                style={{ backgroundColor: C.ochre, color: C.ocean, letterSpacing: '0.15em' }}
              >
                Explore data sovereignty
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* INNOVATION & SPECIAL PROJECTS */}
      <section className="editorial-section" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-3xl mb-12"
          >
            <p
              className="font-bold uppercase mb-4"
              style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
            >
              Innovation &amp; special projects
            </p>
            <h2
              className="font-fraunces font-bold mb-5"
              style={{ color: C.ocean, fontSize: 'clamp(32px, 4.5vw, 48px)', lineHeight: 1.1 }}
            >
              Community-led innovation
            </h2>
            <p
              className="font-fraunces"
              style={{ color: C.driftwood, fontSize: 'clamp(16px, 2vw, 19px)', lineHeight: 1.55 }}
            >
              Pioneering projects that create employment, preserve culture, and build community sovereignty.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {innovationProjects.map((project, index) => (
              <InnovationProjectCard key={project.slug} project={project} index={index} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 text-center"
          >
            <Link
              href="/innovation"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-bold uppercase text-xs hover:opacity-90 transition"
              style={{ backgroundColor: C.ocean, color: '#FBF8EE', letterSpacing: '0.15em' }}
            >
              Explore all innovation projects
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* MEDIA GALLERY SECTION */}
      <section className="editorial-section" style={{ backgroundColor: C.shell }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-3xl mb-16"
          >
            <p
              className="font-bold uppercase mb-4"
              style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
            >
              Community media
            </p>
            <h2
              className="font-fraunces font-bold mb-5"
              style={{ color: C.ocean, fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1.1 }}
            >
              {stats.totalPhotos > 0 ? `${stats.totalPhotos.toLocaleString()} moments captured` : 'Moments captured'}
            </h2>
            <p
              className="font-fraunces"
              style={{ color: C.driftwood, fontSize: 'clamp(16px, 2vw, 19px)', lineHeight: 1.55 }}
            >
              Real programs, real people, real impact across our services.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {galleryPhotos.length > 0 ? (
              galleryPhotos.map((media, index) => (
                <GalleryPhotoCard key={media.id} media={media} index={index} />
              ))
            ) : (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-gradient-to-br from-warm-50 to-warm-100" />
              ))
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 flex flex-wrap justify-center gap-6"
          >
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-bold uppercase text-xs hover:opacity-90 transition"
              style={{ backgroundColor: C.ocean, color: '#FBF8EE', letterSpacing: '0.15em' }}
            >
              Browse stories
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 20-YEAR JOURNEY SECTION */}
      <section className="editorial-section bg-gradient-to-br from-picc-earth-700 via-picc-earth to-picc-red text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-3xl mb-16"
          >
            <p
              className="font-bold uppercase mb-4"
              style={{ color: C.ochre, fontSize: 11, letterSpacing: '0.3em' }}
            >
              Road to 20 years
            </p>
            <h2
              className="font-fraunces font-bold mb-5"
              style={{ fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1.1 }}
            >
              Our journey to 2029
            </h2>
            <p
              className="font-fraunces"
              style={{ color: 'rgba(248, 233, 200, 0.75)', fontSize: 'clamp(16px, 2vw, 19px)', lineHeight: 1.55 }}
            >
              From Hull River to community control — {MILESTONES.currentYear} years down, {MILESTONES.yearsRemaining} to go.
            </p>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <div className="flex justify-between text-sm text-picc-ochre-300/60 mb-3">
              <span>2009</span>
              <span className="font-medium text-white/80">{MILESTONES.progressPct}%</span>
              <span>2029</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${MILESTONES.progressPct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="h-full bg-gradient-to-r from-picc-red to-picc-ochre rounded-full"
              />
            </div>
          </motion.div>

          {/* Timeline */}
          <div className="space-y-12 md:space-y-16">
            {timelineEras.map((era, index) => (
              <TimelineEra key={era.year} era={era} isReversed={index % 2 === 1} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <Link
              href="/20-years"
              className="inline-flex items-center gap-3 px-6 py-3 rounded-md font-bold uppercase text-xs hover:opacity-90 transition"
              style={{ backgroundColor: '#FFFFFF', color: C.ocean, letterSpacing: '0.15em' }}
            >
              Explore full timeline
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* COMMUNITY VOICES — Dynamic quotes carousel */}
      <CommunityQuotesSection
        featured
        limit={6}
        variant="carousel"
      />

      {/* FINAL CTA */}
      <section className="editorial-section" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-16"
          >
            <p
              className="font-bold uppercase mb-4"
              style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
            >
              Add your voice
            </p>
            <h2
              className="font-fraunces font-bold mb-5"
              style={{ color: C.ocean, fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1.1 }}
            >
              Be part of the story
            </h2>
            <p
              className="font-fraunces max-w-2xl mx-auto"
              style={{ color: C.driftwood, fontSize: 'clamp(16px, 2vw, 19px)', lineHeight: 1.55 }}
            >
              Every Palm Islander has a voice. Share yours and help document our community&apos;s journey to 20 years.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            <motion.div variants={fadeInUp}>
              <Link
                href="/services"
                className="group block p-8 bg-gray-50 rounded-2xl hover:shadow-lg transition-all duration-500 ease-elegant hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-picc-red rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 ease-elegant">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">Explore Services</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{stats.serviceCount} services mapped across Palm Island</p>
                <span className="animated-underline inline-flex items-center gap-1.5 text-picc-red font-semibold text-sm">
                  View Map <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Link
                href="/impact"
                className="group block p-8 bg-gray-50 rounded-2xl hover:shadow-lg transition-all duration-500 ease-elegant hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-picc-ochre rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 ease-elegant">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">View Impact</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">Community impact data and annual report insights</p>
                <span className="animated-underline inline-flex items-center gap-1.5 text-picc-ochre font-semibold text-sm">
                  See Dashboard <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Link
                href="/share-voice"
                className="group block p-8 bg-gray-50 rounded-2xl hover:shadow-lg transition-all duration-500 ease-elegant hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-picc-red rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 ease-elegant">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">Share Your Story</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">Join {stats.storyCount}+ community storytellers</p>
                <span className="animated-underline inline-flex items-center gap-1.5 text-picc-red font-semibold text-sm">
                  Get Started <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
