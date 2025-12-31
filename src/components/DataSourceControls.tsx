import React from 'react';
import { Globe, RefreshCw, Wifi, Database, Sparkles } from 'lucide-react';

interface DataSourceControlsProps {
  isLoadingLive: boolean;
  onFetchLiveData: () => void;
  liveDataCount: number;
  dataSource: 'mock' | 'celestrak';
}

const DataSourceControls: React.FC<DataSourceControlsProps> = ({
  isLoadingLive,
  onFetchLiveData,
  liveDataCount,
  dataSource
}) => {
  return (
    <div className="absolute bottom-20 right-4 z-10 glass-panel-sm animate-fade-in-up opacity-0" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20">
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">Data Source</h4>
            <p className="text-[10px] text-slate-500">
              {dataSource === 'celestrak' ? 'CelesTrak TLE Data' : 'Mock Simulation'}
            </p>
          </div>
        </div>

        <button
          onClick={onFetchLiveData}
          disabled={isLoadingLive}
          className={`
            w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm
            transition-all duration-300 group
            ${dataSource === 'celestrak'
              ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-400 hover:from-emerald-500/30 hover:to-cyan-500/30'
              : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 hover:from-cyan-500/30 hover:to-blue-500/30'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isLoadingLive ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Fetching...
            </>
          ) : (
            <>
              <Globe className="w-4 h-4 group-hover:scale-110 transition-transform" />
              {dataSource === 'celestrak' ? 'Refresh Live Data' : 'Fetch Live Data'}
            </>
          )}
        </button>

        {dataSource === 'celestrak' && liveDataCount > 0 && (
          <div className="mt-3 p-2.5 rounded-lg bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
              </div>
              <span className="text-[10px] text-emerald-400 font-medium">
                {liveDataCount} satellites from CelesTrak
              </span>
            </div>
          </div>
        )}

        <div className="mt-3 text-[10px] text-slate-500 leading-relaxed">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            <span>Free API - No key required</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSourceControls;
