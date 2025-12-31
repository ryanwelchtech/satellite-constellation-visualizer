import React from 'react';
import { Satellite, Radio, Globe, Zap, Signal, Clock } from 'lucide-react';
import { DashboardStats } from '../types';

interface StatsPanelProps {
  stats: DashboardStats;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ stats }) => {
  const statItems = [
    {
      label: 'Total Satellites',
      value: stats.totalSatellites,
      icon: Satellite,
      gradient: 'from-cyan-500/20 to-cyan-500/5',
      border: 'border-cyan-500/30',
      text: 'text-cyan-400',
      glow: 'glow-border-cyan'
    },
    {
      label: 'Operational',
      value: stats.operationalSatellites,
      icon: Zap,
      gradient: 'from-emerald-500/20 to-emerald-500/5',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      glow: 'glow-border-green'
    },
    {
      label: 'Ground Stations',
      value: stats.groundStations,
      icon: Radio,
      gradient: 'from-blue-500/20 to-blue-500/5',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      glow: 'glow-border-blue'
    },
    {
      label: 'Active Links',
      value: stats.activeLinks,
      icon: Signal,
      gradient: 'from-purple-500/20 to-purple-500/5',
      border: 'border-purple-500/30',
      text: 'text-purple-400',
      glow: 'glow-border-purple'
    },
    {
      label: 'Coverage',
      value: `${stats.globalCoverage}%`,
      icon: Globe,
      gradient: 'from-cyan-500/20 to-blue-500/5',
      border: 'border-cyan-500/30',
      text: 'text-cyan-400',
      glow: 'glow-border-cyan'
    },
    {
      label: 'Avg Latency',
      value: `${stats.averageLatency}ms`,
      icon: Clock,
      gradient: 'from-orange-500/20 to-orange-500/5',
      border: 'border-orange-500/30',
      text: 'text-orange-400',
      glow: 'glow-border-orange'
    }
  ];

  return (
    <div className="absolute bottom-6 left-4 z-10 flex gap-3">
      {statItems.map((item, index) => (
        <div
          key={index}
          className={`
            glass-panel-sm p-4 min-w-[110px] hover-lift cursor-default
            animate-fade-in-up opacity-0
          `}
          style={{ animationDelay: `${(index + 1) * 100}ms`, animationFillMode: 'forwards' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg bg-gradient-to-br ${item.gradient} border ${item.border}`}>
              <item.icon className={`w-3 h-3 ${item.text}`} />
            </div>
          </div>

          <div className={`text-xl font-bold ${item.text} tracking-tight`}>
            {item.value}
          </div>

          <div className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-wider">
            {item.label}
          </div>

          {/* Subtle gradient line at bottom */}
          <div className={`h-0.5 w-full mt-3 rounded-full bg-gradient-to-r ${item.gradient} opacity-50`}></div>
        </div>
      ))}
    </div>
  );
};

export default StatsPanel;
