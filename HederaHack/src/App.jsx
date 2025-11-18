import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TransactionStatusPage from './pages/TransactionStatusPage';
import ReceiptPage from './pages/ReceiptPage';
import BuyPage from './pages/BuyPage';
import PayPage from './pages/PayPage';
import TransactionsPage from './pages/TransactionsPage'; // Import the new page
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/buy" element={<BuyPage />} />
          <Route path="/pay" element={<PayPage />} />
          <Route
            path="/transaction-status"
            element={<TransactionStatusPage />}
          />
          <Route path="/receipt" element={<ReceiptPage />} />
          <Route path="/transactions" element={<TransactionsPage />} /> {/* New route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
