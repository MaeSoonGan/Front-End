import { Link } from 'react-router-dom';

export function UserHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link className="text-base font-bold text-slate-950" to="/home">
          FISA Invest
        </Link>
        <nav className="hidden gap-4 text-sm text-slate-600 sm:flex">
          <Link to="/market">시장</Link>
          <Link to="/contests">대회</Link>
          <Link to="/more">더보기</Link>
        </nav>
      </div>
    </header>
  );
}
