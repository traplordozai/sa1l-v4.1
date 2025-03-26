"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  Panel,
} from "reactflow"
import "reactflow/dist/style.css"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Save, Play, Plus, Settings, Trash2, FileText, Users } from "lucide-react"

// Custom node components
const TaskNode = ({ data }: { data: any }) => {
  return (
    <div className="rounded-md border bg-white p-3 shadow-sm">
      <div className="flex items-center">
        <div className="mr-2 rounded-full bg-blue-100 p-1">
          <FileText className="h-4 w-4 text-blue-500" />
        </div>
        <div className="font-medium">{data.label}</div>
      </div>
      {data.description && <div className="mt-1 text-xs text-gray-500">{data.description}</div>}
    </div>
  )
}

const ApprovalNode = ({ data }: { data: any }) => {
  return (
    <div className="rounded-md border bg-white p-3 shadow-sm">
      <div className="flex items-center">
        <div className="mr-2 rounded-full bg-purple-100 p-1">
          <Users className="h-4 w-4 text-purple-500" />
        </div>
        <div className="font-medium">{data.label}</div>
      </div>
      {data.approvers && <div className="mt-1 text-xs text-gray-500">Approvers: {data.approvers}</div>}
    </div>
  )
}

const ConditionNode = ({ data }: { data: any }) => {
  return (
    <div className="rounded-md border bg-white p-3 shadow-sm">
      <div className="flex items-center">
        <div className="mr-2 rounded-full bg-yellow-100 p-1">
          <Settings className="h-4 w-4 text-yellow-500" />
        </div>
        <div className="font-medium">{data.label}</div>
      </div>
      {data.condition && <div className="mt-1 text-xs text-gray-500">If: {data.condition}</div>}
    </div>
  )
}

// Node types definition
const nodeTypes: NodeTypes = {
  task: TaskNode,
  approval: ApprovalNode,
  condition: ConditionNode,
}

// Initial nodes and edges
const initialNodes: Node[] = [
  {
    id: "1",
    type: "task",
    position: { x: 250, y: 100 },
    data: { label: "Start Task", description: "Begin the workflow process" },
  },
  {
    id: "2",
    type: "approval",
    position: { x: 250, y: 200 },
    data: { label: "Manager Approval", approvers: "Department Manager" },
  },
  {
    id: "3",
    type: "condition",
    position: { x: 250, y: 300 },
    data: { label: "Check Status", condition: "Status == 'Approved'" },
  },
  {
    id: "4",
    type: "task",
    position: { x: 100, y: 400 },
    data: { label: "Rejected Path", description: "Handle rejection" },
  },
  {
    id: "5",
    type: "task",
    position: { x: 400, y: 400 },
    data: { label: "Approved Path", description: "Continue process" },
  },
]

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
  { id: "e3-4", source: "3", target: "4", label: "No" },
  { id: "e3-5", source: "3", target: "5", label: "Yes" },
]

/**
 * Visual workflow builder component
 * Allows users to create and edit automated workflows
 */
export default function WorkflowBuilder() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [workflowName, setWorkflowName] = useState("New Workflow")
  const [workflowDescription, setWorkflowDescription] = useState("Automated workflow process")
  const [isSaving, setIsSaving] = useState(false)
  const [isRunning, setIsRunning] = useState(false)

  // Handle connections between nodes
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges],
  )

  // Handle node selection
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  // Add a new node
  const addNode = useCallback(
    (type: string) => {
      const newNode: Node = {
        id: `${nodes.length + 1}`,
        type,
        position: {
          x: Math.random() * 300 + 100,
          y: Math.random() * 300 + 100,
        },
        data: {
          label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
          ...(type === "task" && { description: "Task description" }),
          ...(type === "approval" && { approvers: "Select approvers" }),
          ...(type === "condition" && { condition: "Define condition" }),
        },
      }

      setNodes((nds) => nds.concat(newNode))
      setSelectedNode(newNode)
    },
    [nodes, setNodes],
  )

  // Update node data
  const updateNodeData = useCallback(
    (id: string, newData: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                ...newData,
              },
            }
          }
          return node
        }),
      )
    },
    [setNodes],
  )

  // Delete selected node
  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id))
      setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id))
      setSelectedNode(null)
    }
  }, [selectedNode, setNodes, setEdges])

  // Save workflow
  const saveWorkflow = useCallback(() => {
    setIsSaving(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Saving workflow:", {
        name: workflowName,
        description: workflowDescription,
        nodes,
        edges,
      })
      setIsSaving(false)
    }, 1000)
  }, [workflowName, workflowDescription, nodes, edges])

  // Run workflow
  const runWorkflow = useCallback(() => {
    setIsRunning(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Running workflow:", {
        name: workflowName,
        nodes,
        edges,
      })
      setIsRunning(false)
    }, 2000)
  }, [workflowName, nodes, edges])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Workflow Builder</h2>
          <p className="text-gray-500">Create and automate business processes with a visual workflow editor</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={saveWorkflow} disabled={isSaving}>
            {isSaving ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
          <Button onClick={runWorkflow} disabled={isRunning}>
            {isRunning ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin">⏳</span>
                Running...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-3">
          <Card className="h-[600px]">
            <CardHeader className="border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <input
                    type="text"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    className="border-0 bg-transparent text-xl font-bold focus:outline-none focus:ring-0"
                    placeholder="Workflow Name"
                  />
                  <input
                    type="text"
                    value={workflowDescription}
                    onChange={(e) => setWorkflowDescription(e.target.value)}
                    className="border-0 bg-transparent text-sm text-gray-500 focus:outline-none focus:ring-0"
                    placeholder="Workflow Description"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[520px] w-full" ref={reactFlowWrapper}>
                <ReactFlowProvider>
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    nodeTypes={nodeTypes}
                    fitView
                  >
                    <Background />
                    <Controls />
                    <MiniMap />
                    <Panel position="top-right">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => addNode("task")}>
                          <Plus className="mr-1 h-3 w-3" />
                          Task
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => addNode("approval")}>
                          <Plus className="mr-1 h-3 w-3" />
                          Approval
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => addNode("condition")}>
                          <Plus className="mr-1 h-3 w-3" />
                          Condition
                        </Button>
                      </div>
                    </Panel>
                  </ReactFlow>
                </ReactFlowProvider>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-[600px]">
            <CardHeader className="border-b px-6 py-4">
              <CardTitle className="text-lg">Properties</CardTitle>
              <CardDescription>
                {selectedNode ? `Edit ${selectedNode.type} node properties` : "Select a node to edit its properties"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {selectedNode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Label</label>
                    <input
                      type="text"
                      value={selectedNode.data.label}
                      onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-westernPurple focus:ring-westernPurple sm:text-sm"
                    />
                  </div>

                  {selectedNode.type === "task" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        value={selectedNode.data.description}
                        onChange={(e) =>
                          updateNodeData(selectedNode.id, {
                            description: e.target.value,
                          })
                        }
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-westernPurple focus:ring-westernPurple sm:text-sm"
                      />
                    </div>
                  )}

                  {selectedNode.type === "approval" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Approvers</label>
                      <input
                        type="text"
                        value={selectedNode.data.approvers}
                        onChange={(e) =>
                          updateNodeData(selectedNode.id, {
                            approvers: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-westernPurple focus:ring-westernPurple sm:text-sm"
                      />
                    </div>
                  )}

                  {selectedNode.type === "condition" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Condition</label>
                      <input
                        type="text"
                        value={selectedNode.data.condition}
                        onChange={(e) =>
                          updateNodeData(selectedNode.id, {
                            condition: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-westernPurple focus:ring-westernPurple sm:text-sm"
                      />
                    </div>
                  )}

                  <Button variant="destructive" size="sm" className="mt-4" onClick={deleteSelectedNode}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Node
                  </Button>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <Settings className="h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No node selected</h3>
                  <p className="mt-1 text-sm text-gray-500">Select a node in the workflow to edit its properties</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between w-full">
                <div className="text-xs text-gray-500">
                  {nodes.length} nodes, {edges.length} connections
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

