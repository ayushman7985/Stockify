const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateProduct(form) {
  const errors = {}

  if (!form.name?.trim()) {
    errors.name = 'Product name is required'
  }

  if (!form.sku?.trim()) {
    errors.sku = 'SKU is required'
  }

  const price = Number(form.price)
  if (form.price === '' || Number.isNaN(price) || price <= 0) {
    errors.price = 'Price must be greater than 0'
  }

  const quantity = Number(form.quantity_in_stock)
  if (form.quantity_in_stock === '' || Number.isNaN(quantity) || quantity < 0) {
    errors.quantity_in_stock = 'Quantity cannot be negative'
  }

  return errors
}

export function validateCustomer(form) {
  const errors = {}

  if (!form.full_name?.trim()) {
    errors.full_name = 'Full name is required'
  }

  if (!form.email?.trim()) {
    errors.email = 'Email is required'
  } else if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = 'Enter a valid email address'
  }

  if (!form.phone_number?.trim()) {
    errors.phone_number = 'Phone number is required'
  }

  return errors
}

export function validateOrder(form) {
  const errors = {}

  if (!form.customerId) {
    errors.customerId = 'Select a customer'
  }

  if (!form.items.length) {
    errors.items = 'Add at least one product'
  }

  const productIds = new Set()
  form.items.forEach((item, index) => {
    if (!item.product_id) {
      errors[`item_${index}_product`] = 'Select a product'
    } else if (productIds.has(item.product_id)) {
      errors[`item_${index}_product`] = 'Duplicate product in order'
    } else {
      productIds.add(item.product_id)
    }

    const quantity = Number(item.quantity)
    if (!item.quantity || Number.isNaN(quantity) || quantity <= 0) {
      errors[`item_${index}_quantity`] = 'Quantity must be at least 1'
    }
  })

  return errors
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0
}
