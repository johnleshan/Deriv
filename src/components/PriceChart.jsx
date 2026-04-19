import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';

const PriceChart = ({ symbol, data = [], mode = 'line' }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const seriesRef = useRef();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#9aa1b1',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 450,
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
    });

    let series;
    if (mode === 'line') {
      series = chart.addAreaSeries({
        lineColor: '#00d1ff',
        topColor: 'rgba(0, 209, 255, 0.2)',
        bottomColor: 'rgba(0, 209, 255, 0)',
        lineWidth: 2,
      });
    } else {
      series = chart.addCandlestickSeries({
        upColor: '#00f2ad',
        downColor: '#ff4d4d',
        borderVisible: false,
        wickUpColor: '#00f2ad',
        wickDownColor: '#ff4d4d',
      });
    }

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [mode]);

  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      seriesRef.current.setData(data);
    }
  }, [data]);

  const currentPrice = mode === 'line' 
    ? data[data.length - 1]?.value 
    : data[data.length - 1]?.close;

  return (
    <div className="chart-wrapper glass animate-fade-in" style={{ borderRadius: '12px', overflow: 'hidden', padding: '16px', position: 'relative' }}>
      <div className="chart-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>{symbol}</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{mode === 'line' ? 'Tick History' : '1m Candles'}</span>
        </div>
        <span className="price-tag" style={{ color: 'var(--accent-cyan)', fontWeight: '700', fontSize: '1.4rem' }}>
          {currentPrice?.toFixed(2) || '0.00'}
        </span>
      </div>
      <div ref={chartContainerRef} />
      
      {/* Chart Controls Overlay */}
      <div style={{ position: 'absolute', bottom: '30px', right: '30px', display: 'flex', gap: '8px', zSelf: '10' }}>
        <button className="glass" style={{ padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', color: 'white', cursor: 'pointer' }}>1m</button>
        <button className="glass" style={{ padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', color: 'white', cursor: 'pointer' }}>5m</button>
      </div>
    </div>
  );
};

export default PriceChart;
