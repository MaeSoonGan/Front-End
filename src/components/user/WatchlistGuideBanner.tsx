export function WatchlistGuideBanner() {
  return (
    <section className="rounded-xl border border-blue-100 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-extrabold text-[#1565C0]">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E5F4FF]">
          ?
        </span>
        <div className="space-y-1">
          <p>
            종목 상세에서 <span className="text-red-500">♥</span>를 눌러 관심종목을 추가하세요!
          </p>
          <p className="text-[#6C88A4]">
            <span className="text-red-500">♥</span>를 다시 누르면 관심종목에서 해제됩니다.
          </p>
        </div>
      </div>
    </section>
  );
}
