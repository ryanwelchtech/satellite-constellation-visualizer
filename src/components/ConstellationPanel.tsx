import React from 'react';
import { Eye, EyeOff, Info, Orbit, Target } from 'lucide-react';
import { Constellation } from '../types';

interface ConstellationPanelProps {
  constellations: Constellation[];
  visibleConstellations: string[];
  onToggleConstellation: (id: string) => void;
  selectedConstellation: string | null;
  onSelectConstellation: (id: string | null) => void;
}

const ConstellationPanel: React.FC<ConstellationPanelProps> = ({
  constellations,
  visibleConstellations,
  onToggleConstellation,
  selectedConstellation,
  onSelectConstellation
}) => {
  const getOrbitTypeClass = (type: string) => {
    switch (type) {
      case 'LEO': return 'orbit-leo';
      case 'MEO': return 'orbit-meo';
      case 'GEO': return 'orbit-geo';
      default: return 'bg-slate-800/50 text-slate-400 border-slate-700/50';
    }
  };

  return (
    <div className="absolute top-24 right-4 z-10 w-80 glass-panel overflow-hidden animate-fade-in-up opacity-0" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
      {/* Header */}
      <div className="p-5 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/20">
            <Orbit className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Constellations</h3>
            <p className="text-xs text-slate-500 mt-0.5">Click to focus, toggle visibility</p>
          </div>
        </div>
      </div>

      {/* Constellation List */}
      <div className="divide-y divide-slate-700/30 max-h-[420px] overflow-y-auto">
        {constellations.map((constellation, index) => {
          const isVisible = visibleConstellations.includes(constellation.id);
          const isSelected = selectedConstellation === constellation.id;

          return (
            <div
              key={constellation.id}
              className={`
                p-4 transition-all duration-300
                ${isSelected
                  ? 'bg-gradient-to-r from-cyan-500/10 to-transparent border-l-2 border-cyan-400'
                  : 'hover:bg-white/[0.02] border-l-2 border-transparent'
                }
              `}
            >
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => onSelectConstellation(isSelected ? null : constellation.id)}
                  className="flex items-center gap-3 group"
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full ring-2 ring-offset-2 ring-offset-slate-900 transition-all duration-300"
                    style={{
                      backgroundColor: constellation.color,
                      ringColor: isSelected ? constellation.color : 'transparent'
                    }}
                  />
                  <span className={`font-semibold text-sm transition-colors ${isSelected ? 'text-cyan-400' : 'text-white group-hover:text-cyan-400'}`}>
                    {constellation.name}
                  </span>
                </button>

                <button
                  onClick={() => onToggleConstellation(constellation.id)}
                  className={`
                    p-2 rounded-lg transition-all duration-300
                    ${isVisible
                      ? 'glass-panel-sm text-cyan-400 hover:bg-cyan-500/10'
                      : 'glass-panel-sm text-slate-500 hover:text-slate-300'
                    }
                  `}
                >
                  {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-xs text-slate-500 mb-3 leading-relaxed">{constellation.description}</p>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg ${getOrbitTypeClass(constellation.orbitType)}`}>
                  {constellation.orbitType}
                </span>
                <span className="px-2.5 py-1 text-[10px] font-medium rounded-lg bg-slate-800/50 text-slate-400 border border-slate-700/50">
                  {constellation.satelliteCount} satellites
                </span>
              </div>

              {/* Expanded Mission Info */}
              {isSelected && (
                <div className="mt-4 p-3 glass-panel-sm animate-fade-in">
                  <div className="flex items-center gap-2 text-xs text-cyan-400 mb-2">
                    <Target className="w-3.5 h-3.5" />
                    <span className="font-semibold uppercase tracking-wider">Mission</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{constellation.purpose}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-900/30">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Visible constellations</span>
          <span className="font-semibold text-cyan-400">{visibleConstellations.length} / {constellations.length}</span>
        </div>
      </div>
    </div>
  );
};

export default ConstellationPanel;
