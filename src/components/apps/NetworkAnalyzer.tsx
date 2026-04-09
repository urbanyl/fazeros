import { useState, useEffect, useRef } from 'react';
import { Play, Square, Search, Trash2, Wifi, Activity, Share2, Server } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

export default function NetworkAnalyzer() {
  const [activeTab, setActiveTab] = useState<'ping' | 'traceroute' | 'arp' | 'netstat'>('ping');
  const [target, setTarget] = useState('1.1.1.1');
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isElectron, setIsElectron] = useState(false);
  const { showNotification } = useNotification();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsElectron(!!(window && (window as any).process && (window as any).process.type));
    setOutput(['FazerOS Network Analyzer - Pentest Edition', 'Sélectionnez un outil réseau pour commencer l\'analyse.']);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  const executeCommand = async (commandType: string) => {
    if (!isElectron) {
      showNotification('Erreur', 'L\'analyse réseau réelle nécessite la version native de FazerOS.', 'error');
      setOutput(prev => [...prev, '\n> ERREUR: Mode Web détecté. Outils réseaux natifs indisponibles.']);
      return;
    }

    if (!target && (commandType === 'ping' || commandType === 'traceroute')) {
      showNotification('Erreur', 'Veuillez entrer une adresse IP ou un nom de domaine valide.', 'error');
      return;
    }

    setIsRunning(true);
    let cmd = '';
    
    // Simple sanitization
    const safeTarget = target.replace(/[^a-zA-Z0-9.-]/g, '');

    switch (commandType) {
      case 'ping':
        cmd = `ping -n 4 ${safeTarget}`;
        setOutput(prev => [...prev, `\n> Exécution de Ping vers ${safeTarget}...`]);
        break;
      case 'traceroute':
        cmd = `tracert -d -w 1000 -h 15 ${safeTarget}`;
        setOutput(prev => [...prev, `\n> Exécution de Traceroute vers ${safeTarget}...`]);
        break;
      case 'arp':
        cmd = 'arp -a';
        setOutput(prev => [...prev, '\n> Analyse de la table ARP locale...']);
        break;
      case 'netstat':
        cmd = 'netstat -an | findstr "ESTABLISHED"';
        setOutput(prev => [...prev, '\n> Liste des connexions TCP actives...']);
        break;
    }

    try {
      const { ipcRenderer } = (window as any).require('electron');
      const result = await ipcRenderer.invoke('execute-command', cmd);
      
      if (result.stdout) {
        setOutput(prev => [...prev, ...result.stdout.split('\n')]);
      }
      if (result.stderr) {
        setOutput(prev => [...prev, `Erreur d'exécution: ${result.stderr}`]);
      }
      if (result.error) {
        setOutput(prev => [...prev, `Exception: ${result.error}`]);
      }
      
      setOutput(prev => [...prev, `> Opération terminée.`]);
    } catch (e: any) {
      setOutput(prev => [...prev, `> Erreur fatale: ${e.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleClear = () => {
    setOutput([]);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#1e1e1e] text-slate-300 font-mono text-sm">
      {/* Tabs */}
      <div className="flex bg-[#252526] border-b border-[#333]">
        <button 
          onClick={() => setActiveTab('ping')}
          className={`flex-1 py-2 flex items-center justify-center gap-2 ${activeTab === 'ping' ? 'bg-[#1e1e1e] text-blue-400 border-t-2 border-blue-500' : 'hover:bg-[#2a2a2b] text-slate-400'}`}
        >
          <Activity className="w-4 h-4" /> Ping
        </button>
        <button 
          onClick={() => setActiveTab('traceroute')}
          className={`flex-1 py-2 flex items-center justify-center gap-2 ${activeTab === 'traceroute' ? 'bg-[#1e1e1e] text-purple-400 border-t-2 border-purple-500' : 'hover:bg-[#2a2a2b] text-slate-400'}`}
        >
          <Share2 className="w-4 h-4" /> Traceroute
        </button>
        <button 
          onClick={() => setActiveTab('netstat')}
          className={`flex-1 py-2 flex items-center justify-center gap-2 ${activeTab === 'netstat' ? 'bg-[#1e1e1e] text-green-400 border-t-2 border-green-500' : 'hover:bg-[#2a2a2b] text-slate-400'}`}
        >
          <Server className="w-4 h-4" /> Connexions
        </button>
        <button 
          onClick={() => setActiveTab('arp')}
          className={`flex-1 py-2 flex items-center justify-center gap-2 ${activeTab === 'arp' ? 'bg-[#1e1e1e] text-orange-400 border-t-2 border-orange-500' : 'hover:bg-[#2a2a2b] text-slate-400'}`}
        >
          <Wifi className="w-4 h-4" /> Réseau Local
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 bg-[#1e1e1e] border-b border-[#333]">
        {(activeTab === 'ping' || activeTab === 'traceroute') && (
          <div className="flex items-center gap-2 flex-1 bg-[#252526] border border-[#444] rounded px-3 py-1.5 focus-within:border-blue-500 transition-colors">
            <Search className="w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Adresse IP ou domaine (ex: 8.8.8.8, google.com)"
              className="bg-transparent border-none outline-none text-white w-full"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              disabled={isRunning}
              onKeyDown={(e) => e.key === 'Enter' && !isRunning && executeCommand(activeTab)}
            />
          </div>
        )}
        
        <button 
          onClick={() => executeCommand(activeTab)}
          disabled={isRunning}
          className={`px-4 py-1.5 rounded flex items-center gap-2 font-medium ${isRunning ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
        >
          {isRunning ? <Square className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4" />}
          {isRunning ? 'En cours...' : 'Lancer'}
        </button>

        <button 
          onClick={handleClear}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
          title="Effacer l'historique"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Console Output */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm leading-relaxed bg-black/50 whitespace-pre-wrap select-text">
        {output.map((line, i) => (
          <div key={i} className={`${line.startsWith('>') ? 'text-blue-400 font-bold mt-2' : line.includes('Erreur') || line.includes('Exception') ? 'text-red-400' : 'text-slate-300'}`}>
            {line}
          </div>
        ))}
        {isRunning && (
          <div className="text-yellow-500 animate-pulse mt-2">En attente de réponse du système...</div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
