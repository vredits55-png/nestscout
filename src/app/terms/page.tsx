import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service — NestScout",
  description: "Terms and conditions for using the NestScout platform.",
};

export default function TermsPage() {
  return (
    <div className="bg-surface min-h-screen">
      {/* Hero */}
      <section className="bg-inverse-surface text-white py-24 md:py-32 px-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-xs uppercase tracking-widest font-bold mb-12 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-5xl md:text-7xl font-headline font-extrabold leading-[1.05] tracking-tight mb-8">
            Terms of <span className="text-primary-fixed italic">Service</span>
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
            <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-4">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing and using NestScout (&quot;the Platform&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you agree to comply with and be bound by these Terms of Service. If you do not agree with these terms, please do not use our platform.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-4">2. The NestScout Platform</h2>
            <p className="leading-relaxed mb-4">
              NestScout operates as a curated real estate marketplace that connects tenants looking for unique living spaces with property providers (landlords, owners, managers). 
            </p>
            <ul className="space-y-2 ml-6 list-disc">
              <li>We do not own, manage, or operate the properties listed on our platform.</li>
              <li>We are not a party to any lease agreement or rental contract entered into between users.</li>
              <li>We act purely as an intermediary to facilitate communication and booking requests.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-4">3. User Responsibilities</h2>
            <p className="leading-relaxed mb-4">You are responsible for your use of the platform and any content you provide, including compliance with applicable laws, rules, and regulations.</p>
            <ul className="space-y-2 ml-6 list-disc">
              <li><strong className="text-on-surface">Account Security:</strong> You are responsible for safeguarding your password and account credentials.</li>
              <li><strong className="text-on-surface">Accurate Information:</strong> You agree to provide true, accurate, current, and complete information.</li>
              <li><strong className="text-on-surface">Prohibited Conduct:</strong> You agree not to use the platform for fraud, spam, harassment, or to distribute malicious software.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-4">4. Property Providers (Landlords)</h2>
            <p className="leading-relaxed mb-4">By listing a property on NestScout, you represent and warrant that:</p>
            <ul className="space-y-2 ml-6 list-disc">
              <li>You own the property or have explicit legal authority to lease it.</li>
              <li>The listing is accurate and adheres to our <Link href="/standards" className="text-primary hover:underline">Editorial Standards</Link>.</li>
              <li>The property meets all local safety, zoning, and habitability regulations.</li>
              <li>You agree to honour confirmed booking requests or provide timely communication if a request must be rejected.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-4">5. Tenants & Bookings</h2>
            <ul className="space-y-2 ml-6 list-disc">
              <li>A &quot;Booking Request&quot; made through NestScout is an expression of interest to rent. It is not a binding legal lease until both parties sign an external lease agreement.</li>
              <li>The proposed price and timeframe in a booking request are subject to final approval by the property provider.</li>
              <li>NestScout does not currently process rent payments or security deposits. Transactions must be handled directly between the tenant and the provider.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-4">6. Intellectual Property</h2>
            <p className="leading-relaxed">
              The platform, including its editorial content, branding, design, and software, is the exclusive property of NestScout. By uploading property photos and descriptions, you grant NestScout a non-exclusive, worldwide, royalty-free license to use, display, and distribute that content to operate and promote the platform.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-4">7. Limitation of Liability</h2>
            <p className="leading-relaxed">
              To the maximum extent permitted by law, NestScout shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (a) your use or inability to use the platform; (b) any conduct or content of any third party on the platform.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-4">8. Termination</h2>
            <p className="leading-relaxed">
              We may suspend or terminate your account and your access to the platform immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms or violate our Editorial Standards.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-4">9. Contact Information</h2>
            <p className="leading-relaxed">
              If you have any questions about these Terms, please contact us at:
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
