import React, { useState, useEffect } from 'react';

/**
 * Shared styles for modal components
 */
const modalOverlayStyle  = {
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
  minWidth: 400,
  maxWidth: 550,
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

const inputStyle = {
  width: '100%',
  padding: 8,
  marginBottom: 12,
  borderRadius: 4,
  border: '1px solid #ccc',
  fontFamily: 'monospace'
};

const textareaStyle = {
  width: '100%',
  padding: 8,
  marginBottom: 12,
  borderRadius: 4,
  border: '1px solid #ccc',
  fontFamily: 'monospace',
  minHeight: 100
};

/**
 * List of fields that should be available in the dynamic object
 */
const FIELD_LIST = [
  'completed_at',
  'button',
  'dynamic_checkbox_group',
  'dynamic_object',
  'email',
  'id',
  'multi_select',
  'name'
];

/**
 * JSONEditorModal Component
 * 
 * A modal that allows editing a JSON object with two modes:
 * 1. Field mode - edit individual fields as key-value pairs
 * 2. JSON mode - edit the raw JSON directly
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is currently open
 * @param {Function} props.onClose - Callback when the modal is closed
 * @param {Object|string} props.initialValue - Initial JSON value (object or string)
 * @param {Function} props.onSave - Callback when changes are saved
 */
const JSONEditorModal = ({ isOpen, onClose, initialValue = {}, onSave }) => {
  // State for form data (structured object)
  const [formData, setFormData] = useState({});
  // Toggle between JSON text editing and field-by-field editing
  const [jsonMode, setJsonMode] = useState(false);
  // Raw JSON text for editing in JSON mode
  const [jsonText, setJsonText] = useState('');
  // Error state for JSON parsing
  const [error, setError] = useState('');

  /**
   * Initialize form data when the modal opens or initialValue changes
   */
  useEffect(() => {
    // Only process if modal is open
    if (isOpen) {
      let data = {};
      
      // Handle both object and string initialValue formats
      if (typeof initialValue === 'string') {
        try {
          data = JSON.parse(initialValue);
        } catch (e) {
          console.error('Failed to parse JSON string:', e);
          data = {};
        }
      } else if (typeof initialValue === 'object' && initialValue !== null) {
        data = initialValue;
      }
      
      // Ensure all fields exist in the form data (with defaults)
      const formattedData = {};
      FIELD_LIST.forEach(field => {
        formattedData[field] = data[field] || '';
      });
      
      // Set both the structured form data and text representation
      setFormData(formattedData);
      setJsonText(JSON.stringify(formattedData, null, 2));
      setError('');
    }
  }, [initialValue, isOpen]);

  /**
   * Handle change to a single field in field mode
   * @param {string} field - Field name
   * @param {string} value - New field value
   */
  const handleFieldChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Keep JSON text in sync with form data
      setJsonText(JSON.stringify(updated, null, 2));
      return updated;
    });
  };

  /**
   * Handle change to the raw JSON text in JSON mode
   * @param {string} text - New JSON text
   */
  const handleJsonChange = (text) => {
    setJsonText(text);
    try {
      // Try to parse the JSON text and update form data if valid
      const parsed = JSON.parse(text);
      setFormData(parsed);
      setError('');
    } catch (e) {
      // Show error if JSON is invalid
      setError('Invalid JSON format');
    }
  };

  /**
   * Handle save button click
   */
  const handleSave = () => {
    // Don't save if there's a JSON error in JSON mode
    if (jsonMode && error) {
      return;
    }
    
    // Call the parent's onSave with the current form data
    onSave(formData);
  };

  /**
   * Toggle between field and JSON editing modes
   */
  const toggleMode = () => {
    setJsonMode(!jsonMode);
  };

  // Don't render anything if modal is closed
  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        {/* Close button (X) */}
        <button onClick={onClose} style={closeButtonStyle} aria-label="Close">&times;</button>
        <h2>Edit Dynamic Object</h2>
        
        {/* Mode toggle and heading */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>Configure the dynamic object for this form</div>
          <button
            onClick={toggleMode}
            style={{
              background: '#f0f0f0',
              border: '1px solid #ccc',
              borderRadius: 4,
              padding: '4px 8px',
              cursor: 'pointer'
            }}
          >
            {jsonMode ? 'Switch to Field Mode' : 'Switch to JSON Mode'}
          </button>
        </div>
        
        {/* Conditional rendering based on edit mode */}
        {jsonMode ? (
          // JSON text editing mode
          <>
            <textarea
              style={{
                ...textareaStyle,
                border: error ? '2px solid red' : '1px solid #ccc'
              }}
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              spellCheck={false}
              rows={12}
            />
            {/* Show error message if JSON is invalid */}
            {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
          </>
        ) : (
          // Field-by-field editing mode
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSave();
            }}
          >
            {/* Generate input field for each entry in FIELD_LIST */}
            {FIELD_LIST.map(field => (
              <div style={{ marginBottom: 16 }} key={field}>
                <label style={{ fontWeight: 500, display: 'block', marginBottom: 4 }}>{field}</label>
                <input
                  style={inputStyle}
                  type="text"
                  value={formData[field] || ''}
                  onChange={e => handleFieldChange(field, e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            ))}
          </form>
        )}
        
        {/* Footer with action buttons */}
        <div style={{ textAlign: 'right', marginTop: 20 }}>
          <button
            onClick={onClose}
            style={{
              background: '#f0f0f0',
              border: '1px solid #ccc',
              borderRadius: 4,
              padding: '8px 16px',
              marginRight: 8,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '8px 16px',
              cursor: 'pointer',
              opacity: jsonMode && error ? 0.5 : 1
            }}
            disabled={jsonMode && error}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default JSONEditorModal;