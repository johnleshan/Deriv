import React from 'react';
import { Briefcase, Clock, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { useDeriv } from '../context/DerivContext';

const ActiveTrades = () => {
  const { trades } = useDeriv();

  return (
    <div className="active-trades glass animate-slide-in" style={{ padding: '24px', borderRadius: 'var(--card-radius)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '-0.5px' }}>
          <Activity size={24} color="var(--accent-cyan)" /> Activity Log
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{trades.length} RECENT</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '120px' }}>
        {trades.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', padding: '40px 0', gap: '12px' }}>
            <Briefcase size={32} style={{ opacity: 0.2 }} />
            <span>No active or recent positions.</span>
          </div>
        ) : (
          trades.map(trade => (
            <div key={trade.id} className="trade-item glass" style={{ padding: '16px 20px', borderRadius: '14px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '36px', height: '36px', borderRadius: '10px', 
                    background: trade.type === 'CALL' ? 'rgba(35, 209, 139, 0.1)' : 'rgba(248, 81, 73, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {trade.type === 'CALL' ? <ArrowUpRight color="var(--success)" size={20}/> : <ArrowDownRight color="var(--danger)" size={20}/>}
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>{trade.symbol.replace('_', ' ')}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{trade.type} CONTRACT</div>
                  </div>
                </div>

                <div className="desktop-only" style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>STAKE</div>
                  <div style={{ fontWeight: '700' }}>${trade.stake}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: trade.profit >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: '800', fontSize: '1.1rem' }}>
                    {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--text-secondary)', justifyContent: 'flex-end', fontWeight: '600' }}>
                    <Clock size={10} /> {trade.time}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActiveTrades;
