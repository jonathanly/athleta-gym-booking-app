import { RosterPage } from "@/components/roster";
export default async function Roster({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RosterPage id={id} />;
}
