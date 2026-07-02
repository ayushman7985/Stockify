import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useApp } from '../context/AppContext'
import { formatCurrency, formatDate, LOW_STOCK_THRESHOLD } from '../utils/format'
import LoadingState from './common/LoadingState'
import StatCard from './common/StatCard'

export default function Dashboard() {
  const { refreshToken } = useApp()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    products: [],
    customers: [],
    orders: [],
  })

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      setLoading(true)
      try {
        const [products, customers, orders] = await Promise.all([
          api.products.list(),
          api.customers.list(),
          api.orders.list(),
        ])

        if (active) {
          setStats({ products, customers, orders })
          setError('')
        }
      } catch (err) {
        if (active) {
          setError(err.message)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadDashboard()
    return () => {
      active = false
    }
  }, [refreshToken])

  const lowStockProducts = stats.products.filter(
    (product) => product.quantity_in_stock <= LOW_STOCK_THRESHOLD,
  )

  if (loading) {
    return <LoadingState label="Loading dashboard..." />
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Dashboard</h2>
        <p>Overview of inventory, customers, and recent order activity.</p>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="stats-grid">
        <StatCard label="Total Products" value={stats.products.length} />
        <StatCard label="Total Customers" value={stats.customers.length} />
        <StatCard label="Total Orders" value={stats.orders.length} />
        <StatCard
          label="Low Stock Products"
          value={lowStockProducts.length}
          hint={`Threshold: ${LOW_STOCK_THRESHOLD} units or less`}
          tone={lowStockProducts.length > 0 ? 'warning' : 'default'}
        />
      </div>

      <div className="card">
        <h3>Low Stock Alerts</h3>
        {lowStockProducts.length === 0 ? (
          <p className="muted">All products are above the low stock threshold.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Stock</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td>
                    <span className="badge warning">{product.quantity_in_stock}</span>
                  </td>
                  <td>{formatCurrency(product.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
