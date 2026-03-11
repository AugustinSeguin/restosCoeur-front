import type { SelectHTMLAttributes } from "react";
import "./form-controls.css";

export type SelectOption = {
  label: string;
  value: string;
};

type SelectListProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: SelectOption[];
};

function SelectList({ label, options, id, ...props }: SelectListProps) {
  const selectId = id ?? `select-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="ui-field">
      <label className="ui-label" htmlFor={selectId}>
        {label}
      </label>
      <select id={selectId} className="ui-select" {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectList;
