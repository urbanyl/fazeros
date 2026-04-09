import { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Server, Zap, X, Shield, Database } from 'lucide-react';
import { useTheme, accentColors, textColors } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';

interface TaskManagerProps {
  apps?: any[];
  closeApp?: (id: any) => void;
}

export default function TaskManager({ apps = [], closeApp = () => {} }: TaskManagerProps) {
  const { accent } = useTheme();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<'processes' | 'performance' | 'services'>('processes');
  const [, setMetrics] = useState({
    cpu: 0,
    ram: 0,
    disk: 0,
    network: 0
  });

  // Calculate real metrics based on open apps
  useEffect(() => {
    const interval = setInterval(() => {
      const openAppsCount = apps.filter(a => a.isOpen).length;
      
      setMetrics({
        cpu: Math.min(100, Math.floor(5 + openAppsCount * 8 + Math.random() * 15)),
        ram: Math.min(100, Math.floor(15 + openAppsCount * 12 + Math.random() * 5)),
        disk: Math.floor(Math.random() * 30),
        network: Math.floor(Math.random() * 50)
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [apps]);

  // Generate processes list based on REAL open apps
  const getProcesses = () => {
    const openApps = apps.filter(a => a.isOpen);
    
    // Add some system background processes
    const processes = [
      { id: 'sys-kernel', name: 'Noyau FazerOS', type: 'system', cpu: 1.2, ram: 145, status: 'En cours', isKillable: false },
      { id: 'sys-ui', name: 'Gestionnaire de fen\u00eatres', type: 'system', cpu: 2.5, ram: 85, status: 'En cours', isKillable: false },
      { id: 'sys-vfs', name: 'VFS Daemon', type: 'system', cpu: 0.1, ram: 42, status: 'En cours', isKillable: false },
    ];

    // Add user apps
    openApps.forEach(app => {
      let cpuBase = 0;
      let ramBase = 0;
      
      switch(app.id) {
        case 'browser': cpuBase = 12; ramBase = 350; break;
        case 'terminal': cpuBase = 1; ramBase = 45; break;
        case 'explorer': cpuBase = 2; ramBase = 65; break;
        case 'network': cpuBase = 8; ramBase = 120; break;
        case 'quarantine': cpuBase = 5; ramBase = 90; break;
        case 'taskmanager': cpuBase = 4; ramBase = 55; break;
        case 'settings': cpuBase = 1; ramBase = 40; break;
        case 'texteditor': cpuBase = 1; ramBase = 35; break;
        default: cpuBase = 2; ramBase = 50;
      }

      processes.push({
        id: app.id,
        name: app.title,
        type: 'app',
        cpu: +(cpuBase + Math.random() * 2).toFixed(1),
        ram: Math.floor(ramBase + Math.random() * 20),
        status: 'En cours',
        isKillable: true
      });
    });

    return processes.sort((a, b) => b.ram - a.ram);
  };

  return (
    <div className="flex-1 flex w-full h-full bg-[#1e1e1e] text-slate-200">
      {/* Sidebar */}
      <div className="w-64 bg-[#252526] border-r border-[#333] flex flex-col">
        <div className="p-4 border-b border-[#333]">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Gestionnaire
          </h2>
          <p className="text-xs text-slate-400 mt-1">Surveillance Système Fazer OS</p>
        </div>
        
        <div className="flex flex-col gap-1 p-2 flex-1">
          <button 
            onClick={() => setActiveTab('processes')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium w-full text-left transition-colors ${activeTab === 'processes' ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <Server className="w-4 h-4" />
            Processus & Mémoire
          </button>
          <button 
            onClick={() => setActiveTab('performance')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium w-full text-left transition-colors ${activeTab === 'performance' ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <Activity className="w-4 h-4" />
            Performance
          </button>
          <button 
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium w-full text-left transition-colors ${activeTab === 'services' ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <Database className="w-4 h-4" />
            Services Système
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'processes' && (
          <>
            <div className="p-4 border-b border-[#333] flex justify-between items-center bg-[#252526]">
              <h3 className="font-medium text-slate-300">Processus en cours</h3>
              <button className="px-3 py-1.5 bg-red-500/20 text-red-400 text-sm rounded hover:bg-red-500/30 transition-colors">
                Fin de tâche
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="text-xs text-slate-400 uppercase bg-[#2d2d30] sticky top-0 shadow-md">
                  <tr>
                    <th className="px-4 py-3 font-medium border-b border-[#333]">Nom du processus</th>
                    <th className="px-4 py-3 font-medium border-b border-[#333] text-right">CPU</th>
                    <th className="px-4 py-3 font-medium border-b border-[#333] text-right">Mémoire</th>
                    <th className="px-4 py-3 font-medium border-b border-[#333]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {getProcesses().map((proc, index) => (
                    <tr key={`${proc.id}-${index}`} className="border-b border-[#333]/50 hover:bg-white/5 transition-colors group">
                      <td className="px-4 py-3 text-slate-300 flex items-center gap-2">
                        {proc.type === 'system' ? <Server className="w-4 h-4 text-slate-500" /> : <Zap className={`w-4 h-4 ${textColors[accent]}`} />}
                        {proc.name}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-400">{proc.cpu.toFixed(1)}%</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-400">{proc.ram} Mo</td>
                      <td className="px-4 py-3">
                        {proc.isKillable ? (
                          <button 
                            onClick={() => {
                              closeApp(proc.id);
                              showNotification('Processus arrêté', `L'application ${proc.name} a été fermée.`, 'warning');
                            }}
                            className="p-1 rounded text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                            title="Fin de tâche"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-xs text-slate-600 italic px-2">Système</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'performance' && (
          <div className="flex-1 p-8 overflow-y-auto flex flex-col gap-8">
            <h3 className="text-lg font-medium text-slate-300">Ressources Système</h3>
            
            <div className="grid grid-cols-2 gap-6">
              {/* CPU Graph */}
              <div className="bg-[#252526] p-6 rounded-xl border border-[#333]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Cpu className={`w-6 h-6 ${textColors[accent]}`} />
                    <div>
                      <h4 className="font-medium text-slate-200">CPU (Processeur)</h4>
                      <p className="text-xs text-slate-400">AMD Ryzen 9 7950X</p>
                    </div>
                  </div>
                  <div className="text-2xl font-light">{(Math.random() * 20 + 5).toFixed(0)}%</div>
                </div>
                <div className="h-32 flex items-end gap-1 opacity-80">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className={`w-full ${accentColors[accent]} rounded-t-sm transition-all duration-500`} style={{ height: `${Math.random() * 100}%` }}></div>
                  ))}
                </div>
              </div>

              {/* RAM Graph */}
              <div className="bg-[#252526] p-6 rounded-xl border border-[#333]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <HardDrive className={`w-6 h-6 ${textColors[accent]}`} />
                    <div>
                      <h4 className="font-medium text-slate-200">Mémoire (RAM)</h4>
                      <p className="text-xs text-slate-400">DDR5 6000MHz</p>
                    </div>
                  </div>
                  <div className="text-2xl font-light">14.2 Go <span className="text-sm text-slate-500">/ 32.0 Go</span></div>
                </div>
                <div className="h-32 flex items-end gap-1 opacity-80">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className={`w-full ${accentColors[accent]} rounded-t-sm transition-all duration-500`} style={{ height: `${Math.random() * 30 + 40}%` }}></div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#252526] p-6 rounded-xl border border-[#333]">
              <h4 className="font-medium text-slate-200 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-slate-400" />
                Sécurité & Pilotes
              </h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="text-slate-400 mb-1">Antivirus Intégré</div>
                  <div className="text-green-400 font-medium">Actif et à jour</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="text-slate-400 mb-1">Pare-feu Fazer</div>
                  <div className="text-green-400 font-medium">Protection Stricte</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="text-slate-400 mb-1">Gestion d'énergie</div>
                  <div className="text-blue-400 font-medium">Profil Performance</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="flex-1 p-6 overflow-y-auto">
            <h3 className="text-lg font-medium text-slate-300 mb-6">Services Système</h3>
            <div className="bg-[#252526] rounded-xl border border-[#333] overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-[#2d2d30] border-b border-[#333]">
                  <tr>
                    <th className="px-4 py-3">Nom du service</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 'fazer-shield', name: 'Fazer Shield', desc: 'Protection Antivirus en temps réel', status: 'En cours', color: 'text-green-400' },
                    { id: 'fazer-firewall', name: 'Pare-feu Réseau', desc: 'Filtrage des paquets entrants/sortants', status: 'En cours', color: 'text-green-400' },
                    { id: 'vfs-daemon', name: 'VFS Daemon', desc: 'Gestionnaire du système de fichiers virtuel', status: 'En cours', color: 'text-green-400' },
                    { id: 'docker-mock', name: 'Conteneur Docker (Simulé)', desc: 'Service de virtualisation', status: 'Arrêté', color: 'text-slate-400' },
                    { id: 'ssh-server', name: 'Serveur OpenSSH', desc: 'Accès distant sécurisé', status: 'Arrêté', color: 'text-slate-400' },
                  ].map((service) => (
                    <tr key={service.id} className="border-b border-[#333] hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-200">{service.name}</td>
                      <td className="px-4 py-3 text-slate-400">{service.desc}</td>
                      <td className="px-4 py-3 font-medium">
                        <span className={service.color}>{service.status}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-slate-300 transition-colors">
                          {service.status === 'En cours' ? 'Arrêter' : 'Démarrer'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
