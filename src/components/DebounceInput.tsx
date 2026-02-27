import { cn } from "@/lib/utils"
import * as React from "react"// Or wherever your clsx/cn utility is

// We Omit 'onChange' from standard props because we want to send back 
// just the value (string | number), not the whole Event object.
type DebouncedInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
}

const DebouncedInput = React.forwardRef<HTMLInputElement, DebouncedInputProps>(
  ({ value: initialValue, onChange, debounce = 500, className, ...props }, ref) => {
    const [value, setValue] = React.useState(initialValue)

    // 1. Sync local state with parent prop
    // If parent clears the filter (e.g. reset button), the input should update
    React.useEffect(() => {
      setValue(initialValue)
    }, [initialValue])

    // 2. The Debounce Logic
    React.useEffect(() => {
      const timeout = setTimeout(() => {
        // Only trigger the parent's onChange if the value has actually changed
        // from what the parent passed in originally
        if (value !== initialValue) {
            onChange(value)
        }
      }, debounce)

      return () => clearTimeout(timeout)
    }, [value, debounce, onChange, initialValue])

    return (
      <input
        {...props}
        ref={ref}
        value={value}
        // Bootstrap class 'form-control' added by default, but overridable
        className={cn("form-control", className)}
        onChange={(e) => setValue(e.target.value)}
      />
    )
  }
)

DebouncedInput.displayName = "DebouncedInput"

export { DebouncedInput }