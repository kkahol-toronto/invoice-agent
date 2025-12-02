import { useMemo, useState, useEffect, useRef } from 'react';
import './CaseModal.css';

// ATP Pipeline Stages (6 stages)
const ATP_STAGES = [
  { id: 'start', label: 'Start', icon: '▶' },
  { id: 'advanced', label: 'Advanced Extraction', icon: '🔍' },
  { id: 'reasoning', label: 'Reasoning Extraction', icon: '🧠' },
  { id: 'combination', label: 'Combination Agent', icon: '🔗' },
  { id: 'supplyDb', label: 'Query Supply DB', icon: '💾' },
  { id: 'communication', label: 'Communication Agent', icon: '✉️' }
];

// Logistics Pipeline Stages (14 stages - includes communication)
const LOGISTICS_STAGES = [
  { id: 'stage0', label: 'File Ingestion Agent', icon: '📁' },
  { id: 'stage1', label: 'Document Classification Agent', icon: '📋' },
  { id: 'stage2', label: 'OCR + Vision Extraction Agent', icon: '👁️' },
  { id: 'stage3', label: 'Layout Reconstruction Agent', icon: '🏗️' },
  { id: 'stage4', label: 'Key-Value Extraction Agent', icon: '🔑' },
  { id: 'stage5', label: 'Line-Item Table Extraction Agent', icon: '📊' },
  { id: 'stage6', label: 'Logistics Intelligence Agent', icon: '🧠' },
  { id: 'stage7', label: 'Validation + Cross-Checking Agent', icon: '✅' },
  { id: 'stage8', label: 'Business Rules Agent', icon: '⚖️' },
  { id: 'stage9', label: 'Entity Normalization Agent', icon: '🔄' },
  { id: 'stage10', label: 'Master JSON Assembly Agent', icon: '📦' },
  { id: 'stage11', label: 'Domain Knowledge Agent', icon: '🎓' },
  { id: 'stage12', label: 'Integration Agent', icon: '🔌' },
  { id: 'communication', label: 'Communication Agent', icon: '✉️' }
];

const ATP_STAGE_MESSAGES = {
  start: 'Initializing agentic pipeline...',
  advanced: 'Running advanced OCR extraction on invoice document...',
  reasoning: 'Applying reasoning agent to extract structured data...',
  combination: 'Merging extraction results and resolving inconsistencies...',
  supplyDb: 'Querying ATP database for inventory status and promise dates...',
  communication: 'Drafting vendor communication based on ATP status...'
};

const ATP_STAGE_COMPLETION_MESSAGES = {
  start: 'Pipeline initialized. Ready to process invoice.',
  advanced: `Successfully extracted ${Math.floor(Math.random() * 15 + 20)} fields including order IDs, product details, quantities, and pricing information.`,
  reasoning: `Identified ${Math.floor(Math.random() * 5 + 8)} key entities and relationships. Validated data consistency across document sections.`,
  combination: 'Merged extraction results. Resolved 2 inconsistencies in product IDs and pricing. Final structured data ready.',
  supplyDb: 'ATP database queried. Retrieved inventory status across 3 plants. Calculated promise dates and availability windows.',
  communication: 'Email draft generated with ATP status, promise dates, and recommended actions for vendor review.'
};

const LOGISTICS_STAGE_MESSAGES = {
  stage0: 'Validating file MIME type and creating job ID...',
  stage1: 'Classifying document type (Sales Order, Purchase Order, Logistics Invoice, etc.)...',
  stage2: 'Running OCR and vision extraction on all pages...',
  stage3: 'Reconstructing document layout and structure...',
  stage4: 'Extracting key-value pairs (Customer PO, Order Date, Buyer name, etc.)...',
  stage5: 'Extracting line-item tables with product codes and quantities...',
  stage6: 'Analyzing logistics intelligence (delivery dates, delays, customs issues)...',
  stage7: 'Validating extracted data and cross-checking for accuracy...',
  stage8: 'Applying business rules and domain logic...',
  stage9: 'Normalizing entities (company names, addresses, product codes)...',
  stage10: 'Assembling master JSON from all extraction stages...',
  stage11: 'Adding domain knowledge (industry tags, hazmat flags, customs flags)...',
  stage12: 'Pushing to ECM, ERP, or DMS systems (SAP, Oracle, Dynamics 365)...',
  communication: 'Drafting communication for concerned parties based on logistics status...'
};

const LOGISTICS_STAGE_COMPLETION_MESSAGES = {
  stage0: `File validated (${['PDF', 'Image-PDF', 'Scan'][Math.floor(Math.random() * 3)]}). Job ID created. File stored in blob storage.`,
  stage1: `Document classified as ${['Logistics Invoice', 'Bill of Lading', 'Delivery Note', 'Sales Order Form'][Math.floor(Math.random() * 4)]} with 98% confidence.`,
  stage2: `OCR completed on ${Math.floor(Math.random() * 3 + 1)} pages. Extracted ${Math.floor(Math.random() * 20 + 30)} text boxes, ${Math.floor(Math.random() * 3 + 2)} tables, and mapped bounding boxes.`,
  stage3: 'Layout reconstructed. Rebuilt grids (Bill To / Ship To), line-item tables, and multi-column layouts. OCR misalignments corrected.',
  stage4: `Extracted ${Math.floor(Math.random() * 15 + 20)} key-value pairs including Customer PO, Order Date, Buyer name, Shipping method, and Payment terms. Normalized phone numbers and dates.`,
  stage5: `Extracted ${Math.floor(Math.random() * 3 + 2)} line items with product codes, quantities, and totals. Normalized product codes and captured multi-line comments.`,
  stage6: `Identified ${Math.floor(Math.random() * 2 + 1)} logistics events, ${Math.floor(Math.random() * 2 + 1)} risk flags. Tagged with keywords: ${['customs_delay', 'staggered_delivery', 'inventory_shortage'][Math.floor(Math.random() * 3)]}.`,
  stage7: 'Validation complete. Address validated, date logic verified, totals checked. All anomalies flagged and resolved.',
  stage8: `Applied business rules. Detected ${['Partial shipment', 'Customs documentation incomplete', 'B2B chemical order'][Math.floor(Math.random() * 3)]}. Status and risk levels assigned.`,
  stage9: 'Entities normalized. Company names standardized, addresses cleaned into components, product names standardized for database integration.',
  stage10: 'Master JSON assembled. All stages merged into canonical schema. Missing fields inferred. Final structured record created.',
  stage11: `Domain knowledge added. Industry classified as ${['Chemical', 'Manufacturing', 'Industrial'][Math.floor(Math.random() * 3)]}. Hazmat and customs flags applied.`,
  stage12: `Integration complete. Data pushed to ${['SAP', 'Oracle SCM', 'Dynamics 365', 'Kagen Enterprise DMS'][Math.floor(Math.random() * 4)]}. Confirmation received with row identifiers.`,
  communication: 'Email draft generated with logistics status, delivery dates, and recommended actions for concerned parties.'
};

export function CaseModal({ selectedCase, onClose }) {
  const [activeStage, setActiveStage] = useState(null);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [completionMessage, setCompletionMessage] = useState(null);
  const [showProcessed, setShowProcessed] = useState(false);
  const [completedStages, setCompletedStages] = useState(new Set());
  const [statusLogs, setStatusLogs] = useState([]);
  const [logSearch, setLogSearch] = useState('');
  const [emailDraft, setEmailDraft] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const timeoutRef = useRef(null);
  const processedTimeoutRef = useRef(null);
  const stageIndexRef = useRef(0);

  // Determine which pipeline to use based on case type
  const isLogistics = selectedCase?.type === 'Logistics';
  const STAGES = isLogistics ? LOGISTICS_STAGES : ATP_STAGES;
  const STAGE_MESSAGES = isLogistics ? LOGISTICS_STAGE_MESSAGES : ATP_STAGE_MESSAGES;
  const STAGE_COMPLETION_MESSAGES = isLogistics ? LOGISTICS_STAGE_COMPLETION_MESSAGES : ATP_STAGE_COMPLETION_MESSAGES;

  const merged = useMemo(() => {
    if (!selectedCase) return {};
    const advanced = selectedCase.advanced || {};
    const reasoning = selectedCase.reasoning || {};
    return { ...advanced, ...reasoning };
  }, [selectedCase]);

  const clearTimers = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (processedTimeoutRef.current) {
      clearTimeout(processedTimeoutRef.current);
      processedTimeoutRef.current = null;
    }
  };

  const runPipeline = () => {
    clearTimers();
    setIsRunning(true);
    setActiveStage(null);
    setCurrentMessage(null);
    setCompletionMessage(null);
    setShowProcessed(false);
    setCompletedStages(new Set());
    setStatusLogs([]);
    setEmailDraft('');
    stageIndexRef.current = 0;
    processNextStage();
  };

  const processNextStage = () => {
    // Get current stages based on case type
    const currentStages = isLogistics ? LOGISTICS_STAGES : ATP_STAGES;
    const currentMessages = isLogistics ? LOGISTICS_STAGE_MESSAGES : ATP_STAGE_MESSAGES;
    const currentCompletionMessages = isLogistics ? LOGISTICS_STAGE_COMPLETION_MESSAGES : ATP_STAGE_COMPLETION_MESSAGES;

    if (stageIndexRef.current >= currentStages.length) {
      setIsRunning(false);
      return;
    }

    const stage = currentStages[stageIndexRef.current];
    setActiveStage(stage.id);
    setCurrentMessage(currentMessages[stage.id]);
    setCompletionMessage(null);
    setShowProcessed(false);

    // Add log entry
    setStatusLogs((prev) => [
      ...prev,
      {
        timestamp: new Date().toLocaleTimeString(),
        stage: stage.label,
        message: currentMessages[stage.id],
        type: 'info'
      }
    ]);

    // Show initial message for 3-5 seconds
    const messageDuration = 3000 + Math.random() * 2000;
    timeoutRef.current = setTimeout(() => {
      // Show completion message
      const currentCompletionMessages = isLogistics ? LOGISTICS_STAGE_COMPLETION_MESSAGES : ATP_STAGE_COMPLETION_MESSAGES;
      const completionMsg = currentCompletionMessages[stage.id];
      setCurrentMessage(null);
      setCompletionMessage(completionMsg);
      
      // Add completion log
      setStatusLogs((prev) => [
        ...prev,
        {
          timestamp: new Date().toLocaleTimeString(),
          stage: stage.label,
          message: completionMsg,
          type: 'info'
        }
      ]);

      // Show completion message for 2-3 seconds
      const completionDuration = 2000 + Math.random() * 1000;
      setTimeout(() => {
        setCompletionMessage(null);
        setShowProcessed(true);

        // Mark stage as completed
        setCompletedStages((prev) => new Set([...prev, stage.id]));

        // Add processed log
        setStatusLogs((prev) => [
          ...prev,
          {
            timestamp: new Date().toLocaleTimeString(),
            stage: stage.label,
            message: 'Stage processed',
            type: 'success'
          }
        ]);

        // Show "Stage processed" for 1-2 seconds
        const processedDuration = 1000 + Math.random() * 1000;
        processedTimeoutRef.current = setTimeout(() => {
          setShowProcessed(false);

          // Special handling for integration stage (stage12) - show extracted JSON
          if (stage.id === 'stage12' && isLogistics) {
            // Mark stage as completed to show JSON
            setCompletedStages((prev) => new Set([...prev, 'stage12']));
          }

          // Special handling for communication stage
          if (stage.id === 'communication') {
            generateEmailDraft();
          }

          stageIndexRef.current++;
          processNextStage();
        }, processedDuration);
      }, completionDuration);
    }, messageDuration);
  };

  const generateEmailDraft = () => {
    if (!selectedCase) return;

    const vendor = selectedCase.vendor || 'Vendor';
    const customer = selectedCase.customer || 'Customer';
    const atpNotes = selectedCase.atpNotes || 'No notes available.';
    const status = selectedCase.status || 'Unknown';
    const caseId = selectedCase.id || 'N/A';
    const amount = selectedCase.amount != null ? `$${Number(selectedCase.amount).toLocaleString()}` : 'TBD';
    const dueDate = selectedCase.dueDate || 'TBD';

    let draft = '';
    
    if (isLogistics) {
      // Logistics email draft
      draft = `Subject: Logistics Status Update - ${caseId}

Dear ${customer} Team,

We have completed processing your logistics order ${caseId}.

Logistics Status: ${status}
Order Amount: ${amount}
Expected Delivery: ${dueDate}

${atpNotes}

The extracted data has been integrated into our systems. Please review the attached logistics document and confirm delivery details. If you have any questions about shipping, customs clearance, or delivery schedules, please contact our logistics team.

Best regards,
Enterprise Logistics Team`;
    } else {
      // ATP email draft
      draft = `Subject: ATP Status Update - ${caseId}

Dear ${vendor} Team,

We have completed our analysis of your order ${caseId} for ${customer}.

ATP Status: ${status}

${atpNotes}

Please review the attached invoice and ATP confirmation details. If you have any questions or need to discuss alternative fulfillment options, please contact our ATP team.

Best regards,
Enterprise ATP Team`;
    }

    setEmailDraft(draft);
  };

  useEffect(() => {
    if (selectedCase) {
      runPipeline();
    }
    return () => {
      clearTimers();
    };
  }, [selectedCase]);

  if (!selectedCase) return null;

  const filteredLogs = statusLogs.filter((log) =>
    log.message.toLowerCase().includes(logSearch.toLowerCase()) ||
    log.stage.toLowerCase().includes(logSearch.toLowerCase())
  );

  return (
    <div className="case-modal__overlay" onClick={onClose}>
      <div className="case-modal glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="case-modal__header">
          <div>
            <p className="eyebrow">{selectedCase.type} case</p>
            <h3>{selectedCase.label}</h3>
            <span>{selectedCase.id}</span>
          </div>
          <div className="case-modal__header-actions">
            <button onClick={runPipeline} className="btn-secondary" disabled={isRunning}>
              <span className="btn-icon">▶</span>
              <span>{isRunning ? 'Running...' : 'Re-run Pipeline'}</span>
            </button>
            <button onClick={onClose} aria-label="Close modal">
              ✕
            </button>
          </div>
        </div>

        <div className="case-modal__body">
          {/* Left: PDF Viewer */}
          <div className="case-modal__viewer">
            <iframe title="invoice-pdf" src={selectedCase.pdf} />
          </div>

          {/* Right: Agentic Pipeline & Insights */}
          <div className="case-modal__right-panel">
            {/* Agentic Pipeline Timeline */}
            <div className="agentic-pipeline">
              <h4>Agentic Pipeline</h4>
              <div className="pipeline-timeline">
                {(isLogistics ? LOGISTICS_STAGES : ATP_STAGES).map((stage, idx) => {
                  const currentStages = isLogistics ? LOGISTICS_STAGES : ATP_STAGES;
                  const isActive = activeStage === stage.id;
                  const isCompleted = currentStages.findIndex((s) => s.id === activeStage) > idx;
                  const isCurrent = isActive && (currentMessage || showProcessed);

                  return (
                    <div
                      key={stage.id}
                      className={`pipeline-stage ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''}`}
                    >
                      <div className="stage-icon">
                        {isCompleted ? '✓' : isCurrent ? stage.icon : '○'}
                      </div>
                      <div className="stage-label">{stage.label}</div>
                      {isCurrent && (
                        <div className="stage-status-message">
                          {currentMessage && <div className="status-message">{currentMessage}</div>}
                          {completionMessage && <div className="status-message completion">{completionMessage}</div>}
                          {showProcessed && <div className="status-message processed">Stage processed</div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Logs */}
            <div className="status-logs">
              <div className="status-logs-header">
                <h4>Status Logs</h4>
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="log-search"
                />
              </div>
              <div className="log-entries">
                {filteredLogs.length === 0 ? (
                  <div className="log-empty">No logs yet. Pipeline will populate logs as it runs.</div>
                ) : (
                  filteredLogs.map((log, idx) => (
                    <div key={idx} className={`log-entry log-entry--${log.type}`}>
                      <span className="log-time">{log.timestamp}</span>
                      <span className="log-stage">{log.stage}</span>
                      <span className="log-message">{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Extraction Results - Only show after stages complete */}
            <div className="extraction-results">
              {isLogistics ? (
                // Logistics: Show extracted JSON after integration stage
                completedStages.has('stage12') && merged && Object.keys(merged).length > 0 && (
                  <section>
                    <div className="section-title">Extracted Data (Master JSON)</div>
                    <pre>{JSON.stringify(merged, null, 2)}</pre>
                  </section>
                )
              ) : (
                // ATP: Show advanced, reasoning, and combination
                <>
                  {completedStages.has('advanced') && selectedCase?.advanced && (
                    <section>
                      <div className="section-title">Advanced extraction</div>
                      <pre>{JSON.stringify(selectedCase.advanced, null, 2)}</pre>
                    </section>
                  )}
                  {completedStages.has('reasoning') && selectedCase?.reasoning && (
                    <section>
                      <div className="section-title">Reasoning extraction</div>
                      <pre>{JSON.stringify(selectedCase.reasoning, null, 2)}</pre>
                    </section>
                  )}
                  {completedStages.has('combination') && merged && Object.keys(merged).length > 0 && (
                    <section>
                      <div className="section-title">Combination agent</div>
                      <pre>{JSON.stringify(merged, null, 2)}</pre>
                    </section>
                  )}
                </>
              )}
            </div>

            {/* Guidance Section */}
            <section className="atp-guidance">
              <div className="section-title">{isLogistics ? 'Logistics guidance' : 'ATP guidance'}</div>
              <div className={`atp-badge atp-badge--${badgeVariant(selectedCase?.status)}`}>
                {selectedCase?.status || 'Unknown'}
              </div>
              <p>{selectedCase?.atpNotes || 'No guidance available.'}</p>
            </section>

            {/* Communication Agent */}
            {emailDraft && (
              <section className="communication-agent">
                <div className="section-title">Communication Agent</div>
                <div className="email-draft">
                  <textarea readOnly value={emailDraft} rows={12} />
                  <button
                    className="btn-primary"
                    onClick={() => {
                      const recipient = isLogistics ? 'concerned parties' : 'vendor';
                      alert(`Email sent to ${recipient}! (This is a demo action)`);
                    }}
                  >
                    📧 {isLogistics ? 'Send to Concerned Parties' : 'Send to Vendor'}
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const badgeVariant = (status = '') => {
  const value = status.toLowerCase();
  if (value.includes('pending') || value.includes('partial')) return 'pending';
  if (value.includes('hold') || value.includes('review')) return 'risk';
  return 'ok';
};
