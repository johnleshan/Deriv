import React from 'react';
import { Briefcase, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const ActiveTrades = () => {
  // Mock data for now
  const trades = [
    { id: 1, type: 'CALL', symbol: 'R_100', stake: 10, profit: 9.5, status: 'Active', time: '1m left' },
  ];

  return (
    <div className="active-trades glass animate-fade-in" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px', gridColumn: 'span 2' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Briefcase size={20} /> Active Positions
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>1 Trade Open</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {trades.map(trade => (
          <div key={trade.id} className="trade-item glass" style={{ padding: '12px 20px', borderRadius: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', alignItems: 'center' }}>
            <span style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {trade.type === 'CALL' ? <ArrowUpRight color="var(--success)" size={16}/> : <ArrowDownRight color="var(--danger)" size={16}/>}
              {trade.type}
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>{trade.symbol}</span>
            <span style={{ fontWeight: '600' }}>${trade.stake}</span>
            <span style={{ color: 'var(--success)', fontWeight: '700' }}>+${trade.profit}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)', justifyContent: 'flex-end' }}>
              <Clock size={14} /> {trade.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveTrades;
