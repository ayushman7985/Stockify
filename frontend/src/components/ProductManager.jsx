import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useApp } from '../context/AppContext'
import { formatCurrency } from '../utils/format'
import { hasErrors, validateProduct } from '../utils/validation'
import Alert from './common/Alert'
import FormField from './common/FormField'
import LoadingState from './common/LoadingState'

const emptyForm = { name: '', sku: '', price: '', quantity_in_stock: '' }

export default function ProductManager() {
  const { refreshToken, refresh, message, showSuccess, showError, clearMessage } = useApp()
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [fieldErrors, setFieldErrors] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  async function loadProducts() {
    setLoading(true)
    try {
      setProducts(await api.products.list())
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [refreshToken])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    clearMessage()
  }

  function startEdit(product) {
    setEditingId(product.id)
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      quantity_in_stock: String(product.quantity_in_stock),
    })
    setFieldErrors({})
    clearMessage()
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
    setFieldErrors({})
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const errors = validateProduct(form)
    setFieldErrors(errors)
    if (hasErrors(errors)) return

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: Number(form.price),
      quantity_in_stock: Number(form.quantity_in_stock),
    }

    setSubmitting(true)
    try {
      if (editingId) {
        await api.products.update(editingId, payload)
        showSuccess('Product updated successfully')
      } else {
        await api.products.create(payload)
        showSuccess('Product created successfully')
      }
      resetForm()
      refresh()
      await loadProducts()
    } catch (err) {
      showError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this product?')) return

    try {
      await api.products.delete(id)
      if (editingId === id) resetForm()
      showSuccess('Product deleted successfully')
      refresh()
      await loadProducts()
    } catch (err) {
      showError(err.message)
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Products</h2>
        <p>Manage inventory items with SKU, price, and stock levels.</p>
      </div>

      <Alert
        type={message?.type}
        message={message?.text}
        onClose={clearMessage}
      />

      <form className="card form-grid" onSubmit={handleSubmit} noValidate>
        <h3>{editingId ? 'Edit Product' : 'Add Product'}</h3>
        <FormField label="Name" name="name" error={fieldErrors.name}>
          <input name="name" value={form.name} onChange={handleChange} />
        </FormField>
        <FormField label="SKU" name="sku" error={fieldErrors.sku}>
          <input name="sku" value={form.sku} onChange={handleChange} />
        </FormField>
        <FormField label="Price" name="price" error={fieldErrors.price}>
          <input
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            value={form.price}
            onChange={handleChange}
          />
        </FormField>
        <FormField
          label="Quantity in Stock"
          name="quantity_in_stock"
          error={fieldErrors.quantity_in_stock}
        >
          <input
            name="quantity_in_stock"
            type="number"
            min="0"
            step="1"
            value={form.quantity_in_stock}
            onChange={handleChange}
          />
        </FormField>
        <div className="form-actions">
          <button type="submit" className="btn primary" disabled={submitting}>
            {submitting ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
          </button>
          {editingId && (
            <button type="button" className="btn secondary" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="card table-card">
        {loading ? (
          <LoadingState label="Loading products..." />
        ) : products.length === 0 ? (
          <p className="muted">No products yet. Add your first product above.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td>{formatCurrency(product.price)}</td>
                  <td>{product.quantity_in_stock}</td>
                  <td className="actions">
                    <button type="button" className="btn small" onClick={() => startEdit(product)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn small danger"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
