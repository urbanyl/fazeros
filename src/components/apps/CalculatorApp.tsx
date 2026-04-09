import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import { evaluate } from 'mathjs';

// Calculator Component
export default function CalculatorApp() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleNumber = (num: string) => {
    if (display === '0' || display === 'Erreur') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    if (display === 'Erreur') return;
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleEqual = () => {
    try {
      const fullEquation = equation + display;
      // Use evaluate from mathjs for safe math evaluation instead of eval
      const result = evaluate(fullEquation.replace('×', '*').replace('÷', '/'));
      
      // Format to avoid long decimals
      const formattedResult = Number.isInteger(result) ? result.toString() : result.toFixed(4).replace(/\.?0+$/, '');
      
      setDisplay(formattedResult);
      setEquation('');
    } catch (e) {
      setDisplay('Erreur');
      setEquation('');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const key = e.key;
    if (/[0-9]/.test(key)) handleNumber(key);
    if (['+', '-', '*', '/'].includes(key)) {
      const opMap: Record<string, string> = { '*': '×', '/': '÷', '+': '+', '-': '-' };
      handleOperator(opMap[key]);
    }
    if (key === 'Enter' || key === '=') handleEqual();
    if (key === 'Escape' || key === 'Backspace' || key === 'Delete') handleClear();
  };

  return (
    <div 
      className="flex flex-col h-full bg-slate-900 text-white rounded-lg overflow-hidden border border-white/10"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-black/40 border-b border-white/10">
        <Calculator className="w-5 h-5 text-blue-400" />
        <span className="font-medium text-sm">Calculatrice Pro</span>
      </div>

      {/* Display */}
      <div className="flex flex-col items-end justify-end p-6 bg-slate-800/50 flex-1">
        <div className="text-slate-400 text-sm min-h-[20px] mb-2">{equation}</div>
        <div className="text-4xl font-light tracking-wider truncate w-full text-right">
          {display}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-1 p-2 bg-slate-950">
        <button onClick={handleClear} className="col-span-2 p-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-md transition-colors">C</button>
        <button onClick={() => handleOperator('÷')} className="p-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-md transition-colors">÷</button>
        <button onClick={() => handleOperator('×')} className="p-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-md transition-colors">×</button>

        <button onClick={() => handleNumber('7')} className="p-4 bg-white/5 hover:bg-white/10 rounded-md transition-colors">7</button>
        <button onClick={() => handleNumber('8')} className="p-4 bg-white/5 hover:bg-white/10 rounded-md transition-colors">8</button>
        <button onClick={() => handleNumber('9')} className="p-4 bg-white/5 hover:bg-white/10 rounded-md transition-colors">9</button>
        <button onClick={() => handleOperator('-')} className="p-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-md transition-colors">-</button>

        <button onClick={() => handleNumber('4')} className="p-4 bg-white/5 hover:bg-white/10 rounded-md transition-colors">4</button>
        <button onClick={() => handleNumber('5')} className="p-4 bg-white/5 hover:bg-white/10 rounded-md transition-colors">5</button>
        <button onClick={() => handleNumber('6')} className="p-4 bg-white/5 hover:bg-white/10 rounded-md transition-colors">6</button>
        <button onClick={() => handleOperator('+')} className="p-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-md transition-colors">+</button>

        <button onClick={() => handleNumber('1')} className="p-4 bg-white/5 hover:bg-white/10 rounded-md transition-colors">1</button>
        <button onClick={() => handleNumber('2')} className="p-4 bg-white/5 hover:bg-white/10 rounded-md transition-colors">2</button>
        <button onClick={() => handleNumber('3')} className="p-4 bg-white/5 hover:bg-white/10 rounded-md transition-colors">3</button>
        <button onClick={handleEqual} className="row-span-2 p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors font-medium">=</button>

        <button onClick={() => handleNumber('0')} className="col-span-2 p-4 bg-white/5 hover:bg-white/10 rounded-md transition-colors">0</button>
        <button onClick={() => handleNumber('.')} className="p-4 bg-white/5 hover:bg-white/10 rounded-md transition-colors">.</button>
      </div>
    </div>
  );
}
