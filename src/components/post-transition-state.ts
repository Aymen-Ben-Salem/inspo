const TRANSITION_KEY = "inspora:pending-post-transition";
const TRANSITION_MAX_AGE_MS = 5_000;

type PendingPostTransition = {
  postId: string;
  startedAt: number;
};

export function stagePostTransition(postId: string) {
  try {
    const transition: PendingPostTransition = {
      postId,
      startedAt: Date.now(),
    };

    sessionStorage.setItem(TRANSITION_KEY, JSON.stringify(transition));
  } catch {
    // Storage can be unavailable in strict privacy modes; the modal still opens normally.
  }
}

export function consumePostTransition(postId: string) {
  try {
    const stored = sessionStorage.getItem(TRANSITION_KEY);
    sessionStorage.removeItem(TRANSITION_KEY);

    if (!stored) return false;

    const transition = JSON.parse(stored) as PendingPostTransition;

    return (
      transition.postId === postId &&
      Date.now() - transition.startedAt <= TRANSITION_MAX_AGE_MS
    );
  } catch {
    return false;
  }
}
