import { useState, useEffect } from 'react'
import ToggleableGraph from './components/ToggleableGraph'
import NodeLegend from './components/NodeLegend'

function App() {
  const [nodes, setNodes] = useState([])
  const [links, setLinks] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [showMetrics, setShowMetrics] = useState(false)

  useEffect(() => {
    fetch('/mock-data/baseline.json')
      .then(response => response.json())
      .then(data => {
        setNodes(data.nodes)
        setLinks(data.links)
      })
      .catch(error => console.error('Error loading data:', error))
  }, [])

  // Calculate simple centrality metric (degree centrality + weighted connections)
  const calculateCentrality = (nodeId) => {
    const connections = links.filter(link => 
      link.source === nodeId || link.target === nodeId ||
      (typeof link.source === 'object' && link.source.id === nodeId) ||
      (typeof link.target === 'object' && link.target.id === nodeId)
    );
    
    const degree = connections.length;
    const weightSum = connections.reduce((sum, link) => sum + link.weight, 0);
    
    return (degree * 0.5) + (weightSum * 0.5); // Normalized centrality score
  };

  const getNodesWithMetrics = () => {
    return nodes.map(node => {
      const nodeWithMetrics = {
        ...node,
        centrality: calculateCentrality(node.id)
      };
      
      return nodeWithMetrics;
    });
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Header with Globe Heat Wave styling */}
      <div className="flex-shrink-0 px-6 py-6">
        <h1 className="text-h1 font-bold text-center tracking-tight">
          Achilles Analytics Risk Simulation
        </h1>
        <p className="text-small text-gray-400 text-center mt-2 max-w-2xl mx-auto">
          Real-time network visualization with stress propagation and centrality analysis
        </p>
      </div>
      
      <div className="flex-1 relative">
        {/* Node Types Legend */}
        <NodeLegend />
        <ToggleableGraph 
          nodes={getNodesWithMetrics()} 
          links={links} 
          onNodeClick={setSelectedNode}
          showMetrics={showMetrics}
        />
        
        {/* Floating Action Button - Globe Heat Wave style */}
        <div className="absolute top-6 right-6 z-10">
          <button 
            onClick={() => setShowMetrics(!showMetrics)}
            className={`fab text-small font-semibold transition-all duration-300 ${
              showMetrics 
                ? 'bg-purple-600/90 hover:bg-purple-700/90 text-white border-purple-500/30' 
                : 'text-white hover:text-white'
            }`}
            title="Toggle Centrality Heatmap"
          >
            {showMetrics ? '📊 Hide Metrics' : '📈 Show Metrics'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default App