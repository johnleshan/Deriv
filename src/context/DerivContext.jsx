import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

const DerivContext = createContext();

const APP_ID = import.meta.env.VITE_DERIV_APP_ID || '1089';
const TOKEN = localStorage.getItem('deriv_token') || import.meta.env.VITE_DERIV_TOKEN;
const WS_URL = `wss://ws.derivws.com/websockets/v3?app_id=${APP_ID}`;

export const DerivProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState({ amount: 0, currency: 'USD' });
  const [prices, setPrices] = useState({});
  const [trades, setTrades] = useState(() => {
    const saved = localStorage.getItem('deriv_trades');
    return saved ? JSON.parse(saved) : [];
  });
  
  useEffect(() => {
    localStorage.setItem('deriv_trades', JSON.stringify(trades));
  }, [trades]);

  const socketRef = useRef(null);
  const subscriptionsRef = useRef({});

  const connect = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('Connected to Deriv WebSocket');
      setIsConnected(true);
      
      // Authorize if token is available
      if (TOKEN) {
        ws.send(JSON.stringify({ authorize: TOKEN }));
      }

      // Send ping every 30 seconds to keep connection alive
      setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ ping: 1 }));
        }
      }, 30000);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleMessage(data);
    };

    ws.onclose = () => {
      console.log('Disconnected from Deriv');
      setIsConnected(false);
      // Reconnect after 5 seconds
      setTimeout(connect, 5000);
    };

    socketRef.current = ws;
  };

  const handleMessage = (data) => {
    if (data.msg_type === 'tick') {
      const { symbol, quote, epoch } = data.tick;
      setPrices((prev) => ({
        ...prev,
        [symbol]: { quote, epoch },
      }));
    }

    if (data.msg_type === 'candles') {
      const { candles } = data;
      setPrices((prev) => ({
        ...prev,
        history: candles.map(c => ({
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

    if (data.msg_type === 'authorize') {
      console.log('Authorized successfully:', data.authorize.email);
      // Request balance after authorization
      socketRef.current.send(JSON.stringify({ balance: 1, subscribe: 1 }));
    }

    if (data.msg_type === 'balance') {
      setBalance({
        amount: data.balance.balance,
        currency: data.balance.currency,
      });
    }

    if (data.error) {
      console.error('Deriv API Error:', data.error.message);
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

  const subscribeToTick = (symbol) => {
    if (socketRef.current?.readyState === WebSocket.OPEN && !subscriptionsRef.current[symbol]) {
      console.log(`Subscribing to ${symbol}`);
      socketRef.current.send(JSON.stringify({
        ticks: symbol,
        subscribe: 1
      }));
      subscriptionsRef.current[symbol] = true;
    }
  };

  const unsubscribeToTick = (symbol) => {
    if (socketRef.current?.readyState === WebSocket.OPEN && subscriptionsRef.current[symbol]) {
      console.log(`Unsubscribing from ${symbol}`);
      socketRef.current.send(JSON.stringify({
        forget_all: 'ticks'
      }));
      delete subscriptionsRef.current[symbol];
    }
  };

  const executeTrade = (params) => {
    // Basic trade implementation placeholder
    console.log('Executing trade:', params);
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

  useEffect(() => {
    // Check URL for OAuth tokens
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token1 = params.get('token1');
    if (token1) {
      console.log('Login successful, saving tokens...');
      // In a real app, we'd store all accounts, but for now just the first one
      localStorage.setItem('deriv_token', token1);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    connect();
    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  const login = () => {
    const oauthUrl = `https://oauth.deriv.com/oauth2/authorize?app_id=${APP_ID}&l=EN&brand=deriv`;
    window.location.href = oauthUrl;
  };

  const logout = () => {
    localStorage.removeItem('deriv_token');
    window.location.reload();
  };

  return (
    <DerivContext.Provider value={{ 
      isConnected, 
      balance, 
      prices, 
      subscribeToTick, 
      subscribeToCandles,
      executeTrade,
      login,
      logout,
      trades,
      setTrades
    }}>
      {children}
    </DerivContext.Provider>
  );
};

export const useDeriv = () => useContext(DerivContext);
