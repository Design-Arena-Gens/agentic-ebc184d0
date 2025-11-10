'use client';

import { useMemo, useState } from "react";
import { Task, TaskQuadrant } from "@/types";
import {
  buildTaskPayload,
  calculateTaskScore,
  determineQuadrant,
  quadrantLabel,
} from "@/lib/taskUtils";

type TaskFormProps = {
  onCreate: (task: Task) => void;
};

const MIN_VALUE = 0;
const MAX_VALUE = 10;

export function TaskForm({ onCreate }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState(5);
  const [importance, setImportance] = useState(5);
  const [autoAssign, setAutoAssign] = useState(true);
  const [manualQuadrant, setManualQuadrant] = useState<TaskQuadrant>(() =>
    determineQuadrant(5, 5),
  );

  const score = useMemo(
    () => calculateTaskScore(urgency, importance),
    [importance, urgency],
  );

  const projectedQuadrant = useMemo(
    () => determineQuadrant(urgency, importance),
    [importance, urgency],
  );

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setUrgency(5);
    setImportance(5);
    setAutoAssign(true);
    setManualQuadrant(determineQuadrant(5, 5));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }

    const payload = buildTaskPayload(
      title.trim(),
      description.trim(),
      urgency,
      importance,
      autoAssign,
      manualQuadrant,
    );
    onCreate(payload);
    resetForm();
  };

  return (
    <form className="card task-form" onSubmit={handleSubmit}>
      <header>
        <h2>Eisenhower Intake</h2>
        <p>
          Score before placing; auto assign by score or override manually. Urgency and importance
          scale from {MIN_VALUE} to {MAX_VALUE}.
        </p>
      </header>
      <div className="form-grid">
        <label className="field">
          <span>Task Title</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Summarize the task objective"
            required
          />
        </label>
        <label className="field">
          <span>Context / Notes</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Additional details to keep you focused"
            rows={3}
          />
        </label>
      </div>
      <div className="scoring-row">
        <div className="field slider-field">
          <label>
            <span>Urgency</span>
            <input
              type="range"
              min={MIN_VALUE}
              max={MAX_VALUE}
              value={urgency}
              onChange={(event) => setUrgency(Number(event.target.value))}
            />
          </label>
          <div className="metric-display">
            <span className="metric-value">{urgency}</span>
            <span className="metric-label">Urgency score</span>
          </div>
        </div>
        <div className="field slider-field">
          <label>
            <span>Importance</span>
            <input
              type="range"
              min={MIN_VALUE}
              max={MAX_VALUE}
              value={importance}
              onChange={(event) => setImportance(Number(event.target.value))}
            />
          </label>
          <div className="metric-display">
            <span className="metric-value">{importance}</span>
            <span className="metric-label">Importance score</span>
          </div>
        </div>
        <div className="scorecard">
          <span>Total Score</span>
          <strong>{score}</strong>
          <span className="score-caption">
            Auto quadrant: <em>{quadrantLabel(projectedQuadrant)}</em>
          </span>
        </div>
      </div>
      <div className="controls-row">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={autoAssign}
            onChange={(event) => setAutoAssign(event.target.checked)}
          />
          <span>Auto assign quadrant (based on urgency & importance)</span>
        </label>
        {!autoAssign && (
          <label className="field manual-select">
            <span>Manual quadrant override</span>
            <select
              value={manualQuadrant}
              onChange={(event) => setManualQuadrant(event.target.value as TaskQuadrant)}
            >
              <option value="urgentImportant">{quadrantLabel("urgentImportant")}</option>
              <option value="notUrgentImportant">{quadrantLabel("notUrgentImportant")}</option>
              <option value="urgentNotImportant">{quadrantLabel("urgentNotImportant")}</option>
              <option value="notUrgentNotImportant">
                {quadrantLabel("notUrgentNotImportant")}
              </option>
            </select>
          </label>
        )}
        <button type="submit" className="primary">
          Add to Matrix
        </button>
      </div>
    </form>
  );
}
