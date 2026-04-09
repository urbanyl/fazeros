import React, { useState, useEffect } from 'react';
import { Clock, Cpu, CloudRain, Calculator, StickyNote, HardDrive, Sun, Cloud, CloudSnow, CloudLightning, Edit2, Loader2 } from 'lucide-react';
import { useTheme, accentColors } from '../../contexts/ThemeContext';

export function ClockWidget() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#1a1d24]/80 backdrop-blur-md border border-[#2a2e38] rounded-xl p-4 shadow-lg w-full h-full flex flex-col justify-center">
      <div className="flex items-center gap-2 mb-2 text-slate-400">
        <Clock className="w-4 h-4" />
        <span className="text-xs font-medium uppercase tracking-wider">Horloge Système</span>
      </div>
      <div className="text-4xl font-light text-slate-200 tracking-tight">
        {time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
      <div className="text-sm text-slate-400 mt-1">
        {time.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
}

export function CpuWidget() {
  const [usage, setUsage] = useState(0);
  const { accent } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => {
      setUsage(prev => {
        const diff = (Math.random() - 0.5) * 20;
        return Math.max(5, Math.min(95, prev + diff));
      });
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#1a1d24]/80 backdrop-blur-md border border-[#2a2e38] rounded-xl p-4 shadow-lg w-full h-full flex flex-col justify-center">
      <div className="flex items-center justify-between mb-3 text-slate-400">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wider">CPU Usage</span>
        </div>
        <span className="text-xs font-mono">{usage.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-[#0f1115] rounded-full h-2 overflow-hidden">
        <div 
          className={`h-2 rounded-full transition-all duration-1000 ${accentColors[accent]}`} 
          style={{ width: `${usage}%` }}
        ></div>
      </div>
    </div>
  );
}

export function RamWidget() {
  const [usage, setUsage] = useState(30);
  const { accent } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => {
      setUsage(prev => Math.max(20, Math.min(80, prev + (Math.random() - 0.5) * 5)));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#1a1d24]/80 backdrop-blur-md border border-[#2a2e38] rounded-xl p-4 shadow-lg w-full h-full flex flex-col justify-center">
      <div className="flex items-center justify-between mb-3 text-slate-400">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wider">RAM Usage</span>
        </div>
        <span className="text-xs font-mono">{(usage / 10).toFixed(1)} GB / 16 GB</span>
      </div>
      <div className="w-full bg-[#0f1115] rounded-full h-2 overflow-hidden">
        <div 
          className={`h-2 rounded-full transition-all duration-1000 ${accentColors[accent]}`} 
          style={{ width: `${usage}%` }}
        ></div>
      </div>
    </div>
  );
}

export function WeatherWidget() {
  const [city, setCity] = useState(() => localStorage.getItem('fazer_weather_city') || 'Paris');
  const [displayCity, setDisplayCity] = useState(city);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(city);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weather, setWeather] = useState<{ temp: number; humidity: number; wind: number; code: number } | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchWeather = async () => {
      try {
        setLoading(true);
        // Geocoding pour trouver les coordonnées de la ville
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fr&format=json`);
        const geoData = await geoRes.json();
        
        if (!geoData.results || geoData.results.length === 0) {
          if (mounted) {
            setError('Ville introuvable');
            setLoading(false);
          }
          return;
        }
        
        const { latitude, longitude, name } = geoData.results[0];
        if (mounted) {
          setDisplayCity(name);
          localStorage.setItem('fazer_weather_city', name);
        }
        
        // Météo actuelle avec l'API Open-Meteo
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`);
        const weatherData = await weatherRes.json();
        
        if (mounted) {
          setWeather({
            temp: weatherData.current.temperature_2m,
            humidity: weatherData.current.relative_humidity_2m,
            wind: weatherData.current.wind_speed_10m,
            code: weatherData.current.weather_code
          });
          setError(null);
        }
      } catch (err) {
        if (mounted) setError('Erreur réseau');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchWeather();
    // Rafraîchir toutes les 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [city]);

  const handleSubmit = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (editValue.trim()) {
      setCity(editValue.trim());
    }
    setIsEditing(false);
  };

  const getWeatherInfo = (code: number) => {
    switch (true) {
      case code === 0: return { desc: 'Ciel clair', Icon: Sun, color: 'text-yellow-400' };
      case code === 1 || code === 2 || code === 3: return { desc: 'Nuageux', Icon: Cloud, color: 'text-slate-300' };
      case code === 45 || code === 48: return { desc: 'Brouillard', Icon: Cloud, color: 'text-slate-400' };
      case code >= 51 && code <= 67: return { desc: 'Bruine', Icon: CloudRain, color: 'text-blue-300' };
      case code >= 71 && code <= 77: return { desc: 'Neige', Icon: CloudSnow, color: 'text-white' };
      case code >= 80 && code <= 82: return { desc: 'Averses', Icon: CloudRain, color: 'text-blue-400' };
      case code >= 85 && code <= 86: return { desc: 'Averses de neige', Icon: CloudSnow, color: 'text-white' };
      case code >= 95 && code <= 99: return { desc: 'Orage', Icon: CloudLightning, color: 'text-purple-400' };
      default: return { desc: 'Inconnu', Icon: Cloud, color: 'text-slate-400' };
    }
  };

  const weatherInfo = weather ? getWeatherInfo(weather.code) : { desc: 'Chargement...', Icon: Cloud, color: 'text-slate-400' };
  const CurrentIcon = weatherInfo.Icon;

  return (
    <div className="bg-[#1a1d24]/80 backdrop-blur-md border border-[#2a2e38] rounded-xl p-4 shadow-lg w-full h-full flex flex-col justify-center relative group">
      <div className="flex items-center justify-between mb-2 text-slate-400">
        <div className="flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin text-blue-400" /> : <CurrentIcon className={`w-4 h-4 ${weatherInfo.color}`} />}
          <span className="text-xs font-medium uppercase tracking-wider">Météo</span>
        </div>
        
        {isEditing ? (
          <form onSubmit={handleSubmit} className="flex items-center" onMouseDown={(e) => e.stopPropagation()}>
            <input
              type="text"
              autoFocus
              className="bg-[#0f1115] border border-blue-500/50 rounded px-2 py-0.5 text-xs text-white outline-none w-24"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSubmit}
              onKeyDown={(e) => e.key === 'Escape' && setIsEditing(false)}
            />
          </form>
        ) : (
          <div 
            className="text-xs flex items-center gap-1 cursor-pointer hover:text-white transition-colors"
            onClick={() => {
              setEditValue(displayCity);
              setIsEditing(true);
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <span className="truncate max-w-[80px]">{displayCity}</span>
            <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>
      
      {error ? (
        <div className="flex-1 flex items-center justify-center text-sm text-red-400 text-center">
          {error}
        </div>
      ) : weather ? (
        <>
          <div className="flex items-end gap-3 mt-2">
            <div className="text-4xl font-light text-slate-200">{Math.round(weather.temp)}°C</div>
            <div className="text-sm text-slate-400 mb-1 truncate">{weatherInfo.desc}</div>
          </div>
          <div className="text-xs text-slate-500 mt-3 flex justify-between">
            <span>Hum: {weather.humidity}%</span>
            <span>Vent: {Math.round(weather.wind)} km/h</span>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
          Recherche...
        </div>
      )}
    </div>
  );
}

export function NotesWidget() {
  const [note, setNote] = useState(() => localStorage.getItem('fazer_note') || '');

  useEffect(() => {
    localStorage.setItem('fazer_note', note);
  }, [note]);

  return (
    <div className="bg-yellow-900/20 backdrop-blur-md border border-yellow-700/30 rounded-xl p-3 shadow-lg w-full h-full flex flex-col">
      <div className="flex items-center gap-2 mb-2 text-yellow-500/80">
        <StickyNote className="w-4 h-4" />
        <span className="text-xs font-medium uppercase tracking-wider">Notes Rapides</span>
      </div>
      <textarea 
        className="flex-1 bg-transparent resize-none outline-none text-sm text-yellow-100/90 placeholder-yellow-500/40"
        placeholder="Écrivez quelque chose ici..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onMouseDown={(e) => e.stopPropagation()} // Prevent drag when typing
      />
    </div>
  );
}

export function CalculatorWidget() {
  const [display, setDisplay] = useState('0');

  const handleInput = (val: string) => {
    setDisplay(prev => {
      if (prev === 'Error') return val === '.' ? '0.' : val;
      if (prev === '0') return val === '.' ? '0.' : val;
      return prev + val;
    });
  };

  const calculate = () => {
    setDisplay(prev => {
      if (prev === 'Error') return '0';
      try {
        return String(new Function('return ' + prev)());
      } catch (e) {
        return 'Error';
      }
    });
  };

  const clear = () => setDisplay('0');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent listening when user is typing in an input or textarea
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key;
      if (/^[0-9+\-*/.]$/.test(key)) {
        handleInput(key);
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calculate();
      } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        clear();
      } else if (key === 'Backspace') {
        setDisplay(prev => prev.length > 1 && prev !== 'Error' ? prev.slice(0, -1) : '0');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="bg-[#1a1d24]/90 backdrop-blur-md border border-[#2a2e38] rounded-xl p-3 shadow-lg w-full h-full flex flex-col">
      <div className="bg-[#0f1115] rounded p-2 text-right text-lg font-mono text-white mb-2 overflow-hidden truncate">
        {display}
      </div>
      <div 
        className="grid grid-cols-4 gap-1 flex-1"
        onMouseDown={(e) => e.stopPropagation()} // Prevent drag when clicking buttons
      >
        {['7','8','9','/','4','5','6','*','1','2','3','-','C','0','=','+'].map(btn => (
          <button 
            key={btn}
            onClick={() => {
              if(btn === 'C') clear();
              else if(btn === '=') calculate();
              else handleInput(btn);
            }}
            className="bg-white/5 hover:bg-white/10 rounded text-sm font-medium transition-colors"
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
}

export type WidgetType = 'clock' | 'cpu' | 'ram' | 'weather' | 'notes' | 'calculator';

export const WIDGET_REGISTRY: Record<WidgetType, { name: string; icon: React.ElementType; component: React.ReactNode; defaultWidth: number; defaultHeight: number }> = {
  clock: { name: 'Horloge', icon: Clock, component: <ClockWidget />, defaultWidth: 280, defaultHeight: 140 },
  cpu: { name: 'Moniteur CPU', icon: Cpu, component: <CpuWidget />, defaultWidth: 280, defaultHeight: 120 },
  ram: { name: 'Moniteur RAM', icon: HardDrive, component: <RamWidget />, defaultWidth: 280, defaultHeight: 120 },
  weather: { name: 'Météo', icon: CloudRain, component: <WeatherWidget />, defaultWidth: 280, defaultHeight: 150 },
  notes: { name: 'Pense-bête', icon: StickyNote, component: <NotesWidget />, defaultWidth: 250, defaultHeight: 200 },
  calculator: { name: 'Calculatrice', icon: Calculator, component: <CalculatorWidget />, defaultWidth: 220, defaultHeight: 260 },
};
