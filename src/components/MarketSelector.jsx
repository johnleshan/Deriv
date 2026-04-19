import React from 'react';
import { Search } from 'lucide-react';

const MARKETS = [
  { id: 'R_10', name: 'Volatility 10 Index' },
  { id: 'R_25', name: 'Volatility 25 Index' },
  { id: 'R_50', name: 'Volatility 50 Index' },
  { id: 'R_75', name: 'Volatility 75 Index' },
  { id: 'R_100', name: 'Volatility 100 Index' },
  { id: '1HZ10V', name: 'Volatility 10 (1s) Index' },
  { id: '1HZ100V', name: 'Volatility 100 (1s) Index' },
];

const MarketSelector = ({ currentMarket, onSelect }) => {
  return (
    <div className="market-selector" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="search-box glass" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderRadius: '10px' }}>
        <Search size={18} color="var(--text-secondary)" />
        <input 
          type="text" 
          placeholder="Search markets..." 
          style={{ background: 'none', border: 'none', color: 'white', outline: 'none', fontSize: '0.9rem', width: '100%' }}
        />
      </div>

      <div className="market-list" style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '400px', overflowY: 'auto' }}>
        {MARKETS.map(market => (
          <div 
            key={market.id}
            onClick={() => onSelect(market.id, market.name)}
            className="market-item"
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              background: currentMarket === market.id ? 'rgba(0, 209, 255, 0.1)' : 'transparent',
              border: `1px solid ${currentMarket === market.id ? 'var(--accent-cyan)' : 'transparent'}`,
              transition: 'all 0.2s'
            }}
          >
            <div style={{ fontWeight: '600', fontSize: '0.9rem', color: currentMarket === market.id ? 'var(--accent-cyan)' : 'white' }}>{market.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Synthetic Indices</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketSelector;
