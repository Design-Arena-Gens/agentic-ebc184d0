'use client';

import { useMemo, useState } from "react";
import { Task, TaskQuadrant } from "@/types";
import { quadrantColor, quadrantLabel, sortTasks } from "@/lib/taskUtils";

type TaskMatrixProps = {
  tasks: Task[];
  onComplete: (taskId: string) => void;
};

const quadrantOrder: TaskQuadrant[] = [
  "urgentImportant",
  "urgentNotImportant",
  "notUrgentImportant",
  "notUrgentNotImportant",
];

export function TaskMatrix({ tasks, onComplete }: TaskMatrixProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const sorted = sortTasks(tasks);
    return quadrantOrder.reduce<Record<TaskQuadrant, Task[]>>(
      (acc, quadrant) => ({
        ...acc,
        [quadrant]: sorted.filter((task) => task.quadrant === quadrant),
      }),
      {
        urgentImportant: [],
        urgentNotImportant: [],
        notUrgentImportant: [],
        notUrgentNotImportant: [],
      },
    );
  }, [tasks]);

  const handleSelect = (taskId: string) => {
    setSelectedTaskId((current) => (current === taskId ? null : taskId));
  };

  const selectedTask =
    selectedTaskId != null ? tasks.find((task) => task.id === selectedTaskId) : null;

  return (
    <section className="matrix-section">
      <header className="matrix-header">
        <h2>Eisenhower Matrix</h2>
        <p>
          Color-coded focus grid. Select a task to inspect its score, then mark it complete to keep
          the board clear.
        </p>
      </header>
      <div className="matrix-grid">
        {quadrantOrder.map((quadrant) => (
          <div
            key={quadrant}
            className={`matrix-cell ${selectedTask?.quadrant === quadrant ? "active" : ""}`}
            style={{ backgroundColor: quadrantColor(quadrant) }}
          >
            <header>
              <h3>{quadrantLabel(quadrant)}</h3>
              <span>{grouped[quadrant].length} task(s)</span>
            </header>
            <ul>
              {grouped[quadrant].map((task) => (
                <li
                  key={task.id}
                  className={selectedTaskId === task.id ? "selected" : ""}
                  onClick={() => handleSelect(task.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      handleSelect(task.id);
                    }
                  }}
                >
                  <div className="task-title">
                    <strong>{task.title}</strong>
                    <span className="task-score">Score {task.score}</span>
                  </div>
                  {task.description && <p>{task.description}</p>}
                  <footer>
                    <span>Urgency {task.urgency}</span>
                    <span>Importance {task.importance}</span>
                    <span>{task.autoAssigned ? "Auto" : "Manual"} placed</span>
                  </footer>
                </li>
              ))}
              {grouped[quadrant].length === 0 && <li className="empty-state">No tasks yet.</li>}
            </ul>
          </div>
        ))}
      </div>
      <div className="matrix-actions">
        <div className="selection-info">
          {selectedTask ? (
            <>
              <strong>{selectedTask.title}</strong>
              <span>Score {selectedTask.score}</span>
              <span>{quadrantLabel(selectedTask.quadrant)}</span>
            </>
          ) : (
            <span>Select a task to enable completion</span>
          )}
        </div>
        <button
          className="secondary"
          type="button"
          disabled={!selectedTask}
          onClick={() => {
            if (selectedTask) {
              onComplete(selectedTask.id);
              setSelectedTaskId(null);
            }
          }}
        >
          Mark Selected as Complete
        </button>
      </div>
    </section>
  );
}
