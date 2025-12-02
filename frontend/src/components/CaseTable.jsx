import { useMemo, useState } from 'react';
import './CaseTable.css';

export function CaseTable({ cases, onOpenCase }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  const filtered = useMemo(() => {
    return cases.filter((caseItem) => {
      const matchesType = filter === 'ALL' || caseItem.type === filter;
      const haystack = `${caseItem.id} ${caseItem.vendor} ${caseItem.customer}`.toLowerCase();
      return matchesType && haystack.includes(search.toLowerCase());
    });
  }, [cases, search, filter]);

  return (
    <div className="case-table glass-card">
      <div className="case-table__controls">
        <div>
          <h3>Case queue</h3>
          <p>{filtered.length} results</p>
        </div>
        <div className="controls">
          <input
            type="search"
            placeholder="Search PO, vendor, customer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="ALL">All types</option>
            <option value="ATP">ATP</option>
            <option value="Logistics">Logistics</option>
            <option value="Pricing">Pricing</option>
          </select>
        </div>
      </div>

      <div className="case-table__table">
        <table>
          <thead>
            <tr>
              <th>Case</th>
              <th>Vendor</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Due</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((caseItem) => (
              <tr key={caseItem.id} onClick={() => onOpenCase(caseItem)}>
                <td>
                  <strong>{caseItem.id}</strong>
                  <span>{caseItem.label}</span>
                </td>
                <td>{caseItem.vendor}</td>
                <td>{caseItem.customer}</td>
                <td>
                  <span className={`pill pill--${caseItem.type.toLowerCase()}`}>{caseItem.type}</span>
                </td>
                <td>
                  <span className={`status status--${statusVariant(caseItem.status)}`}>{caseItem.status}</span>
                </td>
                <td>${caseItem.amount.toLocaleString()}</td>
                <td>{caseItem.dueDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const statusVariant = (status = '') => {
  const value = status.toLowerCase();
  if (value.includes('pending') || value.includes('partial')) return 'pending';
  if (value.includes('hold') || value.includes('review')) return 'risk';
  return 'ok';
};

