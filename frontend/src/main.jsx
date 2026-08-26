import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './Context/AuthContext.jsx'
import { CartProvider } from './Context/CartContext.jsx'
import { WishlistProvider } from './Context/WishlistContext.jsx'
import { SettingsProvider } from './Context/SettingsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      {/* ✅ SettingsProvider AUTHProvider ke ANDAR hona chahiye */}
      <AuthProvider>
        <SettingsProvider>  {/* ✅ YAHAN RAKHO */}
          <CartProvider>
            <WishlistProvider>
              <App />
            </WishlistProvider>
          </CartProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)