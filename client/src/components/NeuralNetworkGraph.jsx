import React, { useRef, useMemo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';

const NeuralNetworkGraph = ({ data }) => {
    const fgRef = useRef();

    const graphData = useMemo(() => {
        if (!data || !data.nodes || !data.links) return { nodes: [], links: [] };
        // Deep clone to avoid mutating props, as force-graph modifies objects
        return {
            nodes: data.nodes.map(node => ({ ...node })),
            links: data.links.map(link => ({ ...link }))
        };
    }, [data]);

    // Don't render if no data
    if (!data || !data.nodes || data.nodes.length === 0) {
        return (
            <div style={{ 
                height: '500px', 
                width: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.5)'
            }}>
                No network data available yet. Start chatting to build your conversation network!
            </div>
        );
    }

    return (
        <div style={{ height: '500px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            <ForceGraph3D
                ref={fgRef}
                graphData={graphData}
                nodeLabel={node => `
                    <div style="background: rgba(0,0,0,0.9); padding: 12px; border-radius: 8px; max-width: 200px;">
                        <div style="font-weight: bold; margin-bottom: 6px; color: ${
                            node.group === 2 ? '#a78bfa' : // AI messages - purple
                            node.emotion === 'happy' ? '#4ade80' :
                            node.emotion === 'sad' ? '#60a5fa' :
                            node.emotion === 'angry' ? '#f87171' :
                            node.emotion === 'anxious' ? '#fbbf24' :
                            node.emotion === 'calm' ? '#34d399' : '#9ca3af'
                        };">
                            ${node.group === 2 ? '🤖 AI' : (node.emotion ? node.emotion.toUpperCase() : 'USER')}
                        </div>
                        <div style="font-size: 12px; color: rgba(255,255,255,0.9);">
                            ${(node.content || '').substring(0, 80)}${node.content && node.content.length > 80 ? '...' : ''}
                        </div>
                    </div>
                `}
                nodeColor={node => {
                    // AI messages - unique purple color
                    if (node.group === 2) return '#a78bfa';
                    
                    // User messages - emotion-based colors
                    switch (node.emotion) {
                        case 'happy': return '#4ade80';
                        case 'sad': return '#60a5fa';
                        case 'angry': return '#f87171';
                        case 'anxious': return '#fbbf24';
                        case 'calm': return '#34d399';
                        case 'neutral': return '#9ca3af';
                        default: return '#9ca3af';
                    }
                }}
                nodeVal={node => node.val || 1}
                nodeRelSize={6}
                nodeOpacity={0.9}
                linkColor={() => 'rgba(255,255,255,0.2)'}
                linkWidth={1.5}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.005}
                linkDirectionalParticleWidth={2}
                backgroundColor="#0f172a"
                width={800}
                height={500}
                d3AlphaDecay={0.01}
                d3VelocityDecay={0.3}
                d3Force={{
                    charge: { strength: -120 },
                    link: { distance: 80 },
                    center: { strength: 0.5 }
                }}
                enableNodeDrag={true}
                enableNavigationControls={true}
                showNavInfo={false}
            />
        </div>
    );
};

export default NeuralNetworkGraph;
