import React from 'react'
import { DerivProvider } from './context/DerivContext'
import TradingDashboard from './components/TradingDashboard'
import './index.css'

function App() {
  return (
    <DerivProvider>
      <TradingDashboard />
    </DerivProvider>
  )
}

export default App
