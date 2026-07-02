export default function FormField({
  label,
  name,
  error,
  children,
}) {
  return (
    <label className={error ? 'field-error' : undefined}>
      {label}
      {children}
      {error && <span className="field-message">{error}</span>}
    </label>
  )
}
