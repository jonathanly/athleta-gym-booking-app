"use client";
import {
  cloneElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type ReactElement,
  type FormEvent,
} from "react";
import { X, Search, LoaderCircle, AlertCircle } from "lucide-react";

export function Loading({ text = "Loading workspace" }: { text?: string }) {
  return (
    <div className="state" role="status">
      <LoaderCircle className="spinner" />
      <span>{text}…</span>
    </div>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="state">
      <strong>{title}</strong>
      <p>{children}</p>
    </div>
  );
}
export function ErrorMessage({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div className="error" role="alert">
      <AlertCircle />
      <span>{message}</span>
      {retry && (
        <button className="text-button" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}
export function SearchField({
  value,
  onChange,
  label = "Search",
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}) {
  return (
    <label className="search">
      <span className="sr-only">{label}</span>
      <Search />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
      />
    </label>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactElement<{ id?: string }>;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {cloneElement(children, { id })}
    </div>
  );
}
export function Badge({
  children,
  tone = "",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
export function Dialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previous;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby="dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="dialog-inner">
        <div className="dialog-heading">
          <h2 id="dialog-title">{title}</h2>
          <button
            className="icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
export function MutationForm({
  children,
  submitLabel,
  onSubmit,
  onDone,
  onCancel,
  danger = false,
}: {
  children: ReactNode;
  submitLabel: string;
  onSubmit: (data: FormData) => Promise<unknown>;
  onDone: () => void;
  onCancel?: () => void;
  danger?: boolean;
}) {
  const [error, setError] = useState(""),
    [pending, setPending] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      await onSubmit(new FormData(e.currentTarget));
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save changes");
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={submit}>
      {children}
      {error && <ErrorMessage message={error} />}
      <div className="form-actions">
        {onCancel && (
          <button
            type="button"
            className="secondary"
            disabled={pending}
            onClick={onCancel}
          >
            Keep unchanged
          </button>
        )}
        <button className={danger ? "danger" : "primary"} disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
