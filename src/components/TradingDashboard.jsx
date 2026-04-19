import React, { useEffect, useState } from 'react';
import { useDeriv } from '../context/DerivContext';
import PriceChart from './PriceChart';
import TradePanel from './TradePanel';
import ActiveTrades from './ActiveTrades';
import MarketSelector from './MarketSelector';
import { LayoutDashboard, History, Settings, TrendingUp, Activity } from 'lucide-react';

const TradingDashboard = () => {
  const { balance, isConnected, prices, subscribeToTick, subscribeToCandles, unsubscribeToTick, login, logout } = useDeriv();
  const [chartData, setChartData] = useState([]);
  const [chartMode, setChartMode] = useState('candles'); // Default to candles for pro feel
  const [symbol, setSymbol] = useState({ id: 'R_100', name: 'Volatility 100 Index' });

  const hasToken = !!localStorage.getItem('deriv_token');

  useEffect(() => {
    if (isConnected) {
      if (chartMode === 'line') {
        subscribeToTick(symbol.id);
      } else {
        subscribeToCandles(symbol.id, 60);
      }
    }
  }, [isConnected, chartMode, symbol.id]);

  const handleMarketChange = (id, name) => {
    // Unsubscribe from current market if in line mode
    if (chartMode === 'line') {
      unsubscribeToTick(symbol.id);
    }
    setChartData([]); // Clear old data
    setSymbol({ id, name });
  };

  useEffect(() => {
    if (chartMode === 'line' && prices[symbol.id]) {
      const newPoint = {
        time: prices[symbol.id].epoch,
        value: prices[symbol.id].quote,
      };
      setChartData((prev) => [...prev.slice(-100), newPoint]);
    } else if (chartMode === 'candles' && prices.history) {
      setChartData(prices.history);
    }
  }, [prices[symbol.id], prices.history, chartMode]);

  // Handle live candle updates
  useEffect(() => {
    if (chartMode === 'candles' && prices.lastOHLC) {
      setChartData(prev => {
        const last = prev[prev.length - 1];
        if (last && last.time === prices.lastOHLC.time) {
          // Update current candle
          return [...prev.slice(0, -1), prices.lastOHLC];
        } else {
          // New candle
          return [...prev.slice(-99), prices.lastOHLC];
        }
      });
    }
  }, [prices.lastOHLC]);

  return (
    <div className="dashboard-container" style={{ display: 'flex', width: '100%', height: '100%' }}>
      {/* Sidebar */}
      <aside className="glass" style={{ width: 'var(--sidebar-width)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div className="logo flex-center" style={{ gap: '12px', fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>
          <TrendingUp size={32} /> DERIV.X
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <NavItem icon={<LayoutDashboard size={20}/>} label="Trade" active />
          <NavItem icon={<History size={20}/>} label="History" />
          <NavItem icon={<Activity size={20}/>} label="Analysis" />
          <NavItem icon={<Settings size={20}/>} label="Settings" />
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={hasToken ? logout : login}
            className="glass"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              background: hasToken ? 'rgba(255, 77, 77, 0.1)' : 'var(--accent-blue)',
              color: 'white',
              border: hasToken ? '1px solid var(--danger)' : 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}
          >
            {hasToken ? 'Logout' : 'Login with Deriv'}
          </button>
        </div>

        <div className="divider" style={{ height: '1px', background: 'var(--border-color)', margin: '16px 0' }}></div>
        
        <MarketSelector currentMarket={symbol.id} onSelect={handleMarketChange} />
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header className="glass" style={{ height: 'var(--header-height)', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="market-info">
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Market: </span>
            <span style={{ fontWeight: '600' }}>{symbol.name}</span>
          </div>

          <div className="chart-toggles glass" style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden' }}>
            <button 
              onClick={() => setChartMode('line')}
              style={{
                background: chartMode === 'line' ? 'var(--accent-blue)' : 'transparent',
                border: 'none', color: 'white', padding: '6px 16px', cursor: 'pointer', fontSize: '0.8rem'
              }}>Line</button>
            <button 
              onClick={() => setChartMode('candles')}
              style={{
                background: chartMode === 'candles' ? 'var(--accent-blue)' : 'transparent',
                border: 'none', color: 'white', padding: '6px 16px', cursor: 'pointer', fontSize: '0.8rem'
              }}>Candles</button>
          </div>
          
          <div className="account-info" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div className="status flex-center" style={{ gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isConnected ? 'var(--success)' : 'var(--danger)' }}></div>
              {isConnected ? 'LIVE' : 'CONNECTING'}
            </div>
            <div className="balance glass" style={{ padding: '8px 20px', borderRadius: '100px', fontWeight: '700', border: '1px solid var(--accent-blue)' }}>
              {balance.currency} {balance.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </header>

        {/* Workspace */}
        <div style={{ flex: 1, padding: '32px', display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px', overflow: 'hidden' }}>
          <PriceChart symbol={symbol.name} data={chartData} mode={chartMode} />
          <TradePanel symbol={symbol.id} />
          <ActiveTrades />
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active }) => (
  <div className={`nav-item flex-center ${active ? 'active' : ''}`} style={{
    justifyContent: 'flex-start',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '10px',
    cursor: 'pointer',
    color: active ? 'white' : 'var(--text-secondary)',
    background: active ? 'linear-gradient(90deg, var(--accent-blue), transparent)' : 'transparent',
    transition: 'all 0.2s'
  }}>
    {icon}
    <span style={{ fontWeight: '500' }}>{label}</span>
  </div>
);

export default TradingDashboard;
