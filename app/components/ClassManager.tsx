"use client";

import { useState } from "react";
import type { SchoolClass } from "@/app/lib/types";
import styles from "./ClassManager.module.css";

interface Props {
  classes: SchoolClass[];
  onAdd: (name: string) => void;
  onDelete: (name: string) => void;
  onColorChange: (name: string, color: string) => void;
}

export function ClassManager({ classes, onAdd, onDelete, onColorChange }: Props) {
  const [name, setName] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name);
    setName("");
  };

  return (
    <aside className={styles.panel}>
      <h2 className={styles.heading}>Classes</h2>

      <ul className={styles.list}>
        {classes.map((c) => (
          <li key={c.name} className={styles.row}>
            <span
              className={styles.swatch}
              style={{ backgroundColor: c.color }}
            />
            <span className={styles.name} title={c.name}>
              {c.name}
            </span>
            <input
              type="color"
              className={styles.colorInput}
              value={c.color}
              aria-label={`Change color for ${c.name}`}
              onChange={(e) => onColorChange(c.name, e.target.value)}
            />
            <button
              type="button"
              className={styles.deleteBtn}
              aria-label={`Delete ${c.name}`}
              onClick={() => onDelete(c.name)}
            >
              &times;
            </button>
          </li>
        ))}
      </ul>

      <form className={styles.addForm} onSubmit={submit}>
        <input
          type="text"
          className={styles.addInput}
          placeholder="New class name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className={styles.addBtn}>
          Add
        </button>
      </form>
    </aside>
  );
}