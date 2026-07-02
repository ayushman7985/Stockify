import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { formatCurrency, formatDate } from '../utils/format'
import LoadingState from './common/LoadingState'
import Modal from './common/Modal'

export default function OrderDetailsModal({ orderId, isOpen, onClose }) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen || !orderId) return undefined

    let active = true

    async function loadOrder() {
      setLoading(true)
      try {
        const data = await api.orders.get(orderId)
        if (active) {
          setOrder(data)
          setError('')
        }
      } catch (err) {
        if (active) {
          setError(err.message)
          setOrder(null)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadOrder()
    return () => {
      active = false
    }
  }, [isOpen, orderId])

  return (
    <Modal title={`Order #${orderId}`} isOpen={isOpen} onClose={onClose}>
      {loading && <LoadingState label="Loading order details..." />}
      {error && <div className="alert error">{error}</div>}
      {order && !loading && (
        <div className="order-details">
          <div className="detail-grid">
            <div>
              <p className="detail-label">Customer</p>
              <p className="detail-value">{order.customer.full_name}</p>
            </div>
            <div>
              <p className="detail-label">Email</p>
              <p className="detail-value">{order.customer.email}</p>
            </div>
            <div>
              <p className="detail-label">Phone</p>
              <p className="detail-value">{order.customer.phone_number}</p>
            </div>
            <div>
              <p className="detail-label">Order Date</p>
              <p className="detail-value">{formatDate(order.created_at)}</p>
            </div>
            <div>
              <p className="detail-label">Total Amount</p>
              <p className="detail-value highlight">{formatCurrency(order.total_amount)}</p>
            </div>
          </div>

          <h4>Line Items</h4>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.product.name}</td>
                  <td>{item.product.sku}</td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.unit_price)}</td>
                  <td>{formatCurrency(Number(item.unit_price) * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  )
}
