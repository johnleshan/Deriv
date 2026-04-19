import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Clock, Wallet, ChevronRight } from 'lucide-react';
import { useDeriv } from '../context/DerivContext';

const TradePanel = ({ symbol }) => {
  const { executeTrade, isConnected, recordTrade } = useDeriv();
  const [stake, setStake] = useState(10);
  const [duration, setDuration] = useState(1);

  const handleTrade = (type) => {
    const newTrade = {
      type: type === 'rise' ? 'CALL' : 'PUT',
      symbol,
      stake: parseFloat(stake),
      status: 'Open',
      trade_time: new Date().toISOString(),
      profit: 0
    };

    executeTrade({
      symbol,
      contractType: type === 'rise' ? 'CALL' : 'PUT',
      stake,
      duration,
    });

    recordTrade(newTrade);
  };

  return (
    <div className="trade-panel glass animate-slide-in" style={{ padding: '24px', borderRadius: 'var(--card-radius)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Execution</h3>
        <div style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(46, 91, 255, 0.1)', color: 'var(--accent-cyan)', fontSize: '0.75rem', fontWeight: '700' }}>
          TRADING LIVE
        </div>
      </div>
      
      <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
          <Wallet size={14} /> Stake Amount (USD)
        </label>
        <div style={{ position: 'relative' }}>
          <input 
            type="number" 
            value={stake} 
            onChange={(e) => setStake(e.target.value)}
            style={{ width: '100%', padding: '14px 16px', fontSize: '1.1rem', fontWeight: '700' }}
          />
          <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontWeight: '600' }}>USD</span>
        </div>
      </div>

      <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
          <Clock size={14} /> Duration
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {[1, 5, 15].map(m => (
            <button 
              key={m}
              onClick={() => setDuration(m)}
              style={{
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: duration === m ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '0.9rem',
                transition: 'var(--transition)'
              }}
            >
              {m}m
            </button>
          ))}
        </div>
      </div>

      <div className="actions" style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
        <button 
          className="btn-rise"
          disabled={!isConnected}
          onClick={() => handleTrade('rise')}
          style={{
            background: 'var(--success)',
            color: 'var(--bg-primary)',
            border: 'none',
            padding: '18px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            fontWeight: '800',
            fontSize: '1.1rem',
            cursor: isConnected ? 'pointer' : 'not-allowed',
            opacity: isConnected ? 1 : 0.6,
            transition: 'var(--transition)',
          }}
        >
          <TrendingUp size={24} /> <span>RISE</span> <ChevronRight size={18} style={{ marginLeft: 'auto', opacity: 0.5 }} />
        </button>
        
        <button 
          className="btn-fall"
          disabled={!isConnected}
          onClick={() => handleTrade('fall')}
          style={{
            background: 'var(--danger)',
            color: 'white',
            border: 'none',
            padding: '18px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            fontWeight: '800',
            fontSize: '1.1rem',
            cursor: isConnected ? 'pointer' : 'not-allowed',
            opacity: isConnected ? 1 : 0.6,
            transition: 'var(--transition)',
          }}
        >
          <TrendingDown size={24} /> <span>FALL</span> <ChevronRight size={18} style={{ marginLeft: 'auto', opacity: 0.5 }} />
        </button>
      </div>

      {!isConnected && (
        <div className="connecting-status animate-pulse" style={{ 
          color: 'var(--danger)', 
          fontSize: '0.8rem', 
          textAlign: 'center',
          padding: '12px',
          background: 'rgba(248, 81, 73, 0.05)',
          borderRadius: '8px',
          fontWeight: '600'
        }}>
          Establishing connection to Deriv nodes...
        </div>
      )}
    </div>
  );
};

export default TradePanel;
