"use client";
import { ErrorMessage } from "@/components/ui";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="content">
      <h1>Something interrupted your session</h1>
      <ErrorMessage
        message="The workspace could not be displayed. Try loading it again."
        retry={reset}
      />
    </main>
  );
}
