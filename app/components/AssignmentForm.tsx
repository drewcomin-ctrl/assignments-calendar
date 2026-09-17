"use client";

import { useState } from "react";
import type { Assignment, SchoolClass } from "@/app/lib/types";
import styles from "./AssignmentForm.module.css";

interface Props {
  defaultAssignedDate: string;
  defaultDueDate: string;
  classes: SchoolClass[];
  onSave: (input: Omit<Assignment, "id" | "createdAt" | "completed">) => void;
  onClose: () => void;
}

export function AssignmentForm({
  defaultAssignedDate,
  defaultDueDate,
  classes,
  onSave,
  onClose,
}: Props) {
  const [title, setTitle] = useState("");
  const [className, setClassName] = useState("");
  const [assignedDate, setAssignedDate] = useState(defaultAssignedDate);
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !className || !assignedDate || !dueDate) {
      setError("Please fill in title, class, assigned date, and due date.");
      return;
    }
    if (dueDate < assignedDate) {
      setError("Due date can't be before the assigned date.");
      return;
    }
    onSave({
      title: title.trim(),
      className,
      assignedDate,
      dueDate,
      description: description.trim(),
    });
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <form
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>New Assignment</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <label className={styles.label}>
          Assignment
          <input
            className={styles.input}
            autoFocus
            type="text"
            required
            placeholder="e.g. Problem Set 4"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label className={styles.label}>
          Class
          <select
            className={styles.input}
            required
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          >
            <option value="" disabled>
              Select a class
            </option>
            {classes.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          {classes.length === 0 && (
            <span className={styles.hint}>
              Add classes in the Classes panel first.
            </span>
          )}
        </label>

        <div className={styles.dateRow}>
          <label className={styles.label}>
            Assigned
            <input
              className={styles.input}
              type="date"
              required
              value={assignedDate}
              onChange={(e) => setAssignedDate(e.target.value)}
            />
          </label>
          <label className={styles.label}>
            Due
            <input
              className={styles.input}
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </label>
        </div>

        <label className={styles.label}>
          Description (optional)
          <textarea
            className={`${styles.input} ${styles.textarea}`}
            placeholder="Any extra details"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={styles.saveBtn}>
            Save Assignment
          </button>
        </div>
      </form>
    </div>
  );
}