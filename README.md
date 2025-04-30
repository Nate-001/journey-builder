# Journey Builder

Journey Builder is a React application that allows users to create and visualize customer journeys through a flow diagram interface. It enables configuration of form prefilling and data mapping between forms, making it easy to design complex customer workflows.

![Journey Builder Demo](https://img.youtube.com/vi/vOSX1l2LVpU/0.jpg)

[Watch the coding video](https://www.youtube.com/watch?v=vOSX1l2LVpU)

## Features

- Interactive flow diagram for visualizing customer journeys
- Form editor for configuring form properties
- Data mapping between forms with parent-child relationships
- JSON configuration for complex objects
- Support for prefilling child forms from parent forms
- Export functionality for saving journey configurations

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/journey-builder.git
   cd journey-builder
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Running the Application

The project consists of two parts:

#### Backend Server

The backend server runs on port 3000 by default:

```bash
cd server
npm start
```

#### Frontend Client

The React client will also attempt to run on port 3000, but will prompt you to use another port since the server is already using it:

```bash
cd client
npm start
```

When prompted, press `Y` to use an alternative port (typically 3001).

## How to Run Locally

1. Start the server:
   ```bash
   cd server
   npm start
   ```

2. In a separate terminal, start the client:
   ```bash
   cd client
   npm start
   ```

3. The application should automatically open in your default browser at `http://localhost:3001` (or another available port).

## API Endpoints

The application communicates with the following API endpoint:

- `GET /api/v1/:orgId/actions/blueprints/bp_:blueprintId/bpv_:versionId/graph` - Fetches the journey graph data

## How to Extend with New Data Sources

The application supports adding new data sources for mapping between forms. To add a new data source:

1. Open `FormEditor.js` and locate the `dataSources` array.

2. Add a new data source object with the following structure:
   ```javascript
   {
     name: 'Your Data Source Name',
     fields: [
       { name: 'field_name_1', prefill: 'Default Value' },
       { name: 'field_name_2' },
       // Add more fields as needed
     ]
   }
   ```

3. The new data source will automatically appear in the DataMappingModal when selecting fields to map.

### Example: Adding a New Data Source

```javascript
// Add to the dataSources array in FormEditor.js
{
  name: 'Customer Details',
  fields: [
    { name: 'customer_id', prefill: 'CUST-001' },
    { name: 'full_name' },
    { name: 'phone_number' },
    { name: 'preferred_contact_method' }
  ]
}
```

## Key Patterns to Pay Attention To

### 1. Parent-Child Relationship & Prefilling

The application uses a parent-child relationship model to allow form data to cascade from parent forms to child forms. When a parent form's data changes, all child forms with `isPrefilled` set to `true` will automatically inherit those changes.

Key components of this pattern:
- `findParentNode` and `findChildNodes` functions in `JourneyBuilder.js`
- The `isPrefilled` toggle in `FormEditor.js`
- The `recursivelyUpdateChildNodes` function that handles cascading updates

### 2. Data Mapping Modal

The `DataMappingModal` component provides a reusable interface for mapping fields between different data sources. It filters available sources based on the node's position in the flow graph, ensuring that users can only select mappings that make logical sense.

Key aspects:
- The `getParentNodes` function traverses the graph upward
- Sources are filtered based on parent-child relationships
- The `toggleSource` function handles selecting/deselecting mappings

### 3. Form Data Registry

The application maintains a central registry of form data configurations for all form nodes, making it easy to track and update the state of forms throughout the journey.

```javascript
const [formDataRegistry, setFormDataRegistry] = useState({});
```

This registry is updated whenever a node's data changes and is included in the exported JSON.

### 4. ReactFlow Integration

The application leverages the ReactFlow library for the interactive flow diagram. Key integration points:

- Custom node styling based on node type
- Animated edges with arrow markers
- Node click handlers for selection
- Visual feedback for updated nodes (green border) and cascaded updates (yellow border)

## Development Notes

- The application uses inline styles for simplicity but could be refactored to use a CSS-in-JS solution or styled components for better maintainability.
- Form validation is currently minimal and could be enhanced with a form validation library.
- The API endpoint is currently hardcoded and should be made configurable for different environments.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
