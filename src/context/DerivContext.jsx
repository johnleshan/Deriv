import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';

const DerivContext = createContext();

// Smart App ID detection: Extract only the numbers if it's alpha-numeric
const rawAppId = import.meta.env.VITE_DERIV_APP_ID || '1089';
const APP_ID = (rawAppId.match(/\d+/) || ['1089'])[0];
const TOKEN = localStorage.getItem('deriv_token') || import.meta.env.VITE_DERIV_TOKEN;
const WS_URL = `wss://ws.derivws.com/websockets/v3?app_id=${APP_ID}`;

console.log('[Deriv Connection] Using App ID:', APP_ID);
if (rawAppId.length > APP_ID.length) {
  console.log('[Deriv Connection] Extracted numeric ID from:', rawAppId);
}
console.log('[Deriv Connection] WS URL:', WS_URL);

export const DerivProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState({ amount: 0, currency: 'USD' });
  const [prices, setPrices] = useState({});
  const [trades, setTrades] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [activeAccount, setActiveAccount] = useState(null);
  const [settings, setSettings] = useState({});
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState({ loading: false, sent: false, error: null });
  
  const socketRef = useRef(null);
  const subscriptionsRef = useRef({});

  // Fetch trades from Supabase on mount
  useEffect(() => {
    const fetchTrades = async () => {
      if (!supabase) {
        console.warn('Supabase client not initialized. Check your environment variables.');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('trades')
          .select('*')
          .order('trade_time', { ascending: false })
          .limit(20);
        
        if (error) {
          console.warn('Supabase request error (Table probably missing or permissions issue):', error.message);
          return;
        }
        
        if (data) setTrades(data);
      } catch (err) {
        console.warn('Supabase initialization or fetch failed. Continuing in offline mode.');
      }
    };

    fetchTrades();
  }, []);

  const saveTradeToCloud = async (trade) => {
    if (!supabase) return;

    try {
      await supabase.from('trades').insert([trade]);
    } catch (err) {
      console.error('Failed to save trade to cloud:', err);
    }
  };

  const recordTrade = (trade) => {
    const tradeWithId = { ...trade, id: trade.id || Date.now() };
    setTrades(prev => [tradeWithId, ...prev.slice(0, 19)]);
    saveTradeToCloud(tradeWithId);
  };

  const connect = () => {
    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      console.log('Initiating connection to Deriv WS...');
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('Connected to Deriv WebSocket');
        setIsConnected(true);
        if (TOKEN) {
          setIsAuthorizing(true);
          ws.send(JSON.stringify({ authorize: TOKEN, account_list: 1 }));
        }
        
        setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ ping: 1 }));
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (e) {
          console.error('Error parsing WS message:', e);
        }
      };

      ws.onclose = () => {
        console.log('Deriv WS connection closed');
        setIsConnected(false);
        setIsAuthorizing(false);
        setTimeout(connect, 5000);
      };

      ws.onerror = (error) => {
        console.error('Deriv WS Error:', error);
      };

      socketRef.current = ws;
    } catch (e) {
      console.error('WebSocket connection failed:', e);
    }
  };

  const handleMessage = (data) => {
    if (data.msg_type === 'tick') {
      const { symbol, quote, epoch } = data.tick;
      setPrices((prev) => ({ ...prev, [symbol]: { quote, epoch } }));
    }

    if (data.msg_type === 'candles') {
      const { candles } = data;
      setPrices((prev) => ({
        ...prev,
        history: (candles || []).map(c => ({
          time: c.epoch,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close
        }))
      }));
    }

    if (data.msg_type === 'ohlc') {
      const { ohlc } = data;
      setPrices((prev) => ({
        ...prev,
        lastOHLC: {
          time: ohlc.epoch,
          open: parseFloat(ohlc.open),
          high: parseFloat(ohlc.high),
          low: parseFloat(ohlc.low),
          close: parseFloat(ohlc.close)
        }
      }));
    }

    if (data.msg_type === 'authorize' && !data.error) {
      console.log('Authorized successfully');
      setIsAuthorizing(false);
      setActiveAccount(data.authorize);
      if (data.authorize.account_list) {
        setAccounts(data.authorize.account_list);
      }
      socketRef.current.send(JSON.stringify({ balance: 1, subscribe: 1, get_settings: 1 }));
    }

    if (data.msg_type === 'account_list' && data.account_list) {
      setAccounts(data.account_list);
    }

    if (data.msg_type === 'get_settings' && data.get_settings) {
      setSettings(data.get_settings);
    }

    if (data.msg_type === 'set_settings' && !data.error) {
      console.log('Settings updated successfully');
      socketRef.current.send(JSON.stringify({ get_settings: 1 }));
    }

    if (data.msg_type === 'verify_email') {
      setVerificationStatus({
        loading: false,
        sent: !data.error,
        error: data.error ? data.error.message : null
      });
    }

    if (data.msg_type === 'balance' && data.balance) {
      setBalance({
        amount: data.balance.balance,
        currency: data.balance.currency,
      });
    }

    if (data.msg_type === 'new_account_virtual' && !data.error) {
      console.log('Virtual account created successfully:', data.new_account_virtual);
      // Automatically switch to the new account if token is returned
      if (data.new_account_virtual.oauth_token) {
        localStorage.setItem('deriv_token', data.new_account_virtual.oauth_token);
        window.location.reload();
      }
    }

    if (data.error) {
      console.warn('Deriv API Response Error:', data.error.message);
      setIsAuthorizing(false);
    }
  };

  const subscribeToTick = (symbol) => {
    if (socketRef.current?.readyState === WebSocket.OPEN && !subscriptionsRef.current[symbol]) {
      socketRef.current.send(JSON.stringify({ ticks: symbol, subscribe: 1 }));
      subscriptionsRef.current[symbol] = true;
    }
  };

  const subscribeToCandles = (symbol, granularity = 60) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        ticks_history: symbol,
        adjust_start_time: 1,
        count: 100,
        end: 'latest',
        granularity,
        style: 'candles',
        subscribe: 1
      }));
    }
  };

  const unsubscribeToTick = (symbol) => {
    if (socketRef.current?.readyState === WebSocket.OPEN && subscriptionsRef.current[symbol]) {
      socketRef.current.send(JSON.stringify({ forget_all: 'ticks' }));
      delete subscriptionsRef.current[symbol];
    }
  };

  const executeTrade = (params) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        buy: 1,
        price: params.stake,
        parameters: {
          amount: params.stake,
          basis: 'stake',
          contract_type: params.contractType,
          currency: 'USD',
          duration: params.duration,
          duration_unit: 'm',
          symbol: params.symbol,
        }
      }));
    }
  };

  const switchToAccount = (token) => {
    localStorage.setItem('deriv_token', token);
    window.location.reload(); 
  };

  const updateSettings = (params) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ set_settings: 1, ...params }));
    }
  };

  const verifyEmail = (email, type = 'signup') => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ verify_email: email, type }));
    }
  };

  const createVirtualAccount = (params) => {
    setVerificationStatus(prev => ({ ...prev, loading: true }));
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ new_account_virtual: 1, ...params }));
    }
  };

  const clearVerificationStatus = () => {
    setVerificationStatus({ loading: false, sent: false, error: null });
  };

  const login = () => {
    window.location.href = `https://oauth.deriv.com/oauth2/authorize?app_id=${APP_ID}&l=EN&brand=deriv`;
  };

  const logout = () => {
    localStorage.removeItem('deriv_token');
    window.location.reload();
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token1 = params.get('token1');
    if (token1) {
      localStorage.setItem('deriv_token', token1);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    connect();
    return () => { if (socketRef.current) socketRef.current.close(); };
  }, []);

  return (
    <DerivContext.Provider value={{ 
      isConnected, balance, prices, subscribeToTick, 
      subscribeToCandles, executeTrade, login, logout, 
      trades, recordTrade, accounts, activeAccount, 
      settings, switchToAccount, updateSettings, 
      verifyEmail, createVirtualAccount, isAuthorizing, rawAppId,
      verificationStatus, clearVerificationStatus
    }}>
      {children}
    </DerivContext.Provider>
  );
};

export const useDeriv = () => useContext(DerivContext);
