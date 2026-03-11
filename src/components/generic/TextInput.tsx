import type { InputHTMLAttributes } from "react";
import "./form-controls.css";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  helperText?: string;
};

function TextInput({ label, helperText, id, ...props }: TextInputProps) {
  const inputId =
    id ?? `text-input-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="ui-field">
      <label className="ui-label" htmlFor={inputId}>
        {label}
      </label>
      <input id={inputId} type="text" className="ui-input" {...props} />
      {helperText ? <p className="ui-helper">{helperText}</p> : null}
    </div>
  );
}

export default TextInput;
