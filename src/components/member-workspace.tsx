"use client";
import Link from "next/link";
import { useState } from "react";
import { api, formatGym, gymTime, type Booking, type User } from "./api";
import { useAuth } from "./auth";
import { useApiData, useClock } from "./use-api";
import {
  Badge,
  Dialog,
  Empty,
  ErrorMessage,
  Field,
  Loading,
  MutationForm,
} from "./ui";
export function MyBookingsPage() {
  const { user } = useAuth();
  const now = useClock();
  const [tab, setTab] = useState("upcoming"),
    [version, setVersion] = useState(0),
    [target, setTarget] = useState<Booking | null>(null),
    [notice, setNotice] = useState("");
  const { data: bookings, error } = useApiData<Booking[]>(
    `/bookings?userId=${user.id}`,
    version,
  );
  const rows = bookings
    ?.filter((b) => {
      const upcoming =
        Date.parse(b.session.startsAt) > now && b.status !== "cancelled";
      return tab === "upcoming" ? upcoming : !upcoming;
    })
    .sort((a, b) =>
      tab === "upcoming"
        ? Date.parse(a.session.startsAt) - Date.parse(b.session.startsAt)
        : Date.parse(b.session.startsAt) - Date.parse(a.session.startsAt),
    );
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>My bookings</h1>
          <p>A place for the sessions ahead and the work you’ve put in.</p>
        </div>
        <Link className="primary" href="/member">
          Find a class
        </Link>
      </div>
      {notice && (
        <p className="success" role="status">
          {notice}
        </p>
      )}
      <div className="tabs" role="group" aria-label="Booking period">
        {["upcoming", "history"].map((value) => (
          <button
            key={value}
            aria-pressed={tab === value}
            onClick={() => setTab(value)}
          >
            {value === "upcoming" ? "Upcoming" : "History"}
          </button>
        ))}
      </div>
      {error ? (
        <ErrorMessage message={error} retry={() => setVersion((v) => v + 1)} />
      ) : !rows ? (
        <Loading text="Loading bookings" />
      ) : (
        <div className="booking-list">
          {rows.length ? (
            rows.map((booking) => (
              <article className="booking-row" key={booking.id}>
                <div>
                  <p className="booking-date">
                    {formatGym(booking.session.startsAt, {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    · {gymTime(booking.session.startsAt)}
                  </p>
                  <h2>{booking.session.title}</h2>
                  <p>
                    {booking.session.coach} · {booking.session.location}
                  </p>
                </div>
                <Badge
                  tone={
                    booking.status === "attended"
                      ? "checked"
                      : booking.status === "no_show"
                        ? "no-show"
                        : ""
                  }
                >
                  {
                    {
                      booked: "Booked",
                      attended: "Attended",
                      no_show: "No-show",
                      cancelled: "Cancelled",
                    }[booking.status]
                  }
                </Badge>
                {tab === "upcoming" && (
                  <button
                    className="secondary"
                    onClick={() => setTarget(booking)}
                  >
                    Cancel booking
                  </button>
                )}
              </article>
            ))
          ) : (
            <Empty
              title={
                tab === "upcoming"
                  ? "Your next class is waiting"
                  : "No booking history yet"
              }
            >
              {tab === "upcoming"
                ? "Browse the timetable and book a place that suits your day."
                : "Your past sessions and cancellations will appear here."}
            </Empty>
          )}
        </div>
      )}
      {target && (
        <Dialog title="Cancel your booking?" onClose={() => setTarget(null)}>
          <p className="confirmation-copy">
            Your place in {target.session.title} will become available to
            another member.
          </p>
          <MutationForm
            submitLabel="Cancel booking"
            danger
            onCancel={() => setTarget(null)}
            onSubmit={() =>
              api(`/bookings/${target.id}`, "PATCH", { status: "cancelled" })
            }
            onDone={() => {
              setTarget(null);
              setNotice("Booking cancelled");
              setVersion((v) => v + 1);
            }}
          >
            {null}
          </MutationForm>
        </Dialog>
      )}
    </>
  );
}
export function ProfilePage() {
  const { user, setUser } = useAuth();
  const [notice, setNotice] = useState("");
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Your profile</h1>
          <p>Keep your contact details up to date.</p>
        </div>
      </div>
      {notice && (
        <p className="success" role="status">
          {notice}
        </p>
      )}
      <section className="profile-panel">
        <h2>Personal details</h2>
        <MutationForm
          submitLabel="Save changes"
          onSubmit={async (data) =>
            setUser(
              await api<User>("/auth/me", "PATCH", Object.fromEntries(data)),
            )
          }
          onDone={() => setNotice("Your profile has been updated")}
        >
          <div className="form-grid">
            <Field label="First name">
              <input
                name="firstName"
                autoComplete="given-name"
                required
                defaultValue={user.firstName}
              />
            </Field>
            <Field label="Last name">
              <input
                name="lastName"
                autoComplete="family-name"
                required
                defaultValue={user.lastName}
              />
            </Field>
          </div>
          <Field label="Email">
            <input type="email" disabled value={user.email} />
          </Field>
          <p className="form-note">
            Contact gym staff if your email address needs to change.
          </p>
          <Field label="Phone">
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              defaultValue={user.phone || ""}
            />
          </Field>
        </MutationForm>
      </section>
    </>
  );
}
