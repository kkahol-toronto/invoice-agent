# Celanese Neural Invoicing Processing System (NIPS)

A modern, AI-powered invoice processing portal for Celanese that provides real-time visibility into invoice processing, ATP (Available-to-Promise) status, logistics, and pricing workflows.

## Overview

NIPS is a comprehensive invoice management system that enables Celanese teams to:

- **Monitor Invoice KPIs**: Track processed, approved, pending invoices, and ATP alerts
- **Visualize Vendor Distribution**: Interactive map showing vendor locations and ATP posture
- **Search & Manage Cases**: Filterable table for ATP, Logistics, and Pricing cases
- **Agentic Processing Pipeline**: Automated extraction, reasoning, and combination agents for invoice processing
- **AI-Powered Chat**: Intelligent copilot for answering questions about invoices, ATP status, and logistics

## Features

### 📊 Dashboard
- Real-time KPI metrics (invoices processed, approved, pending, ATP alerts)
- Vendor & ATP heatmap with interactive markers
- Searchable case table with filtering capabilities
- Celanese-branded UI with modern design

### 🤖 Agentic Workspace
When opening a case, the system runs an automated pipeline:

1. **Start** - Initializes the processing pipeline
2. **Advanced Extraction** - OCR-based extraction of invoice data
3. **Reasoning Extraction** - AI-powered reasoning to extract structured data
4. **Combination Agent** - Merges extraction results and resolves inconsistencies
5. **Query Supply DB** - Retrieves ATP status from inventory database
6. **Communication Agent** - Drafts vendor communications based on ATP status

Each stage displays intelligent status messages and logs all activities in a searchable log panel.

### 💬 AI Copilot
- Context-aware chat assistant powered by Azure OpenAI
- Answers questions about:
  - Invoice statistics and trends
  - ATP status and promise dates
  - Logistics holds and shipping delays
  - Pricing reviews and formula updates
- Supports both dashboard-level and case-specific queries
- Renders markdown responses with tables, lists, and formatted text

## Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **react-simple-maps** - Interactive map visualization
- **react-markdown** - Markdown rendering for chat responses
- **CSS3** - Custom styling with Celanese brand colors

### Backend
- **FastAPI** - Python web framework
- **Azure OpenAI** - GPT-4 for intelligent chat responses
- **CORS-enabled** - Supports multiple frontend origins

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Backend API running at `https://insurance-intake-agent.azurewebsites.net` (or configure your own)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kkahol-toronto/invoice-agent.git
   cd invoice-agent
   ```

2. **Navigate to frontend**
   ```bash
   cd frontend
   ```

3. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```
   Note: `--legacy-peer-deps` is required due to React 19 compatibility with some dependencies.

4. **Configure environment variables**
   Create a `.env.local` file in the `frontend/` directory:
   ```bash
   VITE_BACKEND_URL=https://insurance-intake-agent.azurewebsites.net
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173` (or the next available port).

### Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory, ready for deployment to any static hosting service (Azure Static Web Apps, Vercel, Netlify, etc.).

## Project Structure

```
invoice_agent/
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── CaseModal.jsx      # Agentic workspace modal
│   │   │   ├── CaseTable.jsx      # Searchable case table
│   │   │   ├── ChatWidget.jsx     # AI copilot chat
│   │   │   ├── KPIGrid.jsx        # KPI metrics cards
│   │   │   └── VendorMap.jsx      # Interactive vendor map
│   │   ├── data/
│   │   │   └── caseDefinitions.js # Case data definitions
│   │   ├── App.jsx          # Main application component
│   │   └── main.jsx         # Application entry point
│   ├── public/
│   │   └── data/           # Static case data (PDFs, JSON)
│   ├── package.json
│   └── vite.config.js
├── fwdataforcelanesedemo/  # Sample data files
└── README.md
```

## Key Components

### CaseModal
The agentic workspace that displays:
- PDF viewer for invoice documents
- Animated processing pipeline with stage-by-stage progress
- Extraction results (Advanced, Reasoning, Combination)
- ATP guidance with status badges
- Communication agent with email draft functionality
- Searchable status logs

### VendorMap
Interactive map showing:
- Vendor locations across the United States
- Color-coded ATP status (Ready, Pending, At Risk)
- Hover tooltips with case details
- Legend for status interpretation

### ChatWidget
AI-powered copilot that:
- Provides context-aware responses
- Supports markdown formatting (tables, lists, code)
- Maintains conversation history
- Adapts to dashboard or case-specific context

## Backend Integration

The frontend communicates with the backend API at `/api/chat` endpoint:

**Request Format:**
```json
{
  "message": "What is the ATP status for ChemPlus?",
  "chat_history": [...],
  "context_type": "dashboard" | "case",
  "claims_data": {
    "statistics": {...},
    "recentCases": [...],
    "currentCase": {...}
  },
  "client": "nips"
}
```

**Response Format:**
```json
{
  "success": true,
  "response": "Markdown-formatted response text"
}
```

## Deployment

### Azure Static Web Apps

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Deploy using Azure Static Web Apps CLI:
   ```bash
   npm install -g @azure/static-web-apps-cli
   swa deploy ./dist --deployment-token <your-token>
   ```

   Or use GitHub Actions for automatic deployments.

### Environment Configuration

Ensure the backend URL is configured:
- Development: Set in `.env.local`
- Production: Set in Azure Static Web Apps environment variables as `VITE_BACKEND_URL`

## Data Structure

### Case Definition
```javascript
{
  id: "ATP-45009856-10",
  label: "ChemPlus Chicago Depot",
  type: "ATP" | "Logistics" | "Pricing",
  vendor: "ChemPlus",
  customer: "ChemPlus – Chicago Depot",
  location: { city: "Chicago", state: "IL", lat: 41.8781, lon: -87.6298 },
  pdf: "/data/.../invoice.pdf",
  advancedPath: "/data/.../advanced.json",
  reasoningPath: "/data/.../reasoning.json",
  atpNotes: "ATP failed, no stock across plants...",
  status: "ATP Pending" | "ATP Partial" | "Ready" | "At Risk",
  amount: 29200,
  dueDate: "2025-11-25"
}
```

## Color Scheme

The application uses Celanese brand colors:
- **Primary Purple**: `#6b3ce9`
- **Orange Accent**: `#ff8c42`
- **Navy**: `#0b1437`
- **Status Colors**:
  - Ready: `#5dd39e` (green)
  - Pending: `#ffbf69` (orange)
  - At Risk: `#ff6b6b` (red)

## Contributing

This is an internal Celanese project. For contributions, please follow the existing code style and submit pull requests for review.

## License

Proprietary - Celanese Corporation. All rights reserved.

## Support

For issues or questions, please contact the development team or create an issue in this repository.

---

**Built with ❤️ for Celanese**

