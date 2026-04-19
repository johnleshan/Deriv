import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

const PriceChart = ({ symbol, data = [] }) => {
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
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
    });

    const series = chart.addAreaSeries({
      lineColor: '#00d1ff',
      topColor: 'rgba(0, 209, 255, 0.2)',
      bottomColor: 'rgba(0, 209, 255, 0)',
      lineWidth: 2,
    });

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
  }, []);

  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      seriesRef.current.setData(data);
    }
  }, [data]);

  return (
    <div className="chart-wrapper glass animate-fade-in" style={{ borderRadius: '12px', overflow: 'hidden', padding: '16px' }}>
      <div className="chart-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>{symbol}</h3>
        <span className="price-tag" style={{ color: 'var(--accent-cyan)', fontWeight: '700', fontSize: '1.4rem' }}>
          {data[data.length - 1]?.value?.toFixed(2) || '0.00'}
        </span>
      </div>
      <div ref={chartContainerRef} />
    </div>
  );
};

export default PriceChart;
