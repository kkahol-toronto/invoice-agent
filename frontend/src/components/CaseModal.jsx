import { useMemo, useState, useEffect, useRef } from 'react';
import './CaseModal.css';

const STAGES = [
  { id: 'start', label: 'Start', icon: '▶' },
  { id: 'advanced', label: 'Advanced Extraction', icon: '🔍' },
  { id: 'reasoning', label: 'Reasoning Extraction', icon: '🧠' },
  { id: 'combination', label: 'Combination Agent', icon: '🔗' },
  { id: 'supplyDb', label: 'Query Supply DB', icon: '💾' },
  { id: 'communication', label: 'Communication Agent', icon: '✉️' }
];

const STAGE_MESSAGES = {
  start: 'Initializing agentic pipeline...',
  advanced: 'Running advanced OCR extraction on invoice document...',
  reasoning: 'Applying reasoning agent to extract structured data...',
  combination: 'Merging extraction results and resolving inconsistencies...',
  supplyDb: 'Querying ATP database for inventory status and promise dates...',
  communication: 'Drafting vendor communication based on ATP status...'
};

const STAGE_COMPLETION_MESSAGES = {
  start: 'Pipeline initialized. Ready to process invoice.',
  advanced: `Successfully extracted ${Math.floor(Math.random() * 15 + 20)} fields including order IDs, product details, quantities, and pricing information.`,
  reasoning: `Identified ${Math.floor(Math.random() * 5 + 8)} key entities and relationships. Validated data consistency across document sections.`,
  combination: 'Merged extraction results. Resolved 2 inconsistencies in product IDs and pricing. Final structured data ready.',
  supplyDb: 'ATP database queried. Retrieved inventory status across 3 plants. Calculated promise dates and availability windows.',
  communication: 'Email draft generated with ATP status, promise dates, and recommended actions for vendor review.'
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

  const merged = useMemo(() => {
    if (!selectedCase?.advanced || !selectedCase?.reasoning) return {};
    return { ...selectedCase.advanced, ...selectedCase.reasoning };
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
    if (stageIndexRef.current >= STAGES.length) {
      setIsRunning(false);
      return;
    }

    const stage = STAGES[stageIndexRef.current];
    setActiveStage(stage.id);
    setCurrentMessage(STAGE_MESSAGES[stage.id]);
    setCompletionMessage(null);
    setShowProcessed(false);

    // Add log entry
    setStatusLogs((prev) => [
      ...prev,
      {
        timestamp: new Date().toLocaleTimeString(),
        stage: stage.label,
        message: STAGE_MESSAGES[stage.id],
        type: 'info'
      }
    ]);

    // Show initial message for 3-5 seconds
    const messageDuration = 3000 + Math.random() * 2000;
    timeoutRef.current = setTimeout(() => {
      // Show completion message
      const completionMsg = STAGE_COMPLETION_MESSAGES[stage.id];
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
    const atpNotes = selectedCase.atpNotes || 'No ATP notes available.';
    const status = selectedCase.status || 'Unknown';

    const draft = `Subject: ATP Status Update - ${selectedCase.id}

Dear ${vendor} Team,

We have completed our analysis of your order ${selectedCase.id} for ${customer}.

ATP Status: ${status}

${atpNotes}

Please review the attached invoice and ATP confirmation details. If you have any questions or need to discuss alternative fulfillment options, please contact our ATP team at atp@celanese.com.

Best regards,
Celanese ATP Team`;

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
                {STAGES.map((stage, idx) => {
                  const isActive = activeStage === stage.id;
                  const isCompleted = STAGES.findIndex((s) => s.id === activeStage) > idx;
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
              {completedStages.has('advanced') && (
                <section>
                  <div className="section-title">Advanced extraction</div>
                  <pre>{JSON.stringify(selectedCase.advanced, null, 2)}</pre>
                </section>
              )}
              {completedStages.has('reasoning') && (
                <section>
                  <div className="section-title">Reasoning extraction</div>
                  <pre>{JSON.stringify(selectedCase.reasoning, null, 2)}</pre>
                </section>
              )}
              {completedStages.has('combination') && (
                <section>
                  <div className="section-title">Combination agent</div>
                  <pre>{JSON.stringify(merged, null, 2)}</pre>
                </section>
              )}
            </div>

            {/* ATP Guidance */}
            <section className="atp-guidance">
              <div className="section-title">ATP guidance</div>
              <div className={`atp-badge atp-badge--${badgeVariant(selectedCase.status)}`}>
                {selectedCase.status}
              </div>
              <p>{selectedCase.atpNotes}</p>
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
                      alert('Email sent to vendor! (This is a demo action)');
                    }}
                  >
                    📧 Send to Vendor
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
