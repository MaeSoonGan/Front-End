import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';

interface MenuCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  to?: string;
  onClick?: () => void;
  className?: string;
}

export function MenuCard({
  title,
  description,
  icon,
  to,
  onClick,
  className,
}: MenuCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    if (to) {
      navigate(to);
    }
  };

  return (
    <button
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border border-blue-100 bg-white p-4 text-left shadow-sm transition hover:border-blue-200 hover:bg-[#F8FBFF]',
        className,
      )}
      onClick={handleClick}
      type="button"
    >
      {icon ? (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F0F6FF] text-base">
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-slate-950">{title}</span>
        {description ? (
          <span className="mt-1 block text-xs leading-5 text-[#6C88A4]">
            {description}
          </span>
        ) : null}
      </span>
      <span className="text-lg text-[#A3B4C6]">›</span>
    </button>
  );
}
