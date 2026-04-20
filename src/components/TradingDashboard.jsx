import React, { useEffect, useState } from 'react';
import { useDeriv } from '../context/DerivContext';
import PriceChart from './PriceChart';
import TradePanel from './TradePanel';
import ActiveTrades from './ActiveTrades';
import MarketSelector from './MarketSelector';
import AccountCreation from './AccountCreation';
import { 
  LayoutDashboard, History, Settings, TrendingUp, Activity, 
  Menu, X, Wallet, Info, User, Check, ChevronDown, 
  UserPlus, Globe, Phone, MapPin, Key
} from 'lucide-react';

const TradingDashboard = () => {
  const { 
    balance, isConnected, prices, subscribeToTick, 
    subscribeToCandles, unsubscribeToTick, login, logout, 
    trades, rawAppId, accounts, activeAccount, 
    settings, switchToAccount, updateSettings, isAuthorizing 
  } = useDeriv();
  
  const [symbol, setSymbol] = useState({ id: 'R_100', name: 'Volatility 100 Index' });
  const [chartMode, setChartMode] = useState('line');
  const [chartData, setChartData] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('trade'); // 'trade', 'history', 'analysis', 'settings', 'create-account'
  const [isAccountSwitcherOpen, setIsAccountSwitcherOpen] = useState(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address_line_1: '',
    address_city: '',
  });

  useEffect(() => {
    if (settings) {
      setProfileForm({
        first_name: settings.first_name || '',
        last_name: settings.last_name || '',
        phone: settings.phone || '',
        address_line_1: settings.address_line_1 || '',
        address_city: settings.address_city || '',
      });
    }
  }, [settings]);

  useEffect(() => {
    subscribeToTick(symbol.id);
    subscribeToCandles(symbol.id);
    return () => unsubscribeToTick(symbol.id);
  }, [symbol.id]);

  useEffect(() => {
    if (chartMode === 'line' && prices[symbol.id]) {
      const newPoint = {
        time: prices[symbol.id].epoch,
        value: prices[symbol.id].quote,
      };
      
      setChartData((prev) => {
        const lastPoint = prev[prev.length - 1];
        // Only add if it's a new timestamp to prevent chart errors
        if (lastPoint && lastPoint.time === newPoint.time) {
          // Update the value of the current second rather than adding a new point
          return [...prev.slice(0, -1), newPoint];
        }
        return [...prev.slice(-149), newPoint];
      });
    }
  }, [prices[symbol.id], chartMode]);

  useEffect(() => {
    if (chartMode === 'candles' && prices.history) {
      setChartData(prices.history.slice(-100));
    }
  }, [prices.history, chartMode]);

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

  const handleMarketChange = (id, name) => {
    setSymbol({ id, name });
    setChartData([]);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    updateSettings(profileForm);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'create-account':
        return <AccountCreation onCancel={() => setActiveView('trade')} />;
      case 'history':
        return (
          <div className="history-view animate-fade-in" style={{ padding: '24px' }}>
            <div className="section-header" style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Trade History</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Detailed record of your recent executions.</p>
            </div>
            <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
               <ActiveTrades fullView />
            </div>
          </div>
        );
      case 'analysis':
        return (
          <div className="analysis-view animate-fade-in" style={{ padding: '24px' }}>
            <div className="section-header" style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Market Analysis</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Technical insights for {symbol.name}.</p>
            </div>
            <div className="glass" style={{ padding: '60px 24px', borderRadius: '16px', textAlign: 'center' }}>
               <Activity size={48} color="var(--accent-cyan)" style={{ marginBottom: '16px' }} />
               <h3 style={{ marginBottom: '8px' }}>Processing Price Action...</h3>
               <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
                 We are calculating real-time indicators (SMA, RSI) for {symbol.name}. Advanced technical analysis will appear here.
               </p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="settings-view animate-fade-in" style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="section-header" style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Account Settings</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Control your profile and account configurations.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 340px', gap: '32px' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="glass" style={{ padding: '32px', borderRadius: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                      <User size={20} color="var(--accent-blue)" />
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Personal Details</h3>
                    </div>
                    
                    <form onSubmit={handleProfileUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>First Name</label>
                        <input 
                          type="text" 
                          value={profileForm.first_name} 
                          onChange={(e) => setProfileForm(prev => ({...prev, first_name: e.target.value}))}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Last Name</label>
                        <input 
                          type="text" 
                          value={profileForm.last_name} 
                          onChange={(e) => setProfileForm(prev => ({...prev, last_name: e.target.value}))}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Phone Number</label>
                        <div style={{ position: 'relative' }}>
                          <Phone size={14} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                          <input 
                            type="text" 
                            style={{ width: '100%', paddingLeft: '44px' }} 
                            value={profileForm.phone} 
                            onChange={(e) => setProfileForm(prev => ({...prev, phone: e.target.value}))}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Address</label>
                        <div style={{ position: 'relative' }}>
                          <MapPin size={14} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                          <input 
                            type="text" 
                            style={{ width: '100%', paddingLeft: '44px' }} 
                            value={profileForm.address_line_1} 
                            onChange={(e) => setProfileForm(prev => ({...prev, address_line_1: e.target.value}))}
                          />
                        </div>
                      </div>
                      <div style={{ gridColumn: 'span 2', marginTop: '12px' }}>
                        <button className="btn-primary" type="submit" style={{ width: '100%' }}>Update Profile</button>
                      </div>
                    </form>
                  </div>

                  <div className="glass" style={{ padding: '32px', borderRadius: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                      <Key size={20} color="var(--accent-cyan)" />
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>API & Security</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                       <div className="flex-center" style={{ justifyContent: 'space-between', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>App ID</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Used for WebSocket authentication</div>
                          </div>
                          <code style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '6px' }}>{rawAppId}</code>
                       </div>
                    </div>
                  </div>
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="glass" style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--accent-blue)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '16px' }}>ACCOUNT BADGE</h4>
                    <div className="flex-center" style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))', margin: '0 auto 16px' }}>
                      <User size={32} color="white" />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{activeAccount?.fullname || 'Trader'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>{activeAccount?.loginid}</div>
                      <div style={{ 
                        display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: '900',
                        background: activeAccount?.is_virtual ? 'rgba(0, 209, 255, 0.1)' : 'rgba(35, 209, 139, 0.1)',
                        color: activeAccount?.is_virtual ? 'var(--accent-cyan)' : 'var(--success)'
                      }}>
                        {activeAccount?.is_virtual ? 'VIRTUAL' : 'REAL'}
                      </div>
                    </div>
                  </div>

                  <div className="glass" style={{ padding: '24px', borderRadius: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <Info size={16} color="var(--text-secondary)" />
                      <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Status</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Connection</span>
                        <span style={{ color: 'var(--success)', fontWeight: '700' }}>Secure</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Market Data</span>
                        <span style={{ color: 'var(--success)', fontWeight: '700' }}>Active</span>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        );
      default:
        return (
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
        );
    }
  };

  return (
    <div className="dashboard-layout" style={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99,
          }}
        />
      )}

      {/* Sidebar */}
      <aside className={`glass sidebar ${isSidebarOpen ? 'open' : ''}`} style={{
        width: 'var(--sidebar-width)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: window.innerWidth < 1024 ? 'fixed' : 'relative',
        transform: window.innerWidth < 1024 && !isSidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
        left: 0
      }}>
        <div className="sidebar-header" style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="logo flex-center" style={{ gap: '12px' }}>
            <div className="logo-icon" style={{ width: '32px', height: '32px', background: 'var(--accent-blue)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} color="white" />
            </div>
            <span style={{ fontWeight: '900', fontSize: '1.25rem', letterSpacing: '-1px' }}>DERIV.X</span>
          </div>
          <button className="mobile-only glass" onClick={() => setIsSidebarOpen(false)} style={{ padding: '8px', borderRadius: '8px', border: 'none', color: 'white' }}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav" style={{ flex: 1, padding: '0 16px' }}>
          <NavItem icon={<LayoutDashboard size={20}/>} label="Trade" active={activeView === 'trade'} onClick={() => setActiveView('trade')} />
          <NavItem icon={<History size={20}/>} label="History" active={activeView === 'history'} onClick={() => setActiveView('history')} />
          <NavItem icon={<Activity size={20}/>} label="Analysis" active={activeView === 'analysis'} onClick={() => setActiveView('analysis')} />
          <NavItem icon={<Settings size={20}/>} label="Settings" active={activeView === 'settings'} onClick={() => setActiveView('settings')} />
          
          <div style={{ marginTop: '40px', padding: '0 12px' }}>
             <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Popular Markets</p>
             <MarketSelector currentMarket={symbol.id} onSelect={handleMarketChange} />
          </div>
        </nav>

        <div className="sidebar-footer" style={{ padding: '24px' }}>
          <button onClick={logout} className="glass ripple" style={{ width: '100%', padding: '12px', borderRadius: '12px', color: 'var(--danger)', fontWeight: '700', border: '1px solid rgba(248, 81, 73, 0.2)' }}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, height: '100%', overflowY: 'auto', background: 'var(--bg-primary)', position: 'relative' }}>
        {/* Header */}
        <header className="glass" style={{ 
          height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px',
          position: 'sticky', top: 0, zIndex: 50, borderTop: 'none', borderLeft: 'none', borderRight: 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="mobile-only glass" onClick={() => setIsSidebarOpen(true)} style={{ padding: '10px', borderRadius: '10px', border: 'none', color: 'white' }}>
              <Menu size={24} />
            </button>
            <div className="breadcrumb desktop-only">
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Active Market</span>
              <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{symbol.name}</div>
            </div>
          </div>

          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Account Switcher */}
            <div className="account-switcher-wrapper" style={{ position: 'relative' }}>
              <button 
                className="glass flex-center" 
                onClick={() => setIsAccountSwitcherOpen(!isAccountSwitcherOpen)}
                style={{ 
                  padding: '8px 16px', borderRadius: '12px', gap: '12px', cursor: 'pointer',
                  border: isAccountSwitcherOpen ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)'
                }}
              >
                <div style={{ 
                   width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-tertiary)', 
                   display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  <User size={14} color="var(--accent-blue)" />
                </div>
                <div style={{ textAlign: 'left' }} className="desktop-only">
                   <div style={{ fontSize: '0.75rem', fontWeight: '800', lineHeight: 1 }}>{activeAccount?.loginid || (isAuthorizing ? 'Authorizing...' : 'No Account')}</div>
                   <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                     {activeAccount ? (activeAccount.is_virtual ? 'Demo' : 'Real') : (isAuthorizing ? 'Syncing...' : 'Please Login')} Account
                   </div>
                </div>
                <ChevronDown size={14} style={{ transform: isAccountSwitcherOpen ? 'rotate(180deg)' : 'rotate(0)', transition: '0.3s' }} />
              </button>

              {isAccountSwitcherOpen && (
                <div className="glass animate-fade-in" style={{ 
                  position: 'absolute', top: '100%', right: 0, marginTop: '12px', width: '280px', 
                  borderRadius: '16px', padding: '12px', zIndex: 1000, overflow: 'hidden'
                }}>
                  <p style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-secondary)', padding: '8px 12px', textTransform: 'uppercase' }}>Select Account</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {accounts.map(acc => (
                      <div 
                        key={acc.loginid} 
                        onClick={() => {
                          if (acc.token !== localStorage.getItem('deriv_token')) switchToAccount(acc.token);
                          setIsAccountSwitcherOpen(false);
                        }}
                        className={`flex-center ripple ${acc.loginid === activeAccount?.loginid ? 'active' : ''}`}
                        style={{ 
                          padding: '12px', borderRadius: '10px', justifyContent: 'space-between', cursor: 'pointer',
                          background: acc.loginid === activeAccount?.loginid ? 'rgba(46, 91, 255, 0.1)' : 'transparent'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Globe size={14} color={acc.is_virtual ? 'var(--accent-cyan)' : 'var(--success)'} />
                          <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: '800' }}>{acc.loginid}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{acc.currency} {acc.is_virtual ? 'Demo' : 'Real'}</div>
                          </div>
                        </div>
                        {acc.loginid === activeAccount?.loginid && <Check size={14} color="var(--accent-blue)" />}
                      </div>
                    ))}
                    
                    <div className="divider" style={{ height: '1px', background: 'var(--border-color)', margin: '8px 0' }} />
                    
                    <button 
                      onClick={() => { setActiveView('create-account'); setIsAccountSwitcherOpen(false); }}
                      className="flex-center ripple" 
                      style={{ 
                        width: '100%', padding: '12px', borderRadius: '10px', gap: '12px', justifyContent: 'flex-start',
                        background: 'rgba(0, 209, 255, 0.05)', color: 'var(--accent-cyan)', fontWeight: '700', border: 'none'
                      }}
                    >
                      <UserPlus size={16} />
                      <span style={{ fontSize: '0.85rem' }}>Create Account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="balance-display flex-center glass" style={{ padding: '8px 16px', borderRadius: '12px', gap: '8px', border: '1px solid var(--accent-blue)' }}>
              <Wallet size={16} color="var(--accent-cyan)" />
              <span style={{ fontWeight: '800', letterSpacing: '0.5px' }}>
                {balance?.currency || 'USD'} {(balance?.amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </header>

        {renderContent()}
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
        
        .divider {
          border-bottom: 1px solid var(--border-color);
          margin: 16px 0;
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
        }
      `}</style>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`nav-item flex-center ripple ${active ? 'active' : ''}`} 
    style={{ 
      padding: '14px 16px', borderRadius: '12px', cursor: 'pointer', gap: '16px',
      justifyContent: 'flex-start', color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)',
      background: active ? 'rgba(0, 209, 255, 0.08)' : 'transparent',
      transition: 'var(--transition)',
      marginBottom: '4px',
      position: 'relative',
      fontWeight: active ? '700' : '500'
    }}
  >
    {icon}
    <span style={{ fontSize: '0.95rem' }}>{label}</span>
    {active && <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '4px', background: 'var(--accent-cyan)', borderRadius: '0 4px 4px 0' }} />}
  </div>
);

export default TradingDashboard;
