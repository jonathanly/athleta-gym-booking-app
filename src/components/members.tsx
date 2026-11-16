"use client";
import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { api, fullName, type User } from "./api";
import { useApiData } from "./use-api";
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
export function MemberForm({
  member,
  onClose,
  onSaved,
}: {
  member?: User;
  onClose: () => void;
  onSaved: () => void;
}) {
  return (
    <Dialog title={member ? "Edit member" : "Add member"} onClose={onClose}>
      <MutationForm
        submitLabel={member ? "Save changes" : "Create member"}
        onCancel={onClose}
        onDone={onSaved}
        onSubmit={(data) =>
          api(
            member ? `/members/${member.id}` : "/members",
            member ? "PATCH" : "POST",
            Object.fromEntries(data),
          )
        }
      >
        <div className="form-grid">
          <Field label="First name">
            <input name="firstName" required defaultValue={member?.firstName} />
          </Field>
          <Field label="Last name">
            <input name="lastName" required defaultValue={member?.lastName} />
          </Field>
        </div>
        <Field label="Email">
          <input
            name="email"
            type="email"
            required
            disabled={!!member}
            defaultValue={member?.email}
          />
        </Field>
        <Field label="Phone">
          <input name="phone" type="tel" defaultValue={member?.phone || ""} />
        </Field>
        {!member && (
          <>
            <Field label="Temporary password">
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={10}
                required
              />
            </Field>
            <p className="form-note">
              Use at least 10 characters, up to 72 UTF-8 bytes. Share these
              login details with the member securely. No invitation email is
              sent.
            </p>
          </>
        )}
      </MutationForm>
    </Dialog>
  );
}
export function MembersPage() {
  const [search, setSearch] = useState(""),
    [version, setVersion] = useState(0),
    [editing, setEditing] = useState<User | null | undefined>(undefined),
    [target, setTarget] = useState<User | null>(null),
    [notice, setNotice] = useState("");
  const { data: members, error } = useApiData<User[]>(
    `/members?search=${encodeURIComponent(search)}`,
    version,
  );
  const refresh = () => setVersion((v) => v + 1);
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Members</h1>
          <p>The people behind every booked place.</p>
        </div>
        <button className="primary" onClick={() => setEditing(null)}>
          <Plus />
          Add member
        </button>
      </div>
      {notice && (
        <p className="success" role="status">
          {notice}
        </p>
      )}
      <div className="filters">
        <SearchField
          label="Search members"
          placeholder="Find a member by name or email"
          value={search}
          onChange={setSearch}
        />
      </div>
      {error ? (
        <ErrorMessage message={error} retry={refresh} />
      ) : !members ? (
        <Loading text="Loading members" />
      ) : (
        <div className="directory">
          <div className="directory-labels">
            <span>Member</span>
            <span>Phone</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {members.length ? (
            members.map((member) => (
              <article className="directory-row" key={member.id}>
                <div className="person">
                  <span className="avatar">
                    {member.firstName[0]}
                    {member.lastName[0]}
                  </span>
                  <div>
                    <h2>{fullName(member)}</h2>
                    <p>{member.email}</p>
                  </div>
                </div>
                <span className="phone">{member.phone || "Not provided"}</span>
                <Badge tone={member.active ? "checked" : ""}>
                  {member.active ? "Active" : "Inactive"}
                </Badge>
                <div className="row-actions">
                  <button
                    className="secondary"
                    onClick={() => setEditing(member)}
                    aria-label={`Edit ${fullName(member)}`}
                  >
                    <Pencil />
                    Edit
                  </button>
                  <button
                    className="text-button"
                    onClick={() => setTarget(member)}
                  >
                    {member.active ? "Deactivate" : "Reactivate"}
                  </button>
                </div>
              </article>
            ))
          ) : (
            <Empty title="No members found">
              Try another name or email, or add a new member.
            </Empty>
          )}
        </div>
      )}
      {editing !== undefined && (
        <MemberForm
          member={editing || undefined}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setNotice(editing ? "Member updated" : "Member created");
            setEditing(undefined);
            refresh();
          }}
        />
      )}
      {target && (
        <Dialog
          title={`${target.active ? "Deactivate" : "Reactivate"} member?`}
          onClose={() => setTarget(null)}
        >
          <p className="confirmation-copy">
            {fullName(target)}
            {target.active
              ? " will no longer be able to sign in or make new bookings. Existing booking history is preserved."
              : " will be able to sign in and make bookings again."}
          </p>
          <MutationForm
            submitLabel={
              target.active ? "Deactivate member" : "Reactivate member"
            }
            danger={target.active}
            onCancel={() => setTarget(null)}
            onSubmit={() =>
              api(`/members/${target.id}`, "PATCH", { active: !target.active })
            }
            onDone={() => {
              setNotice(
                target.active ? "Member deactivated" : "Member reactivated",
              );
              setTarget(null);
              refresh();
            }}
          >
            {null}
          </MutationForm>
        </Dialog>
      )}
    </>
  );
}
