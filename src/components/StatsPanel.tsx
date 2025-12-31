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
      color: 'text-space-cyan'
    },
    {
      label: 'Operational',
      value: stats.operationalSatellites,
      icon: Zap,
      color: 'text-space-green'
    },
    {
      label: 'Ground Stations',
      value: stats.groundStations,
      icon: Radio,
      color: 'text-space-blue'
    },
    {
      label: 'Active Links',
      value: stats.activeLinks,
      icon: Signal,
      color: 'text-space-purple'
    },
    {
      label: 'Coverage',
      value: `${stats.globalCoverage}%`,
      icon: Globe,
      color: 'text-space-cyan'
    },
    {
      label: 'Avg Latency',
      value: `${stats.averageLatency}ms`,
      icon: Clock,
      color: 'text-space-orange'
    }
  ];

  return (
    <div className="absolute bottom-4 left-4 z-10 flex gap-2">
      {statItems.map((item, index) => (
        <div
          key={index}
          className="bg-space-dark/90 backdrop-blur-sm border border-space-blue/20 rounded-lg px-3 py-2 min-w-[100px]"
        >
          <div className="flex items-center gap-2 mb-1">
            <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">{item.label}</span>
          </div>
          <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsPanel;
