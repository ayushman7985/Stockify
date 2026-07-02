import { useState } from 'react'
import { AppProvider } from './context/AppContext'
import CustomerManager from './components/CustomerManager'
import Dashboard from './components/Dashboard'
import OrderManager from './components/OrderManager'
import ProductManager from './components/ProductManager'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'products', label: 'Products' },
  { id: 'customers', label: 'Customers' },
  { id: 'orders', label: 'Orders' },
]

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <p className="eyebrow">Stockify</p>
          <h1>Inventory & Order Management</h1>
          <p className="subtitle">
            Manage products, customers, and orders with a persistent PostgreSQL database.
          </p>
        </div>
        <a className="docs-link" href={`${API_URL}/docs`} target="_blank" rel="noreferrer">
          API Docs
        </a>
      </header>

      <nav className="tabs" aria-label="Main navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? 'tab active' : 'tab'}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'products' && <ProductManager />}
        {activeTab === 'customers' && <CustomerManager />}
        {activeTab === 'orders' && <OrderManager />}
      </main>
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
