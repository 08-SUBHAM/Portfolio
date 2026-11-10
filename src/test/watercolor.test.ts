import { describe, it, expect } from 'vitest';
import { washAlpha } from '@/components/ink/watercolor-stamps';
describe('watercolour wash stamp', () => {
  it('is empty outside the blotch and painted inside', () => {
    expect(washAlpha(1, 1, 1.3)).toBe(0);
    expect(washAlpha(0, 0, 1.3)).toBeGreaterThan(0.2);
  });
  it('has an irregular, non-circular edge', () => {
    const reach = Array.from({ length: 24 }, (_, i) => { const th = (i / 24) * Math.PI * 2; let r = 0; while (r < 1 && washAlpha(Math.cos(th) * r, Math.sin(th) * r, 2.3) > 0) r += 0.01; return r; });
    expect(Math.max(...reach) - Math.min(...reach)).toBeGreaterThan(0.12);
  });
});
