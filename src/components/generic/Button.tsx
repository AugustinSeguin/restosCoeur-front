import type { ButtonHTMLAttributes } from "react";
import "./form-controls.css";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const variantClass =
    variant === "secondary" ? "ui-button-secondary" : "ui-button-primary";

  return (
    <button
      className={`ui-button ${variantClass} ${className}`.trim()}
      type="button"
      {...props}
    />
  );
}

export default Button;
