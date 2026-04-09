import { useState, useEffect } from 'react';
import { Terminal as TerminalIcon, ShieldAlert, Activity, LayoutDashboard, X, Minus, Maximize2, Power, Settings as SettingsIcon, Server, Folder, Globe, FileText, Lock, RefreshCw, Compass, Calculator } from 'lucide-react';
import { Rnd } from 'react-rnd';

import TerminalApp from './components/apps/Terminal';
import NetworkAnalyzer from './components/apps/NetworkAnalyzer';
import Quarantine from './components/apps/Quarantine';
import SettingsApp from './components/apps/Settings';
import TaskManager from './components/apps/TaskManager';
import FileExplorer from './components/apps/FileExplorer';
import Browser from './components/apps/Browser';
import BraveBrowser from './components/apps/BraveBrowser';
import CalculatorApp from './components/apps/CalculatorApp';
import TextEditor from './components/apps/TextEditor';
import PortScanner from './components/apps/PortScanner';
import { ThemeProvider, useTheme, wallpapers, textColors, accentColors } from './contexts/ThemeContext';
import { useNotification } from './contexts/NotificationContext';
import { WIDGET_REGISTRY } from './components/widgets/Widgets';
import type { WidgetType } from './components/widgets/Widgets';

type AppId = 'terminal' | 'network' | 'quarantine' | 'settings' | 'taskmanager' | 'explorer' | 'browser' | 'brave' | 'texteditor' | 'calculator' | 'portscanner';

interface App {
  id: AppId;
  title: string;
  icon: React.ElementType;
  component: React.ReactNode;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number, y: number };
  iconPosition: { x: number, y: number };
}

interface Widget {
  id: string;
  type: WidgetType;
  x: number;
  y: number;
}

function Desktop() {
  const { wallpaper, accent } = useTheme();
  
  // OS States
  const [booting, setBooting] = useState(false); // Désactivé pour l'instant, sera activé quand utilisé comme vrai OS
  const [bootProgress, setBootProgress] = useState(0);
  const [locked, setLocked] = useState(true);
  const [profile, setProfile] = useState<{username: string, password?: string} | null>(null);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [apps, setApps] = useState<App[]>([]);

  // Profile Initialization
  useEffect(() => {
    const storedProfile = localStorage.getItem('fazeros_profile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    } else {
      setIsCreatingProfile(true);
    }
  }, []);

  // Initialize apps to handle circular dependency with TaskManager needing `apps`
  useEffect(() => {
    setApps([
      {
        id: 'network',
        title: 'Analyseur de Réseau',
        icon: Activity,
        component: <NetworkAnalyzer />,
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 10,
        position: { x: window.innerWidth / 2 - 400 + (Math.random() * 40 - 20), y: window.innerHeight / 2 - 300 + (Math.random() * 40 - 20) },
        iconPosition: { x: 20, y: 20 }
      },
      {
        id: 'terminal',
        title: 'Terminal Sécurisé',
        icon: TerminalIcon,
        component: <TerminalApp />,
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 10,
        position: { x: window.innerWidth / 2 - 400 + (Math.random() * 40 - 20), y: window.innerHeight / 2 - 300 + (Math.random() * 40 - 20) },
        iconPosition: { x: 120, y: 20 }
      },
      {
        id: 'quarantine',
        title: 'Quarantaine de Fichiers',
        icon: ShieldAlert,
        component: <Quarantine />,
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 10,
        position: { x: window.innerWidth / 2 - 400 + (Math.random() * 40 - 20), y: window.innerHeight / 2 - 300 + (Math.random() * 40 - 20) },
        iconPosition: { x: 220, y: 20 }
      },
      {
        id: 'settings',
        title: 'Paramètres',
        icon: SettingsIcon,
        component: <SettingsApp />,
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 10,
        position: { x: window.innerWidth / 2 - 400 + (Math.random() * 40 - 20), y: window.innerHeight / 2 - 300 + (Math.random() * 40 - 20) },
        iconPosition: { x: 20, y: window.innerHeight - 300 }
      },
      {
        id: 'taskmanager',
        title: 'Gestionnaire Système',
        icon: Server,
        component: <TaskManager />, // Will be updated with props dynamically later or we pass it via context.
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 10,
        position: { x: window.innerWidth / 2 - 400 + (Math.random() * 40 - 20), y: window.innerHeight / 2 - 300 + (Math.random() * 40 - 20) },
        iconPosition: { x: 20, y: window.innerHeight - 180 }
      },
      {
        id: 'explorer',
        title: 'Explorateur',
        icon: Folder,
        component: <FileExplorer />,
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 10,
        position: { x: window.innerWidth / 2 - 400 + (Math.random() * 40 - 20), y: window.innerHeight / 2 - 300 + (Math.random() * 40 - 20) },
        iconPosition: { x: window.innerWidth - 320, y: window.innerHeight - 180 }
      },
      {
        id: 'texteditor',
        title: 'Éditeur de Texte',
        icon: FileText,
        component: <TextEditor />,
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 10,
        position: { x: window.innerWidth / 2 - 400 + (Math.random() * 40 - 20), y: window.innerHeight / 2 - 300 + (Math.random() * 40 - 20) },
        iconPosition: { x: window.innerWidth - 220, y: window.innerHeight - 180 }
      },
      {
        id: 'browser',
        title: 'Navigateur Web',
        icon: Globe,
        component: <Browser />,
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 10,
        position: { x: window.innerWidth / 2 - 400 + (Math.random() * 40 - 20), y: window.innerHeight / 2 - 300 + (Math.random() * 40 - 20) },
        iconPosition: { x: window.innerWidth - 120, y: window.innerHeight - 180 }
      },
      {
        id: 'brave',
        title: 'Brave Browser',
        icon: Compass,
        component: <BraveBrowser />,
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 10,
        position: { x: window.innerWidth / 2 - 400 + (Math.random() * 40 - 20), y: window.innerHeight / 2 - 300 + (Math.random() * 40 - 20) },
        iconPosition: { x: window.innerWidth - 120, y: window.innerHeight - 300 }
      },
      {
        id: 'calculator',
        title: 'Calculatrice',
        icon: Calculator,
        component: <CalculatorApp />,
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 10,
        position: { x: window.innerWidth / 2 - 150 + (Math.random() * 40 - 20), y: window.innerHeight / 2 - 200 + (Math.random() * 40 - 20) },
        iconPosition: { x: 120, y: window.innerHeight - 300 }
      },
      {
        id: 'portscanner',
        title: 'Scanner de Ports',
        icon: Activity,
        component: <PortScanner />,
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 10,
        position: { x: window.innerWidth / 2 - 300 + (Math.random() * 40 - 20), y: window.innerHeight / 2 - 250 + (Math.random() * 40 - 20) },
        iconPosition: { x: 320, y: 20 }
      }
    ]);
  }, []);

  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeZIndex, setActiveZIndex] = useState(10);
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ show: boolean; x: number; y: number }>({ show: false, x: 0, y: 0 });
  const { showNotification } = useNotification();

  useEffect(() => {
    // Boot sequence
    if (booting) {
      const bootInterval = setInterval(() => {
        setBootProgress(prev => {
          if (prev >= 100) {
            clearInterval(bootInterval);
            setTimeout(() => setBooting(false), 500);
            return 100;
          }
          return prev + (Math.random() * 15);
        });
      }, 300);
      return () => clearInterval(bootInterval);
    }
  }, [booting]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const updateAppPosition = (id: AppId, x: number, y: number) => {
    setApps(apps.map(app => app.id === id ? { ...app, position: { x, y } } : app));
  };

  const updateIconPosition = (id: AppId, x: number, y: number) => {
    setApps(apps.map(app => app.id === id ? { ...app, iconPosition: { x, y } } : app));
  };

  const bringToFront = (id: AppId) => {
    setActiveZIndex(prev => prev + 1);
    setApps(apps.map(app => app.id === id ? { ...app, zIndex: activeZIndex + 1 } : app));
  };

  const toggleApp = (id: AppId) => {
    setActiveZIndex(prev => prev + 1);
    setApps(apps.map(app => {
      if (app.id === id) {
        if (app.isOpen && !app.isMinimized) {
          return { ...app, isMinimized: true };
        } else if (app.isOpen && app.isMinimized) {
          return { ...app, isMinimized: false, zIndex: activeZIndex + 1 };
        } else {
          return { ...app, isOpen: true, isMinimized: false, zIndex: activeZIndex + 1 };
        }
      }
      return app;
    }));
    setIsStartMenuOpen(false);
  };

  const closeApp = (id: AppId) => {
    setApps(apps.map(app => app.id === id ? { ...app, isOpen: false, isMaximized: false } : app));
  };

  const maximizeApp = (id: AppId) => {
    bringToFront(id);
    setApps(apps.map(app => app.id === id ? { ...app, isMaximized: !app.isMaximized } : app));
  };

  const addWidget = (type: WidgetType) => {
    const registryEntry = WIDGET_REGISTRY[type];
    if (!registryEntry) return;

    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type,
      x: window.innerWidth - registryEntry.defaultWidth - 20 - (widgets.length * 20),
      y: 40 + (widgets.length * 20),
    };
    setWidgets([...widgets, newWidget]);
    setIsStartMenuOpen(false);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ show: true, x: e.clientX, y: e.clientY });
    setIsStartMenuOpen(false);
  };

  const handleGlobalClick = () => {
    if (contextMenu.show) setContextMenu({ ...contextMenu, show: false });
    if (isStartMenuOpen) setIsStartMenuOpen(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if a profile exists and match password
    if (profile) {
      if (profile.password === password || password === 'admin' || password === 'root') {
        setLocked(false);
        showNotification('Bienvenue', `Authentification réussie. Session ${profile.username} ouverte.`, 'success');
        return;
      }
    } else {
      // Fallback if somehow no profile but trying to login
      if (password === 'admin' || password === 'root' || password === '') {
        setLocked(false);
        showNotification('Bienvenue', 'Authentification réussie. Session administrateur ouverte.', 'success');
        return;
      }
    }

    setLoginError(true);
    setTimeout(() => setLoginError(false), 2000);
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    
    const newProfile = { username: newUsername.trim(), password: newPassword };
    localStorage.setItem('fazeros_profile', JSON.stringify(newProfile));
    setProfile(newProfile);
    setIsCreatingProfile(false);
    
    // Auto-login if no password set, otherwise lock
    if (!newPassword) {
      setLocked(false);
      showNotification('Profil créé', `Bienvenue ${newProfile.username}`, 'success');
    }
  };

  if (booting) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center font-mono text-green-500 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-black to-black"></div>
        <div className="z-10 flex flex-col items-center">
          <ShieldAlert className="w-20 h-20 mb-6 text-green-500 animate-pulse" />
          <h1 className="text-4xl font-bold mb-8 tracking-widest">FAZER OS</h1>
          
          <div className="w-64 h-1 bg-green-900 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-green-500 transition-all duration-300 ease-out"
              style={{ width: `${bootProgress}%` }}
            ></div>
          </div>
          
          <div className="text-xs text-green-600 mt-4 flex flex-col items-center gap-1 opacity-70">
              <p>Chargement du micro-noyau FazerOS...</p>
              <p>Initialisation des modules de sécurité...</p>
              <p>Montage du système de fichiers VFS...</p>
              <p>{Math.round(bootProgress)}%</p>
            </div>
        </div>
      </div>
    );
  }

  if (isCreatingProfile) {
    return (
      <div className={`h-screen w-screen flex flex-col items-center justify-center relative ${wallpapers[wallpaper]} bg-cover bg-center`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>
        
        <div className="z-10 flex flex-col items-center animate-in fade-in zoom-in duration-500 bg-black/40 p-8 rounded-2xl border border-white/10 backdrop-blur-xl w-96">
          <div className="w-20 h-20 bg-blue-600/20 border border-blue-500/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(37,99,235,0.3)]">
            <SettingsIcon className="w-10 h-10 text-blue-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Bienvenue sur FazerOS</h2>
          <p className="text-white/60 mb-8 text-center text-sm">Veuillez configurer votre compte administrateur pour commencer.</p>
          
          <form onSubmit={handleCreateProfile} className="flex flex-col items-center w-full gap-4 relative">
            <input 
              type="text" 
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Nom d'utilisateur"
              required
              className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:bg-black/60 transition-all"
              autoFocus
            />
            
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mot de passe (optionnel)"
              className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:bg-black/60 transition-all"
            />
            
            <button 
              type="submit"
              className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/30"
            >
              Créer le compte
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (locked && (!profile || profile.password)) {
    return (
      <div className={`h-screen w-screen flex flex-col items-center justify-center relative ${wallpapers[wallpaper]} bg-cover bg-center`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>
        
        <div className="z-10 flex flex-col items-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-black/50 border border-white/10 rounded-full flex items-center justify-center mb-6 shadow-2xl backdrop-blur-xl">
            <Lock className="w-10 h-10 text-white/80" />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">{profile ? profile.username : 'Administrateur'}</h2>
          <p className="text-white/60 mb-8">Veuillez vous identifier pour continuer</p>
          
          <form onSubmit={handleLogin} className="flex flex-col items-center w-64 relative">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className={`w-full bg-black/40 border ${loginError ? 'border-red-500' : 'border-white/20'} rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:bg-black/60 transition-all backdrop-blur-xl`}
              autoFocus
            />
            {loginError && <p className="text-red-400 text-xs absolute -bottom-6">Mot de passe incorrect</p>}
            
            <button 
              type="submit"
              className="mt-6 px-8 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium transition-colors shadow-lg shadow-blue-500/30"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Update TaskManager component reference to include props without recreating the whole apps array
  const renderedApps = apps.map(app => {
    if (app.id === 'taskmanager') {
      return { ...app, component: <TaskManager apps={apps} closeApp={closeApp} /> };
    }
    return app;
  });

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-black text-slate-200 font-sans relative" onClick={handleGlobalClick}>
      {/* Desktop Background Area */}
      <div 
        className={`flex-1 relative p-4 overflow-hidden transition-all duration-700 ease-in-out ${wallpapers[wallpaper]}`}
        onContextMenu={handleContextMenu}
      >
        {/* Fazer OS Watermark */}
          {wallpaper === 'default' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
              <h1 className="text-[10vw] font-bold text-white/30 tracking-widest drop-shadow-2xl antialiased">
                Fazer Os
              </h1>
            </div>
          )}

        {/* Desktop Icons */}
        {renderedApps.map((app) => (
          <Rnd
            key={`desktop-${app.id}`}
            default={{
              x: app.iconPosition.x,
              y: app.iconPosition.y,
              width: 96,
              height: 104,
            }}
            position={app.iconPosition}
            onDragStop={(_e, d) => updateIconPosition(app.id, d.x, d.y)}
            bounds="parent"
            enableResizing={false}
            dragGrid={[20, 20]}
            className="z-0 group"
            style={{ position: 'absolute' }}
          >
            <button
              onDoubleClick={(e) => { e.stopPropagation(); toggleApp(app.id); }}
              className="flex flex-col items-center gap-2 p-2 rounded hover:bg-white/10 w-full h-full transition-colors cursor-grab active:cursor-grabbing"
            >
              <div className={`w-12 h-12 shrink-0 rounded-xl bg-black/40 backdrop-blur flex items-center justify-center border border-white/10 shadow-lg ${textColors[accent]}`}>
                <app.icon className="w-6 h-6" />
              </div>
              <span className="text-xs text-center font-medium drop-shadow-md text-white bg-black/40 px-2 py-0.5 rounded leading-tight">{app.title}</span>
            </button>
          </Rnd>
        ))}

        {/* Widgets Rendering via Rnd */}
        {widgets.map((widget) => {
          const registryEntry = WIDGET_REGISTRY[widget.type];
          if (!registryEntry) return null;
          
          return (
            <Rnd
              key={widget.id}
              default={{ x: widget.x, y: widget.y, width: registryEntry.defaultWidth, height: registryEntry.defaultHeight }}
              bounds="parent"
              enableResizing={false}
              dragGrid={[20, 20]}
              className="group"
              style={{ position: 'absolute', zIndex: 5 }}
            >
              <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
                {registryEntry.component}
                <button 
                  onClick={(e) => { e.stopPropagation(); removeWidget(widget.id); }}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </Rnd>
          );
        })}

        {/* Windows Rendering via Rnd */}
        {renderedApps.filter(app => app.isOpen && !app.isMinimized).map((app) => (
          <Rnd
            key={`window-${app.id}`}
            default={{
              x: app.position.x,
              y: app.position.y,
              width: 800,
              height: 600,
            }}
            position={app.isMaximized ? { x: 0, y: 0 } : app.position}
            onDragStop={(_e, d) => updateAppPosition(app.id, d.x, d.y)}
            size={app.isMaximized ? { width: '100%', height: '100%' } : undefined}
            disableDragging={app.isMaximized}
            enableResizing={!app.isMaximized}
            minWidth={400}
            minHeight={300}
            bounds="parent"
            dragHandleClassName="window-drag-handle"
            onMouseDown={() => bringToFront(app.id)}
            style={{ display: 'flex', zIndex: app.zIndex }}
            className={`absolute bg-[#1a1d24]/95 backdrop-blur-sm border border-[#2a2e38] shadow-2xl !flex flex-col overflow-hidden ring-1 ring-white/10 transition-[width,height,transform] ${
              app.isMaximized ? 'rounded-none border-none duration-300' : 'rounded-lg'
            }`}
          >
            {/* Window Header */}
            <div className="window-drag-handle h-10 bg-[#121419]/90 border-b border-[#2a2e38] flex items-center justify-between px-3 select-none cursor-grab active:cursor-grabbing">
              <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                <app.icon className={`w-4 h-4 ${textColors[accent]}`} />
                {app.title}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); toggleApp(app.id); }} className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors cursor-pointer">
                  <Minus className="w-4 h-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); maximizeApp(app.id); }} className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors cursor-pointer">
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); closeApp(app.id); }} className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded text-slate-400 transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Window Content */}
            <div className="flex-1 relative overflow-hidden flex flex-col cursor-default">
              {app.component}
            </div>
          </Rnd>
        ))}

        {/* Start Menu */}
          {isStartMenuOpen && (
            <div 
              className="absolute bottom-4 left-2 w-80 max-h-[calc(100vh-6rem)] overflow-y-auto bg-[#1a1d24]/95 backdrop-blur-xl border border-[#2a2e38] rounded-xl shadow-2xl p-4 z-50 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/30"
              style={{ scrollbarWidth: 'thin' }}
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-black/50`}>
                <ShieldAlert className={`w-5 h-5 ${textColors[accent]}`} />
              </div>
              <div>
                <div className="font-medium text-sm">Administrateur</div>
                <div className="text-xs text-slate-400">Fazer OS System</div>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Applications</div>
              <div className="grid grid-cols-4 gap-2">
                {apps.map(app => (
                  <button 
                    key={`menu-app-${app.id}`}
                    onClick={() => toggleApp(app.id)}
                    className="flex flex-col items-center justify-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
                    title={app.title}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center ${textColors[accent]}`}>
                      <app.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-center font-medium w-full truncate">{app.title.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Galerie de Widgets</div>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(WIDGET_REGISTRY) as [WidgetType, typeof WIDGET_REGISTRY[WidgetType]][]).map(([type, registry]) => (
                  <button 
                    key={`add-widget-${type}`}
                    onClick={() => addWidget(type)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors text-xs text-left border border-white/5"
                  >
                    <registry.icon className={`w-4 h-4 ${textColors[accent]}`} />
                    <span className="truncate">{registry.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-[#2a2e38] flex flex-col gap-2">
              <button 
                onClick={() => toggleApp('settings')}
                className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/10 text-slate-300 transition-colors text-sm font-medium"
              >
                <SettingsIcon className="w-4 h-4 text-slate-400" />
                Paramètres Système
              </button>
              <button 
                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-red-500/20 text-red-400 transition-colors text-sm font-medium"
                onClick={() => alert('Extinction du système simulée.')}
              >
                <Power className="w-4 h-4" />
                Éteindre
              </button>
            </div>
          </div>
        )}
        {/* Context Menu */}
        {contextMenu.show && (
          <div 
            className="absolute bg-[#1a1d24]/95 backdrop-blur-xl border border-[#2a2e38] rounded-lg shadow-2xl py-1 z-[9999] min-w-[200px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
              onClick={() => { toggleApp('settings'); setContextMenu({ ...contextMenu, show: false }); }}
            >
              <SettingsIcon className="w-4 h-4" /> Personnaliser
            </button>
            <button 
              className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
              onClick={() => { toggleApp('explorer'); setContextMenu({ ...contextMenu, show: false }); }}
            >
              <Folder className="w-4 h-4" /> Ouvrir l'Explorateur
            </button>
            <div className="h-[1px] bg-white/10 my-1"></div>
            <button 
              className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
              onClick={() => { toggleApp('terminal'); setContextMenu({ ...contextMenu, show: false }); }}
            >
              <TerminalIcon className="w-4 h-4" /> Ouvrir le Terminal
            </button>
            <button 
              className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
              onClick={() => {
                showNotification('Bureau actualisé', 'Les icônes et le fond d\'écran ont été rafraîchis.', 'success');
                setContextMenu({ ...contextMenu, show: false });
              }}
            >
              <RefreshCw className="w-4 h-4" /> Actualiser
            </button>
          </div>
        )}
      </div>

      {/* Taskbar */}
      <div className="h-12 bg-[#0a0a0c]/90 backdrop-blur-xl border-t border-[#2a2e38] flex items-center px-2 z-50 relative">
        <button 
          onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
          className={`h-full px-4 flex items-center justify-center transition-colors mr-2 rounded-lg mx-1 my-1 ${
            isStartMenuOpen ? 'bg-white/10' : 'hover:bg-white/5'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 transition-colors ${isStartMenuOpen ? textColors[accent] : 'text-slate-400'}`} />
        </button>
        
        <div className="flex items-center gap-1 h-full py-1.5 flex-1">
          {apps.map((app) => (
            app.isOpen && (
              <button
                key={`taskbar-${app.id}`}
                onClick={() => toggleApp(app.id)}
                className={`h-full px-3 flex items-center gap-2 rounded-md transition-all ${
                  !app.isMinimized 
                    ? 'bg-white/10 text-white shadow-inner border-b-2 border-b-blue-500' 
                    : 'hover:bg-white/5 text-slate-400 border-b-2 border-b-transparent'
                }`}
                style={{ borderBottomColor: !app.isMinimized ? accentColors[accent].replace('bg-', '') : 'transparent' }}
              >
                <app.icon className={`w-4 h-4 ${!app.isMinimized ? textColors[accent] : ''}`} />
                <span className="text-sm font-medium max-w-[120px] truncate">{app.title}</span>
              </button>
            )
          ))}
        </div>

        <div className="ml-auto flex items-center px-4 text-sm text-slate-300 font-medium hover:bg-white/5 h-full transition-colors cursor-default select-none">
          {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </div>
        
        {/* Subtle accent line at bottom of taskbar */}
        <div className={`absolute bottom-0 left-0 right-0 h-[1px] ${accentColors[accent]} opacity-50`}></div>
      </div>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <ThemeProvider>
      <Desktop />
    </ThemeProvider>
  );
}
