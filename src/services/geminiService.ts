import { GoogleGenAI } from "@google/genai";
import { CreditScoreResult, Transaction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function getExplainableScore(
  score: number,
  riskCategory: string,
  features: any,
  recentTransactions: Transaction[]
): Promise<{ explanation: string; recommendations: string[] }> {
  const prompt = `
    As a credit analyst for ChamaScore AI, explain this credit decision for a user in an informal economy (Kenya).
    
    Credit Score: ${score}/100
    Risk Category: ${riskCategory}
    
    Key Features:
    - Income Stability: ${features.incomeStability.toFixed(1)}%
    - Savings Consistency: ${features.savingsConsistency.toFixed(1)}%
    - Transaction Frequency: ${features.transactionFrequency.toFixed(1)}%
    - Debt-to-Income Ratio: ${features.debtToIncomeRatio.toFixed(2)}
    - Social Trust Score: ${features.socialTrustScore.toFixed(1)}%
    
    Recent Activity Summary:
    ${recentTransactions.slice(0, 5).map(t => `- ${t.date}: ${t.description} (${t.amount} KES)`).join('\n')}
    
    Provide:
    1. A human-readable explanation of why this score was given.
    2. 3 actionable recommendations to improve the score.
    
    Return the response in JSON format:
    {
      "explanation": "string",
      "recommendations": ["string", "string", "string"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text || '{}');
    return {
      explanation: result.explanation || "No explanation available.",
      recommendations: result.recommendations || ["Continue saving regularly.", "Maintain stable income flows.", "Minimize high-interest micro-loans."],
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      explanation: "Unable to generate AI explanation at this time.",
      recommendations: ["Continue saving regularly.", "Maintain stable income flows.", "Minimize high-interest micro-loans."],
    };
  }
}
