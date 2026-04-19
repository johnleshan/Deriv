import React, { useEffect, useState } from 'react';
import { useDeriv } from '../context/DerivContext';
import PriceChart from './PriceChart';
import TradePanel from './TradePanel';
import ActiveTrades from './ActiveTrades';
import { LayoutDashboard, History, Settings, TrendingUp, Activity } from 'lucide-react';

const TradingDashboard = () => {
  const { balance, isConnected, prices, subscribeToTick } = useDeriv();
  const [chartData, setChartData] = useState([]);
  const SYMBOL = 'R_100';

  useEffect(() => {
    if (isConnected) {
      subscribeToTick(SYMBOL);
    }
  }, [isConnected]);

  useEffect(() => {
    if (prices[SYMBOL]) {
      const newPoint = {
        time: prices[SYMBOL].epoch,
        value: prices[SYMBOL].quote,
      };
      setChartData((prev) => [...prev.slice(-100), newPoint]);
    }
  }, [prices[SYMBOL]]);

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
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header className="glass" style={{ height: 'var(--header-height)', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="market-info">
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Market: </span>
            <span style={{ fontWeight: '600' }}>Volatility 100 Index</span>
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
          <PriceChart symbol="Volatility 100 Index" data={chartData} />
          <TradePanel symbol={SYMBOL} />
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
