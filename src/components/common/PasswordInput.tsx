import type { InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function PasswordInput({
  className,
  id,
  label,
  ...props
}: PasswordInputProps) {
  return (
    <label className="block">
      {label ? (
        <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      ) : null}
      <input
        className={cn(
          'h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-900',
          className,
        )}
        id={id}
        type="password"
        {...props}
      />
    </label>
  );
}
