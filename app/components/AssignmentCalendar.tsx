"use client";

import { useState } from "react";
import type { Assignment } from "@/app/lib/types";
import { useCalendar } from "@/app/lib/useCalendar";
import { buildMonthCells, dateKey, todayKey } from "@/app/lib/date";
import { AssignmentForm } from "./AssignmentForm";
import { AssignmentDetails } from "./AssignmentDetails";
import { ClassManager } from "./ClassManager";
import styles from "./AssignmentCalendar.module.css";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_VISIBLE = 4;

export default function AssignmentCalendar() {
  const {
    assignments,
    classes,
    addAssignment,
    deleteAssignment,
    addClass,
    deleteClass,
    setClassColor,
    colorForClass,
  } = useCalendar();
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [formDate, setFormDate] = useState<string | null>(null);
  const [selected, setSelected] = useState<Assignment | null>(null);

  const cells = buildMonthCells(viewDate);
  const today = todayKey();

  const activeOn = (key: string): Assignment[] =>
    assignments
      .filter((a) => key >= a.assignedDate && key <= a.dueDate)
      .sort((a, b) =>
        a.dueDate === b.dueDate
          ? a.title.localeCompare(b.title)
          : a.dueDate.localeCompare(b.dueDate)
      );

  const monthLabel = viewDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const isCurrentMonth = (d: Date) => d.getMonth() === viewDate.getMonth();

  const shiftMonth = (delta: number) =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1));

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Assignment Calendar</h1>
        <p className={styles.subtitle}>
          Click any day to add an assignment.
        </p>
      </header>

      <div className={styles.layout}>
        <main className={styles.main}>
          <div className={styles.toolbar}>
            <button className={styles.navBtn} onClick={() => shiftMonth(-1)}>
              &larr;
            </button>
            <button className={styles.navBtn} onClick={() => setViewDate(new Date())}>
              Today
            </button>
            <button className={styles.navBtn} onClick={() => shiftMonth(1)}>
              &rarr;
            </button>
            <span className={styles.monthLabel}>{monthLabel}</span>
          </div>

          <div className={styles.grid}>
            {WEEKDAYS.map((d) => (
              <div key={d} className={styles.weekday}>
                {d}
              </div>
            ))}
            {cells.map((date) => {
              const key = dateKey(date);
              const dayAssignments = activeOn(key);
              const inMonth = isCurrentMonth(date);
              const isToday = key === today;
              return (
                <div
                  key={key}
                  className={[
                    styles.cell,
                    inMonth ? "" : styles.otherMonth,
                    isToday ? styles.today : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setFormDate(key)}
                >
                  <span className={styles.dayNum}>{date.getDate()}</span>
                  <div className={styles.bars}>
                    {dayAssignments.slice(0, MAX_VISIBLE).map((a) => {
                      const color = colorForClass(a.className);
                      const isStart = a.assignedDate === key;
                      const isDue = a.dueDate === key;
                      return (
                        <button
                          key={a.id}
                          className={[
                            styles.bar,
                            isStart ? styles.startBar : "",
                            isDue ? styles.dueBar : "",
                            isStart && isDue ? styles.singleBar : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          style={{
                            background: color + (isDue ? "33" : "1a"),
                            borderLeftColor: color,
                          }}
                          title={`${a.className} — ${a.title}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(a);
                          }}
                        >
                          {isStart && <span className={styles.flag}>start</span>}
                          <span className={styles.barTitle}>{a.title}</span>
                          {isDue && <span className={styles.flag}>due</span>}
                        </button>
                      );
                    })}
                    {dayAssignments.length > MAX_VISIBLE && (
                      <span className={styles.more}>
                        +{dayAssignments.length - MAX_VISIBLE} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className={styles.footer}>
            {assignments.length === 0
              ? "No assignments yet. Click a day to add your first one."
              : `${assignments.length} assignment${assignments.length === 1 ? "" : "s"} saved in your browser.`}
          </p>
        </main>

        <ClassManager
          classes={classes}
          onAdd={addClass}
          onDelete={deleteClass}
          onColorChange={setClassColor}
        />
      </div>

      {formDate && (
        <AssignmentForm
          defaultAssignedDate={today}
          defaultDueDate={formDate}
          classes={classes}
          onSave={addAssignment}
          onClose={() => setFormDate(null)}
        />
      )}

      {selected && (
        <AssignmentDetails
          assignment={selected}
          color={colorForClass(selected.className)}
          onDelete={(id) => {
            deleteAssignment(id);
            setSelected(null);
          }}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}