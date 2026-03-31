export interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense' | 'savings' | 'transfer';
  amount: number;
  category: string;
  description: string;
}

export interface CreditScoreResult {
  score: number;
  defaultProbability: number;
  riskCategory: 'Low' | 'Medium' | 'High';
  features: {
    incomeStability: number;
    savingsConsistency: number;
    transactionFrequency: number;
    debtToIncomeRatio: number;
    socialTrustScore: number;
  };
  explanation: string;
  recommendations: string[];
}

export interface ChamaGroup {
  id: string;
  name: string;
  members: number;
  totalSavings: number;
  lastContribution: string;
  repaymentHistory: number; // 0-100
}
