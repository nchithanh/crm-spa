"use client";

import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type OnConnect,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NodeConfigPanel } from "@/components/automation/node-config-panel";
import { WfFlowNode, type WfFlowNodeData } from "@/components/automation/wf-node";
import type {
  MessageTemplate,
  WfEdge,
  WfNode,
  WorkflowGraph,
  WorkflowNodeType,
} from "@/lib/types";
import { MAX_WORKFLOW_NODES } from "@/lib/types";
import { createNode, NODE_TYPES } from "@/lib/workflow-graph";
import { uid } from "@/lib/utils";

const nodeTypes = { wf: WfFlowNode };

function toFlowNodes(graph: WorkflowGraph, invalidIds: Set<string>): Node[] {
  return graph.nodes.map((n) => ({
    id: n.id,
    type: "wf",
    position: n.position,
    data: {
      label: n.data.label,
      nodeType: n.type,
      subtitle: subtitleFor(n),
      invalid: invalidIds.has(n.id),
    } satisfies WfFlowNodeData,
  }));
}

function subtitleFor(n: WfNode): string {
  if (n.type === "TRIGGER") return String(n.data.triggerEvent ?? "");
  if (n.type === "DELAY") return `${n.data.delayHours ?? 0}h`;
  if (n.type === "SEND_ZALO_TEMPLATE") return String(n.data.templateId || "chưa chọn");
  if (n.type === "ADD_TAG") return String(n.data.tag ?? "");
  if (n.type === "CREATE_TASK") return String(n.data.taskTitle ?? "");
  if (n.type === "CONDITION")
    return `${n.data.conditionField} ${n.data.conditionOp} ${n.data.conditionValue}`;
  return "";
}

function toFlowEdges(graph: WorkflowGraph): Edge[] {
  return graph.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle,
    label: e.sourceHandle,
    style: { stroke: "#64748b" },
  }));
}

function fromFlow(
  nodes: Node[],
  edges: Edge[],
  dataById: Map<string, WfNode>,
): WorkflowGraph {
  const wfNodes: WfNode[] = nodes.map((n) => {
    const prev = dataById.get(n.id);
    const nodeType = (n.data as WfFlowNodeData).nodeType;
    return {
      id: n.id,
      type: nodeType,
      position: n.position,
      data: prev?.data ?? {
        label: (n.data as WfFlowNodeData).label,
      },
    };
  });
  const wfEdges: WfEdge[] = edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle ?? undefined,
  }));
  return { nodes: wfNodes, edges: wfEdges };
}

function CanvasInner({
  initialName,
  initialGraph,
  templates,
  onSave,
  onValidateOnly,
}: {
  initialName: string;
  initialGraph: WorkflowGraph;
  templates: MessageTemplate[];
  onSave: (name: string, graph: WorkflowGraph) => void;
  onValidateOnly: (graph: WorkflowGraph) => string[];
}) {
  const [name, setName] = useState(initialName);
  const [dataById, setDataById] = useState(() => {
    const m = new Map<string, WfNode>();
    for (const n of initialGraph.nodes) m.set(n.id, n);
    return m;
  });
  const [issues, setIssues] = useState<string[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState(
    toFlowNodes(initialGraph, new Set()),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    toFlowEdges(initialGraph),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setNodes((curr) =>
      curr.map((n) => {
        const d = dataById.get(n.id);
        if (!d) return n;
        return {
          ...n,
          data: {
            label: d.data.label,
            nodeType: d.type,
            subtitle: subtitleFor(d),
            invalid: false,
          } satisfies WfFlowNodeData,
        };
      }),
    );
  }, [dataById, setNodes]);

  const selectedNode = selectedId ? dataById.get(selectedId) ?? null : null;

  const syncGraph = useCallback(() => {
    return fromFlow(nodes, edges, dataById);
  }, [nodes, edges, dataById]);

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      // reject cycle: simple check if target can reach source
      const graph = fromFlow(nodes, edges, dataById);
      const adj = new Map<string, string[]>();
      for (const n of graph.nodes) adj.set(n.id, []);
      for (const e of graph.edges) adj.get(e.source)?.push(e.target);
      if (connection.source && connection.target) {
        adj.get(connection.source)?.push(connection.target);
      }
      const seen = new Set<string>();
      const stack = [connection.target!];
      let cycle = false;
      while (stack.length) {
        const cur = stack.pop()!;
        if (cur === connection.source) {
          cycle = true;
          break;
        }
        if (seen.has(cur)) continue;
        seen.add(cur);
        for (const nxt of adj.get(cur) ?? []) stack.push(nxt);
      }
      if (cycle) {
        setIssues(["Không nối được: tạo cycle."]);
        return;
      }
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id: uid("e"),
            label: connection.sourceHandle ?? undefined,
          },
          eds,
        ),
      );
      setIssues([]);
    },
    [nodes, edges, dataById, setEdges],
  );

  const addNode = (type: WorkflowNodeType) => {
    if (dataById.size >= MAX_WORKFLOW_NODES) {
      setIssues([`Tối đa ${MAX_WORKFLOW_NODES} node.`]);
      return;
    }
    if (type === "TRIGGER" && [...dataById.values()].some((n) => n.type === "TRIGGER")) {
      setIssues(["Chỉ được 1 TRIGGER."]);
      return;
    }
    const n = createNode(type, {
      x: 120 + dataById.size * 24,
      y: 80 + (dataById.size % 4) * 40,
    });
    setDataById((m) => new Map(m).set(n.id, n));
    setNodes((nds) => [
      ...nds,
      {
        id: n.id,
        type: "wf",
        position: n.position,
        data: {
          label: n.data.label,
          nodeType: n.type,
          subtitle: subtitleFor(n),
        } satisfies WfFlowNodeData,
      },
    ]);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    const node = dataById.get(selectedId);
    if (node?.type === "TRIGGER") {
      setIssues(["Không xóa TRIGGER — đổi cấu hình thay vì xóa."]);
      return;
    }
    setDataById((m) => {
      const next = new Map(m);
      next.delete(selectedId);
      return next;
    });
    setNodes((nds) => nds.filter((n) => n.id !== selectedId));
    setEdges((eds) =>
      eds.filter((e) => e.source !== selectedId && e.target !== selectedId),
    );
    setSelectedId(null);
  };

  const validate = () => {
    const g = syncGraph();
    const msgs = onValidateOnly(g);
    setIssues(msgs);
    return msgs;
  };

  const save = () => {
    const g = syncGraph();
    const msgs = onValidateOnly(g);
    setIssues(msgs);
    onSave(name, g);
  };

  return (
    <div className="flex flex-col gap-3 lg:flex-row">
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            className="max-w-xs"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên workflow"
          />
          <Button type="button" variant="outline" size="sm" onClick={validate}>
            Validate
          </Button>
          <Button type="button" size="sm" onClick={save}>
            Lưu
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={deleteSelected}
            disabled={!selectedId}
          >
            Xóa node
          </Button>
        </div>

        <div className="flex flex-wrap gap-1">
          {NODE_TYPES.filter((t) => t !== "TRIGGER").map((t) => (
            <Button
              key={t}
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => addNode(t)}
            >
              + {t}
            </Button>
          ))}
        </div>

        {issues.length > 0 ? (
          <ul className="rounded-[10px] border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {issues.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        ) : null}

        <div className="h-[min(28rem,60svh)] overflow-hidden rounded-[12px] border border-slate-200 bg-slate-50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onSelectionChange={({ nodes: ns }) =>
              setSelectedId(ns[0]?.id ?? null)
            }
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={16} size={1} />
            <Controls />
            <MiniMap pannable zoomable />
          </ReactFlow>
        </div>
        <p className="text-xs text-slate-500">
          Kéo handle để nối. CONDITION có nhánh true/false. Max {MAX_WORKFLOW_NODES}{" "}
          node · không cycle.
        </p>
      </div>

      <div className="w-full shrink-0 lg:w-72">
        <NodeConfigPanel
          node={selectedNode}
          templates={templates}
          onChange={(next) => {
            setDataById((m) => new Map(m).set(next.id, next));
          }}
        />
      </div>
    </div>
  );
}

export function WorkflowCanvas(props: {
  initialName: string;
  initialGraph: WorkflowGraph;
  templates: MessageTemplate[];
  onSave: (name: string, graph: WorkflowGraph) => void;
  onValidateOnly: (graph: WorkflowGraph) => string[];
}) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}
