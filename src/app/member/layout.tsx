import type { ReactNode } from "react";
import { Workspace } from "@/components/auth";
export default function MemberLayout({ children }: { children: ReactNode }) {
  return <Workspace role="member">{children}</Workspace>;
}
