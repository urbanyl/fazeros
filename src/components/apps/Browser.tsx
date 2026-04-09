import { useState } from 'react';
import { Globe, ArrowLeft, ArrowRight, RotateCw, Home } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function Browser() {
  const { accent } = useTheme();
  
  const defaultUrl = `data:text/html;charset=utf-8,
    <html>
      <head>
        <style>
          body { background: %230f1115; color: %23f8fafc; font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          h1 { font-size: 3rem; margin-bottom: 1rem; background: linear-gradient(to right, %233b82f6, %238b5cf6); -webkit-background-clip: text; color: transparent; }
          p { color: %2394a3b8; font-size: 1.1rem; text-align: center; max-width: 600px; line-height: 1.5; }
          .note { font-size: 0.85rem; color: %2364748b; margin-top: 2rem; border: 1px solid %23334155; padding: 1rem; border-radius: 8px; background: %231e293b; }
        </style>
      </head>
      <body>
        <h1>FazerOS Navigateur</h1>
        <p>Entrez une URL dans la barre d'adresse pour commencer la navigation.</p>
        <div class="note">
          <strong>Note de sécurité :</strong> En raison des restrictions des navigateurs modernes (X-Frame-Options), 
          certains sites majeurs comme Google, DuckDuckGo ou YouTube refusent d'être affichés à l'intérieur d'autres applications.
          <br/><br/>
          <em>Astuce : Essayez avec https://wikipedia.org ou https://example.com</em>
        </div>
      </body>
    </html>
  `.replace(/\n/g, '').trim();

  const [url, setUrl] = useState(defaultUrl);
  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const blockedDomains = [
    'google.com', 'youtube.com', 'facebook.com', 'twitter.com', 'x.com', 
    'instagram.com', 'github.com', 'linkedin.com', 'duckduckgo.com', 'bing.com',
    'yahoo.com', 'reddit.com', 'tiktok.com', 'netflix.com', 'amazon.com'
  ];

  const getBlockedUrlTemplate = (blockedDomain: string) => `data:text/html;charset=utf-8,
    <html>
      <head>
        <style>
          body { background: %230f1115; color: %23f8fafc; font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .container { text-align: center; max-width: 600px; padding: 2rem; background: %231e293b; border-radius: 12px; border: 1px solid %23334155; }
          h1 { font-size: 2rem; margin-bottom: 1rem; color: %23ef4444; }
          p { color: %2394a3b8; font-size: 1.1rem; line-height: 1.5; margin-bottom: 1.5rem; }
          .domain { font-weight: bold; color: %23f8fafc; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Connexion refusée par le site</h1>
          <p>Le site <span class="domain">${blockedDomain}</span> refuse d'être affiché à l'intérieur d'une autre application (sécurité X-Frame-Options / CSP).</p>
          <p>C'est une restriction de sécurité imposée par le site lui-même pour empêcher le "Clickjacking".</p>
        </div>
      </body>
    </html>
  `.replace(/\n/g, '').trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalUrl = inputUrl.trim();
    
    // Si ce n'est pas une Data URI
    if (!finalUrl.startsWith('data:')) {
      // S'il n'y a pas de protocole, on ajoute https://
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }
      
      // S'il n'y a pas de domaine de premier niveau (ex: .com, .org) et pas localhost, 
      // on suppose que l'utilisateur voulait taper .com (ex: "wikipedia" -> "wikipedia.com")
      try {
        const urlObj = new URL(finalUrl);
        if (!urlObj.hostname.includes('.') && urlObj.hostname !== 'localhost') {
          urlObj.hostname += '.com';
          finalUrl = urlObj.toString();
        }
        
        // Vérification des domaines bloqués connus
        const isBlocked = blockedDomains.some(domain => 
          urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
        );
        
        if (isBlocked) {
          setUrl(getBlockedUrlTemplate(urlObj.hostname));
          setInputUrl(finalUrl);
          setLoading(false);
          return;
        }
      } catch (e) {
        // URL invalide, on laisse tel quel pour l'erreur du navigateur
      }
    }
    
    setUrl(finalUrl);
    setInputUrl(finalUrl);
    setLoading(true);
  };

  const handleHome = () => {
    setUrl(defaultUrl);
    setInputUrl('');
    setLoading(true);
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1d24]">
      {/* Browser Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-[#0f1115] border-b border-[#2a2e38]">
        <button className="p-1.5 hover:bg-white/10 rounded text-slate-400" title="Précédent">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button className="p-1.5 hover:bg-white/10 rounded text-slate-400" title="Suivant">
          <ArrowRight className="w-4 h-4" />
        </button>
        <button onClick={handleHome} className="p-1.5 hover:bg-white/10 rounded text-slate-400" title="Accueil">
            <Home className="w-4 h-4" />
          </button>
          <button onClick={() => setLoading(true)} className="p-1.5 hover:bg-white/10 rounded text-slate-400" title="Rafraîchir">
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        
        <form onSubmit={handleSubmit} className="flex-1 flex items-center bg-[#1a1d24] rounded-full border border-[#2a2e38] px-3 py-1 focus-within:border-blue-500/50 transition-colors">
          <Globe className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-slate-500"
            placeholder="Saisissez une URL ou effectuez une recherche"
          />
        </form>
      </div>

      {/* Browser Content */}
      <div className="flex-1 relative bg-white">
        {loading && (
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/20 overflow-hidden">
            <div className={`h-full ${accent.replace('bg-', 'bg-')} w-1/3 animate-[slide_1s_ease-in-out_infinite]`}></div>
          </div>
        )}
        <iframe
          src={url}
          className="w-full h-full border-none"
          onLoad={() => setLoading(false)}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          title="Browser"
        />
      </div>
    </div>
  );
}