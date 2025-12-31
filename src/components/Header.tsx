import React from 'react';
import { Satellite, Radio, Settings } from 'lucide-react';

interface HeaderProps {
  onTogglePanel: () => void;
  isPanelOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onTogglePanel, isPanelOpen }) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-10 bg-space-dark/80 backdrop-blur-sm border-b border-space-blue/20 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-space-blue/10 rounded-lg">
            <Satellite className="w-6 h-6 text-space-cyan" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Satellite Constellation Visualizer</h1>
            <p className="text-xs text-gray-400">Space Domain Awareness Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-space-dark rounded-lg border border-space-blue/20">
            <Radio className="w-4 h-4 text-space-green animate-pulse" />
            <span className="text-xs text-gray-300">Live Tracking</span>
          </div>

          <button
            onClick={onTogglePanel}
            className={`p-2 rounded-lg transition-colors ${
              isPanelOpen ? 'bg-space-blue/20 text-space-cyan' : 'hover:bg-space-blue/10 text-gray-400'
            }`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
