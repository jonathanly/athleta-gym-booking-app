"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Clock3, Users } from "lucide-react";
import {
  formatGym,
  fullName,
  gymDate,
  gymTime,
  sessionPhase,
  type Dashboard,
} from "./api";
import { ClassList } from "./schedule";
import { Empty, ErrorMessage, Loading } from "./ui";
import { useApiData } from "./use-api";
export function DashboardPage() {
  const [date, setDate] = useState(gymDate),
    [version, setVersion] = useState(0);
  const { data, error } = useApiData<Dashboard>(
    `/dashboard?date=${date}`,
    version,
  );
  const sessions =
      data?.sessionsToday.filter((s) => s.status !== "cancelled") || [],
    live = sessions.find((s) => sessionPhase(s) === "In progress"),
    next = live || sessions.find((s) => sessionPhase(s) === "Upcoming"),
    unfinished = sessions.filter(
      (s) => sessionPhase(s) === "Completed" && s.attendedCount < s.bookedCount,
    ),
    full = sessions.filter((s) => s.bookedCount >= s.capacity);
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>{date === gymDate() ? "Today’s overview" : "Daily overview"}</h1>
          <p>A little clarity before the day picks up.</p>
        </div>
        <label className="date-filter">
          <span className="sr-only">Overview date</span>
          <input
            type="date"
            value={date}
            required
            onChange={(e) => {
              if (e.target.value) setDate(e.target.value);
            }}
          />
        </label>
      </div>
      {error ? (
        <ErrorMessage message={error} retry={() => setVersion((v) => v + 1)} />
      ) : !data ? (
        <Loading />
      ) : (
        <>
          <section className="summary" aria-label="Daily summary">
            <div>
              <p>Classes today</p>
              <strong>{sessions.length}</strong>
              <span>
                {sessions.length
                  ? `${gymTime(sessions[0].startsAt)} first session`
                  : "A clear day on the floor"}
              </span>
            </div>
            <div>
              <p>Booked places</p>
              <strong>
                {data.bookingsToday}
                <small> / {data.capacityToday}</small>
              </strong>
              <span>
                {full.length} {full.length === 1 ? "class" : "classes"} at
                capacity
              </span>
            </div>
            <div>
              <p>Checked in</p>
              <strong>{data.attendedToday}</strong>
              <span>Across the day’s classes</span>
            </div>
            <div className="next-summary">
              <p>Active members</p>
              <strong>{data.activeMembers}</strong>
              <span>{data.totalMembers} member accounts</span>
            </div>
          </section>
          <div className="main-grid">
            <section>
              <div className="section-head">
                <div>
                  <h2>The day’s classes</h2>
                  <p>
                    {formatGym(`${date}T12:00:00Z`, {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Link className="text-link" href="/admin/schedule">
                  Manage schedule
                </Link>
              </div>
              <ClassList sessions={data.sessionsToday} />
              <p className="list-footer">Select a class to open its roster</p>
            </section>
            <aside className="right-rail">
              {next ? (
                <section className="focus-class">
                  <p className="live-label">
                    <span />
                    {live ? "On the floor now" : "Next on the floor"}
                  </p>
                  <h3>{next.title}</h3>
                  <p>
                    {gymTime(next.startsAt)} · {next.coach}
                    <br />
                    {next.location}
                  </p>
                  <div className="attendance-summary">
                    <span>Members checked in</span>
                    <strong>
                      {next.attendedCount} / {next.bookedCount}
                    </strong>
                  </div>
                  <progress
                    value={next.attendedCount}
                    max={Math.max(next.bookedCount, 1)}
                    aria-label="Members checked in"
                  />
                  <Link className="primary" href={`/admin/sessions/${next.id}`}>
                    Open class roster
                    <ArrowRight />
                  </Link>
                </section>
              ) : (
                <section className="aside-section">
                  <h2>On the floor</h2>
                  <p>No more classes scheduled for this day.</p>
                  <Link className="text-link" href="/admin/schedule">
                    View the schedule
                  </Link>
                </section>
              )}
              <section className="aside-section">
                <h2>Worth a look</h2>
                {full.length ? (
                  <p>
                    <Users />
                    {full.length}{" "}
                    {full.length === 1 ? "class is" : "classes are"} full
                  </p>
                ) : (
                  <p>Room to move in every class.</p>
                )}
                {unfinished.length > 0 && (
                  <p>
                    <Clock3 />
                    {unfinished.length} completed{" "}
                    {unfinished.length === 1 ? "roster" : "rosters"} to review
                  </p>
                )}
                {unfinished[0] && (
                  <Link
                    className="text-link"
                    href={`/admin/sessions/${unfinished[0].id}`}
                  >
                    Review attendance
                  </Link>
                )}
                <p className="aside-note">
                  A completed roster may include no-shows. Open the roster to
                  finalise attendance.
                </p>
              </section>
            </aside>
          </div>
          <section className="recent-section">
            <div className="section-head">
              <h2>Recent bookings</h2>
              <Link className="text-link" href="/admin/members">
                Member directory
              </Link>
            </div>
            <div className="recent-list">
              {data.recentBookings.length ? (
                data.recentBookings.map((booking) => (
                  <div key={booking.id}>
                    <strong>{fullName(booking.user)}</strong>
                    <span>
                      {booking.session.title} ·{" "}
                      {
                        {
                          booked: "Booked",
                          attended: "Attended",
                          no_show: "No-show",
                          cancelled: "Cancelled",
                        }[booking.status]
                      }
                    </span>
                    <Link href={`/admin/sessions/${booking.sessionId}`}>
                      View roster
                      <ArrowRight />
                    </Link>
                  </div>
                ))
              ) : (
                <Empty title="No bookings yet">
                  New reservations will appear here.
                </Empty>
              )}
            </div>
          </section>
        </>
      )}
    </>
  );
}
