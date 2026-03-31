import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface ScoreGaugeProps {
  score: number;
  category: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, category }) => {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  const COLORS = [
    category === 'Low' ? '#10B981' : category === 'Medium' ? '#F59E0B' : '#EF4444',
    '#E2E8F0'
  ];

  return (
    <div className="relative w-full h-72 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={85}
            outerRadius={105}
            startAngle={225}
            endAngle={-45}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
            cornerRadius={10}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="absolute inset-0 flex flex-col items-center justify-center pt-4"
      >
        <span className="text-7xl font-bold font-display tracking-tighter">{score}</span>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Credit Score</span>
          <Info className="w-3 h-3 text-muted/50 cursor-help" />
        </div>
      </motion.div>

      <div className="absolute bottom-4 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm border border-slate-100">
        <div className={cn(
          "w-2 h-2 rounded-full",
          category === 'Low' ? "bg-success" : category === 'Medium' ? "bg-warning" : "bg-error"
        )} />
        <span className="text-xs font-bold uppercase tracking-widest text-ink/80">{category} Risk Profile</span>
      </div>
    </div>
  );
};
