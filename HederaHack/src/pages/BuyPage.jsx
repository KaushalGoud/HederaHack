import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BuyPage.css';

const BuyPage = () => {
  const [formData, setFormData] = useState({
    cryptoAmount: '',
    fiatAmount: '',
    paymentMethod: 'Credit Card',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/transaction-status', { state: { action: 'buy', ...formData } });
  };

  return (
    <div className="buy-page">
      <div className="form-container">
        <h2 className="form-title">Buy Crypto</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="cryptoAmount">Amount (HBAR)</label>
            <input
              type="number"
              id="cryptoAmount"
              name="cryptoAmount"
              value={formData.cryptoAmount}
              onChange={handleChange}
              placeholder="0.00"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="fiatAmount">Amount (USD)</label>
            <input
              type="number"
              id="fiatAmount"
              name="fiatAmount"
              value={formData.fiatAmount}
              onChange={handleChange}
              placeholder="0.00"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="paymentMethod">Payment Method</label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
            >
              <option>Credit Card</option>
              <option>Bank Transfer</option>
              <option>Apple Pay</option>
            </select>
          </div>
          <button type="submit" className="submit-btn">
            Buy Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default BuyPage;
