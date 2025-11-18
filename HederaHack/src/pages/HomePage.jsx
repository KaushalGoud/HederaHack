import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css'

export default function HomePage() {
  const navigate = useNavigate()

  const handleBuy = () => {
    navigate('/buy');
  };

  const handleSend = () => {
    navigate('/pay');
  };

  const handleTransactions = () => {
    navigate('/transactions');
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <header className="home-header">
          <h1 className="home-title">HEDERA WALLET</h1>
          <p className="home-subtitle">Your secure and easy-to-use crypto wallet</p>
        </header>

        <div className="wallet-balance">
          <p className="balance-label">Total Balance</p>
          <p className="balance-amount">$1,234.56</p>
        </div>

        <div className="button-grid">
          <button 
            className="action-button action-button--buy" 
            onClick={handleBuy}
            aria-label="Buy Crypto"
          >
            <span className="button-icon">💸</span>
            <span className="button-label">Buy</span>
          </button>

          <button 
            className="action-button action-button--send" 
            onClick={handleSend}
            aria-label="Send Crypto"
          >
            <span className="button-icon">⬆️</span>
            <span className="button-label">Send</span>
          </button>

          <button 
            className="action-button action-button--transactions" 
            onClick={handleTransactions}
            aria-label="View Transactions"
          >
            <span className="button-icon">🔄</span>
            <span className="button-label">Transactions</span>
          </button>
        </div>

        <div className="info-section">
          <p className="info-text">
            Welcome to your Hedera Wallet. Check your balance and manage your transactions.
          </p>
        </div>
      </div>
    </div>
  )
}
