import React, { createContext, useContext, useState, useEffect } from 'react';

export type FileType = 'file' | 'directory';

export interface VNode {
  name: string;
  type: FileType;
  content?: string;
  children?: Record<string, VNode>;
  updatedAt: number;
}

export interface FileSystemContextType {
  fs: VNode;
  readDir: (path: string) => VNode[] | null;
  readFile: (path: string) => string | null;
  makeDir: (path: string) => boolean;
  writeFile: (path: string, content: string) => boolean;
  remove: (path: string) => boolean;
  resolvePath: (currentPath: string, targetPath: string) => string;
}

const defaultFS: VNode = {
  name: 'root',
  type: 'directory',
  updatedAt: Date.now(),
  children: {
    home: {
      name: 'home',
      type: 'directory',
      updatedAt: Date.now(),
      children: {
        admin: {
          name: 'admin',
          type: 'directory',
          updatedAt: Date.now(),
          children: {
            documents: {
              name: 'documents',
              type: 'directory',
              updatedAt: Date.now(),
              children: {
                'rapport-pentest.txt': {
                  name: 'rapport-pentest.txt',
                  type: 'file',
                  content: 'Cible: 192.168.1.10\nPorts ouverts: 22, 80, 443\nVulnérabilités: CVE-2021-34527',
                  updatedAt: Date.now()
                }
              }
            },
            'readme.txt': {
              name: 'readme.txt',
              type: 'file',
              content: 'Bienvenue sur Fazer OS.\n\nCe système est optimisé pour les tâches de cybersécurité.\nUtilisez le terminal pour exécuter des commandes standards (ls, cd, mkdir, cat, rm, echo).',
              updatedAt: Date.now()
            }
          }
        }
      }
    },
    etc: {
      name: 'etc',
      type: 'directory',
      updatedAt: Date.now(),
      children: {
        'fazer.conf': {
          name: 'fazer.conf',
          type: 'file',
          content: 'OS_NAME=Fazer\nVERSION=1.0.0\nKERNEL=Fazer-Cyber-Core',
          updatedAt: Date.now()
        }
      }
    }
  }
};

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

export function FileSystemProvider({ children }: { children: React.ReactNode }) {
  const [fs, setFs] = useState<VNode>(() => {
    const saved = localStorage.getItem('fazer_fs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultFS;
      }
    }
    return defaultFS;
  });

  useEffect(() => {
    localStorage.setItem('fazer_fs', JSON.stringify(fs));
  }, [fs]);

  // Helper to traverse to a node
  const getNode = (path: string): VNode | null => {
    if (path === '/' || path === '') return fs;
    const parts = path.split('/').filter(Boolean);
    let current = fs;
    for (const part of parts) {
      if (current.type !== 'directory' || !current.children || !current.children[part]) {
        return null;
      }
      current = current.children[part];
    }
    return current;
  };

  const resolvePath = (currentPath: string, targetPath: string): string => {
    if (targetPath.startsWith('/')) return targetPath;
    const parts = currentPath.split('/').filter(Boolean);
    const targetParts = targetPath.split('/').filter(Boolean);
    
    for (const part of targetParts) {
      if (part === '..') {
        parts.pop();
      } else if (part !== '.') {
        parts.push(part);
      }
    }
    return '/' + parts.join('/');
  };

  const readDir = (path: string): VNode[] | null => {
    const node = getNode(path);
    if (node && node.type === 'directory' && node.children) {
      return Object.values(node.children);
    }
    return node && node.type === 'directory' ? [] : null;
  };

  const readFile = (path: string): string | null => {
    const node = getNode(path);
    if (node && node.type === 'file') {
      return node.content || '';
    }
    return null;
  };

  const makeDir = (path: string): boolean => {
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return false;
    const name = parts.pop()!;
    
    const newFs = JSON.parse(JSON.stringify(fs));
    let current = newFs;
    for (const part of parts) {
      if (current.type !== 'directory' || !current.children || !current.children[part]) {
        return false;
      }
      current = current.children[part];
    }
    
    if (!current.children) current.children = {};
    if (current.children[name]) return false; // Already exists
    
    current.children[name] = {
      name,
      type: 'directory',
      updatedAt: Date.now(),
      children: {}
    };
    
    setFs(newFs);
    return true;
  };

  const writeFile = (path: string, content: string): boolean => {
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return false;
    const name = parts.pop()!;
    
    const newFs = JSON.parse(JSON.stringify(fs));
    let current = newFs;
    for (const part of parts) {
      if (current.type !== 'directory' || !current.children || !current.children[part]) {
        return false;
      }
      current = current.children[part];
    }
    
    if (!current.children) current.children = {};
    if (current.children[name] && current.children[name].type === 'directory') return false; // Cannot overwrite directory
    
    current.children[name] = {
      name,
      type: 'file',
      content,
      updatedAt: Date.now()
    };
    
    setFs(newFs);
    return true;
  };

  const remove = (path: string): boolean => {
    if (path === '/' || path === '') return false; // Cannot remove root
    const parts = path.split('/').filter(Boolean);
    const name = parts.pop()!;
    
    const newFs = JSON.parse(JSON.stringify(fs));
    let current = newFs;
    for (const part of parts) {
      if (current.type !== 'directory' || !current.children || !current.children[part]) {
        return false;
      }
      current = current.children[part];
    }
    
    if (!current.children || !current.children[name]) return false;
    
    delete current.children[name];
    setFs(newFs);
    return true;
  };

  return (
    <FileSystemContext.Provider value={{ fs, readDir, readFile, makeDir, writeFile, remove, resolvePath }}>
      {children}
    </FileSystemContext.Provider>
  );
}

export function useFileSystem() {
  const context = useContext(FileSystemContext);
  if (context === undefined) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
}