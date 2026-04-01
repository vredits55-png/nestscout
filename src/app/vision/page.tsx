import Link from "next/link";
import { ArrowLeft, Eye, Compass, Heart, Sparkles } from "lucide-react";

export const metadata = {
  title: "The Vision — NestScout",
  description: "Our vision for the future of residential discovery. NestScout is redefining how people find homes.",
};

export default function VisionPage() {
  return (
    <div className="bg-surface min-h-screen">
      {/* Hero */}
      <section className="bg-inverse-surface text-white py-24 md:py-32 px-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-xs uppercase tracking-widest font-bold mb-12 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-5xl md:text-7xl font-headline font-extrabold leading-[1.05] tracking-tight mb-8">
            The <span className="text-primary-fixed italic">Vision</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl leading-relaxed font-body">
            We believe finding a home is not a transaction — it is a deeply personal act of self-expression. NestScout exists to honour that truth.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-8 py-20 space-y-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Eye className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-3xl font-headline font-extrabold text-on-surface mb-4">Beyond Listings</h2>
            <p className="text-on-surface-variant leading-relaxed font-body">
              The conventional real estate experience reduces homes to square footage and price tags. We reject that paradigm entirely. Every space on NestScout is presented as a narrative — a story of light, material, rhythm, and possibility. We curate, we don&apos;t just catalogue.
            </p>
          </div>
          <div>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Compass className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-3xl font-headline font-extrabold text-on-surface mb-4">Guided Discovery</h2>
            <p className="text-on-surface-variant leading-relaxed font-body">
              Our platform understands that a creative professional needs different things from their space than a growing family. Through intelligent matching and editorial curation, we surface homes that resonate with who you are, not just what you can afford.
            </p>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-3xl p-12 md:p-16">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <Heart className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-3xl font-headline font-extrabold text-on-surface mb-6">The Human Element</h2>
          <p className="text-on-surface-variant leading-relaxed font-body text-lg mb-8">
            Technology is our tool, not our master. Behind every recommendation is a deep understanding of human desire — the craving for natural light in a workspace, the quiet corner where morning tea becomes ritual, the view that transforms an ordinary Tuesday into something meaningful.
          </p>
          <p className="text-on-surface-variant leading-relaxed font-body text-lg">
            We are building more than a platform. We are cultivating a community of people who believe that where you live shapes who you become.
          </p>
        </div>

        <div className="text-center py-12">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-3xl font-headline font-extrabold text-on-surface mb-6">Our Promise</h2>
          <p className="text-on-surface-variant leading-relaxed font-body text-lg max-w-2xl mx-auto">
            Every property on NestScout has been vetted, photographed with intention, and described with the care of a literary editor. We promise you will never scroll through a wall of identical, soulless listings here. Every home tells a story. We help you find yours.
          </p>
        </div>
      </section>
    </div>
  );
}
