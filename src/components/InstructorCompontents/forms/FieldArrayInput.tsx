import { FieldArray, useFormikContext, FieldArrayRenderProps } from "formik";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Icon } from "@iconify/react";
import { FormField } from "./FormField";
import { JSX } from "react";

interface FieldArrayInputProps<T = Record<string, unknown>> {
  name: keyof T;
  label: string;
  placeholder: string;
  required?: boolean;
  maxItems?: number;
}

export const FieldArrayInput = <T extends Record<string, unknown>>({
  name,
  label,
  placeholder,
  required = false,
  maxItems = 10,
}: FieldArrayInputProps<T>): JSX.Element => {
  const { values, errors, touched } = useFormikContext<T>();
  const fieldName = String(name);
  const fieldArray = (values[name] as string[]) || [];
  const fieldError = errors[name];
  const fieldTouched = touched[name];

  return (
    <div>
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <FieldArray name={fieldName}>
        {({ push, remove }: FieldArrayRenderProps) => (
          <div className="space-y-2">
            {fieldArray.map((_, index: number) => (
              <div key={index}>
                <div className="flex items-center gap-2">
                  <FormField
                    name={`${fieldName}.${index}`}
                    label=""
                    placeholder={placeholder}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={fieldArray.length <= (required ? 1 : 0)}
                  >
                    <Icon icon="mdi:close" className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {typeof fieldError === "string" && fieldTouched && (
              <div className="text-red-500 text-sm mt-1" role="alert">
                {fieldError}
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => push("")}
              disabled={fieldArray.length >= maxItems}
            >
              <Icon icon="mdi:plus" className="w-4 h-4 mr-1" />
              Add {label.slice(0, -1)}
            </Button>
          </div>
        )}
      </FieldArray>
    </div>
  );
};
