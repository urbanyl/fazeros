import { useState, useEffect, useRef } from 'react';
import { Play, Square, Search, Trash2, Shield, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

const COMMON_PORTS = [
  { port: 20, service: 'FTP Data' },
  { port: 21, service: 'FTP Control' },
  { port: 22, service: 'SSH' },
  { port: 23, service: 'Telnet' },
  { port: 25, service: 'SMTP' },
  { port: 53, service: 'DNS' },
  { port: 80, service: 'HTTP' },
  { port: 110, service: 'POP3' },
  { port: 135, service: 'MSRPC' },
  { port: 139, service: 'NetBIOS' },
  { port: 143, service: 'IMAP' },
  { port: 443, service: 'HTTPS' },
  { port: 445, service: 'SMB' },
  { port: 3306, service: 'MySQL' },
  { port: 3389, service: 'RDP' },
  { port: 5432, service: 'PostgreSQL' },
  { port: 8080, service: 'HTTP-Proxy' }
];

interface ScanResult {
  port: number;
  status: 'open' | 'closed' | 'filtered';
  service: string;
}

export default function PortScanner() {
  const [target, setTarget] = useState('127.0.0.1');
  const [portMode, setPortMode] = useState<'common' | 'range'>('common');
  const [startPort, setStartPort] = useState('1');
  const [endPort, setEndPort] = useState('1024');
  const [results, setResults] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isElectron, setIsElectron] = useState(false);
  
  const { showNotification } = useNotification();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setIsElectron(!!(window && (window as any).process && (window as any).process.type));
  }, []);

  const getServiceForPort = (port: number) => {
    const known = COMMON_PORTS.find(p => p.port === port);
    return known ? known.service : 'Unknown';
  };

  const startScan = async () => {
    if (!isElectron) {
      showNotification('Erreur', 'Le scanner de ports nécessite la version native de FazerOS.', 'error');
      return;
    }

    if (!target) {
      showNotification('Erreur', 'Veuillez entrer une adresse IP cible.', 'error');
      return;
    }

    let portsToScan: number[] = [];
    if (portMode === 'common') {
      portsToScan = COMMON_PORTS.map(p => p.port);
    } else {
      const start = parseInt(startPort, 10);
      const end = parseInt(endPort, 10);
      if (isNaN(start) || isNaN(end) || start < 1 || end > 65535 || start > end) {
        showNotification('Erreur', 'Plage de ports invalide (1-65535).', 'error');
        return;
      }
      for (let i = start; i <= end; i++) {
        portsToScan.push(i);
      }
    }

    setIsScanning(true);
    setResults([]);
    setProgress(0);
    abortControllerRef.current = new AbortController();

    const { ipcRenderer } = (window as any).require('electron');
    const totalPorts = portsToScan.length;
    let scannedCount = 0;

    // Concurrency limit to avoid too many sockets
    const concurrency = 50;
    
    const scanPort = async (port: number) => {
      if (abortControllerRef.current?.signal.aborted) return;
      
      try {
        const result = await ipcRenderer.invoke('scan-port', target, port);
        
        if (result.status === 'open' || result.status === 'filtered') {
          setResults(prev => [...prev, {
            port: result.port,
            status: result.status,
            service: getServiceForPort(result.port)
          }].sort((a, b) => a.port - b.port));
        }
      } catch (error) {
        console.error(`Error scanning port ${port}:`, error);
      } finally {
        scannedCount++;
        setProgress(Math.round((scannedCount / totalPorts) * 100));
      }
    };

    const runInBatches = async () => {
      for (let i = 0; i < portsToScan.length; i += concurrency) {
        if (abortControllerRef.current?.signal.aborted) break;
        const batch = portsToScan.slice(i, i + concurrency);
        await Promise.all(batch.map(p => scanPort(p)));
      }
    };

    await runInBatches();
    setIsScanning(false);
    
    if (!abortControllerRef.current?.signal.aborted) {
      showNotification('Scan Terminé', `Analyse de ${target} complétée.`, 'success');
    }
  };

  const stopScan = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsScanning(false);
      showNotification('Scan Arrêté', 'Le scan de ports a été interrompu.', 'warning');
    }
  };

  const clearResults = () => {
    setResults([]);
    setProgress(0);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-slate-300 font-sans">
      {/* Configuration Header */}
      <div className="p-4 bg-[#252526] border-b border-[#333] space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Cible (IP ou Domaine)</label>
            <div className="flex items-center bg-[#1e1e1e] border border-[#444] rounded px-3 py-2 focus-within:border-blue-500 transition-colors">
              <Search className="w-4 h-4 text-slate-500 mr-2" />
              <input 
                type="text" 
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                disabled={isScanning}
                className="bg-transparent border-none outline-none w-full text-white"
                placeholder="ex: 127.0.0.1, google.com"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Mode de Scan</label>
            <select 
              value={portMode}
              onChange={(e) => setPortMode(e.target.value as 'common' | 'range')}
              disabled={isScanning}
              className="bg-[#1e1e1e] border border-[#444] rounded px-3 py-2 text-white outline-none focus:border-blue-500 h-[42px]"
            >
              <option value="common">Ports Communs (Top 20)</option>
              <option value="range">Plage Personnalisée</option>
            </select>
          </div>
        </div>

        {portMode === 'range' && (
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Port de départ</label>
              <input 
                type="number" 
                value={startPort}
                onChange={(e) => setStartPort(e.target.value)}
                disabled={isScanning}
                min="1" max="65535"
                className="bg-[#1e1e1e] border border-[#444] rounded px-3 py-1.5 text-white outline-none focus:border-blue-500 w-32"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Port de fin</label>
              <input 
                type="number" 
                value={endPort}
                onChange={(e) => setEndPort(e.target.value)}
                disabled={isScanning}
                min="1" max="65535"
                className="bg-[#1e1e1e] border border-[#444] rounded px-3 py-1.5 text-white outline-none focus:border-blue-500 w-32"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {!isScanning ? (
              <button 
                onClick={startScan}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center gap-2 font-medium transition-colors"
              >
                <Play className="w-4 h-4" /> Lancer le Scan
              </button>
            ) : (
              <button 
                onClick={stopScan}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded flex items-center gap-2 font-medium transition-colors"
              >
                <Square className="w-4 h-4" /> Arrêter
              </button>
            )}
            <button 
              onClick={clearResults}
              disabled={isScanning}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded flex items-center gap-2 font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Effacer
            </button>
          </div>
          
          {isScanning && (
            <div className="flex items-center gap-3 w-64">
              <span className="text-xs font-mono text-slate-400">{progress}%</span>
              <div className="h-2 flex-1 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Table */}
      <div className="flex-1 overflow-auto">
        {results.length === 0 && !isScanning ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
            <Shield className="w-16 h-16 opacity-20" />
            <p>Aucun résultat. Configurez la cible et lancez le scan.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#252526] text-slate-400 shadow-sm z-10">
              <tr>
                <th className="py-2 px-4 font-semibold border-b border-[#333] w-24">PORT</th>
                <th className="py-2 px-4 font-semibold border-b border-[#333] w-32">ÉTAT</th>
                <th className="py-2 px-4 font-semibold border-b border-[#333]">SERVICE</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr 
                  key={`${result.port}-${index}`}
                  className="border-b border-[#2a2a2a] hover:bg-[#2a2d3e] transition-colors"
                >
                  <td className="py-2 px-4 font-mono text-blue-400">{result.port}</td>
                  <td className="py-2 px-4">
                    <span className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium w-fit ${
                      result.status === 'open' 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {result.status === 'open' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      {result.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-slate-300 flex items-center gap-2">
                    {result.service}
                    {result.service === 'Unknown' && <HelpCircle className="w-3 h-3 text-slate-500" />}
                  </td>
                </tr>
              ))}
              {isScanning && (
                <tr>
                  <td colSpan={3} className="py-4 px-4 text-center text-slate-500 animate-pulse">
                    Scan en cours... Les ports ouverts apparaîtront ici.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
