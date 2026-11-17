import type { ReactNode } from "react";
import { Workspace } from "@/components/auth";
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <Workspace role="admin">{children}</Workspace>;
}
