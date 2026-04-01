import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — NestScout",
  description: "How NestScout collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-surface min-h-screen">
      {/* Hero */}
      <section className="bg-inverse-surface text-white py-24 md:py-32 px-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-xs uppercase tracking-widest font-bold mb-12 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-5xl md:text-7xl font-headline font-extrabold leading-[1.05] tracking-tight mb-8">
            Privacy <span className="text-primary-fixed italic">Policy</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl leading-relaxed font-body">
            Last updated: April 1, 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-8 py-20">
        <div className="prose prose-lg max-w-none space-y-10 text-on-surface-variant font-body">
          
          <div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-4">1. Information We Collect</h2>
            <p className="leading-relaxed mb-4">When you use NestScout, we may collect the following types of information:</p>
            <ul className="space-y-2 ml-6 list-disc">
              <li><strong className="text-on-surface">Account Information:</strong> Your name, email address, phone number, and role (tenant or provider) when you register.</li>
              <li><strong className="text-on-surface">Profile Data:</strong> Avatar image, bio, and preferences you choose to share.</li>
              <li><strong className="text-on-surface">Property Data:</strong> For providers — property details, images, pricing, and location data.</li>
              <li><strong className="text-on-surface">Usage Data:</strong> Pages visited, search queries, favourites, and interactions within the platform.</li>
              <li><strong className="text-on-surface">Communications:</strong> Messages exchanged through our conversation system between tenants and providers.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-4">2. How We Use Your Information</h2>
            <ul className="space-y-2 ml-6 list-disc">
              <li>To provide, maintain, and improve the NestScout platform.</li>
              <li>To facilitate communication between tenants and property providers.</li>
              <li>To personalise your experience, including property recommendations.</li>
              <li>To send important account notifications and service updates.</li>
              <li>To prevent fraud, abuse, and ensure platform security.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-4">3. Data Storage & Security</h2>
            <p className="leading-relaxed">
              Your data is stored securely using Supabase infrastructure with row-level security policies. We employ industry-standard encryption for data in transit (TLS) and at rest. We never sell your personal data to third parties.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-4">4. Cookies & Tracking</h2>
            <p className="leading-relaxed">
              NestScout uses essential cookies for authentication and session management. We do not use advertising trackers or sell browsing data. Analytics, if implemented, are privacy-respecting and anonymised.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-4">5. Your Rights</h2>
            <p className="leading-relaxed mb-4">You have the right to:</p>
            <ul className="space-y-2 ml-6 list-disc">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your account and associated data.</li>
              <li>Withdraw consent for data processing at any time.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-4">6. Third-Party Services</h2>
            <p className="leading-relaxed">
              We use the following third-party services: Supabase (database and authentication), Vercel (hosting), and OpenStreetMap/Leaflet (maps). Each has their own privacy policy, and we encourage you to review them.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-4">7. Contact Us</h2>
            <p className="leading-relaxed">
              If you have questions about this privacy policy or wish to exercise your data rights, contact us at:
            </p>
            <div className="bg-surface-container-low rounded-2xl p-6 mt-4">
              <p className="font-bold text-on-surface">Email: <a href="mailto:sandarbhs102@gmail.com" className="text-primary">sandarbhs102@gmail.com</a></p>
              <p className="font-bold text-on-surface mt-2">Phone: <a href="tel:+916387360511" className="text-primary">+91 638 736 0511</a></p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
