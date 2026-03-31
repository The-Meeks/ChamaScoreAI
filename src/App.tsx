import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw,
  Info,
  Activity,
  Wallet,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  History,
  Settings,
  HelpCircle,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateSimulatedData, calculateFeatures, calculateBaseScore } from './services/dataService';
import { getExplainableScore } from './services/geminiService';
import { Transaction, CreditScoreResult, ChamaGroup } from './types';
import { ScoreGauge } from './components/ScoreGauge';
import { cn } from './lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  AreaChart,
  Area
} from 'recharts';

const CHAMA_GROUPS: ChamaGroup[] = [
  { id: 'g1', name: 'Zinduka Women Group', members: 12, totalSavings: 450000, lastContribution: '2026-03-25', repaymentHistory: 98 },
  { id: 'g2', name: 'Boda Boda Sacco', members: 45, totalSavings: 1200000, lastContribution: '2026-03-28', repaymentHistory: 85 },
  { id: 'g3', name: 'Market Traders Union', members: 20, totalSavings: 300000, lastContribution: '2026-03-20', repaymentHistory: 72 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'individual' | 'group'>('individual');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [scoreResult, setScoreResult] = useState<CreditScoreResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    handleRefresh();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    const data = generateSimulatedData(90);
    setTransactions(data);
    
    const features = calculateFeatures(data);
    const { finalScore, defaultProb, riskCategory } = calculateBaseScore(features);
    
    setScoreResult({
      score: finalScore,
      defaultProbability: defaultProb,
      riskCategory,
      features,
      explanation: "Analyzing financial behavior...",
      recommendations: []
    });

    setLoading(false);
    
    setIsAnalyzing(true);
    const aiResult = await getExplainableScore(finalScore, riskCategory, features, data);
    setScoreResult(prev => prev ? ({
      ...prev,
      explanation: aiResult.explanation,
      recommendations: aiResult.recommendations
    }) : null);
    setIsAnalyzing(false);
  };

  const featureData = scoreResult ? [
    { subject: 'Income', A: scoreResult.features.incomeStability, fullMark: 100 },
    { subject: 'Savings', A: scoreResult.features.savingsConsistency, fullMark: 100 },
    { subject: 'Frequency', A: scoreResult.features.transactionFrequency, fullMark: 100 },
    { subject: 'Trust', A: scoreResult.features.socialTrustScore, fullMark: 100 },
    { subject: 'DTI', A: (1 - scoreResult.features.debtToIncomeRatio) * 100, fullMark: 100 },
  ] : [];

  const trendData = [
    { name: 'Week 1', score: 62 },
    { name: 'Week 2', score: 65 },
    { name: 'Week 3', score: 63 },
    { name: 'Week 4', score: 68 },
    { name: 'Week 5', score: 72 },
    { name: 'Week 6', score: (scoreResult?.score || 72) },
  ];

  return (
    <div className="min-h-screen bg-bg text-ink font-sans selection:bg-accent selection:text-white">
      {/* Sidebar Overlay for Mobile */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass rounded-full px-6 py-3 flex items-center gap-8 shadow-xl border border-slate-200">
        <button onClick={() => setActiveTab('individual')} className={cn("p-2 rounded-full transition-all", activeTab === 'individual' ? "bg-accent text-white" : "text-muted")}>
          <LayoutDashboard className="w-5 h-5" />
        </button>
        <button onClick={() => setActiveTab('group')} className={cn("p-2 rounded-full transition-all", activeTab === 'group' ? "bg-accent text-white" : "text-muted")}>
          <Users className="w-5 h-5" />
        </button>
      </div>

      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="w-72 bg-white border-r border-slate-100 hidden md:flex flex-col">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
                <Sparkles className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-display tracking-tight">ChamaScore</h1>
                <p className="text-[10px] font-bold text-accent uppercase tracking-widest">AI Intelligence</p>
              </div>
            </div>

            <nav className="space-y-1">
              <SidebarLink 
                active={activeTab === 'individual'} 
                onClick={() => setActiveTab('individual')}
                icon={<LayoutDashboard className="w-4 h-4" />}
                label="Dashboard"
              />
              <SidebarLink 
                active={activeTab === 'group'} 
                onClick={() => setActiveTab('group')}
                icon={<Users className="w-4 h-4" />}
                label="Chama Groups"
              />
              <SidebarLink icon={<History className="w-4 h-4" />} label="History" />
              <SidebarLink icon={<Wallet className="w-4 h-4" />} label="Wallet" />
            </nav>
          </div>

          <div className="mt-auto p-8 border-t border-slate-50">
            <nav className="space-y-1 mb-8">
              <SidebarLink icon={<Settings className="w-4 h-4" />} label="Settings" />
              <SidebarLink icon={<HelpCircle className="w-4 h-4" />} label="Support" />
            </nav>
            
            <div className="bg-slate-50 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-sm">
                  BP
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold truncate">Benedict Pas</p>
                  <p className="text-[10px] text-muted truncate">Premium Merchant</p>
                </div>
              </div>
              <button className="w-full py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors">
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-bg/50">
          {/* Top Bar */}
          <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-40 glass border-b-0">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold font-display">
                {activeTab === 'individual' ? 'Individual Analysis' : 'Chama Group Analysis'}
              </h2>
              <div className="h-4 w-[1px] bg-slate-200" />
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-wider">
                <Activity className="w-3 h-3 text-success" />
                System Live
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={handleRefresh}
                disabled={isAnalyzing}
                className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all font-bold text-xs disabled:opacity-50"
              >
                <RefreshCw className={cn("w-4 h-4", isAnalyzing && "animate-spin")} />
                {isAnalyzing ? 'Analyzing...' : 'Re-calculate Score'}
              </button>
            </div>
          </header>

          <div className="p-8 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'individual' ? (
                <motion.div 
                  key="individual"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Top Stats Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Score Card */}
                    <div className="lg:col-span-4 bento-card flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute top-4 left-6">
                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Credit Health</p>
                      </div>
                      {scoreResult && <ScoreGauge score={scoreResult.score} category={scoreResult.riskCategory} />}
                      
                      <div className="w-full grid grid-cols-2 gap-3 mt-4">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1">Default Prob.</p>
                          <p className="text-xl font-bold font-display">{(scoreResult?.defaultProbability || 0 * 100).toFixed(1)}%</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1">Risk Tier</p>
                          <p className={cn(
                            "text-xl font-bold font-display",
                            scoreResult?.riskCategory === 'Low' ? "text-success" : 
                            scoreResult?.riskCategory === 'Medium' ? "text-warning" : "text-error"
                          )}>{scoreResult?.riskCategory}</p>
                        </div>
                      </div>
                    </div>

                    {/* AI Insights Card */}
                    <div className="lg:col-span-8 bento-card">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-xl font-bold font-display">AI Behavioral Insights</h3>
                          <p className="text-xs text-muted">Explainable intelligence based on alternative data</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-accent" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-8">
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Info className="w-3 h-3 text-accent" />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Decision Rationale</span>
                            </div>
                            <p className="text-sm leading-relaxed font-medium text-ink/80">
                              {scoreResult?.explanation}
                            </p>
                          </div>

                          <div className="space-y-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Score Improvement Plan</span>
                            <div className="space-y-3">
                              {scoreResult?.recommendations.map((rec, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 group hover:border-accent/30 transition-colors">
                                  <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                                    {i + 1}
                                  </div>
                                  <span className="text-xs font-semibold">{rec}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col">
                          <div className="flex-1 min-h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={featureData}>
                                <PolarGrid stroke="#E2E8F0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }} />
                                <Radar
                                  name="Features"
                                  dataKey="A"
                                  stroke="#3B82F6"
                                  fill="#3B82F6"
                                  fillOpacity={0.15}
                                />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Score Trend</span>
                              <span className="text-[10px] font-bold text-success flex items-center gap-1">
                                <ArrowUpRight className="w-3 h-3" />
                                +12% this month
                              </span>
                            </div>
                            <div className="h-16">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                  <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <Area type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transaction Feed */}
                  <div className="bento-card overflow-hidden p-0">
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold font-display">Alternative Data Stream</h3>
                        <p className="text-xs text-muted">Simulated M-Pesa & Utility transaction flows</p>
                      </div>
                      <button className="text-[10px] font-bold uppercase tracking-widest text-accent hover:underline flex items-center gap-1">
                        Export Data <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50/50">
                            <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">Transaction Details</th>
                            <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">Category</th>
                            <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">Status</th>
                            <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {transactions.slice(0, 8).map((t) => (
                            <tr key={t.id} className="group hover:bg-slate-50/50 transition-colors">
                              <td className="px-8 py-5">
                                <div className="flex items-center gap-4">
                                  <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center",
                                    t.type === 'income' ? "bg-success/10 text-success" : 
                                    t.type === 'expense' ? "bg-error/10 text-error" : 
                                    "bg-accent/10 text-accent"
                                  )}>
                                    {t.type === 'income' ? <ArrowDownRight className="w-5 h-5" /> : 
                                     t.type === 'expense' ? <ArrowUpRight className="w-5 h-5" /> : 
                                     <RefreshCw className="w-5 h-5" />}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold">{t.description}</p>
                                    <p className="text-[10px] font-mono text-muted uppercase">{t.date}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-5">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-100 text-muted">
                                  {t.category}
                                </span>
                              </td>
                              <td className="px-8 py-5">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-success" />
                                  <span className="text-xs font-semibold">Verified</span>
                                </div>
                              </td>
                              <td className={cn(
                                "px-8 py-5 text-sm font-bold text-right font-mono",
                                t.type === 'income' ? "text-success" : "text-ink"
                              )}>
                                {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()} KES
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-6 bg-slate-50/50 border-t border-slate-100 text-center">
                      <button className="text-[10px] font-bold uppercase tracking-widest text-muted hover:text-accent transition-colors">
                        Load More Transactions
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {CHAMA_GROUPS.map((group) => (
                      <div key={group.id} className="bento-card group">
                        <div className="flex justify-between items-start mb-6">
                          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-500">
                            <Users className="w-6 h-6" />
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1">Repayment Health</p>
                            <div className="flex items-center justify-end gap-2">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                group.repaymentHistory > 90 ? "bg-success" : group.repaymentHistory > 80 ? "bg-warning" : "bg-error"
                              )} />
                              <span className="text-lg font-bold font-display">{group.repaymentHistory}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold font-display mb-1">{group.name}</h3>
                        <p className="text-xs text-muted mb-8">{group.members} Active Members</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-8">
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1">Pool Savings</p>
                            <p className="text-sm font-bold font-mono">KES {group.totalSavings.toLocaleString()}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1">Last Activity</p>
                            <p className="text-sm font-bold font-mono">{group.lastContribution}</p>
                          </div>
                        </div>

                        <button className="w-full py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:text-white hover:border-accent transition-all flex items-center justify-center gap-2">
                          Analyze Group Risk <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 bento-card">
                      <h3 className="text-xl font-bold font-display mb-8">Collective Intelligence</h3>
                      <div className="space-y-6">
                        <div className="flex gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-6 h-6 text-success" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold mb-1">Group Default Prediction</h4>
                            <p className="text-xs text-muted leading-relaxed">
                              Chama groups with consistent weekly contributions and high member retention show a 45% lower default rate compared to individual borrowers.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                            <Sparkles className="w-6 h-6 text-accent" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold mb-1">Social Trust Metric</h4>
                            <p className="text-xs text-muted leading-relaxed">
                              Peer-to-peer transaction density within a group is the strongest predictor of loan repayment reliability in informal sectors.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-5 bento-card">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold font-display">Aggregate Growth</h3>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-accent" />
                          <span className="text-[10px] font-bold uppercase text-muted">Savings Pool</span>
                        </div>
                      </div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { name: 'Jan', value: 400000 },
                            { name: 'Feb', value: 650000 },
                            { name: 'Mar', value: 900000 },
                            { name: 'Apr', value: 1200000 },
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0F172A', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}
                              cursor={{ fill: '#F1F5F9' }}
                            />
                            <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-xs",
        active 
          ? "bg-accent/10 text-accent" 
          : "text-muted hover:bg-slate-50 hover:text-ink"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
