import type { InputHTMLAttributes } from "react";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
};

export const Field = ({ label, name, ...inputProps }: FieldProps) => (
  <div className="field">
    <label htmlFor={name}>{label}</label>
    <input id={name} name={name} {...inputProps} />
  </div>
);
