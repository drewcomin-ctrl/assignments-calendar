"use client";

import type { Assignment } from "@/app/lib/types";
import styles from "./AssignmentDetails.module.css";

interface Props {
  assignment: Assignment;
  color: string;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const formatDate = (key: string): string =>
  new Date(`${key}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

export function AssignmentDetails({ assignment, color, onDelete, onClose }: Props) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>{assignment.title}</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className={styles.classPill}>
          <span
            className={styles.swatch}
            style={{ backgroundColor: color }}
          />
          {assignment.className}
        </div>

        {assignment.description && (
          <p className={styles.description}>{assignment.description}</p>
        )}

        <div className={styles.dates}>
          <div>
            <span className={styles.dateLabel}>Assigned</span>
            <span className={styles.dateValue}>
              {formatDate(assignment.assignedDate)}
            </span>
          </div>
          <div>
            <span className={styles.dateLabel}>Due</span>
            <span className={styles.dateValue}>
              {formatDate(assignment.dueDate)}
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={() => onDelete(assignment.id)}
          >
            Delete
          </button>
          <button type="button" className={styles.closeBtn2} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}