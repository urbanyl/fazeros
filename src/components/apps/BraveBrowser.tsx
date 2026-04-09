import React, { useState, useEffect } from 'react';
import { RefreshCw, ShieldCheck, ChevronLeft, ChevronRight, Home, ExternalLink, DownloadCloud } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

export default function BraveBrowser() {
  const [url, setUrl] = useState('https://search.brave.com');
  const [inputUrl, setInputUrl] = useState('https://search.brave.com');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>(['https://search.brave.com']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const { showNotification } = useNotification();
  const [isElectron, setIsElectron] = useState(false);
  const [appNotFound, setAppNotFound] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installStatus, setInstallStatus] = useState('');

  useEffect(() => {
    // Check if we're running in Electron
    setIsElectron(!!(window && (window as any).process && (window as any).process.type));
    
    // Listen for errors when launching external app
    if (window && (window as any).require) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        
        ipcRenderer.on('external-app-not-found', (_event: any, message: string) => {
          showNotification('Info', message, 'info');
          setAppNotFound(true);
        });

        ipcRenderer.on('external-app-error', (_event: any, message: string) => {
          showNotification('Erreur', message, 'error');
          setIsInstalling(false);
        });

        ipcRenderer.on('external-app-install-status', (_event: any, message: string) => {
          setInstallStatus(message);
        });

        ipcRenderer.on('external-app-install-success', (_event: any, message: string) => {
          showNotification('Succès', message, 'success');
          setIsInstalling(false);
          setAppNotFound(false);
          setInstallStatus('');
        });
        
        return () => {
          ipcRenderer.removeAllListeners('external-app-not-found');
          ipcRenderer.removeAllListeners('external-app-error');
          ipcRenderer.removeAllListeners('external-app-install-status');
          ipcRenderer.removeAllListeners('external-app-install-success');
        };
      } catch (e) {
        console.log('Not running in Electron environment');
      }
    }
  }, [showNotification]);

  const launchRealBrave = () => {
    if (isElectron && (window as any).require) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        ipcRenderer.send('launch-external-app', 'brave');
        showNotification('Lancement', 'Vérification de Brave Browser...', 'info');
      } catch (e) {
        showNotification('Erreur', 'Impossible de communiquer avec le système hôte.', 'error');
      }
    } else {
      // Fallback for web version
      window.open(url, '_blank');
      showNotification('Redirection', 'Ouverture dans un nouvel onglet...', 'success');
    }
  };

  const installBrave = () => {
    if (isElectron && (window as any).require) {
      try {
        setIsInstalling(true);
        setInstallStatus('Initialisation de l\'installation...');
        const { ipcRenderer } = (window as any).require('electron');
        ipcRenderer.send('install-external-app', 'brave');
      } catch (e) {
        setIsInstalling(false);
        showNotification('Erreur', 'Impossible de démarrer l\'installation.', 'error');
      }
    }
  };

  const formatUrl = (input: string) => {
    let finalUrl = input.trim();
    if (!finalUrl) return 'https://search.brave.com';

    // If it looks like a search query
    if (!finalUrl.includes('.') || finalUrl.includes(' ')) {
      return `https://search.brave.com/search?q=${encodeURIComponent(finalUrl)}`;
    }

    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }
    
    try {
      new URL(finalUrl);
      return finalUrl;
    } catch {
      return `https://search.brave.com/search?q=${encodeURIComponent(input)}`;
    }
  };

  const getBlockedUrlTemplate = (domain: string) => {
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #1a1a1a; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .container { text-align: center; max-width: 500px; padding: 2rem; background: #2a2a2a; border-radius: 12px; border: 1px solid #f9622d; box-shadow: 0 4px 20px rgba(249, 98, 45, 0.2); }
            h1 { color: #f9622d; margin-bottom: 1rem; }
            p { color: #ccc; line-height: 1.6; }
            .shield { width: 64px; height: 64px; color: #f9622d; margin-bottom: 1rem; }
          </style>
        </head>
        <body>
          <div class="container">
            <svg class="shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <h1>Accès bloqué par Brave Shields</h1>
            <p>Le site <strong>${domain}</strong> a refusé la connexion ou a été bloqué par sécurité.</p>
            <p>Certains sites (comme Google, YouTube) interdisent leur affichage dans des iframes pour des raisons de sécurité (X-Frame-Options).</p>
          </div>
        </body>
      </html>
    `;
    return `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const finalUrl = formatUrl(inputUrl);
    
    try {
      const urlObj = new URL(finalUrl);
      const blockedDomains = [
        'google.com', 'youtube.com', 'facebook.com', 'twitter.com', 'x.com', 
        'instagram.com', 'github.com', 'linkedin.com'
      ];

      const isBlocked = blockedDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
      );

      if (isBlocked) {
        setUrl(getBlockedUrlTemplate(urlObj.hostname));
        setInputUrl(finalUrl);
        setLoading(false);
        
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(finalUrl);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        return;
      }
      
      setUrl(finalUrl);
      setInputUrl(finalUrl);
      
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(finalUrl);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } catch (err) {
      console.error(err);
      setUrl(finalUrl);
    }
  };

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const prevUrl = history[historyIndex - 1];
      setUrl(prevUrl);
      setInputUrl(prevUrl);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const nextUrl = history[historyIndex + 1];
      setUrl(nextUrl);
      setInputUrl(nextUrl);
    }
  };

  const goHome = () => {
    const homeUrl = 'https://search.brave.com';
    setUrl(homeUrl);
    setInputUrl(homeUrl);
    setLoading(true);
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(homeUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg overflow-hidden border border-white/10">
      <div className="flex items-center gap-2 p-2 bg-[#2a2a2a] border-b border-[#3a3a3a]">
        <div className="flex items-center gap-1">
          <button 
            onClick={goBack}
            disabled={historyIndex === 0}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4 text-slate-300" />
          </button>
          <button 
            onClick={goForward}
            disabled={historyIndex === history.length - 1}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
          <button 
            onClick={goHome}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
          >
            <Home className="w-4 h-4 text-slate-300" />
          </button>
          <button 
            onClick={() => setLoading(true)}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-slate-300 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
          <div className="flex-1 flex items-center bg-[#1a1a1a] rounded-full px-3 py-1 border border-[#3a3a3a] focus-within:border-[#fb542b] focus-within:shadow-[0_0_0_1px_rgba(251,84,43,0.3)] transition-all">
            <ShieldCheck className="w-4 h-4 text-[#fb542b] mr-2" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-200"
              placeholder="Rechercher avec Brave ou saisir une URL"
            />
            <button
              type="button"
              onClick={launchRealBrave}
              className="ml-2 p-1.5 hover:bg-white/10 rounded-full transition-colors text-[#fb542b]"
              title="Ouvrir le vrai logiciel Brave sur votre PC"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      <div className="flex-1 bg-white relative">
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10 p-8 text-center">
          <div className="w-24 h-24 mb-6 rounded-full bg-[#fb542b]/20 flex items-center justify-center shadow-[0_0_40px_rgba(251,84,43,0.3)]">
            {isInstalling ? (
              <RefreshCw className="w-12 h-12 text-[#fb542b] animate-spin" />
            ) : (
              <ShieldCheck className="w-12 h-12 text-[#fb542b]" />
            )}
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            {isInstalling ? 'Installation en cours' : 'Lancer Brave Browser'}
          </h2>
          <p className="text-gray-400 mb-8 max-w-md">
            {isInstalling ? (
              installStatus || "Veuillez patienter pendant l'installation..."
            ) : appNotFound ? (
              "Brave n'a pas été trouvé sur votre système. Voulez-vous que FazerOS l'installe automatiquement pour vous ?"
            ) : (
              "Voulez-vous lancer le véritable navigateur Brave installé sur votre système ? Ceci ouvrira l'application native pour une meilleure expérience et sécurité."
            )}
          </p>
          
          <div className="flex gap-4">
            {!isInstalling && (
              <button 
                onClick={launchRealBrave}
                className="px-8 py-3 bg-[#fb542b] hover:bg-[#e04a25] text-white rounded-full font-medium transition-colors shadow-lg flex items-center gap-3 text-lg"
              >
                <ExternalLink className="w-5 h-5" />
                {appNotFound ? 'Réessayer' : 'Ouvrir Brave (Logiciel)'}
              </button>
            )}

            {appNotFound && !isInstalling && isElectron && (
              <button 
                onClick={installBrave}
                className="px-8 py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-full font-medium transition-colors shadow-lg flex items-center gap-3 text-lg"
              >
                <DownloadCloud className="w-5 h-5" />
                Installer Brave
              </button>
            )}
          </div>
          
          <p className="text-gray-500 mt-6 text-sm">
            Si l'installation échoue, vous pouvez le télécharger depuis <a href="#" onClick={() => window.open('https://brave.com', '_blank')} className="text-[#fb542b] hover:underline">brave.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}