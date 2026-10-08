import { describe, expect, it } from 'vitest';
import { moveItem } from './reorder';

describe('moveItem', () => {
  it('moves an item down', () => {
    expect(moveItem(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c']);
  });

  it('moves an item up', () => {
    expect(moveItem(['a', 'b', 'c'], 2, 1)).toEqual(['a', 'c', 'b']);
  });

  it('returns the same array for out-of-range or no-op moves', () => {
    const items = ['a', 'b'];
    expect(moveItem(items, 0, 0)).toBe(items);
    expect(moveItem(items, 0, 5)).toBe(items);
    expect(moveItem(items, -1, 0)).toBe(items);
  });

  it('does not mutate the input array', () => {
    const items = ['a', 'b', 'c'];
    const result = moveItem(items, 0, 2);
    expect(items).toEqual(['a', 'b', 'c']);
    expect(result).toEqual(['b', 'c', 'a']);
  });
});
