export const LOW_STOCK_THRESHOLD = 5

export function formatCurrency(value) {
  return `$${Number(value).toFixed(2)}`
}

export function formatDate(value) {
  return new Date(value).toLocaleString()
}
