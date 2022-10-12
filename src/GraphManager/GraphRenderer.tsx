import React from "react";
import ForceGraph2D from "react-force-graph-2d";
import { DataSetType } from "./types";

interface GraphRendererProps {
  selectedGraphDataset: DataSetType;
  openVoteDialog: (params: any) => void;
}

export const GraphRenderer = ({
  selectedGraphDataset,
  openVoteDialog,
}: GraphRendererProps) => {
  return (
    <ForceGraph2D
      graphData={{ ...selectedGraphDataset.data }}
      nodeAutoColorBy={"group"}
      onNodeClick={(params) => {
        console.log("clicked", params);
      }}
      onLinkHover={(params) => {
        console.log("linkHov", params);
      }}
      onLinkClick={(params) => {
        openVoteDialog({
          sourceNode: params.source,
          targetNode: params.target,
        });
      }}
      nodeCanvasObject={(node, ctx, globalScale) => {
        const label = node.id ?? "";
        const fontSize = 22 / globalScale;
        ctx.font = `${fontSize}px Sans-Serif`;
        const textWidth = ctx.measureText(String(node.id)).width;
        const padding = 0.2;
        const bckgDimensions = [textWidth, fontSize].map(
          (n) => n + fontSize * padding
        );

        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillRect(
          node.x ?? 0 - bckgDimensions[0] / 2,
          node.y ?? 0 - bckgDimensions[1] / 2,
          bckgDimensions[0],
          bckgDimensions[1]
        );

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#000";
        ctx.fillText(String(label), node.x ?? 0, node.y ?? 0);

        // node.bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
      }}
      linkDirectionalArrowLength={10}
      linkDirectionalArrowRelPos={0.7}
      linkCanvasObjectMode={() => "after"}
    />
  );
};