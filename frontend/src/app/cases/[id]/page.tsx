import { redirect } from "next/navigation";

export default async function CaseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/user/complaints/${id}`);
}
