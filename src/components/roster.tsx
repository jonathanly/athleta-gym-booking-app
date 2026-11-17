"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Plus,
  Pencil,
} from "lucide-react";
import {
  api,
  formatGym,
  fullName,
  gymTime,
  type Session,
  type Booking,
  type User,
} from "./api";
import { ClassBadge, ClassForm } from "./schedule";
import { useApiData, useClock } from "./use-api";
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
const attendanceLabels = {
  booked: "Not checked in",
  attended: "Checked in",
  no_show: "No-show",
  cancelled: "Cancelled",
};
export function RosterPage({ id }: { id: string }) {
  const now = useClock();
  const [mutationError, setError] = useState(""),
    [version, setVersion] = useState(0),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState(""),
    [editing, setEditing] = useState(false),
    [cancelClass, setCancelClass] = useState(false),
    [add, setAdd] = useState(false),
    [target, setTarget] = useState<Booking | null>(null),
    [busy, setBusy] = useState(""),
    [notice, setNotice] = useState("");
  const refresh = () => setVersion((v) => v + 1);
  const { data: session, error: sessionError } = useApiData<Session>(
    `/sessions/${id}`,
    version,
  );
  const { data: bookingRows, error: bookingError } = useApiData<Booking[]>(
    `/bookings?sessionId=${id}`,
    version,
  );
  const bookings = bookingRows || [];
  const error = mutationError || sessionError || bookingError;
  async function attendance(booking: Booking, status: Booking["status"]) {
    setBusy(booking.id);
    setError("");
    try {
      await api(`/bookings/${booking.id}`, "PATCH", { status });
      setNotice(
        `${fullName(booking.user)} ${status === "attended" ? "checked in" : status === "no_show" ? "marked as a no-show" : "returned to expected"}`,
      );
      refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy("");
    }
  }
  if (!session)
    return error ? (
      <ErrorMessage message={error} retry={refresh} />
    ) : (
      <Loading text="Loading class roster" />
    );
  const active = bookings.filter((b) => b.status !== "cancelled"),
    attended = active.filter((b) => b.status === "attended").length,
    expected = active.filter((b) => b.status === "booked").length,
    rows = bookings.filter(
      (b) =>
        (filter ? b.status === filter : b.status !== "cancelled") &&
        `${fullName(b.user)} ${b.user.email}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    ),
    started = Date.parse(session.startsAt) <= now,
    cancelled = session.status === "cancelled";
  return (
    <>
      <Link className="back-link" href="/admin/schedule">
        <ArrowLeft />
        Back to schedule
      </Link>
      <div className="page-heading">
        <div>
          <h1>{session.title}</h1>
          <div className="metadata">
            <span>
              <CalendarDays />
              {formatGym(session.startsAt, {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span>
              <Clock3 />
              {gymTime(session.startsAt)}–
              {gymTime(
                new Date(
                  Date.parse(session.startsAt) +
                    session.durationMinutes * 60000,
                ).toISOString(),
              )}
            </span>
            <span>
              <MapPin />
              {session.location}
            </span>
          </div>
        </div>
        <ClassBadge session={session} />
      </div>
      {notice && (
        <p className="success" role="status">
          {notice}
        </p>
      )}
      {error && <ErrorMessage message={error} retry={refresh} />}
      <div className="roster-stats">
        <span>
          <strong>{active.length}</strong>Booked
        </span>
        <span>
          <strong>{attended}</strong>Checked in
        </span>
        <span>
          <strong>{expected}</strong>Expected
        </span>
        <Badge>{session.capacity - active.length} places available</Badge>
      </div>
      <div className="main-grid">
        <section>
          <div className="section-head">
            <div>
              <h2>Class roster</h2>
              <p>Check members in as they arrive.</p>
            </div>
            <button
              className="primary"
              disabled={
                cancelled || started || active.length >= session.capacity
              }
              onClick={() => setAdd(true)}
            >
              <Plus />
              Add booking
            </button>
          </div>
          {!started && !cancelled && (
            <p className="notice">Attendance opens when the class starts.</p>
          )}
          {cancelled && (
            <p className="notice">
              This class is cancelled. Its reservations have been cancelled too.
            </p>
          )}
          <div className="filters">
            <SearchField
              label="Search roster"
              placeholder="Search members"
              value={search}
              onChange={setSearch}
            />
            <label>
              <span className="sr-only">Attendance status</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">Active bookings</option>
                {Object.entries(attendanceLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="roster-list">
            <div className="roster-labels">
              <span>Member</span>
              <span>Attendance</span>
              <span>Actions</span>
            </div>
            {rows.length ? (
              rows.map((booking) => (
                <article className="member-row" key={booking.id}>
                  <div className="person">
                    <span className="avatar">
                      {booking.user.firstName[0]}
                      {booking.user.lastName[0]}
                    </span>
                    <div>
                      <h3>{fullName(booking.user)}</h3>
                      <p>{booking.user.email}</p>
                    </div>
                  </div>
                  <div className="member-status">
                    <Badge
                      tone={
                        booking.status === "attended"
                          ? "checked"
                          : booking.status === "no_show"
                            ? "no-show"
                            : ""
                      }
                    >
                      {booking.status === "attended" && <Check />}
                      {attendanceLabels[booking.status]}
                    </Badge>
                  </div>
                  <div className="row-actions">
                    {!cancelled && booking.status !== "cancelled" && (
                      <>
                        {booking.status === "booked" ? (
                          <>
                            <button
                              className="check-button"
                              disabled={!started || busy === booking.id}
                              onClick={() => attendance(booking, "attended")}
                            >
                              <Check />
                              Check in
                            </button>
                            <button
                              className="text-button"
                              disabled={!started || busy === booking.id}
                              onClick={() => attendance(booking, "no_show")}
                            >
                              No-show
                            </button>
                          </>
                        ) : (
                          <button
                            className="text-button"
                            disabled={busy === booking.id}
                            onClick={() => attendance(booking, "booked")}
                          >
                            {booking.status === "attended"
                              ? "Undo check-in"
                              : "Undo no-show"}
                          </button>
                        )}
                        <button
                          className="text-button"
                          disabled={busy === booking.id}
                          onClick={() => setTarget(booking)}
                        >
                          Cancel booking
                        </button>
                      </>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <Empty title="No members to show">
                Try a different search or attendance filter.
              </Empty>
            )}
          </div>
          <p className="list-footer">
            Showing {rows.length} of {bookings.length} reservations
          </p>
        </section>
        <aside className="right-rail">
          <section className="aside-section">
            <h2>Class details</h2>
            <p>Coach: {session.coach}</p>
            <p>
              {session.durationMinutes}-minute session · {session.capacity}{" "}
              places
            </p>
            <p>{session.description || "No description added."}</p>
            {!cancelled && (
              <div className="aside-actions">
                <button className="secondary" onClick={() => setEditing(true)}>
                  <Pencil />
                  Edit class
                </button>
                <button
                  className="text-button danger-text"
                  onClick={() => setCancelClass(true)}
                >
                  Cancel class
                </button>
              </div>
            )}
          </section>
          <section className="aside-section">
            <h2>A simpler check-in</h2>
            <p>
              Made a mistake? Undo returns a member to the expected list.
              No-shows keep their place in the attendance history.
            </p>
          </section>
        </aside>
      </div>
      {editing && (
        <ClassForm
          session={session}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            setNotice("Class updated");
            refresh();
          }}
        />
      )}
      {cancelClass && (
        <Dialog
          title="Cancel this class?"
          onClose={() => setCancelClass(false)}
        >
          <p className="confirmation-copy">
            {session.title} will be cancelled along with all active
            reservations. This cannot be undone.
          </p>
          <MutationForm
            submitLabel="Cancel class"
            danger
            onCancel={() => setCancelClass(false)}
            onSubmit={() =>
              api(`/sessions/${id}`, "PATCH", { status: "cancelled" })
            }
            onDone={() => {
              setCancelClass(false);
              setNotice("Class cancelled");
              refresh();
            }}
          >
            {null}
          </MutationForm>
        </Dialog>
      )}
      {target && (
        <Dialog title="Cancel booking?" onClose={() => setTarget(null)}>
          <p className="confirmation-copy">
            Remove {fullName(target.user)} from this class? The cancelled
            reservation stays in booking history.
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
              refresh();
            }}
          >
            {null}
          </MutationForm>
        </Dialog>
      )}
      {add && (
        <AddBooking
          session={session}
          bookings={active}
          onClose={() => setAdd(false)}
          onSaved={() => {
            setAdd(false);
            setNotice("Member added to the class");
            refresh();
          }}
        />
      )}
    </>
  );
}
function AddBooking({
  session,
  bookings,
  onClose,
  onSaved,
}: {
  session: Session;
  bookings: Booking[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [search, setSearch] = useState(""),
    { data, error } = useApiData<User[]>(
      `/members?search=${encodeURIComponent(search)}`,
    );
  const members = data?.filter(
    (user) => user.active && !bookings.some((b) => b.userId === user.id),
  );
  return (
    <Dialog title="Add booking" onClose={onClose}>
      <p className="form-note">Choose an active member for {session.title}.</p>
      <SearchField label="Find member" value={search} onChange={setSearch} />
      {error ? (
        <ErrorMessage message={error} />
      ) : !members ? (
        <Loading text="Finding members" />
      ) : !members.length ? (
        <Empty title="No available members">
          Try another name. Inactive or already booked members are not listed.
        </Empty>
      ) : (
        <MutationForm
          submitLabel="Add booking"
          onCancel={onClose}
          onDone={onSaved}
          onSubmit={(data) =>
            api("/bookings", "POST", {
              sessionId: session.id,
              userId: data.get("userId"),
            })
          }
        >
          <Field label="Member">
            <select name="userId" required defaultValue="">
              <option value="" disabled>
                Select a member
              </option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {fullName(member)} · {member.email}
                </option>
              ))}
            </select>
          </Field>
        </MutationForm>
      )}
    </Dialog>
  );
}
