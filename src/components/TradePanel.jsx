import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Clock, Wallet } from 'lucide-react';
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
      time: 'Just now',
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
    <div className="trade-panel glass animate-fade-in" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Trade Controls</h3>
      
      <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <Wallet size={16} /> Stake (USD)
        </label>
        <input 
          type="number" 
          value={stake} 
          onChange={(e) => setStake(e.target.value)}
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            color: 'white',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '1rem',
            outline: 'none'
          }}
        />
      </div>

      <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <Clock size={16} /> Duration (Minutes)
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          {[1, 5, 10].map(m => (
            <button 
              key={m}
              onClick={() => setDuration(m)}
              style={{
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: duration === m ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {m}m
            </button>
          ))}
        </div>
      </div>

      <div className="actions" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
        <button 
          className="btn-rise"
          disabled={!isConnected}
          onClick={() => handleTrade('rise')}
          style={{
            background: 'var(--success)',
            color: 'var(--bg-primary)',
            border: 'none',
            padding: '16px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            fontWeight: '700',
            fontSize: '1.1rem',
            cursor: isConnected ? 'pointer' : 'not-allowed',
            opacity: isConnected ? 1 : 0.5,
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          <TrendingUp /> RISE
        </button>
        
        <button 
          className="btn-fall"
          disabled={!isConnected}
          onClick={() => handleTrade('fall')}
          style={{
            background: 'var(--danger)',
            color: 'white',
            border: 'none',
            padding: '16px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            fontWeight: '700',
            fontSize: '1.1rem',
            cursor: isConnected ? 'pointer' : 'not-allowed',
            opacity: isConnected ? 1 : 0.5,
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          <TrendingDown /> FALL
        </button>
      </div>

      {!isConnected && (
        <p style={{ color: 'var(--danger)', fontSize: '0.8rem', textAlign: 'center' }}>
          Connecting to server...
        </p>
      )}
    </div>
  );
};

export default TradePanel;
