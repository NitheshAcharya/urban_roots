import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Encyclopedia from './pages/Encyclopedia';
import Marketplace from './pages/Marketplace';
import Experts from './pages/Experts';
import AITools from './pages/AITools';
import Admin from './pages/Admin';
import PlantDetails from './pages/PlantDetails';
import Community from './pages/Community';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import Checkout from './pages/Checkout';
import Nurseries from './pages/Nurseries';
import YieldCalculator from './pages/YieldCalculator';
import PlantingCalendar from './pages/PlantingCalendar';
import OnboardingModal from './components/OnboardingModal';
import GamificationToasts from './components/GamificationToasts';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
          <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="encyclopedia" element={<Encyclopedia />} />
            <Route path="encyclopedia/:id" element={<PlantDetails />} />
            <Route path="market" element={<Marketplace />} />
            <Route path="experts" element={<Experts />} />
            <Route path="ai-tools" element={<AITools />} />
            <Route path="community" element={<Community />} />
            <Route path="nurseries" element={<Nurseries />} />
            <Route path="yield-calculator" element={<YieldCalculator />} />
            <Route path="planting-calendar" element={<PlantingCalendar />} />
            <Route path="profile" element={<Profile />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="admin" element={<Admin />} />
          </Route>
          </Routes>
          <OnboardingModal />
          <GamificationToasts />
        </Router>
      </CartProvider>
    </AuthProvider>
  </ThemeProvider>
  );
}

export default App;
