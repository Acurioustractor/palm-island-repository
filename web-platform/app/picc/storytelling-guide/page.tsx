import {
  BookOpen, MessageSquare, Camera, FileText, Users, Shield,
  CheckCircle2, Lightbulb, Heart, Star, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Storytelling Guide | PICC',
  description: 'Guidelines for creating high-quality community stories with cultural protocols',
};

export default function StorytellingGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="py-12" style={{ backgroundColor: '#1A1A2E' }}>
        <div className="max-w-4xl mx-auto px-6">
          <Link href="/picc" className="inline-flex items-center gap-2 mb-4 text-xs uppercase font-bold tracking-widest hover:opacity-80" style={{ color: '#F5A623', letterSpacing: '0.2em' }}>
            <ArrowLeft className="w-3 h-3" />
            Dashboard
          </Link>
          <p className="uppercase font-bold mb-2" style={{ color: '#F5A623', fontSize: 11, letterSpacing: '0.3em' }}>
            PICC admin · storytelling
          </p>
          <h1 className="font-fraunces font-bold leading-tight mb-2" style={{ color: '#FBF8EE', fontSize: 'clamp(32px, 5vw, 48px)' }}>
            Storytelling guide.
          </h1>
          <p className="font-fraunces" style={{ color: '#FBF8EE', opacity: 0.85, fontSize: 18, lineHeight: 1.55 }}>
            Capture and share community stories with respect, quality, and impact.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">

        {/* Story Structure Template */}
        <Section
          icon={<FileText className="w-6 h-6 text-picc-ochre" />}
          title="Story Structure"
          description="Every good story follows this framework"
        >
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { step: '1', label: 'Headline', desc: 'Compelling, specific title (max 80 characters)' },
              { step: '2', label: 'Context', desc: 'Who, what, where — set the scene' },
              { step: '3', label: 'Impact', desc: 'What changed? What was achieved?' },
              { step: '4', label: 'Quote', desc: 'A direct voice from the community member' },
              { step: '5', label: 'Future', desc: 'What happens next? Ongoing impact.' },
            ].map(({ step, label, desc }) => (
              <div key={step} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <div className="w-8 h-8 rounded-full bg-warm-100 text-picc-ochre font-bold flex items-center justify-center mx-auto mb-2">
                  {step}
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">{label}</h4>
                <p className="text-xs text-gray-500 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Interview Prompts */}
        <Section
          icon={<MessageSquare className="w-6 h-6 text-picc-red" />}
          title="Interview Prompts"
          description="Template questions for different story types"
        >
          <div className="space-y-4">
            <PromptCategory
              title="Service Impact Story"
              color="blue"
              prompts={[
                'What brought you to this service?',
                'What was life like before you started working with us?',
                'Can you describe a moment when things started to change?',
                'What does this service mean to your family?',
                'What would you say to someone who is thinking about reaching out?',
              ]}
            />
            <PromptCategory
              title="Elder Wisdom Story"
              color="amber"
              prompts={[
                'What is one memory of Palm Island that shaped who you are?',
                'What do you want the younger generation to know about our community?',
                'How has the island changed during your lifetime?',
                'What gives you hope for the future?',
                'Is there a story about this place that you feel needs to be told?',
              ]}
            />
            <PromptCategory
              title="Youth Achievement Story"
              color="green"
              prompts={[
                'What are you most proud of achieving?',
                'Who supported you along the way?',
                'What challenges did you face and how did you overcome them?',
                'What advice would you give to other young people on Palm Island?',
                'What are your dreams for the future?',
              ]}
            />
            <PromptCategory
              title="Community Event Story"
              color="purple"
              prompts={[
                'What was the highlight of this event for you?',
                'How did the community come together for this?',
                'What does this event mean for Palm Island?',
                'What surprised you most about how it went?',
                'What would you like to see happen at the next one?',
              ]}
            />
          </div>
        </Section>

        {/* Cultural Protocols */}
        <Section
          icon={<Shield className="w-6 h-6 text-picc-ochre" />}
          title="Cultural Protocols Checklist"
          description="Follow these steps for every story, especially Elder content"
        >
          <div className="bg-picc-ochre-50 border border-picc-ochre-200 rounded-xl p-6">
            <div className="space-y-3">
              {[
                { text: 'Get verbal consent before recording or note-taking', required: true },
                { text: 'Ask about preferred name (some Elders have cultural names)', required: true },
                { text: 'Check if any part of the story involves traditional knowledge', required: true },
                { text: 'Ask about sensitivity level: can this be shared publicly?', required: true },
                { text: 'If Elder content: get written approval before publishing', required: true },
                { text: 'Confirm the storyteller is happy with how their name appears', required: true },
                { text: 'Ask if there are any photos they do NOT want used', required: false },
                { text: 'Check if the story references deceased persons (Sorry Business)', required: true },
                { text: 'Allow the storyteller to review the final version before publication', required: false },
                { text: 'Note any seasonal or ceremonial restrictions on sharing', required: false },
              ].map(({ text, required }, i) => (
                <label key={i} className="flex items-start gap-3 cursor-pointer">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    required ? 'border-picc-ochre-500' : 'border-gray-300'
                  }`}>
                    <CheckCircle2 className="w-3 h-3 text-picc-ochre-500 opacity-0" />
                  </div>
                  <span className="text-sm text-gray-700">
                    {text}
                    {required && <span className="text-picc-ochre font-medium ml-1">(Required)</span>}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </Section>

        {/* Photo Guidelines */}
        <Section
          icon={<Camera className="w-6 h-6 text-sage-600" />}
          title="Photo Guidelines"
          description="Capture moments that complement the story"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sage-600" />
                Do
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Capture genuine interactions and activities</li>
                <li>Include the landscape and environment of Palm Island</li>
                <li>Show people in their element (at work, in community)</li>
                <li>Get a mix of wide shots and close-ups</li>
                <li>Take photos in natural light when possible</li>
                <li>Always get verbal permission before photographing people</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-picc-ochre-500" />
                Cultural Considerations
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Do not photograph sacred or restricted areas without permission</li>
                <li>Be sensitive about photographing ceremonies or cultural events</li>
                <li>Check if images of deceased persons should be removed</li>
                <li>Ask Elders for preferred portrait style (formal vs candid)</li>
                <li>Avoid photographing children without parent/guardian consent</li>
                <li>Tag photos with service, event, and cultural context</li>
              </ul>
            </div>
          </div>
        </Section>

        {/* Example Stories */}
        <Section
          icon={<BookOpen className="w-6 h-6 text-picc-ochre" />}
          title="Example Stories"
          description="What great stories look like"
        >
          <div className="space-y-4">
            <ExampleStory
              title="From Crisis to Community Leader: Sarah's Journey"
              type="Service Impact"
              excerpt="When Sarah first came to the Family Wellbeing Centre, she was struggling. Three years later, she is training as a peer support worker, helping others the way she was helped. 'PICC didn't just give me a service,' she says. 'They gave me my life back.'"
              whatMakesItGreat={[
                'Clear transformation arc (before → after)',
                'Powerful direct quote',
                'Names the specific service',
                'Shows ongoing impact (now helping others)',
              ]}
            />
            <ExampleStory
              title="Elder Uncle Allan: Keeping Language Alive"
              type="Elder Wisdom"
              excerpt="For 40 years, Uncle Allan has been teaching language to Palm Island's children. 'When our young people speak our words, they carry our ancestors with them,' he says. This year, the Cultural Programs team recorded 200 phrases in partnership with Uncle Allan."
              whatMakesItGreat={[
                'Respectful Elder framing',
                'Quote that captures cultural significance',
                'Includes specific metrics (200 phrases)',
                'Links personal story to service outcomes',
              ]}
            />
          </div>
        </Section>

        {/* Quick Reference */}
        <Section
          icon={<Lightbulb className="w-6 h-6 text-orange-500" />}
          title="Quick Reference"
          description="Print this section for field staff"
        >
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-6">
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Before the Interview</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>1. Get consent (verbal minimum, written for Elders)</li>
                  <li>2. Explain where the story will be used</li>
                  <li>3. Set up recording or notes</li>
                  <li>4. Start with easy, warm-up questions</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">During the Interview</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>1. Listen more than you talk</li>
                  <li>2. Ask follow-up questions on powerful moments</li>
                  <li>3. Capture exact quotes when possible</li>
                  <li>4. Note emotional tone and body language</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">After the Interview</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>1. Write up within 24 hours (memory fades)</li>
                  <li>2. Use the AI Story Creator to draft</li>
                  <li>3. Review with storyteller before publishing</li>
                  <li>4. Upload photos with proper tags</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Story Quality Checklist</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>Has a compelling headline?</li>
                  <li>Includes at least one direct quote?</li>
                  <li>Names specific services or programs?</li>
                  <li>Shows impact (not just activities)?</li>
                </ul>
              </div>
            </div>
          </div>
        </Section>

        {/* CTA */}
        <div className="bg-gradient-to-r from-picc-ochre to-picc-red rounded-2xl p-8 text-center text-white">
          <Heart className="w-10 h-10 mx-auto mb-3 opacity-90" />
          <h3 className="text-2xl font-bold mb-2">Ready to Create a Story?</h3>
          <p className="text-white/80 mb-6">Use the AI Story Creator in the dashboard to turn interviews into polished stories.</p>
          <Link
            href="/picc/annual-report-data"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-picc-ochre rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            Open Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ icon, title, description, children }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-start gap-3 mb-4">
        <div className="mt-1">{icon}</div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function PromptCategory({ title, color, prompts }: {
  title: string;
  color: string;
  prompts: string[];
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-warm-50 border-warm-200',
    amber: 'bg-picc-ochre-50 border-picc-ochre-200',
    green: 'bg-sage-50 border-sage-200',
    purple: 'bg-warm-100 border-warm-200',
  };

  return (
    <div className={`rounded-xl border p-4 ${colorMap[color] || colorMap.blue}`}>
      <h4 className="font-semibold text-gray-900 mb-2 text-sm">{title}</h4>
      <ol className="space-y-1.5">
        {prompts.map((p, i) => (
          <li key={i} className="text-sm text-gray-700 flex gap-2">
            <span className="text-gray-400 flex-shrink-0">{i + 1}.</span>
            {p}
          </li>
        ))}
      </ol>
    </div>
  );
}

function ExampleStory({ title, type, excerpt, whatMakesItGreat }: {
  title: string;
  type: string;
  excerpt: string;
  whatMakesItGreat: string[];
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <span className="px-2 py-0.5 bg-warm-100 text-picc-ochre text-xs font-medium rounded-full flex-shrink-0">
          {type}
        </span>
      </div>
      <p className="text-sm text-gray-600 italic mb-3">{excerpt}</p>
      <div className="bg-sage-50 rounded-lg p-3">
        <h5 className="text-xs font-semibold text-sage-800 mb-1">What makes this great:</h5>
        <ul className="space-y-1">
          {whatMakesItGreat.map((item, i) => (
            <li key={i} className="text-xs text-sage-700 flex items-start gap-1.5">
              <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
