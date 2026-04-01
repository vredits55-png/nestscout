import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, Clock } from "lucide-react";

export const metadata = {
  title: "Contact — NestScout",
  description: "Get in touch with the NestScout team. We'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <div className="bg-surface min-h-screen">
      {/* Hero */}
      <section className="bg-inverse-surface text-white py-24 md:py-32 px-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-xs uppercase tracking-widest font-bold mb-12 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-5xl md:text-7xl font-headline font-extrabold leading-[1.05] tracking-tight mb-8">
            Get in <span className="text-primary-fixed italic">Touch</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl leading-relaxed font-body">
            Whether you are a prospective tenant, property provider, or just curious — we are here to help.
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="max-w-4xl mx-auto px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Direct Contact */}
          <div className="space-y-8">
            <h2 className="text-3xl font-headline font-extrabold text-on-surface">Direct Contact</h2>
            
            <div className="space-y-6">
              <a href="mailto:sandarbhs102@gmail.com" className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-on-surface font-headline">Email</h3>
                  <p className="text-primary font-body font-semibold">sandarbhs102@gmail.com</p>
                  <p className="text-sm text-on-surface-variant font-body mt-1">For business inquiries, partnerships, and support</p>
                </div>
              </a>

              <a href="tel:+916387360511" className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-on-surface font-headline">Phone</h3>
                  <p className="text-primary font-body font-semibold">+91 638 736 0511</p>
                  <p className="text-sm text-on-surface-variant font-body mt-1">Available Monday – Saturday, 10 AM – 7 PM IST</p>
                </div>
              </a>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-on-surface font-headline">Location</h3>
                  <p className="text-on-surface-variant font-body">India (Remote-First Team)</p>
                  <p className="text-sm text-on-surface-variant font-body mt-1">Serving clients globally</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-on-surface font-headline">Response Time</h3>
                  <p className="text-on-surface-variant font-body">We typically respond within 24 hours</p>
                  <p className="text-sm text-on-surface-variant font-body mt-1">Urgent matters: call us directly</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Contacts */}
          <div className="space-y-8">
            <h2 className="text-3xl font-headline font-extrabold text-on-surface">Quick Links</h2>
            
            <div className="space-y-4">
              <a
                href="mailto:sandarbhs102@gmail.com?subject=Property Listing Inquiry"
                className="block bg-surface-container-lowest rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300 border border-outline-variant/10"
              >
                <h3 className="font-bold text-on-surface font-headline mb-2">🏠 List Your Property</h3>
                <p className="text-sm text-on-surface-variant font-body">Want to showcase your property on NestScout? Reach out to learn about our editorial listing process.</p>
              </a>

              <a
                href="mailto:sandarbhs102@gmail.com?subject=Partnership Proposal"
                className="block bg-surface-container-lowest rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300 border border-outline-variant/10"
              >
                <h3 className="font-bold text-on-surface font-headline mb-2">🤝 Partnerships</h3>
                <p className="text-sm text-on-surface-variant font-body">Interested in collaborating? We are open to partnerships with real estate agencies, interior designers, and lifestyle brands.</p>
              </a>

              <a
                href="mailto:sandarbhs102@gmail.com?subject=Bug Report / Feedback"
                className="block bg-surface-container-lowest rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300 border border-outline-variant/10"
              >
                <h3 className="font-bold text-on-surface font-headline mb-2">🐛 Report an Issue</h3>
                <p className="text-sm text-on-surface-variant font-body">Found a bug or have feedback? We appreciate your help in making NestScout better.</p>
              </a>

              <a
                href="mailto:sandarbhs102@gmail.com?subject=Press Inquiry"
                className="block bg-surface-container-lowest rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300 border border-outline-variant/10"
              >
                <h3 className="font-bold text-on-surface font-headline mb-2">📰 Press & Media</h3>
                <p className="text-sm text-on-surface-variant font-body">For press inquiries, interviews, or media kits, email us with the subject &quot;Press Inquiry&quot;.</p>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
