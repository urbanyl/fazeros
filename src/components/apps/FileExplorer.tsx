import React, { useState } from 'react';
import { Folder, File, FileText, ChevronRight, HardDrive, ArrowLeft, Home, FileImage, FileCode, Plus, Trash2 } from 'lucide-react';
import { useFileSystem } from '../../contexts/FileSystemContext';
import type { VNode } from '../../contexts/FileSystemContext';
import { useTheme, textColors } from '../../contexts/ThemeContext';

export default function FileExplorer() {
  const { readDir, makeDir, writeFile, remove } = useFileSystem();
  const { accent } = useTheme();
  
  const [currentPath, setCurrentPath] = useState<string>('/home/admin');
  const [selectedFile, setSelectedFile] = useState<VNode | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  
  const contents = readDir(currentPath);
  const pathParts = currentPath.split('/').filter(Boolean);

  const navigateTo = (path: string) => {
    setCurrentPath(path);
    setSelectedFile(null);
    setIsEditing(false);
  };

  const handleGoUp = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    navigateTo('/' + parts.join('/'));
  };

  const handleItemClick = (item: VNode) => {
    if (item.type === 'directory') {
      const newPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
      navigateTo(newPath);
    } else {
      setSelectedFile(item);
      setFileContent(item.content || '');
      setIsEditing(false);
    }
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith('.txt') || name.endsWith('.md') || name.endsWith('.conf')) return <FileText className="w-12 h-12 text-slate-300" />;
    if (name.endsWith('.png') || name.endsWith('.jpg')) return <FileImage className="w-12 h-12 text-blue-400" />;
    if (name.endsWith('.js') || name.endsWith('.tsx') || name.endsWith('.json')) return <FileCode className="w-12 h-12 text-yellow-400" />;
    return <File className="w-12 h-12 text-slate-300" />;
  };

  const handleCreateFolder = () => {
    const name = prompt('Nom du nouveau dossier :');
    if (name) {
      makeDir(currentPath === '/' ? `/${name}` : `${currentPath}/${name}`);
    }
  };

  const handleCreateFile = () => {
    const name = prompt('Nom du nouveau fichier :');
    if (name) {
      writeFile(currentPath === '/' ? `/${name}` : `${currentPath}/${name}`, '');
    }
  };

  const handleDelete = (name: string) => {
    if (window.confirm(`Supprimer ${name} ?`)) {
      remove(currentPath === '/' ? `/${name}` : `${currentPath}/${name}`);
      if (selectedFile && selectedFile.name === name) {
        setSelectedFile(null);
      }
    }
  };

  const handleSaveFile = () => {
    if (selectedFile) {
      const path = currentPath === '/' ? `/${selectedFile.name}` : `${currentPath}/${selectedFile.name}`;
      writeFile(path, fileContent);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex-1 flex w-full h-full bg-[#1e1e1e] text-slate-200 font-sans">
      {/* Sidebar */}
      <div className="w-48 bg-[#252526] border-r border-[#333] flex flex-col hidden sm:flex">
        <div className="p-4 border-b border-[#333]">
          <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-300">
            <HardDrive className={`w-4 h-4 ${textColors[accent]}`} />
            Ce PC
          </h2>
        </div>
        <div className="flex flex-col gap-1 p-2 text-sm">
          <button onClick={() => navigateTo('/')} className={`flex items-center gap-2 p-2 rounded hover:bg-white/5 text-slate-300 ${currentPath === '/' ? 'bg-white/10 text-white' : ''}`}>
            <HardDrive className="w-4 h-4" /> Disque Local (C:)
          </button>
          <button onClick={() => navigateTo('/home/admin')} className={`flex items-center gap-2 p-2 rounded hover:bg-white/5 text-slate-300 ${currentPath.startsWith('/home/admin') ? 'bg-white/10 text-white' : ''}`}>
            <Home className="w-4 h-4" /> Dossier Personnel
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar & Breadcrumb */}
        <div className="bg-[#2d2d30] border-b border-[#333] flex flex-col">
          <div className="flex items-center gap-2 p-2 border-b border-[#333]">
            <button onClick={handleGoUp} disabled={currentPath === '/'} className="p-1.5 rounded hover:bg-white/10 disabled:opacity-50 text-slate-300">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex-1 bg-[#1e1e1e] rounded border border-[#333] px-3 py-1 text-sm flex items-center gap-1 overflow-x-auto whitespace-nowrap">
              <span className="text-slate-400 cursor-pointer hover:text-white" onClick={() => navigateTo('/')}>Racine</span>
              {pathParts.map((part, index) => (
                <React.Fragment key={index}>
                  <ChevronRight className="w-3 h-3 text-slate-500 flex-shrink-0" />
                  <span 
                    className="cursor-pointer hover:text-white"
                    onClick={() => navigateTo('/' + pathParts.slice(0, index + 1).join('/'))}
                  >
                    {part}
                  </span>
                </React.Fragment>
              ))}
            </div>
            <div className="flex gap-1 ml-auto">
              <button onClick={handleCreateFolder} className="p-1.5 rounded hover:bg-white/10 text-slate-300" title="Nouveau dossier">
                <Folder className="w-4 h-4" />
                <Plus className="w-3 h-3 absolute -top-1 -right-1" />
              </button>
              <button onClick={handleCreateFile} className="p-1.5 rounded hover:bg-white/10 text-slate-300" title="Nouveau fichier">
                <FileText className="w-4 h-4" />
                <Plus className="w-3 h-3 absolute -top-1 -right-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Grid */}
          <div className={`flex-1 p-4 overflow-y-auto ${selectedFile ? 'hidden md:block w-1/2 border-r border-[#333]' : ''}`}>
            {contents && contents.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {contents.map((item, i) => (
                  <div 
                    key={i} 
                    className="relative group flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white/5 cursor-pointer text-center"
                    onClick={() => handleItemClick(item)}
                  >
                    {item.type === 'directory' ? (
                      <Folder className="w-12 h-12 text-yellow-500 fill-yellow-500/20" />
                    ) : (
                      getFileIcon(item.name)
                    )}
                    <span className="text-sm truncate w-full px-1">{item.name}</span>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.name); }}
                      className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                Ce dossier est vide.
              </div>
            )}
          </div>

          {/* File Preview / Editor */}
          {selectedFile && (
            <div className="flex-1 flex flex-col bg-[#1e1e1e]">
              <div className="p-3 border-b border-[#333] flex items-center justify-between bg-[#252526]">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {getFileIcon(selectedFile.name)}
                  <span>{selectedFile.name}</span>
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <button onClick={handleSaveFile} className="px-3 py-1 text-xs bg-green-600 hover:bg-green-500 text-white rounded">
                      Enregistrer
                    </button>
                  ) : (
                    <button onClick={() => setIsEditing(true)} className="px-3 py-1 text-xs bg-[#333] hover:bg-[#444] text-white rounded">
                      Modifier
                    </button>
                  )}
                  <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-white/10 rounded">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
              <div className="flex-1 p-4 overflow-auto">
                {isEditing ? (
                  <textarea
                    value={fileContent}
                    onChange={(e) => setFileContent(e.target.value)}
                    className="w-full h-full bg-black/50 text-slate-300 font-mono text-sm p-4 rounded outline-none border border-[#333] focus:border-[#555] resize-none"
                    spellCheck="false"
                  />
                ) : (
                  <pre className="whitespace-pre-wrap font-mono text-sm text-slate-300">
                    {fileContent || <span className="text-slate-500 italic">Fichier vide.</span>}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Just needed for the close button in preview
function X(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}