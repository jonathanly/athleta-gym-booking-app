"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ChevronRight, Plus, Pencil } from "lucide-react";
import {
  api,
  formatGym,
  gymDate,
  gymInstant,
  gymTime,
  nextDate,
  sessionPhase,
  type Session,
  type Booking,
} from "./api";
import {
  Badge,
  Dialog,
  Empty,
  ErrorMessage,
  Field,
  Loading,
  MutationForm,
  SearchField,
} from "./ui";
import { useAuth } from "./auth";
import { useApiData, useClock } from "./use-api";

export function ClassBadge({ session }: { session: Session }) {
  const phase = sessionPhase(session);
  return (
    <Badge
      tone={
        phase === "In progress"
          ? "live"
          : phase === "Cancelled"
            ? "cancelled"
            : session.bookedCount >= session.capacity
              ? "full"
              : ""
      }
    >
      {phase === "Upcoming" && session.bookedCount >= session.capacity
        ? "Class full"
        : phase}
    </Badge>
  );
}
export function ClassList({
  sessions,
  admin = true,
  onEdit,
  bookings = [],
  onBook,
}: {
  sessions: Session[];
  admin?: boolean;
  onEdit?: (session: Session) => void;
  bookings?: Booking[];
  onBook?: (session: Session, booking?: Booking) => void;
}) {
  const now = useClock();
  return (
    <div className="class-list">
      <div className={`class-labels ${!admin ? "member-class-grid" : ""}`}>
        <span>Start</span>
        <span>Class & coach</span>
        <span>Booked</span>
        <span>Status</span>
        <span className="sr-only">Actions</span>
      </div>
      {sessions.length ? (
        sessions.map((session) => {
          const booking = bookings.find(
            (b) => b.sessionId === session.id && b.status !== "cancelled",
          );
          return (
            <article
              className={`class-row ${!admin ? "member-class-grid" : ""} ${sessionPhase(session) === "In progress" ? "current" : ""}`}
              key={session.id}
            >
              <div className="time">
                {gymTime(session.startsAt)}
                <small>{session.durationMinutes} min</small>
              </div>
              <div>
                <div className="class-title">
                  {admin ? (
                    <Link href={`/admin/sessions/${session.id}`}>
                      {session.title}
                    </Link>
                  ) : (
                    session.title
                  )}
                </div>
                <p className="class-meta">
                  {session.coach} · {session.location}
                </p>
              </div>
              <div className="seats">
                {session.bookedCount}
                <span> / {session.capacity}</span>
                <meter
                  min={0}
                  max={session.capacity}
                  value={session.bookedCount}
                  aria-label={`${session.bookedCount} of ${session.capacity} places booked`}
                />
              </div>
              <div className="class-status">
                {booking ? (
                  <Badge tone="checked">You’re booked</Badge>
                ) : (
                  <ClassBadge session={session} />
                )}
              </div>
              <div className="class-actions">
                {admin ? (
                  <>
                    {onEdit && (
                      <button
                        className="icon-button"
                        aria-label={`Edit ${session.title}`}
                        onClick={() => onEdit(session)}
                      >
                        <Pencil />
                      </button>
                    )}
                    <Link
                      className="icon-button"
                      href={`/admin/sessions/${session.id}`}
                      aria-label={`Open ${session.title} roster`}
                    >
                      <ChevronRight />
                    </Link>
                  </>
                ) : (
                  <button
                    className={booking ? "secondary" : "primary"}
                    disabled={
                      session.status === "cancelled" ||
                      Date.parse(session.startsAt) <= now ||
                      (!booking && session.bookedCount >= session.capacity)
                    }
                    onClick={() => onBook?.(session, booking)}
                  >
                    {booking
                      ? "Cancel booking"
                      : session.bookedCount >= session.capacity
                        ? "Full"
                        : "Book class"}
                  </button>
                )}
              </div>
            </article>
          );
        })
      ) : (
        <Empty title="No classes to show">
          Try another search or date, or check back for the next session.
        </Empty>
      )}
    </div>
  );
}
export function ClassForm({
  session,
  onClose,
  onSaved,
}: {
  session?: Session;
  onClose: () => void;
  onSaved: () => void;
}) {
  const now = useClock();
  const past = !!session && Date.parse(session.startsAt) <= now;
  return (
    <Dialog title={session ? "Edit class" : "New class"} onClose={onClose}>
      <p className="form-note">Class times are entered in Melbourne time.</p>
      <MutationForm
        submitLabel={session ? "Save changes" : "Create class"}
        onCancel={onClose}
        onDone={onSaved}
        onSubmit={(data) => {
          const values = Object.fromEntries(data);
          const body = {
            title: values.title,
            description: values.description,
            ...(!past
              ? {
                  coach: values.coach,
                  location: values.location,
                  capacity: Number(values.capacity),
                  startsAt: gymInstant(
                    String(values.date),
                    String(values.time),
                  ),
                  durationMinutes: Number(values.durationMinutes),
                }
              : {}),
          };
          return api(
            session ? `/sessions/${session.id}` : "/sessions",
            session ? "PATCH" : "POST",
            body,
          );
        }}
      >
        <Field label="Class name">
          <input
            name="title"
            required
            defaultValue={session?.title}
            maxLength={160}
          />
        </Field>
        <Field label="Description">
          <textarea
            name="description"
            rows={3}
            defaultValue={session?.description}
          />
        </Field>
        <div className="form-grid">
          <Field label="Coach">
            <input
              name="coach"
              required
              disabled={past}
              defaultValue={session?.coach}
            />
          </Field>
          <Field label="Location">
            <input
              name="location"
              required
              disabled={past}
              defaultValue={session?.location}
            />
          </Field>
          <Field label="Date">
            <input
              name="date"
              type="date"
              required
              disabled={past}
              defaultValue={session ? gymDate(session.startsAt) : gymDate()}
            />
          </Field>
          <Field label="Start time">
            <input
              name="time"
              type="time"
              required
              disabled={past}
              defaultValue={session ? gymTime(session.startsAt) : "09:00"}
            />
          </Field>
          <Field label="Duration (minutes)">
            <input
              name="durationMinutes"
              type="number"
              min={1}
              step={1}
              required
              disabled={past}
              defaultValue={session?.durationMinutes || 45}
            />
          </Field>
          <Field label="Capacity">
            <input
              name="capacity"
              type="number"
              min={Math.max(1, session?.bookedCount || 0)}
              step={1}
              required
              disabled={past}
              defaultValue={session?.capacity || 12}
            />
          </Field>
        </div>
        {past && (
          <p className="form-note">
            This class has started. Only its name and description can be
            corrected. Scheduling details are locked.
          </p>
        )}
      </MutationForm>
    </Dialog>
  );
}
export function SchedulePage({ member = false }: { member?: boolean }) {
  const { user } = useAuth();
  const [date, setDate] = useState(gymDate),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState(""),
    [version, setVersion] = useState(0),
    [editing, setEditing] = useState<Session | null | undefined>(undefined),
    [bookingTarget, setBookingTarget] = useState<{
      session: Session;
      booking?: Booking;
    } | null>(null),
    [notice, setNotice] = useState("");
  const refresh = () => setVersion((v) => v + 1);
  const params = new URLSearchParams({
    from: gymInstant(date),
    to: gymInstant(nextDate(date)),
  });
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  const { data: sessions, error: sessionError } = useApiData<Session[]>(
    `/sessions?${params}`,
    version,
  );
  const { data: bookings, error: bookingError } = useApiData<Booking[]>(
    member ? `/bookings?userId=${user.id}` : null,
    version,
  );
  const error = sessionError || bookingError;
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>{member ? "Find your next class" : "Class schedule"}</h1>
          <p>
            {member
              ? "Make room for movement. All times are local to the gym."
              : "Keep the floor running, one well-planned session at a time."}
          </p>
        </div>
        {!member && (
          <button className="primary" onClick={() => setEditing(null)}>
            <Plus />
            New class
          </button>
        )}
      </div>
      {notice && (
        <p className="success" role="status">
          {notice}
        </p>
      )}
      <div className="filters">
        <SearchField
          value={search}
          onChange={(value) => {
            setNotice("");
            setSearch(value);
          }}
          label="Search classes"
          placeholder="Find a class or coach"
        />
        <label className="date-filter">
          <span className="sr-only">Class date</span>
          <input
            type="date"
            value={date}
            required
            onChange={(e) => {
              if (e.target.value) {
                setNotice("");
                setDate(e.target.value);
              }
            }}
          />
        </label>
        <label>
          <span className="sr-only">Class status</span>
          <select
            value={status}
            onChange={(e) => {
              setNotice("");
              setStatus(e.target.value);
            }}
          >
            <option value="">All classes</option>
            <option value="scheduled">Scheduled</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
      </div>
      <div className="section-head">
        <h2>
          {formatGym(`${date}T12:00:00Z`, {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </h2>
        <span className="muted">Melbourne time</span>
      </div>
      {error ? (
        <ErrorMessage message={error} retry={refresh} />
      ) : sessions ? (
        <ClassList
          sessions={sessions}
          admin={!member}
          onEdit={setEditing}
          bookings={bookings || []}
          onBook={(session, booking) => setBookingTarget({ session, booking })}
        />
      ) : (
        <Loading text="Loading classes" />
      )}
      {editing !== undefined && (
        <ClassForm
          session={editing || undefined}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setNotice(editing ? "Class updated" : "Class created");
            setEditing(undefined);
            refresh();
          }}
        />
      )}
      {bookingTarget && (
        <Dialog
          title={
            bookingTarget.booking ? "Cancel your booking?" : "Book this class?"
          }
          onClose={() => setBookingTarget(null)}
        >
          <p className="confirmation-copy">
            {bookingTarget.session.title}
            <br />
            {formatGym(bookingTarget.session.startsAt, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}{" "}
            · {gymTime(bookingTarget.session.startsAt)} Melbourne time
          </p>
          <MutationForm
            submitLabel={
              bookingTarget.booking ? "Cancel booking" : "Confirm booking"
            }
            danger={!!bookingTarget.booking}
            onCancel={() => setBookingTarget(null)}
            onSubmit={() =>
              bookingTarget.booking
                ? api(`/bookings/${bookingTarget.booking.id}`, "PATCH", {
                    status: "cancelled",
                  })
                : api("/bookings", "POST", {
                    sessionId: bookingTarget.session.id,
                  })
            }
            onDone={() => {
              setNotice(
                bookingTarget.booking
                  ? "Booking cancelled"
                  : "Your place is booked",
              );
              setBookingTarget(null);
              refresh();
            }}
          >
            {bookingTarget.booking && (
              <p className="form-note">
                Your place will become available to another member.
              </p>
            )}
          </MutationForm>
        </Dialog>
      )}
      <p className="list-footer">
        {sessions?.length ?? "—"} classes ·{" "}
        <Link href={member ? "/member/bookings" : "/admin"}>
          {member ? "View my bookings" : "Back to today"} <ArrowRight />
        </Link>
      </p>
    </>
  );
}
