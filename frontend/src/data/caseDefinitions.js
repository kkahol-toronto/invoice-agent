export const caseDefinitions = [
  {
    id: 'ATP-45009856-10',
    label: 'ChemPlus Chicago Depot',
    type: 'ATP',
    vendor: 'ChemPlus',
    customer: 'ChemPlus – Chicago Depot',
    location: { city: 'Chicago', state: 'IL', lat: 41.8781, lon: -87.6298 },
    pdf: '/data/fwdataforcelanesedemo/ATP%201/ATP%20Sample%204.pdf',
    advancedPath: '/data/fwdataforcelanesedemo/ATP%201/ATP_SAMPLE_4.json',
    reasoningPath: '/data/fwdataforcelanesedemo/ATP%201/ATP_subsprod_sample5.json',
    atpNotes:
      'ATP failed, no stock across plants. MRP simulation scheduled for 2025-11-28; tentative promise after 2026-01-07.',
    status: 'ATP Pending',
    amount: 29200,
    dueDate: '2025-11-25'
  },
  {
    id: 'ATP-44001177-04',
    label: 'Futura Plastics Dallas',
    type: 'ATP',
    vendor: 'Futura Plastics',
    customer: 'Futura Plastics – Dallas Hub',
    location: { city: 'Dallas', state: 'TX', lat: 32.7767, lon: -96.797 },
    pdf: '/data/fwdataforcelanesedemo/ATP%201/ATP%20Sample%201.pdf',
    advancedPath: '/data/fwdataforcelanesedemo/ATP%201/ATP_Sample_1.json',
    reasoningPath: '/data/fwdataforcelanesedemo/ATP%201/ATP_subsprod_sample5_atp.json',
    atpNotes: 'Partial ATP confirmed. 45% ships 2025-12-03; balance pending vendor allocation.',
    status: 'ATP Partial',
    amount: 18750,
    dueDate: '2025-12-02'
  },
  {
    id: 'LOG-782234',
    label: 'Pacific Logistics Corridor',
    type: 'Logistics',
    vendor: 'Pacific Logistics',
    customer: 'Chemelle – Riverside',
    location: { city: 'Los Angeles', state: 'CA', lat: 34.0522, lon: -118.2437 },
    pdf: '/data/fwdataforcelanesedemo/Logistic%201/Logistics_Sample%206.pdf',
    advancedPath: '/data/manual/logistics_sample_adv.json',
    reasoningPath: '/data/manual/logistics_sample_reasoning.json',
    atpNotes: 'Container delayed at Long Beach. Recommend diverting to Oakland and notifying customer of 4-day slip.',
    status: 'Logistics Hold',
    amount: 40210,
    dueDate: '2025-11-29'
  },
  {
    id: 'PRC-118920',
    label: 'Polymer Pricing Review',
    type: 'Pricing',
    vendor: 'Chemelle Strategic Accounts',
    customer: 'Celanese Europe BV',
    location: { city: 'Frankfurt', state: 'DE', lat: 50.1109, lon: 8.6821 },
    pdf: '/data/fwdataforcelanesedemo/Pricing1/Pricing-Formula%20not%20Updated_Sample%201.pdf',
    advancedPath: '/data/manual/pricing_sample_adv.json',
    reasoningPath: '/data/manual/pricing_sample_reasoning.json',
    atpNotes: 'Formula update pending CFO approval. Recommend provisional credit note and status call with buyer.',
    status: 'Pricing Review',
    amount: 65890,
    dueDate: '2025-12-10'
  }
];

