import { cn } from '../../utils/cn';

interface NotificationToggleItemProps {
  checked: boolean;
  description: string;
  icon: string;
  onChange: (checked: boolean) => void;
  title: string;
}

export function NotificationToggleItem({
  checked,
  description,
  icon,
  onChange,
  title,
}: NotificationToggleItemProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center text-lg">{icon}</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold text-slate-950">{title}</p>
          <p className="mt-1 text-xs font-bold text-[#6C88A4]">{description}</p>
        </div>
      </div>
      <button
        aria-label={`${title} ${checked ? '끄기' : '켜기'}`}
        aria-pressed={checked}
        className={cn(
          'relative h-8 w-14 shrink-0 rounded-full transition',
          checked ? 'bg-[#1565C0]' : 'bg-slate-300',
        )}
        onClick={() => onChange(!checked)}
        type="button"
      >
        <span
          className={cn(
            'absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition',
            checked ? 'left-7' : 'left-1',
          )}
        />
      </button>
    </div>
  );
}
