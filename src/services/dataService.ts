import { Transaction, ChamaGroup, CreditScoreResult } from '../types';
import { subDays, format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export function generateSimulatedData(days: number = 90): Transaction[] {
  const transactions: Transaction[] = [];
  const now = new Date();

  for (let i = 0; i < days; i++) {
    const date = subDays(now, i);
    const dateStr = format(date, 'yyyy-MM-dd');

    // Monthly Income (e.g., salary or business income)
    if (date.getDate() === 1 || date.getDate() === 15) {
      transactions.push({
        id: `inc-${i}`,
        date: dateStr,
        type: 'income',
        amount: 25000 + Math.random() * 10000,
        category: 'Business Revenue',
        description: 'M-Pesa Business Payment Received',
      });
    }

    // Weekly Savings (Chama Contribution)
    if (date.getDay() === 0) { // Sunday
      transactions.push({
        id: `sav-${i}`,
        date: dateStr,
        type: 'savings',
        amount: 2000,
        category: 'Chama Contribution',
        description: 'Weekly Chama Savings',
      });
    }

    // Daily Expenses
    const numExpenses = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < numExpenses; j++) {
      transactions.push({
        id: `exp-${i}-${j}`,
        date: dateStr,
        type: 'expense',
        amount: 50 + Math.random() * 1500,
        category: ['Airtime', 'Utility', 'Food', 'Transport'][Math.floor(Math.random() * 4)],
        description: 'M-Pesa Payment',
      });
    }

    // Occasional Transfers (P2P)
    if (Math.random() > 0.8) {
      transactions.push({
        id: `p2p-${i}`,
        date: dateStr,
        type: 'transfer',
        amount: 500 + Math.random() * 5000,
        category: 'P2P Transfer',
        description: 'Sent to Family/Friend',
      });
    }
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function calculateFeatures(transactions: Transaction[]) {
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalSavings = transactions.filter(t => t.type === 'savings').reduce((sum, t) => sum + t.amount, 0);
  
  const incomeStability = Math.min(100, (totalIncome / 75000) * 100); // Normalized
  const savingsConsistency = Math.min(100, (totalSavings / 12000) * 100); // Normalized for 90 days
  const transactionFrequency = Math.min(100, (transactions.length / 200) * 100);
  const debtToIncomeRatio = totalIncome > 0 ? (totalExpenses / totalIncome) : 1;
  const socialTrustScore = 75 + Math.random() * 20; // Simulated trust based on P2P network

  return {
    incomeStability,
    savingsConsistency,
    transactionFrequency,
    debtToIncomeRatio,
    socialTrustScore,
  };
}

export function calculateBaseScore(features: ReturnType<typeof calculateFeatures>) {
  // Simple weighted average for the prototype
  const score = (
    features.incomeStability * 0.3 +
    features.savingsConsistency * 0.3 +
    features.transactionFrequency * 0.1 +
    (1 - features.debtToIncomeRatio) * 100 * 0.2 +
    features.socialTrustScore * 0.1
  );

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));
  const defaultProb = Math.max(0, Math.min(1, (100 - finalScore) / 100));
  
  let riskCategory: 'Low' | 'Medium' | 'High' = 'High';
  if (finalScore > 75) riskCategory = 'Low';
  else if (finalScore > 50) riskCategory = 'Medium';

  return { finalScore, defaultProb, riskCategory };
}
