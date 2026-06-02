import Link from "next/link";
import { Search, MapPin } from "lucide-react";
import { cookies } from "next/headers";
import { getUser } from "@/actions/auth";
import Image from "next/image";
import PropertySlider from "@/components/PropertySlider";

export default async function HomePage() {
  // Conditionally check if the current user is already a provider
  // so the 'List a Property' button smartly redirects them to their dashboard
  const cookieStore = await cookies();
  const hasAuthCookie = cookieStore.getAll().some(
    (cookie) => cookie.name.includes("auth-token") || cookie.name.startsWith("sb-")
  );

  let listUrl = "/register?role=provider";
  if (hasAuthCookie) {
    const user = await getUser();
    if (user?.role === "provider") {
      listUrl = "/provider/dashboard";
    }
  }

  return (
    <div className="bg-transparent">
      {/* ================== HERO SECTION ================== */}
      <section className="relative px-8 py-12 md:py-24 max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[90vh]">
        <div className="lg:col-span-6 space-y-8 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-headline font-extrabold text-on-surface leading-[1.05] tracking-tight">
            Find a home that <span className="text-primary italic">speaks</span> to you.
          </h1>
          <p className="text-xl text-on-surface-variant max-w-lg leading-relaxed animate-fade-in-up delay-75">
            Moving beyond listings. We curate living spaces that reflect your personality, values, and vision for the future.
          </p>

          {/* Editorial Search Bar Link */}
          <div className="bg-surface-container-low/30 backdrop-blur-2xl border border-white/40 rounded-xl p-3 shadow-[0_20px_40px_-5px_rgba(0,110,26,0.08),_inset_0_1px_2px_rgba(255,255,255,0.5)] flex flex-col md:flex-row gap-4 items-center animate-fade-in-up delay-150">
            <Link href="/search" className="flex-1 w-full flex items-center gap-3 px-4 transition-all cursor-pointer">
              <MapPin className="text-outline w-5 h-5 block" />
              <div className="w-full py-3 text-outline-variant font-medium select-none text-left">
                Where to?
              </div>
            </Link>
            <Link href="/search" className="editorial-gradient text-on-primary w-full md:w-auto px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              <Search className="w-5 h-5 block" />
              Search Options
            </Link>
          </div>
        </div>
        
        <div className="lg:col-span-6 relative animate-slide-right delay-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="w-full h-80 rounded-xl overflow-hidden arch-mask-left shadow-2xl relative">
              <Image
                alt="Luxury home exterior"
                className="object-cover"
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
                fill
                sizes="(max-width: 1024px) 50vw, 30vw"
                priority
              />
            </div>
            <div className="w-full h-80 rounded-xl overflow-hidden translate-y-12 shadow-ambient relative">
              <Image
                alt="Modern living room"
                className="object-cover"
                src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80"
                fill
                sizes="(max-width: 1024px) 50vw, 30vw"
                priority
              />
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-surface-container-low rounded-full blur-[100px] opacity-70 animate-breathe"></div>
        </div>
      </section>

      {/* ================== PROPERTIES SLIDER ================== */}
      <PropertySlider />

      {/* ================== TESTIMONIALS (Editorial Style) ================== */}
      <section className="bg-surface-container-low py-24 px-8 overflow-hidden">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface mb-4">Stories of Belonging.</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto italic">How our members found more than just a roof over their heads.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-surface-container-lowest p-10 rounded-2xl ambient-glow flex flex-col md:flex-row gap-8 items-start hover:-translate-y-2 transition-transform duration-500 animate-fade-in-up delay-75">
              <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 grayscale relative">
                <Image
                  alt="Sarah Jenkins"
                  className="object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
                  fill
                  sizes="96px"
                />
              </div>
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
            </div>

            {/* Testimonial 2 */}
            <div className="bg-surface-container-lowest p-10 rounded-2xl ambient-glow flex flex-col md:flex-row gap-8 items-start hover:-translate-y-2 transition-transform duration-500 animate-fade-in-up delay-150">
              <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 grayscale border-2 border-surface-container-high relative">
                <Image
                  alt="Marcus Thorne"
                  className="object-cover"
                  src="https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=200&q=80"
                  fill
                  sizes="96px"
                />
              </div>
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
            </div>
          </div>
        </div>
      </section>

      {/* ================== CTA SECTION ================== */}
      <section className="bg-surface py-24 px-8 relative overflow-hidden">
         <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface mb-8 animate-fade-in-up">
              Ready to shape the future of living?
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-6 animate-fade-in-up delay-150">
              <Link href="/search" className="btn btn-primary text-lg px-8 py-4">
                Start Searching
              </Link>
              <Link href={listUrl} className="btn btn-ghost text-lg px-8 py-4">
                List a Property
              </Link>
            </div>
         </div>
         {/* Decorative blob */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-0"></div>
      </section>
    </div>
  );
}
