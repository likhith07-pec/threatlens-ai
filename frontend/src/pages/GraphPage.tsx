import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Network,
  RefreshCw,
  Info,
  ExternalLink,
  Layers,
  Shield,
  FileCheck2,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { useInvestigation } from '@/context/InvestigationContext';
import { investigationsApi } from '@/api/investigations';
import type { GraphResponse, GraphNode } from '@/types/api';

export const GraphPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { activeId, activeCve } = useInvestigation();

  const targetId = searchParams.get('id') || activeId;

  const [graphData, setGraphData] = useState<GraphResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const fetchGraph = async () => {
    if (!targetId) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await investigationsApi.getGraph(targetId);
      setGraphData(res);

      // Layout nodes into a graph layout
      if (res && res.nodes && res.nodes.length > 0) {
        // Group nodes by type (claims on left/middle, sources on right)
        const claimNodes = res.nodes.filter((n) => n.type === 'claim');
        const sourceNodes = res.nodes.filter((n) => n.type === 'source' || n.type === 'evidence');

        const flowNodes: Node[] = [];

        claimNodes.forEach((cn, index) => {
          flowNodes.push({
            id: cn.id,
            position: { x: 100, y: 80 + index * 120 },
            data: { label: cn.label, raw: cn },
            style: {
              background: '#071428',
              color: '#E2E8F0',
              border:
                cn.verification_state === 'verified'
                  ? '2px solid #22C55E'
                  : cn.verification_state === 'contradicted'
                  ? '2px solid #F87171'
                  : '2px solid #60A5FA',
              borderRadius: '8px',
              padding: '12px',
              width: 260,
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
            },
          });
        });

        sourceNodes.forEach((sn, index) => {
          flowNodes.push({
            id: sn.id,
            position: { x: 500, y: 80 + index * 130 },
            data: { label: sn.label, raw: sn },
            style: {
              background: '#0C1F3F',
              color: '#94A3B8',
              border: '1px solid #1E3560',
              borderRadius: '6px',
              padding: '10px',
              width: 240,
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
            },
          });
        });

        const flowEdges: Edge[] = res.edges.map((e, index) => ({
          id: `e-${index}-${e.source}-${e.target}`,
          source: e.source,
          target: e.target,
          label: e.relationship,
          animated: e.relationship === 'supported',
          style: {
            stroke:
              e.relationship === 'contradicted'
                ? '#F87171'
                : e.relationship === 'supported'
                ? '#22C55E'
                : '#60A5FA',
            strokeWidth: 1.5,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color:
              e.relationship === 'contradicted'
                ? '#F87171'
                : e.relationship === 'supported'
                ? '#22C55E'
                : '#60A5FA',
          },
        }));

        setNodes(flowNodes);
        setEdges(flowEdges);
      } else {
        setNodes([]);
        setEdges([]);
      }
    } catch (err: any) {
      setError(err?.detail || 'Failed to fetch graph data from backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, [targetId]);

  const onNodeClick = (_: any, node: Node) => {
    if (node.data && node.data.raw) {
      setSelectedNode(node.data.raw as GraphNode);
    }
  };

  if (!targetId) {
    return (
      <EmptyState
        title="No Investigation Selected"
        description="Select an investigation to visualize the evidence relationship graph."
        actionText="View Investigations"
        onAction={() => navigate('/investigations')}
      />
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1E3560] shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#E2E8F0] tracking-tight flex items-center gap-2">
              <Network className="w-5 h-5 text-[#60A5FA]" />
              Evidence Relationship Graph
            </h1>
            {activeCve && (
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#0C1F3F] border border-[#2A4D80] text-[#60A5FA]">
                {activeCve}
              </span>
            )}
          </div>
          <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
            Interactive topology connecting extracted claims with authoritative sources and citations
          </p>
        </div>

        <button
          onClick={fetchGraph}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0C1F3F] hover:bg-[#112850] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#1E3560] text-xs font-mono rounded transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Reload Topology
        </button>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchGraph} />}

      {/* Main Graph Canvas Area */}
      <div className="flex-1 min-h-[500px] bg-[#040D1A] border border-[#1E3560] rounded-lg overflow-hidden relative flex">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <LoadingSpinner label="Compiling evidence topology..." />
          </div>
        ) : nodes.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center p-8">
            <EmptyState
              title="No Graph Nodes Available"
              description="This investigation currently has no persisted claims or evidence relationships to map into a graph."
              actionText="Inspect Evidence"
              onAction={() => navigate(`/evidence?id=${targetId}`)}
            />
          </div>
        ) : (
          <div className="flex-1 h-full relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              fitView
              className="bg-[#040D1A]"
            >
              <Background color="#1E3560" gap={20} size={1} />
              <Controls className="bg-[#071428] border border-[#1E3560] fill-white" />
              <MiniMap
                nodeColor={(n) => (n.id.startsWith('c') ? '#60A5FA' : '#22C55E')}
                className="bg-[#071428] border border-[#1E3560]"
              />
            </ReactFlow>

            {/* Graph Legend overlay */}
            <div className="absolute top-4 left-4 bg-[#071428]/90 backdrop-blur-sm border border-[#1E3560] rounded p-3 text-xs font-mono space-y-1.5 z-10">
              <div className="text-[10px] text-[#64748B] uppercase tracking-wider mb-1">
                Topology Legend
              </div>
              <div className="flex items-center gap-2 text-[#E2E8F0]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#071428] border-2 border-[#22C55E]" />
                <span>Verified Claim</span>
              </div>
              <div className="flex items-center gap-2 text-[#E2E8F0]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#071428] border-2 border-[#60A5FA]" />
                <span>Candidate Claim</span>
              </div>
              <div className="flex items-center gap-2 text-[#E2E8F0]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#0C1F3F] border border-[#1E3560]" />
                <span>Authoritative Source</span>
              </div>
            </div>
          </div>
        )}

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="w-80 bg-[#071428] border-l border-[#1E3560] p-4 flex flex-col justify-between overflow-y-auto shrink-0 z-20">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#1E3560] mb-3">
                <span className="text-xs font-mono uppercase text-[#64748B]">Node Inspector</span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-xs text-[#94A3B8] hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3 font-mono">
                <div>
                  <div className="text-[10px] text-[#64748B] uppercase">Type</div>
                  <div className="text-xs font-bold text-[#60A5FA] capitalize">
                    {selectedNode.type}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-[#64748B] uppercase">Node Label / Text</div>
                  <div className="text-xs text-[#E2E8F0] mt-0.5 leading-relaxed font-sans">
                    {selectedNode.label}
                  </div>
                </div>

                {selectedNode.verification_state && (
                  <div>
                    <div className="text-[10px] text-[#64748B] uppercase mb-1">
                      Verification Status
                    </div>
                    <Badge
                      variant="verification"
                      verificationState={selectedNode.verification_state}
                    />
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => navigate(`/evidence?id=${targetId}`)}
              className="mt-4 w-full py-2 bg-[#1A3561] hover:bg-[#1E3F70] text-[#60A5FA] rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>View in Evidence Viewer</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
