"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Search,
  Shield,
  MapPin,
  Star,
  ArrowRight,
  Zap,
  Building,
  Users,
} from "lucide-react";

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="bg-white">
      {/* ================== FLOOR 1: HERO (stays pinned, gets covered) ================== */}
      <section className="h-screen sticky top-0 z-0 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 mesh-bg" />

        {/* Animated Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-light/20 rounded-full blur-[100px] animate-breathe mix-blend-multiply" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px] animate-breathe delay-500 mix-blend-multiply" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full text-center pt-24">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-primary font-medium animate-float">
              <Zap className="w-4 h-4 text-cta" />
              <span>The Future of Premium Rentals</span>
            </div>

            <h1 className="text-6xl sm:text-8xl font-bold leading-[1.05] mb-8 text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-light to-accent animate-fade-in-up">
              Discover spaces that feel alive.
            </h1>

            <p className="text-xl text-text-muted max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up delay-150">
              Experience the next generation of housing exploration with real-time dynamic mapping, verified owners, and immersive property tours.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-300">
              <Link href="/search" className="btn btn-primary sm:w-auto w-full group text-lg px-8 py-4">
                <Search className="w-5 h-5 mr-2" />
                Explore Rentals
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/register?role=provider" className="btn btn-ghost sm:w-auto w-full text-lg px-8 py-4">
                List Your Property
              </Link>
            </div>
          </div>

          {/* Floating Glass Cards */}
          <div className="mt-16 relative h-[350px] w-full max-w-5xl mx-auto hidden md:block">
            <div className="absolute top-8 left-[8%] glass p-4 rounded-2xl w-64 animate-float delay-150 transform -rotate-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-light/20 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-bold">Downtown Loft</div>
                  <div className="text-xs text-text-muted">$3,200/mo</div>
                </div>
              </div>
            </div>

            <div className="absolute top-4 right-[12%] glass p-4 rounded-2xl w-72 animate-float delay-300 transform rotate-3">
              <div className="w-full h-28 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 mb-3" />
              <div className="h-2 w-3/4 bg-border rounded-full mb-2" />
              <div className="h-2 w-1/2 bg-border rounded-full" />
            </div>

            <div className="absolute bottom-8 left-[30%] glass p-6 rounded-3xl w-96 animate-float delay-500 z-20 shadow-glow">
              <h3 className="text-xl font-bold mb-2">Verified Owner</h3>
              <p className="text-sm text-text-muted">Instant direct messaging enabled for this premium property.</p>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-breathe">
            <span className="text-xs text-text-muted font-medium uppercase tracking-widest">Scroll Down</span>
            <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center pt-2">
              <div className="w-1.5 h-3 bg-primary rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* ================== FLOOR 2: VALUE PROP (slides over hero) ================== */}
      <section className="min-h-screen sticky top-0 z-10 bg-white shadow-[0_-30px_60px_rgba(0,0,0,0.08)] flex items-center">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cta/5 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full py-20">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-5xl font-bold mb-4">Why choose NestScout?</h2>
            <p className="text-text-muted text-lg">Built differently from the ground up.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Guaranteed Security",
                desc: "Every listing and user is cryptographically verified to eliminate scams entirely.",
              },
              {
                icon: MapPin,
                title: "Dynamic Exploration",
                desc: "Our active map interface pulses with life, showing you real-time rental availability.",
              },
              {
                icon: Star,
                title: "Zero Middlemen",
                desc: "Connect instantly with landlords through our secure internal messaging matrix.",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="nest-card p-8"
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mb-6 shadow-glow transition-transform hover:scale-110 duration-300">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-text-muted leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Stats row */}
          <motion.div
            className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {[
              { value: "10k+", label: "Active Listings" },
              { value: "25k+", label: "Happy Tenants" },
              { value: "99%", label: "Verified Owners" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">{stat.value}</div>
                <div className="text-sm text-text-muted font-medium mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================== FLOOR 3: CTA (slides over value prop) ================== */}
      <section className="min-h-[80vh] sticky top-0 z-20 flex items-center justify-center bg-primary shadow-[0_-30px_60px_rgba(0,0,0,0.15)] overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center mix-blend-overlay opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-primary/80" />

        <motion.div
          className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-5xl font-bold mb-8 text-white drop-shadow-md">
            Ready to shape the future of living?
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of tenants and landlords already on the NestScout network.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/register?role=client" className="btn btn-cta text-lg px-8 py-4">
              Start Searching
            </Link>
            <Link href="/register?role=provider" className="btn btn-ghost text-lg px-8 py-4 !border-white/30 !text-white hover:!bg-white/10 hover:!border-white">
              List a Property
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Spacer to allow last sticky to unstick */}
      <div className="h-20 bg-primary relative z-20" />
    </div>
  );
}
