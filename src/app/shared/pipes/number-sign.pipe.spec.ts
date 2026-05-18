import { beforeEach, describe, expect, it } from '@jest/globals';
import { NumberSignPipe } from './number-sign.pipe';

describe('NumberSignPipe', () => {
  let pipe: NumberSignPipe;

  beforeEach(() => {
    pipe = new NumberSignPipe();
  });

  it('should format positive numbers with plus sign', () => {
    expect(pipe.transform(12.345)).toBe('+12.35');
  });

  it('should format zero without plus sign', () => {
    expect(pipe.transform(0)).toBe('0.00');
  });

  it('should format negative numbers without extra plus sign', () => {
    expect(pipe.transform(-3.75)).toBe('-3.75');
  });
});
