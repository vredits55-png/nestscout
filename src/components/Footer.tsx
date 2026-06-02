import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-inverse-surface text-on-primary-container mt-auto">
      <div className="w-full py-16 px-8 flex flex-col md:flex-row justify-between items-start max-w-[1440px] mx-auto gap-12">
        <div className="space-y-6 max-w-sm">
          <div className="text-white font-bold text-3xl font-headline flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white shadow-xl p-0.5 relative">
              <Image src="/logo.png" alt="NestScout Logo" width={40} height={40} className="object-contain" />
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
  );
}
