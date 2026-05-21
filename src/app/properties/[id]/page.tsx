import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  CheckCircle,
  Info,
  ChevronRight,
} from "lucide-react";
import { getProperty } from "@/actions/properties";
import { getUserFavoriteIds } from "@/actions/favorites";
import { formatCurrency } from "@/lib/utils";
import FavoriteButton from "@/components/FavoriteButton";
import InquiryForm from "@/components/InquiryForm";
import MapView from "@/components/MapView";
import DynamicBackButton from "@/components/DynamicBackButton";

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) notFound();

  const favoriteIds = await getUserFavoriteIds();
  const isFavorited = favoriteIds.includes(property.id);

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden pb-24">
      {/* Animated Floating Background Elements */}
      <div className="floating-blob w-96 h-96 bg-primary-fixed top-[-10%] left-[-10%] rounded-full animate-float"></div>
      <div className="floating-blob w-80 h-80 bg-tertiary-fixed-dim top-[40%] right-[-5%] rounded-full animate-float-delayed"></div>
      <div className="floating-blob w-64 h-64 bg-secondary-fixed bottom-[-5%] left-[20%] rounded-full animate-float"></div>

      {/* Breadcrumb Header */}
      <div className="pt-28 pb-8 px-4 sm:px-8 relative z-10">
        <div className="max-w-[1440px] mx-auto flex items-center gap-2 text-sm text-outline font-bold uppercase tracking-widest animate-fade-in">
          <DynamicBackButton label="Return" />
          <ChevronRight className="w-4 h-4 text-outline-variant" />
          <span className="text-on-surface truncate cursor-default">{property.title}</span>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 mt-4 relative z-10 group">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 rounded-[2.5rem] overflow-hidden animate-reveal relative antigravity-shadow transition-transform duration-700 group-hover:scale-[1.01]">
          
          {/* Main Hero Image */}
          <div className="md:col-span-8 relative h-[60vh] min-h-[400px]">
            {property.images?.[0] ? (
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-surface-variant flex items-center justify-center rounded-2xl">
                <MapPin className="w-16 h-16 text-outline opacity-20" />
              </div>
            )}
            <div className="absolute top-6 right-6">
              <FavoriteButton
                propertyId={property.id}
                initialFavorited={isFavorited}
              />
            </div>
            {property.is_available && (
              <div className="absolute bottom-6 left-6 bg-surface-container-lowest/90 backdrop-blur-md px-6 py-2 rounded-full font-bold text-primary flex items-center gap-2 shadow-ambient">
                 <CheckCircle className="w-5 h-5" />
                 Ready to Lease
              </div>
            )}
          </div>

          {/* Secondary Stacked Images */}
          <div className="hidden md:flex flex-col md:col-span-4 gap-4">
            {(property.images?.slice(1, 3) || []).map(
              (img: string, i: number) => (
                <div key={i} className="relative h-full flex-1 overflow-hidden rounded-2xl group shadow-ambient">
                  <img
                    src={img}
                    alt={`${property.title} detailed view ${i + 2}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out cursor-pointer"
                  />
                </div>
              )
            )}
            {(!property.images || property.images.length < 2) &&
              [0, 1].map((i) => (
                <div
                  key={i}
                  className="h-full flex-1 bg-surface-container-low flex items-center justify-center rounded-2xl border border-outline-variant/30"
                >
                  <span className="font-headline font-bold text-outline opacity-40 uppercase tracking-widest text-xs">Awaiting Asset</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Content Layout */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 mt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Details */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Title & Stats */}
            <div className="animate-fade-in-up">
              <div className="flex flex-wrap items-center justify-between gap-6 mb-6">
                 <div>
                    <div className="flex items-center gap-3 mb-4">
                       <span className="bg-primary/90 backdrop-blur text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.2em]">
                         {property.property_type}
                       </span>
                       <span className="flex items-center gap-1.5 text-on-surface-variant font-bold text-sm">
                         <MapPin className="w-4 h-4 text-primary" />
                         {property.city}, {property.state} {property.zip_code}
                       </span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-headline text-on-surface tracking-tight leading-[1.05] drop-shadow-sm">
                      {property.title}
                    </h1>
                 </div>
              </div>

              {/* Glass Stats Row */}
              <div className="glass-card p-8 rounded-[2rem] antigravity-shadow flex flex-wrap justify-between items-center transform transition-all hover:-translate-y-2 gap-6 mt-10">
                {[
                  { icon: Bed, label: "Bedrooms", value: property.bedrooms },
                  { icon: Bath, label: "Bathrooms", value: property.bathrooms },
                  {
                    icon: Maximize,
                    label: "Area SqFt",
                    value: property.area_sqft,
                  },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                       <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-outline-variant uppercase tracking-[0.2em]">{stat.label}</div>
                        <div className="text-xl font-black font-headline text-on-surface leading-tight">
                          {stat.value}
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Narrative Glass Card */}
            <section className="glass-card p-10 rounded-[2.5rem] antigravity-shadow transform transition-all hover:-translate-y-1 animate-fade-in-up delay-150">
              <h2 className="text-3xl font-black font-headline text-primary mb-8">
                The Editorial Narrative
              </h2>
              <p className="text-xl text-on-surface-variant font-light leading-relaxed whitespace-pre-wrap">
                {property.description || "The story of this space is currently being written."}
              </p>
            </section>

            {/* Amenities Grid Card */}
            {property.amenities?.length > 0 && (
              <section className="glass-card p-10 rounded-[2.5rem] antigravity-shadow transform transition-all hover:-translate-y-1 animate-fade-in-up delay-200">
                <h2 className="text-3xl font-black font-headline text-primary mb-10 text-center">
                  Curated Amenities
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {property.amenities.map((amenity: string, index: number) => (
                    <div key={index} className="flex items-center gap-4 bg-surface p-5 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1">
                      <div className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-xs uppercase tracking-widest font-bold text-on-surface">{amenity}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Neighborhood Nuance */}
            {property.neighborhood_info && (
              <section className="animate-fade-in-up delay-[400ms]">
                <h2 className="text-2xl font-black font-headline text-on-surface mb-6 border-b border-outline-variant/30 pb-4 flex items-center gap-2">
                  <Info className="text-primary w-6 h-6"/> Neighborhood Context
                </h2>
                <div className="relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-[100px] border-l border-b border-primary/20 blur-xl"></div>
                  <p className="text-on-surface-variant text-xl font-light leading-relaxed whitespace-pre-wrap relative z-10 italic">
                    &ldquo;{property.neighborhood_info}&rdquo;
                  </p>
                </div>
              </section>
            )}

            {/* Location Map */}
            {property.latitude && property.longitude && (
              <div className="animate-fade-in-up delay-[400ms]">
                <h2 className="text-2xl font-black font-headline text-on-surface mb-6 border-b border-outline-variant/30 pb-4">
                  Cartography
                </h2>
                <div className="h-80 rounded-3xl overflow-hidden shadow-ambient relative">
                  <MapView
                    properties={[property]}
                    center={[property.latitude, property.longitude]}
                    zoom={15}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Area */}
          <aside className="lg:col-span-4 animate-slide-right delay-150 relative z-20">
            <div className="sticky top-28 space-y-8">
              
              {/* High Contrast Sidebar Card Container */}
              <div className="bg-on-surface p-8 sm:p-10 rounded-[3rem] antigravity-shadow text-white relative overflow-hidden transform transition-all duration-500">
                 {/* Decorative Accent Flow */}
                 <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/40 rounded-full blur-[60px]"></div>
                 
                 <div className="relative z-10 w-full mb-10">
                    <span className="text-4xl sm:text-5xl font-black font-headline text-primary-fixed block leading-none tracking-tight">
                      {formatCurrency(property.price_per_month)}
                    </span>
                    <span className="text-white/60 font-medium block mt-2 tracking-widest uppercase text-xs">/ month luxury lease</span>
                 </div>

                 {/* Interaction Engine */}
                 <div className="w-full relative z-10 mt-6">
                   <div className="bg-transparent text-white">
                     <InquiryForm
                        propertyId={property.id}
                        receiverId={property.provider_id}
                        propertyTitle={property.title}
                     />
                   </div>
                 </div>

                 <p className="text-center text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 mt-10 border-t border-white/10 pt-6">Managed centrally via the NestScout network</p>
              </div>
              {/* Curator Contact Glass Card */}
              {property.provider && (
                <div className="glass-card p-8 rounded-[3rem] antigravity-shadow border-white/40 flex items-center gap-5">
                  <div className="w-20 h-20 rounded-full bg-surface-container-low border-[3px] border-primary-container flex items-center justify-center shrink-0 overflow-hidden text-2xl font-black text-primary font-headline shadow-inner">
                    {property.provider.avatar_url ? (
                       <img src={property.provider.avatar_url} alt="Curator" className="w-full h-full object-cover"/>
                    ) : (
                       property.provider.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase() || "OP"
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-outline-variant uppercase tracking-[0.2em] mb-1">
                      Certified Curator
                    </div>
                    <div className="font-black text-on-surface font-headline text-xl mb-1 leading-tight">
                      {property.provider.full_name || "Official Partner"}
                    </div>
                    <Link href={`/curators/${property.provider.id}`} className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                       View Complete Portfolio <ChevronRight className="w-3 h-3"/>
                    </Link>
                  </div>
                </div>
              )}

            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
