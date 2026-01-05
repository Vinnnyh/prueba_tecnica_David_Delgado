export interface Movement {
  amount: number;
  type: 'INCOME' | 'EXPENSE' | string;
}

/**
 * Calculates the total balance, total income, and total expenses from a list of movements.
 */
export const calculateBalance = (movements: Movement[]) => {
  return movements.reduce(
    (acc, movement) => {
      const { amount } = movement;
      if (movement.type === 'INCOME') {
        acc.income += amount;
        acc.balance += amount;
      } else if (movement.type === 'EXPENSE') {
        acc.expense += amount;
        acc.balance -= amount;
      }
      return acc;
    },
    { balance: 0, income: 0, expense: 0 }
  );
};
