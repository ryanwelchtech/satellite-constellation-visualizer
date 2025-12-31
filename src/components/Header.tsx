import React from 'react';
import { Satellite, Radio, Settings, Globe } from 'lucide-react';

interface HeaderProps {
  onTogglePanel: () => void;
  isPanelOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onTogglePanel, isPanelOpen }) => {
  return (
    <header className="absolute top-4 left-4 right-4 z-10 glass-panel px-6 py-4 animate-fade-in-up opacity-0" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20">
            <Satellite className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Satellite Constellation Visualizer</h1>
            <p className="text-xs text-slate-500 mt-0.5">Space Domain Awareness Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Orbital Stats Badge */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 glass-panel-sm">
            <Globe className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-slate-400">Real-Time Orbital Tracking</span>
          </div>

          {/* Live Status Indicator */}
          <div className="flex items-center gap-2.5 px-4 py-2 glass-panel-sm glow-border-green">
            <div className="relative">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
            </div>
            <span className="text-xs font-medium text-emerald-400">Live Tracking</span>
          </div>

          {/* Settings Toggle */}
          <button
            onClick={onTogglePanel}
            className={`
              p-2.5 rounded-xl transition-all duration-300 group
              ${isPanelOpen
                ? 'glass-panel-sm glow-border-cyan'
                : 'glass-panel-sm hover:glow-border-cyan'
              }
            `}
          >
            <Settings className={`w-5 h-5 transition-all duration-300 ${isPanelOpen ? 'text-cyan-400 rotate-90' : 'text-slate-400 group-hover:text-cyan-400'}`} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
