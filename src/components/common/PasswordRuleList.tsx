import { cn } from '../../utils/cn';

interface PasswordRule {
  label: string;
  isValid: boolean;
}

interface PasswordRuleListProps {
  rules: PasswordRule[];
}

export function PasswordRuleList({ rules }: PasswordRuleListProps) {
  return (
    <ul className="mt-2 space-y-1 text-xs">
      {rules.map((rule) => (
        <li
          className={cn(
            'flex items-center gap-1.5',
            rule.isValid ? 'text-emerald-600' : 'text-slate-300',
          )}
          key={rule.label}
        >
          <span aria-hidden="true" className="text-[11px]">
            {rule.isValid ? '☑' : '☐'}
          </span>
          <span>{rule.label}</span>
        </li>
      ))}
    </ul>
  );
}
