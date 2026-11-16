import Link from "next/link";
export default function NotFound() {
  return (
    <main className="state">
      <h1>This page isn’t on the schedule</h1>
      <p>The link may have changed. Return to your workspace to continue.</p>
      <Link className="primary" href="/login">
        Return to Athleta
      </Link>
    </main>
  );
}
