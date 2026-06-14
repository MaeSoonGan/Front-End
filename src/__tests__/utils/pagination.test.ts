import { describe, it, expect } from 'vitest';
import { getPaginationPages } from '../../utils/pagination';

// UT-FE: 페이지네이션 블록 계산 (실제 소스 import)
describe('getPaginationPages', () => {
  it('현재 페이지가 속한 5개 블록을 반환한다 (7/49 → 6~10)', () => {
    expect(getPaginationPages(7, 49)).toEqual([6, 7, 8, 9, 10]);
  });

  it('첫 블록은 1~5를 반환한다', () => {
    expect(getPaginationPages(1, 49)).toEqual([1, 2, 3, 4, 5]);
    expect(getPaginationPages(5, 49)).toEqual([1, 2, 3, 4, 5]);
  });

  it('마지막 블록은 totalPages까지만 반환한다 (49/49 → 46~49)', () => {
    expect(getPaginationPages(49, 49)).toEqual([46, 47, 48, 49]);
  });

  it('전체 페이지가 5 이하면 그대로 노출한다', () => {
    expect(getPaginationPages(2, 3)).toEqual([1, 2, 3]);
  });
});
