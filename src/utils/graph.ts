/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TimelineTask, CycleDetectionResult } from '../types/event';

/**
 * Real DFS Graph Cycle Detection algorithm.
 * Uses 3-state graph coloring (White = 0/unvisited, Gray = 1/visiting, Black = 2/visited)
 * to detect cycles in task dependency graphs and report the exact cyclic path.
 */
export function detectGraphCycles(tasks: TimelineTask[]): CycleDetectionResult {
  const taskMap = new Map<string, TimelineTask>();
  tasks.forEach((t) => taskMap.set(t.id, t));

  // Adjacency list: task -> list of tasks it depends on
  // For cycle detection, a directed edge exists from task A to task B if A depends on B.
  const adj = new Map<string, string[]>();
  tasks.forEach((t) => {
    adj.set(t.id, t.dependsOn || []);
  });

  const state = new Map<string, number>(); // 0 = unvisited, 1 = visiting, 2 = visited
  const parent = new Map<string, string | null>();
  tasks.forEach((t) => {
    state.set(t.id, 0);
    parent.set(t.id, null);
  });

  let cycleStartNode: string | null = null;
  let cycleEndNode: string | null = null;

  function dfs(u: string): boolean {
    state.set(u, 1);

    const neighbors = adj.get(u) || [];
    for (const v of neighbors) {
      // Ignore if neighbor does not exist in current task set
      if (!taskMap.has(v)) continue;

      if (state.get(v) === 1) {
        // Back edge found! Cycle detected!
        cycleStartNode = v;
        cycleEndNode = u;
        return true;
      }

      if (state.get(v) === 0) {
        parent.set(v, u);
        if (dfs(v)) return true;
      }
    }

    state.set(u, 2);
    return false;
  }

  for (const t of tasks) {
    if (state.get(t.id) === 0) {
      if (dfs(t.id)) {
        break;
      }
    }
  }

  if (cycleStartNode && cycleEndNode) {
    // Reconstruct cyclic path
    const cycleNodes: string[] = [cycleStartNode];
    let curr: string | null | undefined = cycleEndNode;

    while (curr && curr !== cycleStartNode) {
      cycleNodes.push(curr);
      curr = parent.get(curr);
    }
    cycleNodes.push(cycleStartNode);
    cycleNodes.reverse();

    const pathNames = cycleNodes
      .map((id) => taskMap.get(id)?.title || id)
      .join(' ➔ ');

    return {
      hasCycle: true,
      cycleNodes: Array.from(new Set(cycleNodes)),
      cyclePath: pathNames,
    };
  }

  return {
    hasCycle: false,
    cycleNodes: [],
    cyclePath: '',
  };
}

/**
 * Checks if adding a proposed dependency edge (from taskId -> to dependsOnId) would introduce a cycle.
 */
export function wouldIntroduceCycle(
  tasks: TimelineTask[],
  taskId: string,
  newDependsOnId: string
): boolean {
  if (taskId === newDependsOnId) return true;

  // Clone tasks with simulated dependency added
  const simulatedTasks = tasks.map((t) => {
    if (t.id === taskId) {
      const existing = t.dependsOn || [];
      return {
        ...t,
        dependsOn: existing.includes(newDependsOnId)
          ? existing
          : [...existing, newDependsOnId],
      };
    }
    return t;
  });

  const result = detectGraphCycles(simulatedTasks);
  return result.hasCycle;
}
