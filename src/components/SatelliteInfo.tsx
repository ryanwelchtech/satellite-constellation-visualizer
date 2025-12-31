import React from 'react';
import { X, Satellite as SatelliteIcon, MapPin, Radio, Calendar, Gauge, Navigation, Clock } from 'lucide-react';
import { Satellite } from '../types';
import { constellations } from '../data/satellites';

interface SatelliteInfoProps {
  satellite: Satellite | null;
  onClose: () => void;
}

const SatelliteInfo: React.FC<SatelliteInfoProps> = ({ satellite, onClose }) => {
  if (!satellite) return null;

  const constellation = constellations.find(c => c.id === satellite.constellation);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'operational':
        return 'status-operational';
      case 'degraded':
        return 'status-degraded';
      case 'offline':
        return 'status-offline';
      default:
        return 'bg-slate-800/50 text-slate-400 border-slate-700/50';
    }
  };

  const getOrbitTypeClass = (type: string) => {
    switch (type) {
      case 'LEO': return 'orbit-leo';
      case 'MEO': return 'orbit-meo';
      case 'GEO': return 'orbit-geo';
      default: return 'bg-slate-800/50 text-slate-400';
    }
  };

  return (
    <div className="absolute top-24 left-4 z-10 w-80 glass-panel overflow-hidden animate-scale-in">
      {/* Header */}
      <div className="p-5 border-b border-slate-700/50">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="p-3 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${constellation?.color}30, ${constellation?.color}10)`,
                boxShadow: `0 0 20px ${constellation?.color}20`
              }}
            >
              <SatelliteIcon className="w-5 h-5" style={{ color: constellation?.color }} />
            </div>
            <div>
              <h3 className="font-bold text-white">{satellite.name}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{satellite.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl glass-panel-sm hover:bg-white/5 transition-all duration-300 group"
          >
            <X className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Status and Constellation Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Status</span>
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${getStatusStyles(satellite.status)}`}>
              {satellite.status.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: constellation?.color }}
            />
            <span className="text-sm text-white font-medium">{constellation?.name}</span>
          </div>
        </div>

        {/* Orbital Parameters */}
        <div className="glass-panel-sm p-4">
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-3">
            <Radio className="w-3.5 h-3.5" />
            <span className="font-semibold uppercase tracking-wider">Orbital Parameters</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Orbit Type</span>
              <div className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${getOrbitTypeClass(satellite.orbitType)}`}>
                {satellite.orbitType}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Altitude</span>
              <p className="text-sm text-white font-semibold">{satellite.altitude.toLocaleString()} km</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Inclination</span>
              <p className="text-sm text-white font-semibold">{satellite.inclination.toFixed(1)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Period</span>
              <p className="text-sm text-white font-semibold">{satellite.period.toFixed(0)} min</p>
            </div>
          </div>
        </div>

        {/* Current Position */}
        <div className="glass-panel-sm p-4">
          <div className="flex items-center gap-2 text-xs text-purple-400 mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span className="font-semibold uppercase tracking-wider">Current Position</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Latitude</span>
              <p className="text-sm text-white font-semibold">{satellite.position.lat.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Longitude</span>
              <p className="text-sm text-white font-semibold">{satellite.position.lng.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Velocity</span>
              <p className="text-sm text-white font-semibold">{satellite.velocity.toFixed(2)} km/s</p>
            </div>
          </div>
        </div>

        {/* Launch Date */}
        <div className="flex items-center gap-3 p-3 glass-panel-sm">
          <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/30">
            <Calendar className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Launch Date</span>
            <p className="text-sm text-white font-medium">{satellite.launchDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
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
            hover:shadow-lg hover:shadow-cyan-500/20
            transition-all duration-300"
        >
          Close Details
        </button>
      </div>
    </div>
  );
};

export default SatelliteInfo;
