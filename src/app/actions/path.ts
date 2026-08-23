"use server";

import { revalidatePath } from "next/cache";
import {
  getPathNode,
  getPathNodeIndex,
  isPathNodeAvailable,
  LEARNING_PATH_NODES,
} from "@/data/learningPath";
import { createClient } from "@/utils/supabase/server";

export type PathActionResult = {
  ok: boolean;
  error?: string;
  alreadyCompleted?: boolean;
  insertedVocab?: number;
  unlockedPairs?: Array<{ rootId: string; patternId: string }>;
  completedNodeIds?: string[];
};

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, user: null as null, error: "Not authenticated." };
  }
  return { supabase, user, error: null as null };
}

async function fetchCompletedNodeIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<string[]> {
  const pathIds = LEARNING_PATH_NODES.map((n) => n.id);
  const { data } = await supabase
    .from("user_lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .in("lesson_id", pathIds);

  return (data ?? []).map((r) => r.lesson_id as string);
}

/**
 * Complete a Learning Path node:
 * 1. Enforce linear lock (previous node must be done)
 * 2. Record completion in `user_lesson_progress`
 * 3. Unlock combat vocab via `unlock_vocab_batch` RPC
 */
export async function completePathNodeAction(nodeId: string): Promise<PathActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const node = getPathNode(nodeId);
  if (!node) return { ok: false, error: "Unknown path node." };

  const completed = await fetchCompletedNodeIds(supabase, user.id);

  if (completed.includes(nodeId)) {
    return {
      ok: true,
      alreadyCompleted: true,
      insertedVocab: 0,
      unlockedPairs: node.unlocks.map((u) => ({ rootId: u.rootId, patternId: u.patternId })),
      completedNodeIds: completed,
    };
  }

  if (!isPathNodeAvailable(nodeId, completed)) {
    const idx = getPathNodeIndex(nodeId);
    const prev = idx > 0 ? LEARNING_PATH_NODES[idx - 1] : null;
    return {
      ok: false,
      error: prev
        ? `Complete “${prev.title}” first.`
        : "This node is locked.",
    };
  }

  const { error: insertError } = await supabase.from("user_lesson_progress").insert({
    user_id: user.id,
    lesson_id: nodeId,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return {
        ok: true,
        alreadyCompleted: true,
        insertedVocab: 0,
        completedNodeIds: [...completed, nodeId],
      };
    }
    return { ok: false, error: insertError.message };
  }

  let insertedVocab = 0;
  if (node.unlocks.length > 0) {
    const pairs = node.unlocks.map((u) => ({
      root_id: u.rootId,
      pattern_id: u.patternId,
    }));

    const { data, error: rpcError } = await supabase.rpc("unlock_vocab_batch", {
      p_pairs: pairs,
      p_source_node_id: nodeId,
    });

    if (rpcError) {
      // Completion is recorded; surface RPC failure so the client can retry unlock
      return {
        ok: false,
        error: `Node saved, but vocab unlock failed: ${rpcError.message}`,
        completedNodeIds: [...completed, nodeId],
      };
    }

    const payload = data as { inserted?: number } | null;
    insertedVocab = typeof payload?.inserted === "number" ? payload.inserted : pairs.length;
  }

  const nextCompleted = [...completed, nodeId];

  revalidatePath("/path");
  revalidatePath("/arena");
  revalidatePath("/");

  return {
    ok: true,
    insertedVocab,
    unlockedPairs: node.unlocks.map((u) => ({ rootId: u.rootId, patternId: u.patternId })),
    completedNodeIds: nextCompleted,
  };
}

/** Server snapshot for the /path page. */
export async function getPathProgress(): Promise<{
  completedNodeIds: string[];
  unlockedVocabCount: number;
} | null> {
  const { supabase, user } = await requireUser();
  if (!user) return null;

  const [completed, vocabRes] = await Promise.all([
    fetchCompletedNodeIds(supabase, user.id),
    supabase
      .from("user_unlocked_vocab")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  return {
    completedNodeIds: completed,
    unlockedVocabCount: vocabRes.count ?? 0,
  };
}
