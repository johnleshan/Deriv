import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';

const PriceChart = ({ symbol, data = [], mode = 'line' }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const seriesRef = useRef();
  const [containerHeight, setContainerHeight] = useState(450);

  useEffect(() => {
    const updateHeight = () => {
      const height = window.innerWidth < 768 ? 300 : 450;
      setContainerHeight(height);
      if (chartRef.current) {
        chartRef.current.applyOptions({ height });
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#8b949e',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: containerHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: 'rgba(255, 255, 255, 0.05)',
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.05)',
      },
      crosshair: {
        vertLine: { color: 'var(--accent-blue)', labelBackgroundColor: 'var(--accent-blue)' },
        horzLine: { color: 'var(--accent-blue)', labelBackgroundColor: 'var(--accent-blue)' },
      }
    });

    let series;
    if (mode === 'line') {
      series = chart.addAreaSeries({
        lineColor: '#00d1ff',
        topColor: 'rgba(0, 209, 255, 0.15)',
        bottomColor: 'rgba(0, 209, 255, 0)',
        lineWidth: 2,
        priceFormat: { precision: 2, minMove: 0.01 },
      });
    } else {
      series = chart.addCandlestickSeries({
        upColor: '#23d18b',
        downColor: '#f85149',
        borderVisible: false,
        wickUpColor: '#23d18b',
        wickDownColor: '#f85149',
      });
    }

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (chartContainerRef.current && chartContainerRef.current.clientWidth > 0) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    // Initial resize to ensure correct width if rendered hidden
    setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [mode]);

  useEffect(() => {
    if (seriesRef.current && data && data.length > 0) {
      seriesRef.current.setData(data);
    }
  }, [data]);

  const currentPrice = mode === 'line' 
    ? data?.[data.length - 1]?.value 
    : data?.[data.length - 1]?.close;

  return (
    <div className="chart-wrapper glass animate-slide-in" style={{ 
      borderRadius: 'var(--card-radius)', 
      overflow: 'hidden', 
      padding: '24px', 
      position: 'relative',
      minHeight: '400px'
    }}>
      <div className="chart-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.5px' }}>{symbol}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }}></span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
              {mode === 'line' ? 'Real-time Ticks' : '1 Minute Intervals'}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="price-tag text-gradient" style={{ fontWeight: '800', fontSize: '1.75rem', letterSpacing: '-1px' }}>
            {(currentPrice || 0).toFixed(2)}
          </span>
        </div>
      </div>
      <div ref={chartContainerRef} style={{ width: '100%', minHeight: containerHeight }} />
      
      {/* Timeframe selector overlay */}
      <div className="chart-actions" style={{ position: 'absolute', bottom: '24px', right: '24px', display: 'flex', gap: '8px', zIndex: 10 }}>
        {['1m', '5m', '15m'].map(tf => (
          <button key={tf} className="glass" style={{ 
            padding: '6px 14px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', color: 'white', cursor: 'pointer', border: '1px solid var(--border-color)', transition: 'var(--transition)'
          }}
          onMouseEnter={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
          onMouseLeave={(e) => e.target.style.borderColor = 'var(--border-color)'}
          >{tf}</button>
        ))}
      </div>
    </div>
  );
};

export default PriceChart;
