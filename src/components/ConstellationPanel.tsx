import React from 'react';
import { Eye, EyeOff, Info } from 'lucide-react';
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
  return (
    <div className="absolute top-20 right-4 z-10 w-72 bg-space-dark/90 backdrop-blur-sm border border-space-blue/20 rounded-lg overflow-hidden">
      <div className="p-3 border-b border-space-blue/20">
        <h3 className="text-sm font-semibold text-white">Constellations</h3>
        <p className="text-xs text-gray-400">Click to focus, toggle visibility</p>
      </div>

      <div className="divide-y divide-space-blue/10 max-h-[400px] overflow-y-auto">
        {constellations.map((constellation) => {
          const isVisible = visibleConstellations.includes(constellation.id);
          const isSelected = selectedConstellation === constellation.id;

          return (
            <div
              key={constellation.id}
              className={`p-3 transition-colors ${
                isSelected ? 'bg-space-blue/20' : 'hover:bg-space-blue/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => onSelectConstellation(isSelected ? null : constellation.id)}
                  className="flex items-center gap-2"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: constellation.color }}
                  />
                  <span className="font-medium text-white text-sm">{constellation.name}</span>
                </button>

                <button
                  onClick={() => onToggleConstellation(constellation.id)}
                  className={`p-1.5 rounded transition-colors ${
                    isVisible ? 'text-space-cyan' : 'text-gray-500'
                  }`}
                >
                  {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-xs text-gray-400 mb-2">{constellation.description}</p>

              <div className="flex items-center gap-3 text-xs">
                <span className="px-2 py-0.5 bg-gray-800 rounded text-gray-300">
                  {constellation.orbitType}
                </span>
                <span className="text-gray-400">
                  {constellation.satelliteCount} satellites
                </span>
              </div>

              {isSelected && (
                <div className="mt-3 p-2 bg-space-darker rounded border border-space-blue/10">
                  <div className="flex items-center gap-1 text-xs text-space-cyan mb-1">
                    <Info className="w-3 h-3" />
                    <span>Mission</span>
                  </div>
                  <p className="text-xs text-gray-300">{constellation.purpose}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConstellationPanel;
