import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useApp } from '../context/AppContext'
import { hasErrors, validateCustomer } from '../utils/validation'
import Alert from './common/Alert'
import FormField from './common/FormField'
import LoadingState from './common/LoadingState'

const emptyForm = { full_name: '', email: '', phone_number: '' }

export default function CustomerManager() {
  const { refreshToken, refresh, message, showSuccess, showError, clearMessage } = useApp()
  const [customers, setCustomers] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  async function loadCustomers() {
    setLoading(true)
    try {
      setCustomers(await api.customers.list())
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [refreshToken])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    clearMessage()
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const errors = validateCustomer(form)
    setFieldErrors(errors)
    if (hasErrors(errors)) return

    setSubmitting(true)
    try {
      await api.customers.create({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone_number: form.phone_number.trim(),
      })
      setForm(emptyForm)
      showSuccess('Customer created successfully')
      refresh()
      await loadCustomers()
    } catch (err) {
      showError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this customer?')) return

    try {
      await api.customers.delete(id)
      showSuccess('Customer deleted successfully')
      refresh()
      await loadCustomers()
    } catch (err) {
      showError(err.message)
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Customers</h2>
        <p>Store customer contact details for order processing.</p>
      </div>

      <Alert
        type={message?.type}
        message={message?.text}
        onClose={clearMessage}
      />

      <form className="card form-grid" onSubmit={handleSubmit} noValidate>
        <h3>Add Customer</h3>
        <FormField label="Full Name" name="full_name" error={fieldErrors.full_name}>
          <input name="full_name" value={form.full_name} onChange={handleChange} />
        </FormField>
        <FormField label="Email" name="email" error={fieldErrors.email}>
          <input name="email" type="email" value={form.email} onChange={handleChange} />
        </FormField>
        <FormField label="Phone Number" name="phone_number" error={fieldErrors.phone_number}>
          <input name="phone_number" value={form.phone_number} onChange={handleChange} />
        </FormField>
        <div className="form-actions">
          <button type="submit" className="btn primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Create Customer'}
          </button>
        </div>
      </form>

      <div className="card table-card">
        {loading ? (
          <LoadingState label="Loading customers..." />
        ) : customers.length === 0 ? (
          <p className="muted">No customers yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.full_name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone_number}</td>
                  <td className="actions">
                    <button
                      type="button"
                      className="btn small danger"
                      onClick={() => handleDelete(customer.id)}
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
