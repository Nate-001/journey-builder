import React, { useState, useEffect } from 'react';
import DataMappingModal from './DataMappingModal';
import JSONEditorModal from './JSONEditorModal';

/**
 * FormEditor Component
 * 
 * A sidebar component that allows users to edit form node properties,
 * including data mapping between forms and JSON configuration.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.node - The node being edited
 * @param {Object} props.parentNode - The parent node (if any)
 * @param {Function} props.onChange - Callback function when changes are saved
 * @param {Function} props.onClose - Callback function to close the editor
 * @param {Array} props.edges - All edges in the flow
 * @param {Array} props.nodes - All nodes in the flow
 */
const FormEditor = ({ node, parentNode, onChange, onClose, edges, nodes }) => {
    // State for prefill setting - determines if this form should inherit parent form data
    const [isPrefilled, setIsPrefilled] = useState(node.data.isPrefilled || false);
    
    // State for dynamic checkbox configuration - stores field mappings as a string
    const [dynamicCheckbox, setDynamicCheckbox] = useState(node.data.dynamicCheckbox || 'dynamic_checkbox_group');
    
    // State for dynamic object - stores a complex JSON object for the form
    const [dynamicObject, setDynamicObject] = useState(
        // Properly initialize the dynamicObject from node data
        typeof node.data.dynamicObject === 'object' ? 
            node.data.dynamicObject : 
            {
                completed_at: '',
                button: '',
                dynamic_checkbox_group: '',
                dynamic_object: '',
                email: '',
                id: '',
                multi_select: '',
                name: ''
            }
    );
    
    // State for email field
    const [email, setEmail] = useState(node.data.email || 'email: Form A.email');

    // State for modal visibility
    const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
    const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
    
    // State for tracking which field is currently being edited
    const [selectedField, setSelectedField] = useState(null);

    /**
     * Effect to update local state when node data changes
     * This ensures the form reflects any updates from outside
     */
    useEffect(() => {
        setIsPrefilled(node.data.isPrefilled || false);
        setDynamicCheckbox(node.data.dynamicCheckbox || 'dynamic_checkbox_group');
        
        // Properly handle dynamicObject from node data
        if (node.data.dynamicObject) {
            if (typeof node.data.dynamicObject === 'object') {
                setDynamicObject(node.data.dynamicObject);
            } else {
                try {
                    const parsedObject = JSON.parse(node.data.dynamicObject);
                    setDynamicObject(parsedObject);
                } catch (e) {
                    console.error('Error parsing dynamicObject:', e);
                    setDynamicObject({
                        completed_at: '',
                        button: '',
                        dynamic_checkbox_group: '',
                        dynamic_object: '',
                        email: '',
                        id: '',
                        multi_select: '',
                        name: ''
                    });
                }
            }
        }
        
        setEmail(node.data.email || 'email: Form A.email');
    }, [node.data]);

    /**
     * Effect to handle prefill logic when enabled
     * When prefill is toggled on, inherit data from parent node
     */
    useEffect(() => {
      if (isPrefilled && parentNode && parentNode.data) {
        const parentData = JSON.parse(JSON.stringify(parentNode.data));
        
        // Inherit specific data from parent node
        setDynamicCheckbox(parentData.dynamicCheckbox || '');
        
        // Handle parent's dynamicObject properly
        if (parentData.dynamicObject) {
            setDynamicObject(
                typeof parentData.dynamicObject === 'object' ? 
                    parentData.dynamicObject : 
                    JSON.parse(parentData.dynamicObject)
            );
        }
        
        setEmail(parentData.email || '');
        
        // Force immediate state update through parent component
        onChange({
          id: node.id,
          data: {
            ...node.data,
            dynamicCheckbox: parentData.dynamicCheckbox,
            dynamicObject: parentData.dynamicObject,
            email: parentData.email,
            isPrefilled: true
          }
        });
      }
    }, [isPrefilled, parentNode]);
    

    // Data sources for field mapping
    // These represent different forms and fields that can be mapped
    const dataSources = [
        {
            name: 'Action Properties',
            fields: [
                { name: 'action_type', prefill: 'Email' },
                { name: 'action_status', prefill: 'Pending' }
            ]
        },
        {
            name: 'Client Organisation Properties',
            fields: [
                { name: 'org_name', prefill: 'Acme Corp' },
                { name: 'org_id', prefill: 'ORG-123' }
            ]
        },
        {
            name: 'Form A',
            fields: [
                { name: 'completed_at' },
                { name: 'button' },
                { name: 'dynamic_checkbox_group' },
                { name: 'dynamic_object' },
                { name: 'email' },
                { name: 'id' },
                { name: 'multi_select' },
                { name: 'name' }
            ]
        },
        {
            name: 'Form B',
            fields: [
                { name: 'completed_at' },
                { name: 'button' },
                { name: 'dynamic_checkbox_group' },
                { name: 'dynamic_object' },
                { name: 'email' },
                { name: 'id' },
                { name: 'multi_select' },
                { name: 'name' }
            ]
        },
        {
            name: 'Form C',
            fields: [
                { name: 'completed_at' },
                { name: 'button' },
                { name: 'dynamic_checkbox_group' },
                { name: 'dynamic_object' },
                { name: 'email' },
                { name: 'id' },
                { name: 'multi_select' },
                { name: 'name' }
            ]
        },
        {
            name: 'Form D',
            fields: [
                { name: 'completed_at' },
                { name: 'button' },
                { name: 'dynamic_checkbox_group' },
                { name: 'dynamic_object' },
                { name: 'email' },
                { name: 'id' },
                { name: 'multi_select' },
                { name: 'name' }
            ]
        },
        {
            name: 'Form E',
            fields: [
                { name: 'completed_at' },
                { name: 'button' },
                { name: 'dynamic_checkbox_group' },
                { name: 'dynamic_object' },
                { name: 'email' },
                { name: 'id' },
                { name: 'multi_select' },
                { name: 'name' }
            ]
        },
        {
            name: 'Form F',
            fields: [
                { name: 'completed_at' },
                { name: 'button' },
                { name: 'dynamic_checkbox_group' },
                { name: 'dynamic_object' },
                { name: 'email' },
                { name: 'id' },
                { name: 'multi_select' },
                { name: 'name' }
            ]
        }
    ];

    /**
     * Opens the data mapping modal for a specific field
     * @param {string} field - The field being mapped
     */
    const openMappingModal = (field) => {
        setSelectedField({
          field,
          // Pass BOTH the raw string and structured data for the current mapping
          dynamicCheckbox, // Raw string value from state
          currentSelections: dynamicCheckbox
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
            .map(selection => {
              const [source, field] = selection.split('.');
              return { source, field };
            }),
        });
        setIsMappingModalOpen(true);
      };

    /**
     * Opens the JSON editor modal
     */
    const openJsonModal = () => {
        setIsJsonModalOpen(true);
    };

    /**
     * Closes all modals
     */
    const closeModals = () => {
        setIsMappingModalOpen(false);
        setIsJsonModalOpen(false);
        setSelectedField(null);
    };

    /**
     * Handles when a user selects mappings in the data mapping modal
     * @param {Array} selections - Array of {source, field} objects
     */
    const handleMappingSelect = (selections) => {
      // Convert selections array to string format: "source.field, source.field"
      const value = selections.map(({ source, field }) => `${source}.${field}`).join(', ');
      setDynamicCheckbox(value);
      
      // Immediately update parent state with the new value
      onChange({
        id: node.id,
        data: { 
          ...node.data,
          dynamicCheckbox: value,
          isPrefilled 
        }
      });
      
      closeModals();
    };

    /**
     * Handles when a user saves changes in the JSON editor modal
     * @param {Object} jsonValue - The updated JSON object
     */
    const handleJsonSave = (jsonValue) => {
        // Update local state with the new JSON object
        setDynamicObject(jsonValue);
        
        // Immediately update parent state
        onChange({
            id: node.id,
            data: { 
                ...node.data,
                dynamicObject: jsonValue,
                isPrefilled 
            }
        });
        
        closeModals();
    };

    /**
     * Handles final save of all form editor changes
     */
    const handleSave = () => {
        onChange({
            id: node.id,
            data: { 
                dynamicCheckbox, 
                dynamicObject, // Pass the full object
                email, 
                isPrefilled 
            }
        });
        onClose();
    };

    /**
     * Helper to render a more readable preview of the dynamicObject
     * @returns {string} - Human-readable representation of the object
     */
    const renderDynamicObjectPreview = () => {
        if (!dynamicObject) return 'dynamic_object';
        
        try {
            // Count filled fields (non-empty values)
            const filledFields = Object.entries(dynamicObject)
                .filter(([_, value]) => value && value.trim !== '')
                .length;
                
            return `dynamic_object (${filledFields} fields filled)`;
        } catch (e) {
            return 'dynamic_object';
        }
    };

    return (
        <div style={{
            padding: '20px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            width: '300px'
        }}>
            <h3>Form Configuration: {node.data.name || node.data.label}</h3>
            
            {/* Prefill toggle switch */}
            <label htmlFor="prefill-checkbox" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ marginRight: '10px' }}>Prefill fields for this form</span>
                <label className="switch">
                    <input
                        id="prefill-checkbox"
                        type="checkbox"
                        checked={isPrefilled}
                        onChange={() => setIsPrefilled(!isPrefilled)}
                    />
                    <span className="slider round"></span>
                </label>
            </label>

            <div style={{ marginBottom: '10px', marginRight: '30px' }}>
                {/* Dynamic Checkbox Field - clickable field that opens mapping modal */}
                <label
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#fff',
                        border: '1px dashed #999',
                        padding: '8px',
                        borderRadius: '4px',
                        marginBottom: '5px',
                        cursor: 'pointer'
                    }}
                    onClick={() => openMappingModal('dynamicCheckbox')}
                >
                    <span style={{ marginRight: '10px' }}>🗄️</span>
                    <input
                        type="text"
                        value={dynamicCheckbox}
                        onChange={(e) => setDynamicCheckbox(e.target.value)}
                        style={{ border: 'none', outline: 'none', flex: 1, backgroundColor: 'transparent' }}
                    />
                </label>

                {/* Dynamic Object Field - clickable field that opens JSON editor */}
                <label
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#fff',
                        border: '1px dashed #999',
                        padding: '8px',
                        borderRadius: '4px',
                        marginBottom: '5px',
                        cursor: 'pointer'
                    }}
                    onClick={openJsonModal}
                >
                    <span style={{ marginRight: '10px' }}>🗄️</span>
                    <input
                        type="text"
                        value={renderDynamicObjectPreview()}
                        style={{ border: 'none', outline: 'none', flex: 1, backgroundColor: 'transparent' }}
                        readOnly
                    />
                </label>

                {/* Email Field - direct input field */}
                <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    border: '1px solid #ccc',
                    padding: '8px',
                    borderRadius: '20px',
                }}>
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ border: 'none', outline: 'none', flex: 1, backgroundColor: 'transparent' }}
                    />
                    <button
                        onClick={() => setEmail('')}
                        style={{
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: 'pointer'
                        }}
                    >
                        ❌
                    </button>
                </label>
            </div>

            {/* Save button */}
            <div style={{ marginTop: '20px',marginRight: '30px', textAlign: 'right' }}>
                <button onClick={handleSave} style={{
                    padding: '8px 16px',
                    backgroundColor: '#558b2f',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}>Save</button>
            </div>

            {/* Data Mapping Modal - rendered conditionally when open */}
            <DataMappingModal
                isOpen={isMappingModalOpen}
                onClose={closeModals}
                onSelect={handleMappingSelect}
                dataSources={dataSources}
                selectedField={selectedField}
                node={node}
                edges={edges}
                nodes={nodes}
                isPrefilled={isPrefilled}
            />

            {/* JSON Editor Modal - rendered conditionally when open */}
            <JSONEditorModal
                isOpen={isJsonModalOpen}
                onClose={closeModals}
                initialValue={dynamicObject}
                onSave={handleJsonSave}
            />
        </div>
    );
};

export default FormEditor;