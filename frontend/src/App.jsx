import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { caseDefinitions } from './data/caseDefinitions';
import { KPIGrid } from './components/KPIGrid';
import { VendorMap } from './components/VendorMap';
import { CaseTable } from './components/CaseTable';
import { CaseModal } from './components/CaseModal';
import { ChatWidget } from './components/ChatWidget';

function App() {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const enriched = await Promise.all(
          caseDefinitions.map(async (definition) => {
            try {
              const [advanced, reasoning] = await Promise.all([
                fetch(definition.advancedPath)
                  .then((res) => {
                    if (!res.ok) {
                      console.warn(`Failed to load ${definition.advancedPath}: ${res.status}`);
                      return {};
                    }
                    return res.json();
                  })
                  .catch((err) => {
                    console.warn(`Error loading ${definition.advancedPath}:`, err);
                    return {};
                  }),
                fetch(definition.reasoningPath)
                  .then((res) => {
                    if (!res.ok) {
                      console.warn(`Failed to load ${definition.reasoningPath}: ${res.status}`);
                      return {};
                    }
                    return res.json();
                  })
                  .catch((err) => {
                    console.warn(`Error loading ${definition.reasoningPath}:`, err);
                    return {};
                  })
              ]);
              return {
                ...definition,
                advanced,
                reasoning
              };
            } catch (error) {
              console.error(`Error loading case ${definition.id}:`, error);
              // Return case definition even if JSON files fail to load
              return {
                ...definition,
                advanced: {},
                reasoning: {}
              };
            }
          })
        );
        setCases(enriched);
      } catch (error) {
        console.error('Failed to load case data', error);
        // Still set cases even if some fail
        setCases(caseDefinitions.map(def => ({ ...def, advanced: {}, reasoning: {} })));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = useMemo(() => computeStats(cases), [cases]);

  return (
    <div className="nips-app">
      <header className="glass-card hero">
        <div className="hero-brand">
          <span>Celanese | Neural Invoicing Processing System</span>
          <h1>Neural intelligence for every invoice touchpoint.</h1>
          <p>
            Monitor volume, fast-track ATP promises, resolve logistics holds, and sync pricing updates – all in one
            Celanese-native workspace powered by NIPS.
          </p>
        </div>
        <div className="hero-pill">
          <div>
            <strong>{stats.totalInvoices.toLocaleString()}</strong>
            <span>Invoices this month</span>
          </div>
          <div>
            <strong>{stats.atpAlerts}</strong>
            <span>ATP alerts</span>
          </div>
        </div>
      </header>

      <main className="content-wrapper">
        {loading ? (
          <div className="glass-card" style={{ padding: 32 }}>Loading Celanese telemetry…</div>
        ) : (
          <>
            <KPIGrid stats={stats} />
            <div className="grid-two">
              <VendorMap cases={cases} />
              <div className="glass-card summary-card">
                <h3>Outstanding ATP guidance</h3>
                <ul>
                  {cases && cases.length > 0 ? (
                    cases.slice(0, 4).map((caseItem) => {
                      if (!caseItem) return null;
                      return (
                        <li key={caseItem.id || Math.random()}>
                          <div>
                            <strong>{caseItem.vendor || 'N/A'}</strong>
                            <span>{caseItem.atpNotes || 'No notes available'}</span>
                          </div>
                          <span className={`status status--${statusVariant(caseItem.status)}`}>
                            {caseItem.status || 'Unknown'}
                          </span>
                        </li>
                      );
                    })
                  ) : (
                    <li>No cases available</li>
                  )}
                </ul>
              </div>
            </div>
            <CaseTable cases={cases} onOpenCase={setSelectedCase} />
          </>
        )}
      </main>

      <CaseModal selectedCase={selectedCase} onClose={() => setSelectedCase(null)} />
      <ChatWidget cases={cases} statistics={stats} currentCase={selectedCase} />
    </div>
  );
}

const computeStats = (cases) => {
  if (!cases || !Array.isArray(cases) || cases.length === 0) {
    return {
      totalInvoices: 0,
      approved: 0,
      pending: 0,
      atpAlerts: 0,
      approvedPercent: 0,
      pendingPercent: 0
    };
  }
  const total = cases.length;
  const approved = cases.filter((c) => c && c.status && c.status.toLowerCase().includes('ready')).length;
  const pending = cases.filter((c) => c && c.status && (c.status.toLowerCase().includes('pending') || c.status.toLowerCase().includes('review'))).length;
  const atpAlerts = cases.filter((c) => c && c.type === 'ATP' && c.status && !c.status.toLowerCase().includes('ready')).length;
  return {
    totalInvoices: total * 24,
    approved,
    pending,
    atpAlerts,
    approvedPercent: total > 0 ? Math.round((approved / total) * 100) : 0,
    pendingPercent: total > 0 ? Math.round((pending / total) * 100) : 0
  };
};

const statusVariant = (status = '') => {
  const value = status.toLowerCase();
  if (value.includes('pending') || value.includes('partial')) return 'pending';
  if (value.includes('hold') || value.includes('review')) return 'risk';
  return 'ok';
};

export default App;
