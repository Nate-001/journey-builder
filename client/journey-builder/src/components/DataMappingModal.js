import React, { useState, useEffect } from 'react';

/**
 * Shared styles for modal components
 */
const modalOverlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.3)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const modalContentStyle = {
  background: '#fff',
  borderRadius: 8,
  padding: 24,
  minWidth: 500,
  maxWidth: 700,
  boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
  position: 'relative',
  maxHeight: '90vh',
  overflow: 'auto'
};

const closeButtonStyle = {
  position: 'absolute',
  top: 10,
  right: 10,
  background: 'none',
  border: 'none',
  fontSize: 20,
  cursor: 'pointer'
};

/**
 * DataMappingModal Component
 * 
 * A modal that allows users to map fields from various data sources
 * to the current form field. It filters available sources based on
 * the node's position in the flow graph.
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is currently open
 * @param {Function} props.onClose - Callback when the modal is closed
 * @param {Function} props.onSelect - Callback when field mappings are selected
 * @param {Array} props.dataSources - Available data sources for mapping
 * @param {Object} props.selectedField - Current field being edited
 * @param {Object} props.node - Current node being edited
 * @param {Array} props.edges - All edges in the flow
 * @param {Array} props.nodes - All nodes in the flow
 * @param {boolean} props.isPrefilled - Whether prefill is enabled for this node
 */
const DataMappingModal = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  dataSources, 
  selectedField, 
  node, 
  edges, 
  nodes,
  isPrefilled
}) => {
  // State for currently selected source-field mappings
  const [selectedSources, setSelectedSources] = useState([]);
  // State for filtering sources and fields
  const [searchTerm, setSearchTerm] = useState('');
  // State for sources that are available based on node position
  const [availableSources, setAvailableSources] = useState([]);

  /**
   * Find all parent nodes of the current node by traversing edges
   * @param {string} nodeId - ID of the node to find parents for
   * @returns {Array} - Array of parent node objects
   */
  const getParentNodes = (nodeId) => {
    const parentNodes = [];
    let currentNodeId = nodeId;
    
    // Traverse upward through the graph
    while (true) {
      // Find parent edge (where current node is the target)
      const parentEdge = edges.find(edge => edge.target === currentNodeId);
      if (!parentEdge) break;
      
      // Find parent node
      const parentNode = nodes.find(n => n.id === parentEdge.source);
      if (!parentNode) break;
      
      // Add to list and continue traversing upward
      parentNodes.push(parentNode);
      currentNodeId = parentNode.id;
    }
    
    return parentNodes;
  };

  /**
   * Effect to filter available sources based on node position in flow
   * Only certain sources should be available based on the node's position
   */
  useEffect(() => {
    if (isOpen && node) {
      // Get all parent nodes to determine which sources are available
      const parentNodes = getParentNodes(node.id);
      
      // Filter sources based on parent nodes and rules
      const filtered = dataSources.filter(source => {
        // Common sources always available to all nodes
        if (source.name.startsWith('Action') || source.name.startsWith('Client')) {
          return true;
        }
        
        // Current node's form is available (self-reference)
        if (source.name === node.data.name || source.name === node.data.label) {
          return true;
        }
        
        // Parents' forms are available (upstream data flow)
        return parentNodes.some(parent => 
          source.name === parent.data.name || source.name === parent.data.label
        );
      });
      
      setAvailableSources(filtered);
    }
  }, [isOpen, node, dataSources, edges, nodes]);

  /**
   * Initialize selected sources when modal opens
   */
  useEffect(() => {
    if (isOpen && selectedField) {
      if (selectedField.currentSelections && selectedField.currentSelections.length > 0) {
        setSelectedSources(selectedField.currentSelections);
      } else {
        setSelectedSources([]);
      }
    }
  }, [isOpen, selectedField]);

  /**
   * Toggle selection of a source field
   * @param {Object} source - The data source
   * @param {Object} field - The field within the source
   */
  const toggleSource = (source, field) => {
    const selection = { source: source.name, field: field.name };
    
    // Check if this selection already exists
    const existingIndex = selectedSources.findIndex(
      s => s.source === selection.source && s.field === selection.field
    );
    
    if (existingIndex >= 0) {
      // Remove if already selected
      setSelectedSources(prev => prev.filter((_, i) => i !== existingIndex));
    } else {
      // Add new selection
      setSelectedSources(prev => [...prev, selection]);
    }
  };

  /**
   * Check if a source field is currently selected
   * @param {Object} source - The data source
   * @param {Object} field - The field within the source
   * @returns {boolean} - Whether the field is selected
   */
  const isSelected = (source, field) => {
    return selectedSources.some(
      s => s.source === source.name && s.field === field.name
    );
  };
  
  /**
   * Handle save button click
   */
  const handleSave = () => {
    onSelect(selectedSources);
  };
  
  /**
   * Filter sources and fields based on search term
   */
  const filteredSources = searchTerm 
    ? availableSources.filter(source => 
        source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        source.fields.some(field => field.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : availableSources;

  // Don't render anything if modal is closed
  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        {/* Close button (X) */}
        <button onClick={onClose} style={closeButtonStyle}>&times;</button>
        <h2>Data Mapping</h2>
        <p>Select fields to map to <strong>{selectedField?.field}</strong></p>
        
        <div style={{ marginBottom: 20, marginRight: 30}}>
          {/* Search input for filtering sources and fields */}
          <input
            type="text"
            placeholder="Search sources and fields..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 4,
              border: '1px solid #ccc',
              marginBottom: 16
            }}
          />
          
          {/* Scrollable container for data sources */}
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {filteredSources.map(source => (
              <div key={source.name} style={{ marginBottom: 12 }}>
                {/* Source heading */}
                <h3 style={{ 
                  marginBottom: 8, 
                  fontSize: '1rem',
                  color: '#1976d2',
                  borderBottom: '1px solid #eee',
                  paddingBottom: 4
                }}>{source.name}</h3>
                
                {/* Source fields as clickable chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {source.fields.map(field => (
                    <div 
                      key={`${source.name}.${field.name}`}
                      onClick={() => toggleSource(source, field)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 4,
                        border: '1px solid #ddd',
                        backgroundColor: isSelected(source, field) ? '#e3f2fd' : '#f5f5f5',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      {/* Checkmark for selected fields */}
                      {isSelected(source, field) && (
                        <span style={{ color: '#1976d2' }}>✓</span>
                      )}
                      <span>{field.name}</span>
                      {/* Show prefill value if available */}
                      {field.prefill && (
                        <span style={{ 
                          fontSize: '0.7rem', 
                          backgroundColor: '#e8f5e9', 
                          padding: '2px 4px', 
                          borderRadius: 4 
                        }}>
                          {field.prefill}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Selected mappings summary */}
        <div style={{ marginTop: 20 }}>
          <h3>Selected Mapping</h3>
          {selectedSources.length > 0 ? (
            <div style={{ 
              padding: 12,
              backgroundColor: '#f5f5f5',
              borderRadius: 4,
              marginBottom: 16,
              fontFamily: 'monospace'
            }}>
              {selectedSources.map((selection, i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  {selection.source}.{selection.field}
                  {i < selectedSources.length - 1 && ', '}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#757575', fontStyle: 'italic', marginBottom: 16 }}>
              No fields selected
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: 4,
              border: '1px solid #ccc',
              backgroundColor: '#f5f5f5',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              borderRadius: 4,
              border: 'none',
              backgroundColor: '#1976d2',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Save Mapping
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataMappingModal;