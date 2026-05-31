import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CreditCard, Tag, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponStatus, setCouponStatus] = useState(null); // 'success', 'error'
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Mock payment fields
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'URBAN10') {
      setDiscount(cartTotal * 0.1);
      setCouponStatus('success');
    } else if (coupon.toUpperCase() === 'FREESHIP') {
      setDiscount(50);
      setCouponStatus('success');
    } else {
      setDiscount(0);
      setCouponStatus('error');
    }
  };

  const handlePayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      clearCart();
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="checkout-page page-transition success-state">
        <CheckCircle2 size={64} color="var(--color-green)" />
        <h2>Payment Successful!</h2>
        <p>Thank you for your order. Your plants and supplies are on their way.</p>
        <button className="btn-primary" onClick={() => navigate('/market')}>Continue Shopping</button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page page-transition empty-state">
        <h2>Your cart is empty</h2>
        <button className="btn-primary" onClick={() => navigate('/market')}>Go to Market</button>
      </div>
    );
  }

  const finalTotal = cartTotal - discount + 50; // +50 for shipping

  return (
    <div className="checkout-page page-transition">
      <button className="back-nav-btn" onClick={() => navigate(-1)}>
        <ChevronLeft size={20} /> Back to Cart
      </button>

      <div className="checkout-container">
        <div className="checkout-left">
          <h2>Payment Details</h2>
          <form className="payment-form" onSubmit={handlePayment}>
            <div className="form-group">
              <label>Name on Card</label>
              <input type="text" required placeholder="John Doe" value={cardName} onChange={e => setCardName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Card Number</label>
              <div className="card-input-wrapper">
                <CreditCard size={18} className="card-icon" />
                <input type="text" required placeholder="XXXX XXXX XXXX XXXX" maxLength="19" value={cardNumber} onChange={e => setCardNumber(e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input type="text" required placeholder="MM/YY" maxLength="5" value={expiry} onChange={e => setExpiry(e.target.value)} />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input type="password" required placeholder="XXX" maxLength="3" value={cvv} onChange={e => setCvv(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="pay-btn" disabled={isProcessing}>
              {isProcessing ? 'Processing...' : `Pay ₹${finalTotal.toFixed(2)}`}
            </button>
          </form>
        </div>

        <div className="checkout-right">
          <h2>Order Summary</h2>
          <div className="order-items hide-scrollbar">
            {cartItems.map(item => (
              <div key={item.id} className="order-item">
                <div className="item-icon">{item.emoji}</div>
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p>Qty: {item.quantity}</p>
                </div>
                <div className="item-price">₹{item.price * item.quantity}</div>
              </div>
            ))}
          </div>

          <div className="coupon-section">
            <div className="coupon-input-group">
              <Tag size={18} />
              <input type="text" placeholder="Coupon Code (try URBAN10)" value={coupon} onChange={e => setCoupon(e.target.value)} />
              <button onClick={applyCoupon} type="button">Apply</button>
            </div>
            {couponStatus === 'success' && <p className="coupon-msg success"><CheckCircle2 size={14}/> Coupon applied!</p>}
            {couponStatus === 'error' && <p className="coupon-msg error"><AlertCircle size={14}/> Invalid coupon code</p>}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{cartTotal}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>₹50</span>
            </div>
            {discount > 0 && (
              <div className="summary-row discount">
                <span>Discount</span>
                <span>-₹{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
