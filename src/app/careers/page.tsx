import Link from "next/link";
import { ArrowLeft, Briefcase, Code, PenTool, TrendingUp, Users } from "lucide-react";

export const metadata = {
  title: "Careers — NestScout",
  description: "Join the team redefining residential discovery. Open positions at NestScout.",
};

const openings = [
  {
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    location: "Remote (India / Global)",
    type: "Full-Time",
    icon: Code,
    description: "Build the core platform powering curated real estate discovery. Next.js, Supabase, and modern TypeScript stack.",
  },
  {
    title: "Editorial Curator",
    department: "Content",
    location: "Remote",
    type: "Full-Time",
    icon: PenTool,
    description: "Write compelling property narratives and manage listing quality. Background in lifestyle journalism or creative writing preferred.",
  },
  {
    title: "Growth & Partnerships Lead",
    department: "Business",
    location: "Delhi NCR, India",
    type: "Full-Time",
    icon: TrendingUp,
    description: "Drive provider acquisition and strategic partnerships. You will be the bridge between NestScout and the real estate ecosystem.",
  },
  {
    title: "Community Manager",
    department: "Operations",
    location: "Remote",
    type: "Part-Time",
    icon: Users,
    description: "Foster and nurture our growing community of tenants and property providers. Handle feedback, moderation, and engagement.",
  },
];

export default function CareersPage() {
  return (
    <div className="bg-surface min-h-screen">
      {/* Hero */}
      <section className="bg-inverse-surface text-white py-24 md:py-32 px-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-xs uppercase tracking-widest font-bold mb-12 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-5xl md:text-7xl font-headline font-extrabold leading-[1.05] tracking-tight mb-8">
            <span className="text-primary-fixed italic">Careers</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl leading-relaxed font-body">
            We are building the future of how people discover living spaces. If you believe homes deserve more than a listing page, you belong here.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-4xl mx-auto px-8 py-16">
        <div className="bg-surface-container-low rounded-3xl p-10 md:p-14 mb-16">
          <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-6">Why NestScout?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl mb-3">🌍</div>
              <h3 className="font-bold text-on-surface mb-1 font-headline">Remote-First</h3>
              <p className="text-sm text-on-surface-variant font-body">Work from anywhere. We care about impact, not office hours.</p>
            </div>
            <div>
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="font-bold text-on-surface mb-1 font-headline">Early Stage</h3>
              <p className="text-sm text-on-surface-variant font-body">Shape the product, culture, and direction from day one.</p>
            </div>
            <div>
              <div className="text-3xl mb-3">✨</div>
              <h3 className="font-bold text-on-surface mb-1 font-headline">Design-Led</h3>
              <p className="text-sm text-on-surface-variant font-body">Aesthetics and user experience are first-class citizens here.</p>
            </div>
          </div>
        </div>

        {/* Openings */}
        <h2 className="text-3xl font-headline font-extrabold text-on-surface mb-8">Open Positions</h2>
        <div className="space-y-6">
          {openings.map((job) => (
            <div key={job.title} className="bg-surface-container-lowest rounded-2xl p-8 hover:-translate-y-1 transition-transform duration-300 shadow-sm border border-outline-variant/10">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <job.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-headline font-extrabold text-on-surface">{job.title}</h3>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-full">{job.department}</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full">{job.location}</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full">{job.type}</span>
                  </div>
                  <p className="text-on-surface-variant mt-3 font-body">{job.description}</p>
                </div>
                <a
                  href="mailto:sandarbhs102@gmail.com?subject=Application: ${job.title}"
                  className="btn-primary whitespace-nowrap shrink-0"
                >
                  Apply Now
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* General */}
        <div className="mt-16 text-center py-12 bg-surface-container-low rounded-3xl">
          <Briefcase className="w-10 h-10 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-headline font-extrabold text-on-surface mb-3">Don&apos;t see your role?</h3>
          <p className="text-on-surface-variant font-body mb-6 max-w-md mx-auto">
            We are always looking for exceptional people. Send us your portfolio and tell us why you&apos;d be a great fit.
          </p>
          <a href="mailto:sandarbhs102@gmail.com?subject=General Application — NestScout" className="btn-primary">
            Reach Out →
          </a>
        </div>
      </section>
    </div>
  );
}
