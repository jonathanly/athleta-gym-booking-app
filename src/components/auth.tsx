"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  CalendarDays,
  LayoutDashboard,
  Users,
  ListChecks,
  UserRound,
  LogOut,
  Leaf,
  ChevronRight,
} from "lucide-react";
import { api, ApiError, fullName, type User } from "./api";
import { ErrorMessage, Field, Loading, MutationForm } from "./ui";

type AuthContext = { user: User; setUser: (user: User) => void };
const Context = createContext<AuthContext | null>(null);
export function useAuth() {
  const auth = useContext(Context);
  if (!auth) throw new Error("Account context is unavailable");
  return auth;
}
export function Workspace({
  role,
  children,
}: {
  role: User["role"];
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null),
    [error, setError] = useState("");
  const router = useRouter(),
    path = usePathname();
  const [logoutPending, setLogoutPending] = useState(false);
  const load = useCallback(() => {
    api<User>("/auth/me")
      .then((account) => {
        setError("");
        if (account.role !== role)
          router.replace(account.role === "admin" ? "/admin" : "/member");
        else setUser(account);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401)
          router.replace("/login");
        else setError((err as Error).message);
      });
  }, [role, router]);
  useEffect(() => {
    void load();
    const unauthorized = () => {
      setUser(null);
      router.replace("/login");
    };
    window.addEventListener("athleta:unauthorized", unauthorized);
    return () =>
      window.removeEventListener("athleta:unauthorized", unauthorized);
  }, [load, router]);
  if (error && !user)
    return (
      <main className="auth-page">
        <ErrorMessage message={error} retry={load} />
      </main>
    );
  if (!user) return <Loading text="Checking your session" />;
  const links =
    role === "admin"
      ? [
          { href: "/admin", label: "Today", icon: LayoutDashboard },
          { href: "/admin/schedule", label: "Schedule", icon: CalendarDays },
          { href: "/admin/members", label: "Members", icon: Users },
        ]
      : [
          { href: "/member", label: "Timetable", icon: CalendarDays },
          { href: "/member/bookings", label: "My bookings", icon: ListChecks },
          { href: "/member/profile", label: "Profile", icon: UserRound },
        ];
  const active =
    links.find((item) => path === item.href)?.label || "Class roster";
  const activeHref = path.startsWith("/admin/sessions/")
    ? "/admin/schedule"
    : path;
  async function logout() {
    setLogoutPending(true);
    try {
      await api("/auth/logout", "POST");
      router.replace("/login");
    } catch (err) {
      setError((err as Error).message);
      setLogoutPending(false);
    }
  }
  return (
    <Context.Provider value={{ user, setUser }}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="shell">
        <aside className="sidebar">
          <Link className="brand" href={links[0].href}>
            <Leaf />
            athleta
          </Link>
          <p className="brand-sub">Group training, thoughtfully run.</p>
          <nav aria-label="Main navigation">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`nav-item ${activeHref === href ? "active" : ""}`}
                aria-current={activeHref === href ? "page" : undefined}
              >
                <Icon />
                {label}
              </Link>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <p className="sidebar-note">
              A little less admin.
              <br />
              More time on the floor.
            </p>
            <div className="profile">
              <span className="avatar">
                {user.firstName[0]}
                {user.lastName[0]}
              </span>
              <div>
                <strong>{fullName(user)}</strong>
                <span>{role === "admin" ? "Administrator" : "Member"}</span>
              </div>
            </div>
            <button
              className="logout"
              disabled={logoutPending}
              onClick={logout}
            >
              <LogOut />
              {logoutPending ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </aside>
        <div className="workspace">
          <header className="topbar">
            <div className="breadcrumb">
              Workspace
              <ChevronRight />
              <strong>{active}</strong>
            </div>
            <Link className="mobile-brand" href={links[0].href}>
              athleta
            </Link>
            <div className="top-meta">
              <span>Melbourne time</span>
              <button
                className="mobile-logout text-button"
                onClick={logout}
                disabled={logoutPending}
              >
                Sign out
              </button>
              <span className="avatar" aria-label={fullName(user)}>
                {user.firstName[0]}
                {user.lastName[0]}
              </span>
            </div>
          </header>
          {error && <ErrorMessage message={error} />}
          <main id="main" className="content">
            {children}
            <footer className="footnote">
              <span>Local demo · seed records are fictional</span>
              <span>All class times in Melbourne</span>
            </footer>
          </main>
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={activeHref === href ? "active" : ""}
                aria-current={activeHref === href ? "page" : undefined}
              >
                <Icon />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </Context.Provider>
  );
}
export function AuthPage({ register = false }: { register?: boolean }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    let mounted = true;
    api<User>("/auth/me")
      .then((user) =>
        router.replace(user.role === "admin" ? "/admin" : "/member"),
      )
      .catch(() => {
        if (mounted) setChecking(false);
      });
    return () => {
      mounted = false;
    };
  }, [router]);
  if (checking) return <Loading text="Checking your session" />;
  return (
    <main className="auth-page">
      <div className="auth-intro">
        <Link href="/login" className="brand">
          <Leaf />
          athleta
        </Link>
        <h1>
          More time
          <br /> on the floor.
        </h1>
        <p>
          Your classes, your people.
          <br />A little clarity for the day ahead.
        </p>
        <span>Group training, thoughtfully run.</span>
      </div>
      <section className="auth-card">
        <h2>{register ? "Join Athleta" : "Sign in"}</h2>
        <p className="muted">
          {register
            ? "Create your account to find your next class."
            : "The day’s training starts here."}
        </p>
        <MutationForm
          submitLabel={register ? "Create account" : "Sign in"}
          onSubmit={async (data) => {
            const body = Object.fromEntries(data);
            const user = await api<User>(
              register ? "/auth/register" : "/auth/login",
              "POST",
              body,
            );
            router.replace(user.role === "admin" ? "/admin" : "/member");
          }}
          onDone={() => {}}
        >
          {register && (
            <>
              <div className="form-grid">
                <Field label="First name">
                  <input
                    name="firstName"
                    autoComplete="given-name"
                    required
                    maxLength={100}
                  />
                </Field>
                <Field label="Last name">
                  <input
                    name="lastName"
                    autoComplete="family-name"
                    required
                    maxLength={100}
                  />
                </Field>
              </div>
              <Field label="Phone">
                <input name="phone" type="tel" autoComplete="tel" />
              </Field>
            </>
          )}
          <Field label="Email">
            <input name="email" type="email" autoComplete="email" required />
          </Field>
          <Field label="Password">
            <input
              name="password"
              type="password"
              autoComplete={register ? "new-password" : "current-password"}
              minLength={register ? 10 : undefined}
              required
            />
          </Field>
          {register && (
            <p className="form-note">
              Use at least 10 characters. Passwords may contain up to 72 UTF-8
              bytes.
            </p>
          )}
        </MutationForm>
        <p className="auth-switch">
          {register ? "Already a member?" : "New to Athleta?"}{" "}
          <Link href={register ? "/login" : "/register"}>
            {register ? "Sign in" : "Create an account"}
          </Link>
        </p>
        <details className="demo-credentials">
          <summary>Local demo accounts</summary>
          <p>Fictional seed data. Run the seed command before signing in.</p>
          <p>
            Admin: admin@athleta.local
            <br />
            Member: member@athleta.local
            <br />
            Password: AthletaDemo123!
          </p>
        </details>
      </section>
    </main>
  );
}
