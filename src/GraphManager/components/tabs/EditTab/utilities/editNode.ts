import { GraphData, NodeType } from "../../../../types";

type EditNodeTypes = {
  graph: GraphData;
  newNode: NodeType;
  selectedNode: NodeType | undefined;
  isNewNode: boolean;
};
export const editNode = ({
  graph,
  newNode,
  selectedNode,
  isNewNode,
}: EditNodeTypes): GraphData => {
  if (isNewNode) {
    if (graph.nodes.find((n) => n.id === newNode.id)) {
      throw new Error("Attempting to create a new Node that already exists");
    }
    graph.nodes?.push(newNode);
    return graph;
  }

  if (!selectedNode) {
    throw new Error("Attempting to update a Node when none exist");
  }

  // Update existing links to new node ID
  graph?.links?.forEach((link) => {
    if (link.target === selectedNode.id) {
      link.target = newNode.id;
    }
    if (link.source === selectedNode.id) {
      link.source = newNode.id;
    }
  });
  // Update selected node with new content
  Object.assign(selectedNode, newNode);

  return graph;
};
