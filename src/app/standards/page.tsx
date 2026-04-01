import Link from "next/link";
import { ArrowLeft, Shield, Camera, FileText, Star } from "lucide-react";

export const metadata = {
  title: "Editorial Standards — NestScout",
  description: "How we curate, verify, and present every property on the NestScout platform.",
};

export default function StandardsPage() {
  return (
    <div className="bg-surface min-h-screen">
      {/* Hero */}
      <section className="bg-inverse-surface text-white py-24 md:py-32 px-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-xs uppercase tracking-widest font-bold mb-12 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-5xl md:text-7xl font-headline font-extrabold leading-[1.05] tracking-tight mb-8">
            Editorial <span className="text-primary-fixed italic">Standards</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl leading-relaxed font-body">
            Every property on NestScout undergoes a rigorous editorial process. Here is how we maintain the highest bar in residential discovery.
          </p>
        </div>
      </section>

      {/* Standards */}
      <section className="max-w-4xl mx-auto px-8 py-20">
        <div className="space-y-16">
          {/* Standard 1 */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-4">Verification First</h2>
              <p className="text-on-surface-variant leading-relaxed font-body mb-4">
                Every property listing is verified before publication. We confirm ownership documents, property condition, and accuracy of all stated amenities. Listings that fail our verification process are declined — no exceptions.
              </p>
              <ul className="space-y-2 text-on-surface-variant font-body">
                <li className="flex items-start gap-3"><span className="text-primary font-bold mt-0.5">01</span> Ownership and legal documentation review</li>
                <li className="flex items-start gap-3"><span className="text-primary font-bold mt-0.5">02</span> Amenity cross-verification with on-site inspection</li>
                <li className="flex items-start gap-3"><span className="text-primary font-bold mt-0.5">03</span> Pricing analysis against local market data</li>
                <li className="flex items-start gap-3"><span className="text-primary font-bold mt-0.5">04</span> Neighborhood safety and connectivity assessment</li>
              </ul>
            </div>
          </div>

          {/* Standard 2 */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Camera className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-4">Visual Integrity</h2>
              <p className="text-on-surface-variant leading-relaxed font-body">
                We require high-resolution, naturally lit photography for every listing. Wide-angle lens distortion, heavy filters, and misleading staging are explicitly prohibited. What you see on NestScout is what you will experience in person. Our visual guidelines ensure consistency, authenticity, and editorial quality across every single listing.
              </p>
            </div>
          </div>

          {/* Standard 3 */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-4">Narrative Descriptions</h2>
              <p className="text-on-surface-variant leading-relaxed font-body">
                Generic copy-paste descriptions have no place here. Every property description is written or edited by our team to capture the character, light, geometry, and lifestyle potential of the space. We write about homes the way travel editors write about destinations — with reverence, specificity, and soul.
              </p>
            </div>
          </div>

          {/* Standard 4 */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Star className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-4">Ongoing Quality Audits</h2>
              <p className="text-on-surface-variant leading-relaxed font-body">
                Our standards do not end at publication. We conduct periodic reviews of active listings, respond to community feedback within 24 hours, and maintain a zero-tolerance policy for misrepresentation. If a listing no longer meets our standards, it is delisted until the provider addresses our concerns.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
