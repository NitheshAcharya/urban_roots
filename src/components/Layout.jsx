import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import MobileBottomBar from './MobileBottomBar';
import Footer from './Footer';
import ChatBot from './ChatBot';
import CartDrawer from './CartDrawer';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout-wrapper">
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
