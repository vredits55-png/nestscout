import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PropertyCard from "@/components/PropertyCard";
import DynamicBackButton from "@/components/DynamicBackButton";
import { MapPin, Building, Star, Award, CheckCircle } from "lucide-react";

interface CuratorPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CuratorPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", id)
    .single();

  return {
    title: `${profile?.full_name || "Curator"} Portfolio — NestScout`,
  };
}

export default async function CuratorPortfolioPage({ params }: CuratorPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch Curator Profile
  const { data: curator, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("role", "provider")
    .single();

  if (profileError || !curator) {
    notFound();
  }

  // 2. Fetch Curator Properties
  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .eq("provider_id", id)
    .order("created_at", { ascending: false });

  const activeProperties = properties || [];

  return (
    <div className="bg-surface min-h-screen">
      {/* Editorial Header */}
      <section className="bg-inverse-surface text-on-primary-container py-24 px-6 md:px-12 relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-[1440px] mx-auto relative z-10 flex flex-col md:flex-row items-center gap-12">
          {/* Back button */}
          <div className="absolute top-0 left-0">
             <DynamicBackButton label="Discover More" />
          </div>

          {/* Profile Identity */}
          <div className="mt-12 md:mt-0 pt-4 shrink-0">
             {curator.avatar_url ? (
                <img 
                  src={curator.avatar_url} 
                  alt={curator.full_name} 
                  className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-4 border-surface shadow-2xl"
                />
             ) : (
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-primary flex items-center justify-center border-4 border-surface shadow-2xl">
                   <span className="text-white text-4xl md:text-6xl font-headline font-black">
                     {curator.full_name?.charAt(0) || "C"}
                   </span>
                </div>
             )}
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
             <div className="inline-flex items-center gap-2 text-primary font-bold bg-primary/10 px-4 py-1.5 rounded-full text-xs uppercase tracking-[0.2em]">
               <Award className="w-4 h-4" /> Certified Curator
             </div>
             <h1 className="text-4xl md:text-6xl font-black font-headline text-white tracking-tight leading-tight">
               {curator.full_name}
             </h1>
             <p className="text-white/70 max-w-xl text-lg font-body leading-relaxed mx-auto md:mx-0">
                Partnered with NestScout to represent architectural excellence and distinguished living spaces. Managing a portfolio of {activeProperties.length} properties.
             </p>
             <div className="pt-4 flex flex-wrap gap-6 justify-center md:justify-start">
               <div className="flex items-center gap-2 text-white/50 font-body text-sm font-semibold">
                  <CheckCircle className="w-5 h-5 text-primary" /> Verified Identity
               </div>
               <div className="flex items-center gap-2 text-white/50 font-body text-sm font-semibold">
                  <Star className="w-5 h-5 text-primary" /> Premium Portfolio
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Properties List */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-24">
         <div className="flex items-end justify-between mb-12 border-b border-outline-variant/20 pb-6">
            <div>
               <h2 className="text-3xl font-black font-headline text-on-surface">Curated Collection</h2>
               <p className="text-on-surface-variant font-body mt-2">Spaces represented by {curator.full_name}.</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-primary font-bold text-sm bg-primary/5 px-4 py-2 rounded-xl">
               <Building className="w-4 h-4" /> {activeProperties.length} Available
            </div>
         </div>

         {activeProperties.length === 0 ? (
           <div className="text-center py-24 bg-surface-container-lowest rounded-3xl border border-outline-variant/30">
              <MapPin className="w-12 h-12 text-outline-variant mx-auto mb-4" />
              <h3 className="text-2xl font-bold font-headline text-on-surface mb-2">No Active Spaces</h3>
              <p className="text-on-surface-variant font-body max-w-sm mx-auto">This curator currently does not have any properties available for lease on the platform.</p>
           </div>
         ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
             {activeProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
             ))}
           </div>
         )}
      </section>
    </div>
  );
}
