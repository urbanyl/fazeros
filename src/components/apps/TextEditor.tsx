import { useState } from 'react';
import { Save, FolderOpen, FilePlus } from 'lucide-react';
import { useFileSystem } from '../../contexts/FileSystemContext';
import { useNotification } from '../../contexts/NotificationContext';

export default function TextEditor() {
  const { fs } = useFileSystem() as any;
  const { showNotification } = useNotification();

  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [isSaved, setIsSaved] = useState(true);

  const handleSave = () => {
    if (!currentFile) {
      const fileName = prompt('Nom du fichier (ex: /root/nouveau.txt):', '/root/nouveau.txt');
      if (fileName) {
        fs.writeFile(fileName, content);
        setCurrentFile(fileName);
        setIsSaved(true);
        showNotification('Fichier enregistré', `Enregistré sous ${fileName}`, 'success');
      }
    } else {
      fs.writeFile(currentFile, content);
      setIsSaved(true);
      showNotification('Fichier enregistré', `Modifications sauvegardées.`, 'success');
    }
  };

  const handleOpen = () => {
    const path = prompt('Chemin du fichier à ouvrir (ex: /root/notes.txt):');
    if (path) {
      try {
        const fileContent = fs.readFile(path);
        setContent(fileContent);
        setCurrentFile(path);
        setIsSaved(true);
      } catch (err) {
        showNotification('Erreur', 'Fichier introuvable ou inaccessible.', 'error');
      }
    }
  };

  const handleNew = () => {
    if (!isSaved) {
      if (!confirm('Vous avez des modifications non sauvegardées. Continuer ?')) return;
    }
    setCurrentFile(null);
    setContent('');
    setIsSaved(true);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0c]">
      {/* Editor Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-[#1a1d24] border-b border-[#2a2e38]">
        <button onClick={handleNew} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors" title="Nouveau">
          <FilePlus className="w-4 h-4" /> Nouveau
        </button>
        <button onClick={handleOpen} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors" title="Ouvrir">
          <FolderOpen className="w-4 h-4" /> Ouvrir
        </button>
        <button onClick={handleSave} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors" title="Sauvegarder">
          <Save className="w-4 h-4" /> Enregistrer {(!isSaved) && '*'}
        </button>
        
        <div className="ml-auto text-xs text-slate-500 flex items-center gap-2 px-2">
          {currentFile ? currentFile : 'Nouveau fichier non enregistré'}
        </div>
      </div>

      {/* Editor Area */}
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setIsSaved(false);
        }}
        className="flex-1 w-full p-4 bg-transparent border-none outline-none resize-none font-mono text-sm text-slate-300 placeholder-slate-600 leading-relaxed"
        placeholder="Commencez à taper ici..."
        spellCheck={false}
      />
    </div>
  );
}