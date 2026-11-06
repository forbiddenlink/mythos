import type { Node } from "reactflow";

/**
 * Returns nodes with `data.isHighlighted` set from hover/explore focus,
 * leaving positions (including user-dragged ones) untouched.
 */
export function applyHoverHighlight(
  nodes: Node[],
  hoveredId: string | null,
  exploreFocusId: string | null,
): Node[] {
  return nodes.map((node) => {
    const isHighlighted = hoveredId === node.id || exploreFocusId === node.id;
    const data = node.data as { isHighlighted?: boolean };
    if (Boolean(data.isHighlighted) === isHighlighted) return node;
    return { ...node, data: { ...node.data, isHighlighted } };
  });
}
