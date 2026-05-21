"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  ArrowRight,
} from "lucide-react";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [listUrl, setListUrl] = useState("/register?role=provider");
  
  // Conditionally check if the current user is already a provider
  // so the 'List a Property' button smartly redirects them to their dashboard
  useEffect(() => {
    const checkRole = async () => {
       import("@/lib/supabase/client").then(({ createClient }) => {
         const supabase = createClient();
         supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
              supabase.from("profiles").select("role").eq("id", user.id).single()
               .then(({ data }) => {
                 if (data?.role === "provider") {
                   setListUrl("/provider/dashboard");
                 }
               });
            }
         });
       });
    };
    checkRole();
  }, []);

  return (
    <div className="bg-surface">
      {/* ================== HERO SECTION ================== */}
      <section className="relative px-8 py-12 md:py-24 max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[90vh]">
        <div className="lg:col-span-6 space-y-8 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-headline font-extrabold text-on-surface leading-[1.05] tracking-tight">
            Find a home that <span className="text-primary italic">speaks</span> to you.
          </h1>
          <p className="text-xl text-on-surface-variant max-w-lg leading-relaxed animate-fade-in-up delay-75">
            Moving beyond listings. We curate living spaces that reflect your personality, values, and vision for the future.
          </p>

          {/* Editorial Search Bar Link (Instead of building full search form here) */}
          <div className="bg-surface-container-lowest rounded-xl p-3 ambient-glow flex flex-col md:flex-row gap-4 items-center animate-fade-in-up delay-150">
            <div className="flex-1 w-full flex items-center gap-3 px-4 border-b-2 border-transparent transition-all">
              <MapPin className="text-outline w-5 h-5 block" />
              <input readOnly className="w-full bg-transparent border-none focus:ring-0 py-3 text-on-surface placeholder:text-outline-variant cursor-pointer" placeholder="Where to?" type="text" onClick={() => window.location.href='/search'}/>
            </div>
            <Link href="/search" className="editorial-gradient text-on-primary w-full md:w-auto px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              <Search className="w-5 h-5 block" />
              Search Options
            </Link>
          </div>
        </div>
        
        <div className="lg:col-span-6 relative animate-slide-right delay-200">
          <div className="grid grid-cols-2 gap-4">
            <img alt="Luxury home exterior" className="w-full h-80 object-cover arch-mask-left shadow-2xl" src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"/>
            <img alt="Modern living room" className="w-full h-80 object-cover rounded-xl translate-y-12 shadow-ambient" src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80"/>
          </div>
          {/* Decorative Elements */}
          <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-surface-container-low rounded-full blur-[100px] opacity-70 animate-breathe"></div>
        </div>
      </section>

      {/* ================== TRUST BANNER ================== */}
      <section className="bg-inverse-surface py-16 mt-12 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="text-surface-variant font-headline text-lg uppercase tracking-widest opacity-60">Featured &amp; Trusted By</div>
          <div className="flex flex-wrap justify-center gap-12 grayscale opacity-40">
            <div className="text-white text-2xl font-black italic">ARCH-DIGEST</div>
            <div className="text-white text-2xl font-black italic">DWELL</div>
            <div className="text-white text-2xl font-black italic">VOGUE LIVING</div>
            <div className="text-white text-2xl font-black italic">CURBED</div>
          </div>
        </div>
      </section>

      {/* ================== TESTIMONIALS (Editorial Style) ================== */}
      <section className="bg-surface-container-low py-24 px-8 overflow-hidden">
        <div className="max-w-[1440px] mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface mb-4">Stories of Belonging.</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto italic">How our members found more than just a roof over their heads.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Testimonial 1 */}
            <motion.div 
              className="bg-surface-container-lowest p-10 rounded-2xl ambient-glow flex flex-col md:flex-row gap-8 items-start hover:-translate-y-2 transition-transform duration-500"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <img alt="Sarah Jenkins" className="w-24 h-24 rounded-full object-cover grayscale" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"/>
              <div className="space-y-4">
                <div className="flex text-primary">
                  {Array.from({length: 5}).map((_, i) => (
                    <span key={i} className="text-xl leading-none">★</span>
                  ))}
                </div>
                <p className="text-lg leading-relaxed text-on-surface-variant italic font-body">
                    &ldquo;NestScout didn&apos;t just show me houses. They understood my need for natural light and creative energy. The curator I worked with found a loft that has completely transformed my workflow.&rdquo;
                </p>
                <div>
                  <p className="font-bold text-on-surface font-headline">Sarah Jenkins</p>
                  <p className="text-sm text-outline uppercase tracking-widest font-bold">Creative Director</p>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div 
              className="bg-surface-container-lowest p-10 rounded-2xl ambient-glow flex flex-col md:flex-row gap-8 items-start hover:-translate-y-2 transition-transform duration-500"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <img alt="Marcus Thorne" className="w-24 h-24 rounded-full object-cover grayscale border-2 border-surface-container-high" src="https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=200&q=80"/>
              <div className="space-y-4">
                <div className="flex text-primary">
                  {Array.from({length: 5}).map((_, i) => (
                    <span key={i} className="text-xl leading-none">★</span>
                  ))}
                </div>
                <p className="text-lg leading-relaxed text-on-surface-variant italic font-body">
                    &ldquo;The editorial approach to real estate is refreshing. Every property recommended felt hand-picked for my specific lifestyle. It&apos;s the highest level of service I&apos;ve experienced.&rdquo;
                </p>
                <div>
                  <p className="font-bold text-on-surface font-headline">Marcus Thorne</p>
                  <p className="text-sm text-outline uppercase tracking-widest font-bold">Tech Founder</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================== CTA SECTION ================== */}
      <section className="bg-surface py-24 px-8 relative overflow-hidden">
         <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.h2 
              className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Ready to shape the future of living?
            </motion.h2>
            <motion.div 
              className="flex flex-col sm:flex-row justify-center gap-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link href="/search" className="btn btn-primary text-lg px-8 py-4">
                Start Searching
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href={listUrl} className="btn btn-ghost text-lg px-8 py-4">
                List a Property
              </Link>
            </motion.div>
         </div>
         {/* Decorative blob */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-0"></div>
      </section>

      {/* ================== FOOTER ================== */}
      <footer className="bg-inverse-surface text-on-primary-container">
        <div className="w-full py-16 px-8 flex flex-col md:flex-row justify-between items-start max-w-[1440px] mx-auto gap-12">
          <div className="space-y-6 max-w-sm">
            <div className="text-white font-bold text-3xl font-headline flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white shadow-xl p-0.5">
                <img src="/logo.png" alt="NestScout Logo" className="w-full h-full object-contain" />
              </div>
              NestScout
            </div>
            <p className="text-white/60 leading-relaxed font-body">
                Curating the world&apos;s most evocative living spaces for the modern individual. A new standard in residential discovery.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-16 md:gap-24 w-full md:w-auto">
            <div className="space-y-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest font-headline">Company</h4>
            <nav className="flex flex-col gap-3 font-body">
              <Link className="text-white/60 hover:text-primary-fixed transition-colors text-sm uppercase tracking-widest font-semibold" href="/vision">The Vision</Link>
              <Link className="text-white/60 hover:text-primary-fixed transition-colors text-sm uppercase tracking-widest font-semibold" href="/standards">Editorial Standards</Link>
              <Link className="text-white/60 hover:text-primary-fixed transition-colors text-sm uppercase tracking-widest font-semibold" href="/careers">Careers</Link>
            </nav>
            </div>
            <div className="space-y-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest font-headline">Support</h4>
            <nav className="flex flex-col gap-3 font-body">
              <div className="flex flex-col gap-1">
                <Link className="text-white/60 hover:text-primary-fixed transition-colors text-sm uppercase tracking-widest font-semibold" href="/contact">Contact Us</Link>
                <a href="mailto:sandarbhs102@gmail.com" className="text-white/40 hover:text-white transition-colors text-xs">sandarbhs102@gmail.com</a>
                <a href="tel:+916387360511" className="text-white/40 hover:text-white transition-colors text-xs">+91 638 736 0511</a>
              </div>
              <Link className="text-white/60 hover:text-primary-fixed transition-colors text-sm uppercase tracking-widest font-semibold mt-2" href="/privacy">Privacy Policy</Link>
              <Link className="text-white/60 hover:text-primary-fixed transition-colors text-sm uppercase tracking-widest font-semibold" href="/terms">Terms</Link>
            </nav>
            </div>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto px-8 py-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/50 text-xs uppercase tracking-widest font-bold">
            © 2026 NestScout. Part of The Curated Hearth editorial network.
          </p>
        </div>
      </footer>
    </div>
  );
}
