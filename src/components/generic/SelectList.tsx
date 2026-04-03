import { useEffect, useMemo, useRef } from "react";
import type { ChangeEvent, SelectHTMLAttributes } from "react";
import "./form-controls.css";

export type SelectOption = {
  label: string;
  value: string;
};

type SelectListProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: SelectOption[];
  noAutoSelect?: boolean;
};

function SelectList({
  label,
  options,
  id,
  value,
  onChange,
  noAutoSelect = false,
  ...props
}: SelectListProps) {
  const selectId =
    id ?? `select-${label.toLowerCase().replaceAll(/\s+/g, "-")}`;
  const autoSelectedValue = useMemo(() => {
    if (noAutoSelect) {
      return "";
    }

    const selectableOptions = options.filter((option) => option.value !== "");

    if (selectableOptions.length !== 1) {
      return "";
    }

    return selectableOptions[0].value;
  }, [options, noAutoSelect]);

  const didAutoSelect = useRef(false);

  useEffect(() => {
    const currentValue = typeof value === "string" ? value : "";

    if (
      didAutoSelect.current ||
      autoSelectedValue === "" ||
      currentValue !== "" ||
      typeof onChange !== "function"
    ) {
      return;
    }

    didAutoSelect.current = true;

    onChange({
      target: { value: autoSelectedValue },
    } as ChangeEvent<HTMLSelectElement>);
  }, [autoSelectedValue, onChange, value]);

  const displayedValue =
    typeof value === "string" && value !== ""
      ? value
      : autoSelectedValue || value || "";

  return (
    <div className="ui-field">
      <label className="ui-label" htmlFor={selectId}>
        {label}
      </label>
      <select
        id={selectId}
        className="ui-select"
        {...props}
        value={displayedValue}
        onChange={onChange}
      >
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
