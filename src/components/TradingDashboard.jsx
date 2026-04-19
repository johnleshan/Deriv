import React, { useEffect, useState } from 'react';
import { useDeriv } from '../context/DerivContext';
import PriceChart from './PriceChart';
import TradePanel from './TradePanel';
import ActiveTrades from './ActiveTrades';
import MarketSelector from './MarketSelector';
import { LayoutDashboard, History, Settings, TrendingUp, Activity, Menu, X, Wallet } from 'lucide-react';

const TradingDashboard = () => {
  const { balance, isConnected, prices, subscribeToTick, subscribeToCandles, unsubscribeToTick, login, logout } = useDeriv();
  const [chartData, setChartData] = useState([]);
  const [chartMode, setChartMode] = useState('candles');
  const [symbol, setSymbol] = useState({ id: 'R_100', name: 'Volatility 100 Index' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    if (chartMode === 'line') {
      unsubscribeToTick(symbol.id);
    }
    setChartData([]);
    setSymbol({ id, name });
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
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

  useEffect(() => {
    if (chartMode === 'candles' && prices.lastOHLC) {
      setChartData(prev => {
        const last = prev[prev.length - 1];
        if (last && last.time === prices.lastOHLC.time) {
          return [...prev.slice(0, -1), prices.lastOHLC];
        } else {
          return [...prev.slice(-99), prices.lastOHLC];
        }
      });
    }
  }, [prices.lastOHLC]);

  return (
    <div className="dashboard-layout" style={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99,
            display: window.innerWidth < 1024 ? 'block' : 'none'
          }}
        />
      )}

      {/* Sidebar */}
      <aside className={`glass sidebar ${isSidebarOpen ? 'open' : ''}`} style={{
        width: 'var(--sidebar-width)',
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
        zIndex: 100,
        transition: 'var(--transition)',
        position: window.innerWidth < 1024 ? 'fixed' : 'relative',
        height: '100%',
        left: window.innerWidth < 1024 && !isSidebarOpen ? '-100%' : '0'
      }}>
        <div className="sidebar-header flex-center" style={{ justifyContent: 'space-between', width: '100%' }}>
          <div className="logo flex-center" style={{ gap: '12px', fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>
            <TrendingUp size={32} /> DERIV.X
          </div>
          <button className="mobile-only glass" onClick={() => setIsSidebarOpen(false)} style={{ padding: '8px', borderRadius: '8px', border: 'none', color: 'white' }}>
            <X size={20} />
          </button>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <NavItem icon={<LayoutDashboard size={20}/>} label="Trade" active />
          <NavItem icon={<History size={20}/>} label="History" />
          <NavItem icon={<Activity size={20}/>} label="Analysis" />
          <NavItem icon={<Settings size={20}/>} label="Settings" />
        </nav>

        <div className="sidebar-footer" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <MarketSelector currentMarket={symbol.id} onSelect={handleMarketChange} />
          
          <button 
            onClick={hasToken ? logout : login}
            className="btn-primary"
            style={{
              width: '100%',
              background: hasToken ? 'rgba(248, 81, 73, 0.1)' : 'var(--accent-blue)',
              color: hasToken ? 'var(--danger)' : 'white',
              border: hasToken ? '1px solid var(--danger)' : 'none',
              padding: '14px',
            }}
          >
            {hasToken ? 'Logout' : 'Login with Deriv'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'var(--bg-primary)' }}>
        {/* Header */}
        <header className="glass" style={{ 
          height: 'var(--header-height)', 
          padding: '0 24px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          <div className="header-left flex-center" style={{ gap: '16px' }}>
            <button className="mobile-only glass" onClick={() => setIsSidebarOpen(true)} style={{ padding: '10px', borderRadius: '10px', border: 'none', color: 'white' }}>
              <Menu size={24} />
            </button>
            <div className="market-info desktop-only">
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Active Market</span>
              <div style={{ fontWeight: '700', fontSize: '1rem' }}>{symbol.name}</div>
            </div>
          </div>

          <div className="chart-toggles glass desktop-only" style={{ display: 'flex', borderRadius: '12px', padding: '4px' }}>
            <button 
              onClick={() => setChartMode('line')}
              style={{
                background: chartMode === 'line' ? 'var(--accent-blue)' : 'transparent',
                border: 'none', color: 'white', padding: '8px 20px', cursor: 'pointer', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', transition: 'var(--transition)'
              }}>Line</button>
            <button 
              onClick={() => setChartMode('candles')}
              style={{
                background: chartMode === 'candles' ? 'var(--accent-blue)' : 'transparent',
                border: 'none', color: 'white', padding: '8px 20px', cursor: 'pointer', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', transition: 'var(--transition)'
              }}>Candles</button>
          </div>
          
          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="status-badge flex-center" style={{ 
              gap: '8px', 
              fontSize: '0.75rem', 
              fontWeight: '700',
              padding: '6px 12px',
              borderRadius: '100px',
              background: isConnected ? 'rgba(35, 209, 139, 0.1)' : 'rgba(248, 81, 73, 0.1)',
              color: isConnected ? 'var(--success)' : 'var(--danger)',
              border: `1px solid ${isConnected ? 'var(--success)' : 'var(--danger)'}`
            }}>
              <div className={`status-dot ${isConnected ? 'animate-pulse' : ''}`} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
              {isConnected ? 'LIVE' : 'CONNECTING'}
            </div>
            
            <div className="balance-display flex-center glass" style={{ padding: '8px 16px', borderRadius: '12px', gap: '8px', border: '1px solid var(--accent-blue)' }}>
              <Wallet size={16} color="var(--accent-cyan)" />
              <span style={{ fontWeight: '800', letterSpacing: '0.5px' }}>
                {balance.currency} {balance.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </header>

        {/* Workspace */}
        <div className="workspace-grid" style={{ 
          padding: '24px', 
          display: 'grid', 
          gridTemplateColumns: window.innerWidth < 1200 ? '1fr' : '1fr 380px', 
          gap: '24px',
        }}>
          <div className="main-col" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <PriceChart symbol={symbol.name} data={chartData} mode={chartMode} />
            <div className="mobile-only">
              <TradePanel symbol={symbol.id} />
            </div>
            <ActiveTrades />
          </div>
          <div className="side-col desktop-only">
            <TradePanel symbol={symbol.id} />
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 1024px) {
          .sidebar {
            width: 85% !important;
            max-width: 320px !important;
          }
          .workspace-grid {
            grid-template-columns: 1fr !important;
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

const NavItem = ({ icon, label, active }) => (
  <div className={`nav-item flex-center ${active ? 'active' : ''}`} style={{
    justifyContent: 'flex-start',
    gap: '16px',
    padding: '14px 20px',
    borderRadius: '14px',
    cursor: 'pointer',
    color: active ? 'white' : 'var(--text-secondary)',
    background: active ? 'linear-gradient(90deg, var(--accent-blue), transparent)' : 'transparent',
    transition: 'var(--transition)',
    position: 'relative'
  }}>
    {active && <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '4px', background: 'var(--accent-cyan)', borderRadius: '0 4px 4px 0' }} />}
    {icon}
    <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{label}</span>
  </div>
);

export default TradingDashboard;
