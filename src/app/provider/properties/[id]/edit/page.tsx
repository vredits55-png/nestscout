import { getProperty } from "@/actions/properties";
import { getUser } from "@/actions/auth";
import { notFound, redirect } from "next/navigation";
import EditPropertyForm from "./EditPropertyForm";

interface EditPropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = await params;
  const user = await getUser();

  if (!user || user.role !== "provider") {
    redirect("/login");
  }

  const property = await getProperty(id);
  if (!property) {
    notFound();
  }

  if (property.provider_id !== user.id) {
    redirect("/provider/dashboard");
  }

  // Cast property to make sure typings align correctly
  return <EditPropertyForm property={property} />;
}
