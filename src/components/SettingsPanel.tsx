import React from 'react';
import { Settings, X, Ruler } from 'lucide-react';

export type UnitSystem = 'metric' | 'imperial';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  unitSystem: UnitSystem;
  onUnitSystemChange: (system: UnitSystem) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  unitSystem,
  onUnitSystemChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass-panel w-full max-w-sm animate-scale-in">
        {/* Header */}
        <div className="p-5 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/20">
                <Settings className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Settings</h3>
                <p className="text-xs text-slate-500">Configure display options</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl glass-panel-sm hover:bg-white/5 transition-all"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Unit System Toggle */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-cyan-400" />
              <label className="text-sm font-semibold text-white">Unit System</label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onUnitSystemChange('metric')}
                className={`
                  flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300
                  ${unitSystem === 'metric'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-400 shadow-lg shadow-cyan-500/10'
                    : 'glass-panel-sm text-slate-400 hover:text-slate-300 hover:bg-white/5'
                  }
                `}
              >
                <div className="text-center">
                  <div className="font-bold">Metric</div>
                  <div className="text-[10px] opacity-70 mt-0.5">km, km/s</div>
                </div>
              </button>

              <button
                onClick={() => onUnitSystemChange('imperial')}
                className={`
                  flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300
                  ${unitSystem === 'imperial'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-400 shadow-lg shadow-cyan-500/10'
                    : 'glass-panel-sm text-slate-400 hover:text-slate-300 hover:bg-white/5'
                  }
                `}
              >
                <div className="text-center">
                  <div className="font-bold">Imperial</div>
                  <div className="text-[10px] opacity-70 mt-0.5">mi, mph</div>
                </div>
              </button>
            </div>

            <p className="text-[10px] text-slate-500">
              Changes how altitude, velocity, and distances are displayed throughout the app.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50 bg-slate-900/30">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-medium text-sm
              bg-gradient-to-r from-cyan-500/20 to-blue-500/20
              border border-cyan-500/30 text-cyan-400
              hover:from-cyan-500/30 hover:to-blue-500/30
              transition-all duration-300"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
