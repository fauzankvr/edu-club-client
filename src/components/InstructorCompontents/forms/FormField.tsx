import React from "react";
import { useField, FieldInputProps, FieldMetaProps } from "formik";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "number" | "date" | "tel" | "url";
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  as?: "input" | "textarea";
  rows?: number;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = "text",
  placeholder,
  disabled = false,
  required = false,
  className = "",
  as = "input",
  rows = 3,
  ...props
}) => {
  const [field, meta]: [FieldInputProps<string>, FieldMetaProps<string>] =
    useField(name);
  const hasError = Boolean(meta.error && meta.touched);

  const baseClassName = `${hasError ? "border-red-500" : ""} ${className}`;

  return (
    <div>
      <Label htmlFor={name}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {as === "textarea" ? (
        <textarea
          {...field}
          {...props}
          id={name}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={`w-full p-2 border rounded-md resize-vertical ${baseClassName}`}
        />
      ) : (
        <Input
          {...field}
          {...props}
          id={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={baseClassName}
        />
      )}
      {hasError && (
        <div className="text-red-500 text-sm mt-1" role="alert">
          {meta.error}
        </div>
      )}
    </div>
  );
};
