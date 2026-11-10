import { describe, expect, it } from 'vitest';
import { ART_DEPTH, settle, clampVelocity, strokeSamples, TRAIL_DECAY, pointerMoved } from '@/components/ink/wet-math';
describe('living ink motion rules',()=>{
 it('never paints from a pointer repeat at the same screen spot (scroll under a resting cursor)',()=>{expect(pointerMoved(200,300,200,300)).toBe(false);expect(pointerMoved(200,300,212,300)).toBe(true);expect(pointerMoved(NaN,NaN,10,10)).toBe(true);});
 it('moves foreground more than distant wash',()=>{expect(ART_DEPTH.branch).toBeGreaterThan(ART_DEPTH.ridge);expect(ART_DEPTH.ridge).toBeGreaterThan(ART_DEPTH.distant);});
 it('settles progressively rather than snapping on leave',()=>{const a=settle(1,0,.05,1.4);expect(a).toBeGreaterThan(.9);expect(settle(a,0,1,1.4)).toBeLessThan(a);});
 it('caps fast pointer velocity',()=>{expect(clampVelocity(50)).toBe(1);expect(clampVelocity(-50)).toBe(-1);});
 it('interpolates hover movement with no gaps larger than five pixels',()=>{const points=strokeSamples(0,0,100,0);expect(points).toHaveLength(20);expect(points[0]?.x).toBe(5);expect(points[19]?.x).toBe(100);});
 it('keeps painted pigment rich for about two seconds, then bleeds back',()=>{expect(Math.exp(-TRAIL_DECAY*1.5)).toBeGreaterThan(.15);expect(Math.exp(-TRAIL_DECAY*4)).toBeLessThan(.06);});
});
