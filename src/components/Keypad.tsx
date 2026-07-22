interface Props {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  allowDecimal?: boolean
  disabled?: boolean
}

/**
 * On-screen number pad. Deliberately used instead of the iOS keyboard: it keeps
 * the question visible, gives big tap targets, and stops autocorrect getting
 * involved in a maths answer.
 */
export function Keypad({ value, onChange, onSubmit, allowDecimal = true, disabled }: Props) {
  const press = (k: string) => {
    if (disabled) return
    if (k === 'del') return onChange(value.slice(0, -1))
    if (k === '.' && (value.includes('.') || !allowDecimal)) return
    if (k === '.' && value === '') return onChange('0.')
    onChange(value + k)
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', allowDecimal ? '.' : '', '0', 'del']

  return (
    <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto w-full">
      {keys.map((k, i) =>
        k === '' ? (
          <div key={i} />
        ) : (
          <button
            key={i}
            onClick={() => press(k)}
            disabled={disabled}
            className="btn bg-slate-700 text-2xl font-bold py-4 hover:bg-slate-600 disabled:opacity-40"
            aria-label={k === 'del' ? 'Delete' : k}
          >
            {k === 'del' ? '⌫' : k}
          </button>
        )
      )}
      <button
        onClick={onSubmit}
        disabled={disabled || value === ''}
        className="btn-primary col-span-3 text-lg py-4 mt-1"
      >
        Check my answer
      </button>
    </div>
  )
}
