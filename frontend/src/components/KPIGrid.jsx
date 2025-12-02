import './KPIGrid.css';

export function KPIGrid({ stats }) {
  const cards = [
    {
      label: 'Invoices processed',
      value: stats.totalInvoices,
      subtle: 'Last 30 days',
      accent: 'var(--celanese-purple)'
    },
    {
      label: 'Approved',
      value: stats.approved,
      subtle: `${stats.approvedPercent}% of volume`,
      accent: '#5dd39e'
    },
    {
      label: 'Pending review',
      value: stats.pending,
      subtle: `${stats.pendingPercent}% of queue`,
      accent: '#ffbf69'
    },
    {
      label: 'ATP alerts',
      value: stats.atpAlerts,
      subtle: 'Needing vendor action',
      accent: '#ff6b6b'
    }
  ];

  return (
    <div className="kpi-grid glass-card">
      {cards.map((card) => (
        <div className="kpi-card" key={card.label}>
          <span className="kpi-label">{card.label}</span>
          <div className="kpi-value" style={{ color: card.accent }}>
            {(card.value != null ? card.value : 0).toLocaleString()}
          </div>
          <span className="kpi-subtle">{card.subtle}</span>
          <div className="kpi-bar">
            <span style={{ width: `${Math.min(100, card.value != null ? card.value : 0)}%`, background: card.accent }} />
          </div>
        </div>
      ))}
    </div>
  );
}

