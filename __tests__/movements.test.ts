import { describe, it, expect } from 'vitest';
import { calculateBalance, Movement } from '@/lib/movements';

describe('Movements Logic: calculateBalance', () => {
  it('should calculate balance correctly for a mix of income and expenses', () => {
    const movements: Movement[] = [
      { amount: 100, type: 'INCOME' },
      { amount: 50, type: 'EXPENSE' },
      { amount: 200, type: 'INCOME' },
      { amount: 30, type: 'EXPENSE' },
    ];

    const result = calculateBalance(movements);

    expect(result.income).toBe(300);
    expect(result.expense).toBe(80);
    expect(result.balance).toBe(220);
  });

  it('should return zeros for an empty list of movements', () => {
    const result = calculateBalance([]);

    expect(result.income).toBe(0);
    expect(result.expense).toBe(0);
    expect(result.balance).toBe(0);
  });

  it('should handle only income correctly', () => {
    const movements: Movement[] = [
      { amount: 500, type: 'INCOME' },
      { amount: 250, type: 'INCOME' },
    ];

    const result = calculateBalance(movements);

    expect(result.income).toBe(750);
    expect(result.expense).toBe(0);
    expect(result.balance).toBe(750);
  });

  it('should handle only expenses correctly', () => {
    const movements: Movement[] = [
      { amount: 100, type: 'EXPENSE' },
      { amount: 50, type: 'EXPENSE' },
    ];

    const result = calculateBalance(movements);

    expect(result.income).toBe(0);
    expect(result.expense).toBe(150);
    expect(result.balance).toBe(-150);
  });

  it('should ignore unknown movement types', () => {
    const movements: Movement[] = [
      { amount: 100, type: 'INCOME' },
      { amount: 50, type: 'UNKNOWN' },
    ];

    const result = calculateBalance(movements);

    expect(result.income).toBe(100);
    expect(result.expense).toBe(0);
    expect(result.balance).toBe(100);
  });
});
