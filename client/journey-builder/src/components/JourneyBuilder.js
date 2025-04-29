import React, { useState, useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType
} from "reactflow";
import "reactflow/dist/style.css";
import FormEditor from "./FormEditor";

/**
 * JourneyBuilder Component
 * 
 * This component renders a flow diagram that visualizes a customer journey.
 * It allows users to create, view and edit nodes that represent different forms
 * and actions in the journey, with the ability to configure form prefilling
 * and data mapping between forms.
 */
const JourneyBuilder = () => {
  // State for managing the flow nodes
  const [nodes, setNodes] = useState([]);
  // State for managing the connections between nodes
  const [edges, setEdges] = useState([]);
  // Currently selected node for editing/viewing details
  const [selectedNode, setSelectedNode] = useState(null);
  // Loading state for API data fetching
  const [isLoading, setIsLoading] = useState(true);
  // Error state for API data fetching
  const [error, setError] = useState(null);
  // Registry to store form data configurations for all form nodes
  const [formDataRegistry, setFormDataRegistry] = useState({});
  // Visibility toggle for the form editor sidebar
  const [formEditorVisible, setFormEditorVisible] = useState(false);

  /**
   * Effect hook to fetch initial journey data from the API
   * and transform it into the format expected by ReactFlow
   */
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch journey graph data from API
        const response = await fetch('http://localhost:3000/api/v1/123/actions/blueprints/bp_456/bpv_123/graph');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
 
        // Transform nodes to ReactFlow format with styling
        const reactFlowNodes = data.nodes.map(node => ({
          id: node.id,
          type: "default",
          position: node.position,
          data: {
            ...node.data,
            label: node.data.name || node.data.label || node.id
          },
          // Add styling based on node type
          style: {
            background: '#f5f5f5',
            border: '1px solid #1976d2',
            borderRadius: '5px',
            padding: '10px'
          }
        }));
 
        // Transform edges to ReactFlow format with styling and markers
        const reactFlowEdges = data.edges.map((edge, index) => ({
          id: edge.id || `edge-${index}`,
          source: edge.source,
          target: edge.target,
          animated: true,
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          style: { stroke: '#1976d2' }
        }));

        // Update state with transformed data
        setNodes(reactFlowNodes);
        setEdges(reactFlowEdges);
        
        // Initialize form data registry from nodes that are forms
        const initialRegistry = {};
        reactFlowNodes.forEach(node => {
          if (node.data && (node.data.name?.startsWith('Form') || node.data.label?.startsWith('Form'))) {
            initialRegistry[node.id] = {
              dynamicObject: node.data.dynamicObject || {},
              dynamicCheckbox: node.data.dynamicCheckbox || '',
              email: node.data.email || '',
              isPrefilled: node.data.isPrefilled || false
            };
          }
        });
        setFormDataRegistry(initialRegistry);
      } catch (error) {
        console.error("Could not fetch graph data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
 
    fetchData();
  }, []);
 
  /**
   * Handle changes to nodes (position, selection, etc.)
   * using ReactFlow's built-in change handling
   */
  const onNodesChange = (changes) => setNodes(nds => applyNodeChanges(changes, nds));
  
  /**
   * Handle changes to edges (connections between nodes)
   * using ReactFlow's built-in change handling
   */
  const onEdgesChange = (changes) => setEdges(eds => applyEdgeChanges(changes, eds));
  
  /**
   * Handle node click events - selects a node and shows appropriate editor
   * @param {Event} _ - Click event (unused)
   * @param {Object} node - The node that was clicked
   */
  const onNodeClick = (_, node) => {
    // Find parent node (if any) of the clicked node
    const parentNode = findParentNode(node.id);
    
    setSelectedNode({
      ...node,
      parentNode
    });
    
    // Open form editor if this is a form node
    if (node.data && (node.data.name?.startsWith('Form') || node.data.label?.startsWith('Form'))) {
      setFormEditorVisible(true);
    }
    
    // Debug logging
    console.log(`Selected node ${node.id}:`, node.data);
    console.log("Current form data for this node:", formDataRegistry[node.id]);
  };
  
  /**
   * Helper function to find a parent node based on edges
   * @param {string} nodeId - ID of the node to find the parent for
   * @returns {Object|null} - Parent node object or null if no parent
   */
  const findParentNode = (nodeId) => {
    // Find an edge where this node is the target
    const parentEdge = edges.find(edge => edge.target === nodeId);
    if (!parentEdge) return null;
    
    // Return the source node of that edge
    return nodes.find(node => node.id === parentEdge.source);
  };
  
  /**
   * Helper function to find immediate child nodes
   * @param {string} nodeId - ID of the node to find children for
   * @returns {Array} - Array of child node objects
   */
  const findChildNodes = (nodeId) => {
    // Find all edges where this node is the source
    const childEdges = edges.filter(edge => edge.source === nodeId);
    if (!childEdges.length) return [];
    
    // Return all nodes that are targets of those edges
    return nodes.filter(node => childEdges.some(edge => edge.target === node.id));
  };
  
  /**
   * Close the form editor sidebar
   */
  const closeFormEditor = () => {
    setFormEditorVisible(false);
    setSelectedNode(null);
  };
  
  /**
   * Update a node's data and handle cascading updates to child nodes
   * @param {Object} updatedNode - Node with updated data
   */
  const updateNodeData = (updatedNode) => {
    console.log("🏁 updateNodeData triggered with:", updatedNode);
    
    // Update form data registry for this node
    setFormDataRegistry(prev => ({
      ...prev,
      [updatedNode.id]: {
        dynamicObject: updatedNode.data.dynamicObject || {},
        dynamicCheckbox: updatedNode.data.dynamicCheckbox || '',
        email: updatedNode.data.email || '',
        isPrefilled: updatedNode.data.isPrefilled || false
      }
    }));
    
    // Update nodes in state
    setNodes((nodes) => {
      console.log("📦 Current nodes state:", nodes);
      
      const newNodes = nodes.map((node) => {
        // If this is the node being updated
        if (node.id === updatedNode.id) {
          console.log("🔄 Updating node:", node.id);
          console.log("📜 Old node data:", node.data);
          console.log("🆕 New node data:", updatedNode.data);
          
          // Merge the old and new data
          const mergedData = {
            ...node.data,
            ...updatedNode.data,
          };
          
          // Visual feedback that the node was updated
          const newStyle = {
            ...node.style,
            border: `2px solid #4CAF50`
          };
          
          console.log("🧩 Merged data:", mergedData);
          
          return {
            ...node,
            data: mergedData,
            style: newStyle
          };
        }
        
        // If the updated node has isPrefilled=true, cascade changes to its children
        if (updatedNode.data.isPrefilled) {
          // Check if this node is a child of the updated node
          const isChild = edges.some(
            edge => edge.source === updatedNode.id && edge.target === node.id
          );
          
          // If this is a child and has prefill enabled, update it with parent's data
          if (isChild && node.data.isPrefilled) {
            console.log("🔄 Cascading update to child node:", node.id);
            
            // Use parent's data for this child
            const childMergedData = {
              ...node.data,
              dynamicCheckbox: updatedNode.data.dynamicCheckbox,
              dynamicObject: updatedNode.data.dynamicObject,
              email: updatedNode.data.email,
            };
            
            // Visual indication of cascade update
            const childNewStyle = {
              ...node.style,
              border: `2px solid #FFC107` // Yellow for cascaded updates
            };
            
            // Update child in registry too
            setFormDataRegistry(prev => ({
              ...prev,
              [node.id]: {
                dynamicObject: updatedNode.data.dynamicObject || {},
                dynamicCheckbox: updatedNode.data.dynamicCheckbox || '',
                email: updatedNode.data.email || '',
                isPrefilled: true
              }
            }));
            
            return {
              ...node,
              data: childMergedData,
              style: childNewStyle
            };
          }
        }
        
        // Return node unchanged if not affected
        return node;
      });
  
      console.log("✅ Updated nodes array:", newNodes);
      return newNodes;
    });
  
    console.log("🚀 Nodes state update queued in React");
    
    // After updating, recursively check for child nodes that need prefill updates
    if (updatedNode.data.isPrefilled) {
      recursivelyUpdateChildNodes(updatedNode.id, updatedNode.data);
    }
  };
  
  /**
   * Recursively update children's children for deep prefill cascade
   * @param {string} parentId - ID of the parent node
   * @param {Object} parentData - Data from the parent node to cascade
   */
  const recursivelyUpdateChildNodes = (parentId, parentData) => {
    // Find all immediate children of this parent
    const childNodes = findChildNodes(parentId);
    
    // For each child with prefill enabled, update and then check its children too
    childNodes.forEach(childNode => {
      if (childNode.data.isPrefilled) {
        // Update this child with parent's data
        const updatedChildNode = {
          id: childNode.id,
          data: {
            ...childNode.data,
            dynamicCheckbox: parentData.dynamicCheckbox,
            dynamicObject: parentData.dynamicObject,
            email: parentData.email,
            isPrefilled: true
          }
        };
        
        // Update the registry for this child
        setFormDataRegistry(prev => ({
          ...prev,
          [childNode.id]: {
            dynamicObject: parentData.dynamicObject || {},
            dynamicCheckbox: parentData.dynamicCheckbox || '',
            email: parentData.email || '',
            isPrefilled: true
          }
        }));
        
        // Update nodes state for this child
        setNodes(nodes => nodes.map(node => {
          if (node.id === childNode.id) {
            return {
              ...node,
              data: {
                ...node.data,
                dynamicCheckbox: parentData.dynamicCheckbox,
                dynamicObject: parentData.dynamicObject,
                email: parentData.email,
                isPrefilled: true
              },
              style: {
                ...node.style,
                border: `2px solid #FFC107` // Yellow for cascaded updates
              }
            };
          }
          return node;
        }));
        
        // Recursively update this child's children (depth-first)
        recursivelyUpdateChildNodes(childNode.id, updatedChildNode.data);
      }
    });
  };
  
  /**
   * Export the current form data to a downloadable JSON file
   */
  const exportFormData = () => {
    // Collect data to export
    const exportData = {
      formDataRegistry,
      nodes: nodes.map(node => ({
        id: node.id,
        name: node.data.name || node.data.label,
        data: {
          dynamicObject: node.data.dynamicObject || {},
          dynamicCheckbox: node.data.dynamicCheckbox || '',
          email: node.data.email || '',
          isPrefilled: node.data.isPrefilled || false
        }
      })),
      edges: edges.map(edge => ({
        source: edge.source,
        target: edge.target
      }))
    };
    
    // Convert to pretty JSON string
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create and trigger a download link
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonString);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "journey_form_data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Show loading indicator while fetching data
  if (isLoading) {
    return <div>Loading journey map...</div>;
  }

  // Show error message if data fetching failed
  if (error) {
    return <div>Error loading journey: {error}</div>;
  }

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      {/* Export button in top corner */}
      <div style={{ 
        position: 'absolute', 
        top: 10, 
        left: 10, 
        zIndex: 10, 
        backgroundColor: 'white',
        padding: '8px 16px',
        borderRadius: 4,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={exportFormData}
          style={{
            background: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            padding: '8px 16px',
            cursor: 'pointer'
          }}
        >
          Export Form Data
        </button>
      </div>
      
      {/* Main ReactFlow component */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        {/* MiniMap for navigation */}
        <MiniMap 
          style={{ background: '#f0f0f0' }}
          nodeColor={(node) => {
            // Highlight form nodes in the minimap
            if (node.data.name?.startsWith('Form') || node.data.label?.startsWith('Form')) {
              return '#1976d2';
            }
            return '#ccc';
          }}
        />
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
      
      {/* Form Editor Sidebar - shows when form node is selected */}
      {formEditorVisible && selectedNode && (
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '350px',
          backgroundColor: 'white',
          boxShadow: '-2px 0 5px rgba(0,0,0,0.2)',
          zIndex: 10,
          overflowY: 'auto'
        }}>
          <FormEditor
            node={selectedNode}
            parentNode={selectedNode.parentNode}
            onChange={updateNodeData}
            onClose={closeFormEditor}
            edges={edges}
            nodes={nodes}
          />
        </div>
      )}
      
      {/* Node Info Panel - shows when non-form node is selected */}
      {selectedNode && !formEditorVisible && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '15px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          maxWidth: '300px',
          zIndex: 10
        }}>
          <h3>{selectedNode.data.label}</h3>
          <p>ID: {selectedNode.id}</p>
          <p>Type: {selectedNode.data.type || 'Default'}</p>
          <button
            onClick={closeFormEditor}
            style={{
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default JourneyBuilder;