interface AuthPageHeaderProps {
  title: string;
  onBack: () => void;
}

export function AuthPageHeader({ title, onBack }: AuthPageHeaderProps) {
  return (
    <div className="-mx-6 mb-5 flex items-center gap-3 border-b border-blue-100 px-6 pb-4">
      <button
        aria-label="뒤로가기"
        className="relative flex h-8 w-8 items-center justify-center rounded-full text-[#1565C0] hover:bg-[#F0F6FF]"
        onClick={onBack}
        type="button"
      >
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[61%] text-4xl leading-none">
          ‹
        </span>
      </button>
      <h1 className="text-base font-bold text-slate-950">{title}</h1>
    </div>
  );
}
