import { useState } from 'react';
import { User, Shield, Monitor, Palette, Network, HardDrive, Lock, Globe, Activity } from 'lucide-react';
import { useTheme, wallpapers, accentColors, textColors } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';

export default function SettingsApp() {
  const { wallpaper, setWallpaper, accent, setAccent } = useTheme();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<'system' | 'personalization' | 'network' | 'security' | 'accounts'>('personalization');

  // Helper functions for settings
  const handleSystemUpdate = () => {
    showNotification('Mise à jour système', 'Recherche de mises à jour en cours...', 'info');
    setTimeout(() => {
      showNotification('Système à jour', 'FazerOS est déjà à la dernière version (1.0.0-rc).', 'success');
    }, 2500);
  };

  const handleClearCache = () => {
    showNotification('Nettoyage du cache', 'Nettoyage des fichiers temporaires...', 'info');
    setTimeout(() => {
      showNotification('Cache nettoyé', '342 Mo d\'espace libéré avec succès.', 'success');
    }, 1500);
  };

  return (
    <div className="flex h-full bg-[#0a0a0c] text-slate-200">
      {/* Sidebar */}
      <div className="w-64 bg-[#121419] border-r border-[#2a2e38] p-4 flex flex-col gap-2 overflow-y-auto">
        <h2 className="text-sm font-semibold text-slate-400 mb-2 px-3">Paramètres</h2>
        
        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
            activeTab === 'system' ? `${accent} text-white` : 'hover:bg-white/5 text-slate-300'
          }`}
        >
          <Monitor className="w-4 h-4" /> Système
        </button>
        
        <button
          onClick={() => setActiveTab('personalization')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
            activeTab === 'personalization' ? `${accent} text-white` : 'hover:bg-white/5 text-slate-300'
          }`}
        >
          <Palette className="w-4 h-4" /> Personnalisation
        </button>

        <button
          onClick={() => setActiveTab('network')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
            activeTab === 'network' ? `${accent} text-white` : 'hover:bg-white/5 text-slate-300'
          }`}
        >
          <Network className="w-4 h-4" /> Réseau et Internet
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
            activeTab === 'security' ? `${accent} text-white` : 'hover:bg-white/5 text-slate-300'
          }`}
        >
          <Shield className="w-4 h-4" /> Sécurité
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
            activeTab === 'accounts' ? `${accent} text-white` : 'hover:bg-white/5 text-slate-300'
          }`}
        >
          <User className="w-4 h-4" /> Comptes
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
        {activeTab === 'personalization' && (
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <Palette className={`w-6 h-6 ${textColors[accent]}`} /> Personnalisation
            </h1>
            
            <div className="space-y-8">
              {/* Theme Section */}
              <section className="bg-[#121419] p-6 rounded-xl border border-[#2a2e38]">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Couleur d'accentuation</h3>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {Object.entries(accentColors).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => setAccent(key as any)}
                      className={`w-10 h-10 rounded-full transition-all flex items-center justify-center
                        ${value.replace('bg-', 'bg-')} 
                        ${accent === key ? 'ring-2 ring-white ring-offset-2 ring-offset-[#121419] scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'}
                      `}
                      title={key}
                    />
                  ))}
                </div>
              </section>

              {/* Wallpaper Section */}
              <section className="bg-[#121419] p-6 rounded-xl border border-[#2a2e38]">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Fond d'écran</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Object.keys(wallpapers).map((key) => (
                    <button
                      key={key}
                      onClick={() => setWallpaper(key as any)}
                      className={`
                        relative aspect-video rounded-lg overflow-hidden border-2 transition-all
                        ${wallpaper === key ? 'border-blue-500 scale-[1.02] shadow-lg shadow-blue-500/20' : 'border-transparent hover:border-[#2a2e38]'}
                      `}
                    >
                      <div className={`absolute inset-0 ${wallpapers[key as keyof typeof wallpapers]} opacity-80`} />
                      <div className="absolute inset-0 flex items-end p-2 bg-gradient-to-t from-black/60 to-transparent">
                        <span className="text-xs font-medium text-white capitalize">{key}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <Monitor className={`w-6 h-6 ${textColors[accent]}`} /> Système
            </h1>
            
            <div className="space-y-6">
              <section className="bg-[#121419] p-6 rounded-xl border border-[#2a2e38] flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">À propos de FazerOS</h3>
                    <p className="text-sm text-slate-400 mt-1">Version 1.0.0-rc (Build 2026.04.09)</p>
                  </div>
                  <div className={`w-16 h-16 rounded-2xl ${accent} flex items-center justify-center text-white shadow-lg`}>
                    <Monitor className="w-8 h-8" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-[#0a0a0c] p-4 rounded-lg border border-[#2a2e38]">
                    <div className="text-xs text-slate-500 mb-1">Processeur virtuel</div>
                    <div className="text-sm text-slate-200">Fazer VCPU @ 3.20GHz</div>
                  </div>
                  <div className="bg-[#0a0a0c] p-4 rounded-lg border border-[#2a2e38]">
                    <div className="text-xs text-slate-500 mb-1">Mémoire installée (RAM)</div>
                    <div className="text-sm text-slate-200">16.0 Go (15.8 Go utilisable)</div>
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button onClick={handleSystemUpdate} className={`px-4 py-2 rounded-lg text-sm font-medium ${accent} text-white hover:opacity-90 transition-opacity`}>
                    Rechercher des mises à jour
                  </button>
                </div>
              </section>

              <section className="bg-[#121419] p-6 rounded-xl border border-[#2a2e38]">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <HardDrive className="w-4 h-4" /> Stockage
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">Disque Local (C:)</span>
                      <span className="text-slate-400">45 Go libres sur 120 Go</span>
                    </div>
                    <div className="h-2 bg-[#0a0a0c] rounded-full overflow-hidden border border-[#2a2e38]">
                      <div className={`h-full ${accent} w-[62%]`} />
                    </div>
                  </div>
                  <button onClick={handleClearCache} className="px-4 py-2 bg-[#2a2e38] hover:bg-[#333842] rounded-lg text-sm text-white transition-colors">
                    Nettoyer les fichiers temporaires
                  </button>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'network' && (
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <Network className={`w-6 h-6 ${textColors[accent]}`} /> Réseau et Internet
            </h1>
            
            <section className="bg-[#121419] p-6 rounded-xl border border-[#2a2e38]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Connecté</h3>
                  <p className="text-sm text-slate-400">Réseau privé virtuel FazerNet</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-[#0a0a0c] rounded-lg border border-[#2a2e38]">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-slate-400" />
                    <span className="text-sm text-slate-300">État de la connexion</span>
                  </div>
                  <span className="text-sm text-green-400 font-medium">Excellent (1 Gbps)</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#0a0a0c] rounded-lg border border-[#2a2e38]">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-slate-400" />
                    <span className="text-sm text-slate-300">Pare-feu réseau</span>
                  </div>
                  <span className="text-sm text-blue-400 font-medium">Actif</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <Shield className={`w-6 h-6 ${textColors[accent]}`} /> Sécurité
            </h1>
            
            <section className="bg-[#121419] p-6 rounded-xl border border-[#2a2e38] flex flex-col gap-6">
              <div className="flex items-start gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <Shield className="w-6 h-6 text-green-500 shrink-0" />
                <div>
                  <h3 className="font-medium text-green-400">Votre appareil est protégé</h3>
                  <p className="text-sm text-green-500/70 mt-1">Dernière analyse de sécurité : Aujourd'hui, 08:30. Aucune menace détectée.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#2a2e38] pb-4">
                  <div>
                    <h4 className="text-sm font-medium text-white">Protection en temps réel</h4>
                    <p className="text-xs text-slate-400 mt-1">Analyse les fichiers téléchargés et les programmes en cours d'exécution.</p>
                  </div>
                  <div className={`w-10 h-5 rounded-full ${accent} relative cursor-pointer`}>
                    <div className="absolute right-1 top-1 w-3 h-3 rounded-full bg-white"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-b border-[#2a2e38] pb-4">
                  <div>
                    <h4 className="text-sm font-medium text-white">Protection contre les ransomwares</h4>
                    <p className="text-xs text-slate-400 mt-1">Protège vos fichiers et dossiers importants contre les modifications non autorisées.</p>
                  </div>
                  <div className={`w-10 h-5 rounded-full ${accent} relative cursor-pointer`}>
                    <div className="absolute right-1 top-1 w-3 h-3 rounded-full bg-white"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-white">Quarantaine automatique</h4>
                    <p className="text-xs text-slate-400 mt-1">Déplace automatiquement les fichiers suspects vers la quarantaine (recommandé).</p>
                  </div>
                  <div className={`w-10 h-5 rounded-full ${accent} relative cursor-pointer`}>
                    <div className="absolute right-1 top-1 w-3 h-3 rounded-full bg-white"></div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'accounts' && (
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <User className={`w-6 h-6 ${textColors[accent]}`} /> Comptes
            </h1>
            
            <section className="bg-[#121419] p-6 rounded-xl border border-[#2a2e38]">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                  AD
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Administrateur</h3>
                  <p className="text-sm text-slate-400 mt-1">Compte local • Administrateur système</p>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 bg-[#0a0a0c] hover:bg-white/5 border border-[#2a2e38] rounded-lg transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="text-sm font-medium text-white">Options de connexion</div>
                      <div className="text-xs text-slate-500">Mot de passe, code PIN, authentification biométrique</div>
                    </div>
                  </div>
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-[#0a0a0c] hover:bg-white/5 border border-[#2a2e38] rounded-lg transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="text-sm font-medium text-white">Famille et autres utilisateurs</div>
                      <div className="text-xs text-slate-500">Gérer d'autres comptes sur ce PC</div>
                    </div>
                  </div>
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

