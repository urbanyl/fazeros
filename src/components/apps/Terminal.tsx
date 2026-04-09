import { useState, useEffect, useRef } from 'react';
import { useFileSystem } from '../../contexts/FileSystemContext';

export default function Terminal() {
  const { readDir, readFile, makeDir, writeFile, remove, resolvePath } = useFileSystem();
  const [currentPath, setCurrentPath] = useState<string>('/home/admin');
  const [isElectron, setIsElectron] = useState(false);
  const [history, setHistory] = useState<string[]>([
    'Fazer OS v1.0.0 (Pentest Edition) - Terminal Sécurisé',
    'Initialisation des modules d\'exécution natifs...',
  ]);
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const electronEnv = !!(window && (window as any).process && (window as any).process.type);
    setIsElectron(electronEnv);
    
    if (electronEnv) {
      setHistory(h => [...h, 'Connecté au système hôte. Les commandes exécutées seront réelles.', 'Tapez "help" pour voir la liste des commandes locales ou exécutez directement vos commandes bash/powershell.', '']);
    } else {
      setHistory(h => [...h, 'Mode web actif (simulation locale).', 'Tapez "help" pour voir la liste des commandes.', '']);
    }
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const executeRealCommand = async (cmd: string) => {
    try {
      const { ipcRenderer } = (window as any).require('electron');
      const result = await ipcRenderer.invoke('execute-command', cmd);
      
      const outputLines: string[] = [];
      if (result.stdout) {
        outputLines.push(...result.stdout.split('\n'));
      }
      if (result.stderr) {
        outputLines.push(`Erreur: ${result.stderr}`);
      }
      if (result.error) {
        outputLines.push(`Exception système: ${result.error}`);
      }
      
      if (outputLines.length === 0) {
        outputLines.push('(Aucun retour)');
      }
      
      setHistory(h => [...h, ...outputLines, '']);
    } catch (e: any) {
      setHistory(h => [...h, `Erreur d'exécution: ${e.message}`, '']);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCommand = async (cmd: string) => {
    if (isExecuting) return;
    
    const trimmed = cmd.trim();
    if (!trimmed) {
      setHistory(h => [...h, `fazer@root:${currentPath}$ `]);
      return;
    }

    setHistory(h => [...h, `fazer@root:${currentPath}$ ${trimmed}`]);
    
    // Check if it's a local command (VFS)
    const args = trimmed.split(' ');
    const command = args[0].toLowerCase();
    
    if (command === 'clear') {
      setHistory([]);
      return;
    }
    
    // If running in Electron, we pass everything that isn't explicitly VFS to the real OS
    if (isElectron) {
      if (['cd', 'ls', 'pwd', 'mkdir', 'touch', 'cat', 'rm', 'help'].includes(command) && args[1] && args[1].startsWith('/')) {
         // Force VFS only if starts with /
      } else if (command !== 'help' && command !== 'whoami') {
        setIsExecuting(true);
        await executeRealCommand(trimmed);
        return;
      }
    }

    let response: string | string[] = '';

    switch (command) {
      case 'help':
        response = [
          'Commandes disponibles:',
          '  help      - Affiche ce message',
          '  whoami    - Affiche l\'utilisateur actuel',
          '  clear     - Efface le terminal',
          '  ls        - Liste les fichiers du répertoire',
          '  cd <dir>  - Change de répertoire',
          '  pwd       - Affiche le répertoire actuel',
          '  mkdir <d> - Crée un dossier',
          '  touch <f> - Crée un fichier vide',
          '  cat <f>   - Lit le contenu d\'un fichier',
          '  rm <f/d>  - Supprime un fichier ou un dossier',
          '  nmap      - Scanner de ports (simulation)',
          '  ping      - Test de connectivité (simulation)',
        ];
        break;
      case 'whoami':
        response = 'admin';
        break;
      case 'pwd':
        response = currentPath;
        break;
      case 'ls': {
        const contents = readDir(currentPath);
        if (contents) {
          response = contents.map(c => (c.type === 'directory' ? `${c.name}/` : c.name)).join('  ');
        } else {
          response = `ls: impossible d'accéder à '${currentPath}': Aucun fichier ou dossier de ce type`;
        }
        break;
      }
      case 'cd': {
        const target = args[1];
        if (!target) {
          setCurrentPath('/home/admin');
        } else {
          const newPath = resolvePath(currentPath, target);
          const contents = readDir(newPath);
          if (contents !== null) {
            setCurrentPath(newPath);
          } else {
            response = `cd: ${target}: Aucun fichier ou dossier de ce type`;
          }
        }
        break;
      }
      case 'mkdir': {
        const target = args[1];
        if (!target) {
          response = 'mkdir: opérande manquant';
        } else {
          const newPath = resolvePath(currentPath, target);
          const success = makeDir(newPath);
          if (!success) response = `mkdir: impossible de créer le répertoire '${target}': Le fichier existe déjà`;
        }
        break;
      }
      case 'touch': {
        const target = args[1];
        if (!target) {
          response = 'touch: opérande manquant';
        } else {
          const newPath = resolvePath(currentPath, target);
          const success = writeFile(newPath, '');
          if (!success) response = `touch: impossible de créer le fichier '${target}'`;
        }
        break;
      }
      case 'cat': {
        const target = args[1];
        if (!target) {
          response = 'cat: opérande manquant';
        } else {
          const newPath = resolvePath(currentPath, target);
          const content = readFile(newPath);
          if (content !== null) {
            response = content.split('\n');
          } else {
            response = `cat: ${target}: Aucun fichier ou dossier de ce type`;
          }
        }
        break;
      }
      case 'rm': {
        const target = args[1];
        if (!target) {
          response = 'rm: opérande manquant';
        } else {
          const newPath = resolvePath(currentPath, target);
          const success = remove(newPath);
          if (!success) response = `rm: impossible de supprimer '${target}': Aucun fichier ou dossier de ce type`;
        }
        break;
      }
      case 'nmap':
        if (!args[1]) {
          response = 'Erreur: Veuillez spécifier une cible. (ex: nmap 192.168.1.1)';
        } else {
          response = [
            `Démarrage de Nmap 7.92 à ${new Date().toISOString()}`,
            `Nmap scan report for ${args[1]}`,
            'Host is up (0.0012s latency).',
            'Not shown: 996 closed tcp ports',
            'PORT     STATE SERVICE',
            '22/tcp   open  ssh',
            '80/tcp   open  http',
            '443/tcp  open  https',
            '3306/tcp open  mysql',
            '',
            'Nmap done: 1 IP address (1 host up) scanned in 1.42 seconds'
          ];
        }
        break;
      case 'ping':
        if (!args[1]) {
          response = 'Usage: ping <cible>';
        } else {
          response = [
            `PING ${args[1]} (${args[1]}) 56(84) bytes of data.`,
            `64 bytes from ${args[1]}: icmp_seq=1 ttl=64 time=14.2 ms`,
            `64 bytes from ${args[1]}: icmp_seq=2 ttl=64 time=15.1 ms`,
            `64 bytes from ${args[1]}: icmp_seq=3 ttl=64 time=14.8 ms`,
            `--- ${args[1]} ping statistics ---`,
            '3 packets transmitted, 3 received, 0% packet loss, time 2003ms'
          ];
        }
        break;
      default:
        response = `bash: ${args[0]}: commande introuvable`;
    }

    if (Array.isArray(response)) {
      setHistory(h => [...h, ...response, '']);
    } else {
      setHistory(h => [...h, response, '']);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-[#1e1e1e] font-mono text-[13px] text-slate-300 p-4 overflow-hidden">
      <div className="flex-1 overflow-auto">
        {history.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-words min-h-[1.2em]">
            {line}
          </div>
        ))}
        <div className="flex items-center">
          <span className="text-[#3b82f6] mr-2">fazer@root:{currentPath}$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isExecuting}
            className="flex-1 bg-transparent border-none outline-none text-slate-200 font-mono"
            autoFocus
          />
        </div>
        {isExecuting && (
          <div className="text-yellow-500 text-sm mt-2 animate-pulse">Exécution de la commande en cours...</div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
