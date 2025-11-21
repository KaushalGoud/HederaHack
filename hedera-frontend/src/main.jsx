import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import VIPReceipt from './VIPReceipt.jsx'
import BetaReceipt from './BetaReceipt.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/vip-receipt/:serial" element={<VIPReceipt />} />
        <Route path="/beta-receipt/:serial" element={<BetaReceipt />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)