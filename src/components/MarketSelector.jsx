import React, { useState } from 'react';
import { Search, ChevronRight, BarChart2 } from 'lucide-react';

const MARKETS = [
  { id: 'R_10', name: 'Volatility 10 Index', desc: 'Continuous Synthetic' },
  { id: 'R_25', name: 'Volatility 25 Index', desc: 'Continuous Synthetic' },
  { id: 'R_50', name: 'Volatility 50 Index', desc: 'Continuous Synthetic' },
  { id: 'R_75', name: 'Volatility 75 Index', desc: 'Continuous Synthetic' },
  { id: 'R_100', name: 'Volatility 100 Index', desc: 'Continuous Synthetic' },
  { id: '1HZ10V', name: 'Volatility 10 (1s) Index', desc: 'High Frequency' },
  { id: '1HZ100V', name: 'Volatility 100 (1s) Index', desc: 'High Frequency' },
];

const MarketSelector = ({ currentMarket, onSelect }) => {
  const [search, setSearch] = useState('');

  const filteredMarkets = MARKETS.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="market-selector" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="search-box glass" style={{ 
        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px',
        border: '1px solid var(--border-color)', transition: 'var(--transition)'
      }}>
        <Search size={18} color="var(--text-secondary)" />
        <input 
          type="text" 
          placeholder="Search markets..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ background: 'none', border: 'none', color: 'white', outline: 'none', fontSize: '0.9rem', width: '100%', padding: '0' }}
        />
      </div>

      <div className="market-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
        {filteredMarkets.map(market => (
          <div 
            key={market.id}
            onClick={() => onSelect(market.id, market.name)}
            className={`market-item glass ${currentMarket === market.id ? 'active' : ''}`}
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              cursor: 'pointer',
              background: currentMarket === market.id ? 'rgba(0, 209, 255, 0.08)' : 'transparent',
              border: `1px solid ${currentMarket === market.id ? 'var(--accent-cyan)' : 'transparent'}`,
              transition: 'var(--transition)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-tertiary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentMarket === market.id ? 'var(--accent-cyan)' : 'var(--text-secondary)'
            }}>
              <BarChart2 size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '700', fontSize: '0.85rem', color: currentMarket === market.id ? 'var(--accent-cyan)' : 'white' }}>{market.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{market.desc}</div>
            </div>
            {currentMarket === market.id && <ChevronRight size={14} color="var(--accent-cyan)" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketSelector;
