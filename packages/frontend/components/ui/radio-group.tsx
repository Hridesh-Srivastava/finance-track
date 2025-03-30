import * as React from "react"

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}

export function RadioGroup({ value, onValueChange, children, ...props }: RadioGroupProps) {
  return (
    <div role="radiogroup" {...props}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, {
              checked: child.props.value === value,
              onChange: () => onValueChange(child.props.value),
            })
          : child
      )}
    </div>
  )
}

interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string
}

export function RadioGroupItem({ value, ...props }: RadioGroupItemProps) {
  return (
    <label>
      <input type="radio" value={value} {...props} />
    </label>
  )
}