'use client';

import { useMemo } from "react";
import { Task } from "@/types";
import { usePersistentState } from "@/hooks/usePersistentState";
import { TaskForm } from "@/components/TaskForm";
import { TaskMatrix } from "@/components/TaskMatrix";
import { ModelBlueprintOrganizer } from "@/components/ModelBlueprintOrganizer";

export default function Home() {
  const [tasks, setTasks] = usePersistentState<Task[]>("agentic-tasks", []);

  const outstandingCount = useMemo(() => tasks.length, [tasks]);

  return (
    <main className="layout">
      <header className="hero">
        <div>
          <h1>Agentic Focus Board</h1>
          <p>
            Dual-mode command center that keeps your strategic persona aligned with the work that
            matters now. Capture Instructional Rulesets, synthesize knowledge, and route tasks into
            a color-coded Eisenhower Matrix with scoring-driven placement.
          </p>
        </div>
        <aside>
          <div className="hero-stat">
            <span>Open Tasks</span>
            <strong>{outstandingCount}</strong>
          </div>
        </aside>
      </header>
      <TaskForm
        onCreate={(task) =>
          setTasks((current) => {
            return [...current, task];
          })
        }
      />
      <TaskMatrix
        tasks={tasks}
        onComplete={(taskId) =>
          setTasks((current) => current.filter((task) => task.id !== taskId))
        }
      />
      <ModelBlueprintOrganizer />
    </main>
  );
}
