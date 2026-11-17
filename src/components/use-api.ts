"use client";
import { useEffect, useState } from "react";
import { api } from "./api";

// Keep each response with its request identity so changing filters cannot show
// results from the previous query while the new request is in flight.
export function useApiData<T>(path: string | null, revision = 0) {
  const key = `${path}:${revision}`;
  const [result, setResult] = useState<{
    key: string;
    path: string;
    data: T | null;
    error: string;
  } | null>(null);
  useEffect(() => {
    if (!path) return;
    let active = true;
    api<T>(path)
      .then((data) => {
        if (active) setResult({ key, path, data, error: "" });
      })
      .catch((error) => {
        if (active) setResult({ key, path, data: null, error: error.message });
      });
    return () => {
      active = false;
    };
  }, [path, key]);
  return result?.key === key
    ? result
    : { data: result?.path === path ? result.data : null, error: "" };
}

export function useClock() {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);
  return now;
}
