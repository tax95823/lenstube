import { zodResolver } from "@hookform/resolvers/zod";
import React, { ComponentProps } from "react";
import {
  FieldValues,
  FormProvider,
  SubmitHandler,
  useForm,
  UseFormProps,
  UseFormReturn,
} from "react-hook-form";
import { TypeOf, ZodSchema } from "zod";

interface UseZodFormProps<T extends ZodSchema<FieldValues>>
  extends UseFormProps<TypeOf<T>> {
  schema: T;
}

export const useZodForm = <T extends ZodSchema<FieldValues>>({
  schema,
  ...formConfig
}: UseZodFormProps<T>) => {
  return useForm({
    ...formConfig,
    resolver: zodResolver(schema),
  });
};

interface Props<T extends FieldValues = Record<string, unknown>>
  extends Omit<ComponentProps<"form">, "onSubmit"> {
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  className?: string;
  formClassName?: string;
}

export const Form = <T extends FieldValues>({
  form,
  onSubmit,
  children,
  className = "",
  formClassName = "",
}: Props<T>) => {
  return (
    <FormProvider {...form}>
      <form className={formClassName} onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset
          className={`flex flex-col ${className}`}
          disabled={form.formState.isSubmitting}
        >
          {children}
        </fieldset>
      </form>
    </FormProvider>
  );
};
