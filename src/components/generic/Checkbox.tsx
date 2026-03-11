import type { InputHTMLAttributes } from "react";
import "./form-controls.css";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
};

function Checkbox({ label, id, ...props }: CheckboxProps) {
  const inputId = id ?? `checkbox-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <label className="ui-checkbox-row" htmlFor={inputId}>
      <input id={inputId} type="checkbox" className="ui-checkbox" {...props} />
      <span>{label}</span>
    </label>
  );
}

export default Checkbox;
