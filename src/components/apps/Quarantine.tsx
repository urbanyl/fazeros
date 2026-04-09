import { useState } from 'react';
import { ShieldAlert, RefreshCw, Trash2, Search, FileKey, CheckCircle } from 'lucide-react';

interface QuarantinedFile {
  id: string;
  name: string;
  path: string;
  threat: string;
  date: string;
  status: 'quarantined' | 'restored' | 'deleted';
}

const mockFiles: QuarantinedFile[] = [
  { id: '1', name: 'suspicious_payload.exe', path: 'C:\\Users\\Admin\\Downloads', threat: 'Trojan:Win32/Wacatac.B!ml', date: '2026-04-08 14:22:10', status: 'quarantined' },
  { id: '2', name: 'reverse_shell.py', path: '/tmp/', threat: 'Behavior:Linux/ReverseShell.A', date: '2026-04-07 09:15:33', status: 'quarantined' },
  { id: '3', name: 'invoice_7829.pdf.exe', path: 'C:\\Users\\Admin\\Desktop', threat: 'Ransom:Win32/Locky.A', date: '2026-04-06 18:40:01', status: 'quarantined' },
];

export default function Quarantine() {
  const [files, setFiles] = useState<QuarantinedFile[]>(mockFiles);
  const [filter, setFilter] = useState('');

  const handleRestore = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir restaurer ce fichier ? Cela pourrait exposer votre système à des risques.')) {
      setFiles(files.map(f => f.id === id ? { ...f, status: 'restored' } : f));
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Supprimer définitivement ce fichier ? Cette action est irréversible.')) {
      setFiles(files.map(f => f.id === id ? { ...f, status: 'deleted' } : f));
    }
  };

  const filteredFiles = files.filter(f => 
    (f.name.toLowerCase().includes(filter.toLowerCase()) || 
     f.threat.toLowerCase().includes(filter.toLowerCase())) &&
    f.status === 'quarantined'
  );

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-[#1e1e1e] text-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-yellow-500" />
            Zone de Quarantaine
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Les fichiers malveillants sont isolés ici. La suppression définitive n'est appliquée qu'avec votre accord explicite.
          </p>
        </div>
        <div className="flex items-center bg-[#252526] border border-[#333] rounded-md px-3 py-1.5 w-64">
          <Search className="w-4 h-4 text-slate-500 mr-2" />
          <input 
            type="text" 
            placeholder="Rechercher une menace..." 
            className="bg-transparent border-none outline-none text-sm w-full"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-[#252526] border border-[#333] rounded-lg overflow-hidden flex-1 flex flex-col">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#2d2d30] border-b border-[#3e3e42]">
            <tr>
              <th className="py-3 px-4 font-medium text-slate-300">Nom du fichier</th>
              <th className="py-3 px-4 font-medium text-slate-300">Menace détectée</th>
              <th className="py-3 px-4 font-medium text-slate-300">Emplacement d'origine</th>
              <th className="py-3 px-4 font-medium text-slate-300">Date d'isolement</th>
              <th className="py-3 px-4 font-medium text-slate-300 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#333]">
            {filteredFiles.map(file => (
              <tr key={file.id} className="hover:bg-[#2a2d3e] transition-colors">
                <td className="py-3 px-4 flex items-center gap-2">
                  <FileKey className="w-4 h-4 text-red-400" />
                  <span className="font-medium text-slate-200">{file.name}</span>
                </td>
                <td className="py-3 px-4 text-red-400 font-mono text-xs">{file.threat}</td>
                <td className="py-3 px-4 text-slate-400 text-xs truncate max-w-[200px]">{file.path}</td>
                <td className="py-3 px-4 text-slate-400">{file.date}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleRestore(file.id)}
                      className="p-1.5 rounded hover:bg-blue-500/20 text-blue-400 transition-colors"
                      title="Restaurer le fichier"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(file.id)}
                      className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Supprimer définitivement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredFiles.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3 opacity-50" />
                  <p>Aucune menace en quarantaine correspondant à vos critères.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
