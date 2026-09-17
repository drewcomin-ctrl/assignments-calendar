"use client";

import { useSyncExternalStore } from "react";
import type { Assignment, SchoolClass } from "./types";

const ASSIGNMENTS_KEY = "assignments";
const CLASSES_KEY = "classes";

const PALETTE = [
  "#ef4444",
  "#f59e0b",
  "#6366f1",
  "#8b5cf6",
  "#0ea5e9",
  "#10b981",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#a855f7",
  "#eab308",
  "#22d3ee",
];

export const DEFAULT_CLASSES: SchoolClass[] = [
  { name: "Math", color: "#ef4444" },
  { name: "Spanish", color: "#f59e0b" },
  { name: "CAD", color: "#6366f1" },
  { name: "Seminary", color: "#8b5cf6" },
  { name: "Drones", color: "#0ea5e9" },
  { name: "Health", color: "#10b981" },
  { name: "English", color: "#ec4899" },
  { name: "Physics", color: "#14b8a6" },
];

const todayStr = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

const loadClasses = (): SchoolClass[] => {
  if (typeof window === "undefined") return DEFAULT_CLASSES;
  try {
    const raw = window.localStorage.getItem(CLASSES_KEY);
    if (!raw) {
      window.localStorage.setItem(CLASSES_KEY, JSON.stringify(DEFAULT_CLASSES));
      return DEFAULT_CLASSES;
    }
    const parsed = JSON.parse(raw) as SchoolClass[];
    if (!Array.isArray(parsed)) return DEFAULT_CLASSES;
    return parsed.filter((c) => c && typeof c.name === "string");
  } catch {
    return DEFAULT_CLASSES;
  }
};

const migrateAssignment = (a: Partial<Assignment>): Assignment => ({
  id: String(a.id ?? crypto.randomUUID()),
  title: a.title?.trim() || "Untitled",
  className: a.className?.trim() || "Ungrouped",
  assignedDate: a.assignedDate ?? a.dueDate ?? todayStr(),
  dueDate: a.dueDate ?? todayStr(),
  description: a.description ?? "",
  completed: a.completed === true,
  createdAt: a.createdAt ?? "",
});

const loadAssignments = (): Assignment[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ASSIGNMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(migrateAssignment);
  } catch {
    return [];
  }
};

interface ExternalStore<T> {
  getSnapshot: () => T;
  subscribe: (listener: () => void) => () => void;
  set: (next: T) => void;
}

function createStore<T>(storageKey: string, load: () => T): ExternalStore<T> {
  let cache: T | null = null;
  const listeners = new Set<() => void>();

  const emit = () => listeners.forEach((l) => l());

  const refresh = () => {
    cache = null;
    emit();
  };

  const getSnapshot = (): T => {
    if (cache === null) cache = load();
    return cache;
  };

  const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener);
    window.addEventListener("storage", refresh);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", refresh);
    };
  };

  const set = (next: T) => {
    window.localStorage.setItem(storageKey, JSON.stringify(next));
    cache = next;
    emit();
  };

  return { getSnapshot, subscribe, set };
}

const assignmentsStore = createStore(ASSIGNMENTS_KEY, loadAssignments);
const classesStore = createStore(CLASSES_KEY, loadClasses);

const colorForClass = (name: string): string => {
  const found = classesStore.getSnapshot().find((c) => c.name === name);
  if (found) return found.color;
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % PALETTE.length;
  return PALETTE[h];
};

export function useCalendar() {
  const assignments = useSyncExternalStore(
    assignmentsStore.subscribe,
    assignmentsStore.getSnapshot,
    () => []
  );
  const classes = useSyncExternalStore(
    classesStore.subscribe,
    classesStore.getSnapshot,
    () => DEFAULT_CLASSES
  );

  const addAssignment = (
    input: Omit<Assignment, "id" | "createdAt" | "completed">
  ) => {
    const assignment: Assignment = {
      ...input,
      completed: false,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    assignmentsStore.set([...assignmentsStore.getSnapshot(), assignment]);
  };

  const deleteAssignment = (id: string) => {
    assignmentsStore.set(
      assignmentsStore.getSnapshot().filter((a) => a.id !== id)
    );
  };

  const toggleComplete = (id: string) => {
    assignmentsStore.set(
      assignmentsStore
        .getSnapshot()
        .map((a) => (a.id === id ? { ...a, completed: !a.completed } : a))
    );
  };

  const addClass = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const existing = classesStore.getSnapshot();
    if (existing.some((c) => c.name.toLowerCase() === trimmed.toLowerCase()))
      return;
    const used = new Set(existing.map((c) => c.color));
    const color = PALETTE.find((c) => !used.has(c)) ?? "#64748b";
    classesStore.set([...existing, { name: trimmed, color }]);
  };

  const deleteClass = (name: string) => {
    classesStore.set(
      classesStore.getSnapshot().filter((c) => c.name !== name)
    );
  };

  const setClassColor = (name: string, color: string) => {
    classesStore.set(
      classesStore
        .getSnapshot()
        .map((c) => (c.name === name ? { ...c, color } : c))
    );
  };

  return {
    assignments,
    classes,
    addAssignment,
    deleteAssignment,
    toggleComplete,
    addClass,
    deleteClass,
    setClassColor,
    colorForClass,
  };
}