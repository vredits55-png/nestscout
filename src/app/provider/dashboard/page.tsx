import { getProviderProperties } from "@/actions/properties";
import { getReceivedInquiries } from "@/actions/inquiries";
import { getUser } from "@/actions/auth";
import { redirect } from "next/navigation";
import type { Property, Inquiry } from "@/lib/types";
import Link from "next/link";
import {
  Plus,
  Building,
  MessageSquare,
  TrendingUp,
  Eye,
  MapPin,
  Edit,
  ArrowRight,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import DeletePropertyButton from "./DeletePropertyButton";

export default async function ProviderDashboard() {
  const user = await getUser();
  if (!user || user.role !== "provider") redirect("/");

  const [properties, inquiries] = await Promise.all([
    getProviderProperties(user.id),
    getReceivedInquiries(user.id),
  ]);

  const unreadCount = inquiries.filter((i: Inquiry) => !i.is_read).length;

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="bg-white/40 backdrop-blur-md border-b border-outline-variant/20 pt-28 pb-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="animate-fade-in-up">
              <h1
                className="text-3xl font-bold text-on-surface tracking-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Dashboard
              </h1>
              <p className="text-on-surface-variant mt-1 font-medium">
                Welcome back, {user.full_name || "Provider"}
              </p>
            </div>
            <Link
              href="/provider/properties/new"
              className="btn btn-primary cursor-pointer animate-fade-in-up delay-75 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Property
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 stagger-children">
          {[
            {
              icon: Building,
              label: "Total Listings",
              value: properties.length,
              color: "bg-primary/10 text-primary",
            },
            {
              icon: MessageSquare,
              label: "Inquiries",
              value: inquiries.length,
              color: "bg-primary/10 text-primary",
              badge: unreadCount > 0 ? `${unreadCount} new` : undefined,
              href: "/conversations",
            },
            {
              icon: TrendingUp,
              label: "Available",
              value: properties.filter((p: Property) => p.is_available).length,
              color: "bg-primary/10 text-primary",
            },
          ].map((stat) => {
            const CardContent = (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}
                  >
                    <stat.icon className="w-5 h-5" />
                  </div>
                  {stat.badge && (
                    <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md text-xs font-semibold animate-pulse">
                      {stat.badge}
                    </span>
                  )}
                </div>
                <div
                  className="text-4xl font-bold text-on-surface mb-1 tracking-tight"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-text-muted uppercase tracking-wide flex items-center gap-1 group-hover:text-primary transition-colors">
                  {stat.label}
                  {stat.href && <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
                </div>
              </>
            );

            if (stat.href) {
              return (
                <Link
                  key={stat.label}
                  href={stat.href}
                  className="glass border border-outline-variant/20 rounded-2xl p-6 shadow-ambient hover:shadow-glow hover:border-primary/20 transition-all block cursor-pointer group"
                >
                  {CardContent}
                </Link>
              );
            }

            return (
              <div
                key={stat.label}
                className="glass border border-outline-variant/20 rounded-2xl p-6 shadow-ambient hover:shadow-glow transition-all"
              >
                {CardContent}
              </div>
            );
          })}
        </div>

        {/* Properties List */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-2xl font-bold text-on-surface"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Your Properties
            </h2>
          </div>

          {properties.length > 0 ? (
            <div className="space-y-4 stagger-children">
              {properties.map((property: Property) => (
                <div
                  key={property.id}
                  className="glass border border-outline-variant/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-5 transition-all duration-300 hover:shadow-ambient hover:border-primary/20 group"
                >
                  {/* Thumbnail */}
                  <div className="w-full sm:w-32 h-24 rounded-lg overflow-hidden shrink-0 bg-surface-container-low relative">
                    {property.images?.[0] ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-outline-variant" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="font-bold text-on-surface text-lg truncate flex-1 md:flex-none">
                        {property.title}
                      </h3>
                      <span
                        className={`badge ${
                          property.is_available
                            ? "bg-primary/10 text-primary"
                            : "bg-tertiary/10 text-tertiary"
                        }`}
                      >
                        {property.is_available ? "Active" : "Draft"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-on-surface-variant font-medium mb-1.5">
                      <MapPin className="w-3.5 h-3.5 text-outline-variant" />
                      {property.city}, {property.state}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-bold text-on-surface">
                        {formatCurrency(property.price_per_month)}
                        <span className="text-text-muted font-medium text-xs ml-1">/mo</span>
                      </span>
                      <span className="text-text-light flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-outline-variant" />
                        Listed {formatDate(property.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/properties/${property.id}`}
                      className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-md transition-colors"
                      title="View Listing"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                    <Link
                      href={`/provider/properties/${property.id}/edit`}
                      className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-md transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <div className="ml-2">
                       <DeletePropertyButton id={property.id} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 glass border border-dashed border-outline-variant/30 rounded-2xl animate-fade-in-up">
              <Building className="w-12 h-12 text-outline-variant mx-auto mb-4" />
              <h3
                className="text-lg font-bold text-on-surface mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                No Properties Listed
              </h3>
              <p className="text-on-surface-variant mb-6">
                Start by adding your first premium rental property.
              </p>
              <Link
                href="/provider/properties/new"
                className="btn btn-primary cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Property
              </Link>
            </div>
          )}
        </div>

        {/* Recent Inquiries */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-2xl font-bold text-on-surface"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Recent Inquiries
            </h2>
            {inquiries.length > 0 && (
              <Link
                href="/conversations"
                className="text-sm font-semibold text-primary hover:text-[#00c838] flex items-center gap-1 transition-colors"
              >
                View All Messages
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {inquiries.length > 0 ? (
            <div className="space-y-4 stagger-children">
              {inquiries.slice(0, 10).map((inquiry: Inquiry) => (
                <Link
                  key={inquiry.id}
                  href={`/conversations/${inquiry.id}`}
                  className="block"
                >
                  <div
                    className={`glass border border-outline-variant/20 rounded-2xl p-5 transition-all hover:shadow-ambient hover:border-primary/20 ${
                      !inquiry.is_read
                        ? "border-l-4 border-l-primary"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center shrink-0">
                          <MessageSquare className="w-5 h-5 text-on-surface-variant" />
                        </div>
                        <div className="min-w-0 pt-1">
                          <div className="font-bold text-on-surface text-sm mb-0.5">
                            {inquiry.sender?.full_name || "Unknown User"}
                          </div>
                          <div className="text-xs font-semibold text-text-muted mb-2 uppercase tracking-wide">
                            Re: {inquiry.property?.title || "Unknown Property"}
                          </div>
                          <p className="text-sm text-on-surface-variant leading-relaxed">
                            {inquiry.message}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs font-medium text-text-light whitespace-nowrap shrink-0 pt-1">
                        {formatDate(inquiry.created_at)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 glass border border-outline-variant/20 rounded-2xl animate-fade-in-up">
              <MessageSquare className="w-10 h-10 text-outline-variant mx-auto mb-3" />
              <p className="text-on-surface-variant font-medium">No inquiries received yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
