import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import MobileBottomBar from './MobileBottomBar';
import Footer from './Footer';
import ChatBot from './ChatBot';
import CartDrawer from './CartDrawer';
import { isSupabaseConfigured } from '../utils/supabase';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout-wrapper">
      {!isSupabaseConfigured && (
        <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '10px 20px', textAlign: 'center', fontSize: '0.875rem', fontWeight: '500', borderBottom: '1px solid #ffeeba', position: 'sticky', top: 0, zIndex: 9999 }}>
          ⚠️ Supabase environment variables are missing. The website will not connect to the database. Please set up <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in Vercel.
        </div>
      )}
      <TopNav />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomBar />
      <ChatBot />
      <CartDrawer />
    </div>
  );
};

export default Layout;
