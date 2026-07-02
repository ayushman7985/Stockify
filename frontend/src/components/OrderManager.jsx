import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useApp } from '../context/AppContext'
import { formatCurrency, formatDate } from '../utils/format'
import { hasErrors, validateOrder } from '../utils/validation'
import Alert from './common/Alert'
import FormField from './common/FormField'
import LoadingState from './common/LoadingState'
import OrderDetailsModal from './OrderDetailsModal'

const emptyLine = { product_id: '', quantity: '1' }

export default function OrderManager() {
  const { refreshToken, refresh, message, showSuccess, showError, clearMessage } = useApp()
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState([emptyLine])
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState(null)

  async function loadData() {
    setLoading(true)
    try {
      const [orderData, customerData, productData] = await Promise.all([
        api.orders.list(),
        api.customers.list(),
        api.products.list(),
      ])
      setOrders(orderData)
      setCustomers(customerData)
      setProducts(productData)
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [refreshToken])

  function updateLine(index, field, value) {
    setItems((prev) =>
      prev.map((line, i) => (i === index ? { ...line, [field]: value } : line)),
    )
    setFieldErrors((prev) => ({
      ...prev,
      [`item_${index}_${field === 'product_id' ? 'product' : 'quantity'}`]: undefined,
      customerId: undefined,
      items: undefined,
    }))
    clearMessage()
  }

  function addLine() {
    setItems((prev) => [...prev, { ...emptyLine }])
  }

  function removeLine(index) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const errors = validateOrder({ customerId, items })
    setFieldErrors(errors)
    if (hasErrors(errors)) return

    const payload = {
      customer_id: Number(customerId),
      items: items.map((line) => ({
        product_id: Number(line.product_id),
        quantity: Number(line.quantity),
      })),
    }

    setSubmitting(true)
    try {
      await api.orders.create(payload)
      setCustomerId('')
      setItems([emptyLine])
      setFieldErrors({})
      showSuccess('Order created successfully')
      refresh()
      await loadData()
    } catch (err) {
      showError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Cancel and delete this order? Stock will be restored.')) return

    try {
      await api.orders.delete(id)
      showSuccess('Order cancelled successfully')
      refresh()
      await loadData()
    } catch (err) {
      showError(err.message)
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Orders</h2>
        <p>Create orders linked to customers and products. Stock updates automatically.</p>
      </div>

      <Alert
        type={message?.type}
        message={message?.text}
        onClose={clearMessage}
      />

      <form className="card form-grid" onSubmit={handleSubmit} noValidate>
        <h3>Create Order</h3>
        <FormField label="Customer" name="customerId" error={fieldErrors.customerId}>
          <select
            value={customerId}
            onChange={(event) => {
              setCustomerId(event.target.value)
              setFieldErrors((prev) => ({ ...prev, customerId: undefined }))
              clearMessage()
            }}
          >
            <option value="">Select customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.full_name} ({customer.email})
              </option>
            ))}
          </select>
        </FormField>

        <div className="line-items">
          <h4>Order Items</h4>
          {fieldErrors.items && <span className="field-message">{fieldErrors.items}</span>}
          {items.map((line, index) => (
            <div className="line-item" key={index}>
              <FormField
                label="Product"
                error={fieldErrors[`item_${index}_product`]}
              >
                <select
                  value={line.product_id}
                  onChange={(event) => updateLine(index, 'product_id', event.target.value)}
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} — {formatCurrency(product.price)} (stock:{' '}
                      {product.quantity_in_stock})
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField
                label="Quantity"
                error={fieldErrors[`item_${index}_quantity`]}
              >
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={line.quantity}
                  onChange={(event) => updateLine(index, 'quantity', event.target.value)}
                />
              </FormField>
              {items.length > 1 && (
                <button
                  type="button"
                  className="btn small danger"
                  onClick={() => removeLine(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn secondary" onClick={addLine}>
            Add Another Product
          </button>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn primary"
            disabled={submitting || !customers.length || !products.length}
          >
            {submitting ? 'Creating...' : 'Create Order'}
          </button>
        </div>
      </form>

      <div className="card table-card">
        {loading ? (
          <LoadingState label="Loading orders..." />
        ) : orders.length === 0 ? (
          <p className="muted">No orders yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.customer.full_name}</td>
                  <td>
                    <ul className="item-list">
                      {order.items.map((item) => (
                        <li key={item.id}>
                          {item.product.name} x{item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>{formatCurrency(order.total_amount)}</td>
                  <td>{formatDate(order.created_at)}</td>
                  <td className="actions">
                    <button
                      type="button"
                      className="btn small"
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="btn small danger"
                      onClick={() => handleDelete(order.id)}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <OrderDetailsModal
        orderId={selectedOrderId}
        isOpen={Boolean(selectedOrderId)}
        onClose={() => setSelectedOrderId(null)}
      />
    </section>
  )
}
