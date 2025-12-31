import React from 'react';
import { X, Satellite as SatelliteIcon, MapPin, Gauge, Clock, Radio, Calendar } from 'lucide-react';
import { Satellite } from '../types';
import { constellations } from '../data/satellites';

interface SatelliteInfoProps {
  satellite: Satellite | null;
  onClose: () => void;
}

const SatelliteInfo: React.FC<SatelliteInfoProps> = ({ satellite, onClose }) => {
  if (!satellite) return null;

  const constellation = constellations.find(c => c.id === satellite.constellation);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-space-green bg-space-green/10 border-space-green/30';
      case 'degraded': return 'text-space-orange bg-space-orange/10 border-space-orange/30';
      case 'offline': return 'text-red-400 bg-red-400/10 border-red-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getOrbitDescription = (type: string) => {
    switch (type) {
      case 'LEO': return 'Low Earth Orbit (160-2,000 km)';
      case 'MEO': return 'Medium Earth Orbit (2,000-35,786 km)';
      case 'GEO': return 'Geostationary Orbit (35,786 km)';
      case 'HEO': return 'Highly Elliptical Orbit';
      default: return type;
    }
  };

  return (
    <div className="absolute top-20 left-4 z-10 w-80 bg-space-dark/95 backdrop-blur-sm border border-space-blue/30 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-space-blue/20">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${constellation?.color}20` }}
            >
              <SatelliteIcon className="w-5 h-5" style={{ color: constellation?.color }} />
            </div>
            <div>
              <h3 className="font-semibold text-white">{satellite.name}</h3>
              <p className="text-xs text-gray-400">{satellite.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Status</span>
          <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(satellite.status)}`}>
            {satellite.status.toUpperCase()}
          </span>
        </div>

        {/* Constellation */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Constellation</span>
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: constellation?.color }}
            />
            <span className="text-sm text-white">{constellation?.name}</span>
          </div>
        </div>

        {/* Orbit Info */}
        <div className="p-3 bg-space-darker rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-xs text-space-cyan mb-2">
            <Radio className="w-3.5 h-3.5" />
            <span>Orbital Parameters</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Orbit Type</span>
              <p className="text-white">{satellite.orbitType}</p>
            </div>
            <div>
              <span className="text-gray-500">Altitude</span>
              <p className="text-white">{satellite.altitude.toLocaleString()} km</p>
            </div>
            <div>
              <span className="text-gray-500">Inclination</span>
              <p className="text-white">{satellite.inclination.toFixed(1)}°</p>
            </div>
            <div>
              <span className="text-gray-500">Period</span>
              <p className="text-white">{satellite.period.toFixed(0)} min</p>
            </div>
          </div>
        </div>

        {/* Position */}
        <div className="p-3 bg-space-darker rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-xs text-space-cyan mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>Current Position</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Lat</span>
              <p className="text-white">{satellite.position.lat.toFixed(2)}°</p>
            </div>
            <div>
              <span className="text-gray-500">Lng</span>
              <p className="text-white">{satellite.position.lng.toFixed(2)}°</p>
            </div>
            <div>
              <span className="text-gray-500">Velocity</span>
              <p className="text-white">{satellite.velocity.toFixed(2)} km/s</p>
            </div>
          </div>
        </div>

        {/* Launch Date */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>Launched: {satellite.launchDate.toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default SatelliteInfo;
