import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  Plus,
  Wrench,
  BarChart3,
  Layers,
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'transactions' | 'maintenance' | 'reports' | 'all';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewTransaction: () => void;
  maintenanceAlertCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTransaction,
  maintenanceAlertCount = 0,
}) => {
  const handleTabClick = (tab: ActiveTab, sectionId?: string) => {
    if (activeTab === 'all' && sectionId) {
      const el = document.getElementById(sectionId);
      if (el) {
        const yOffset = -70;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
        return;
      }
    }
    setActiveTab(tab);
  };

  const handleAllInOneClick = () => {
    if (activeTab === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveTab('all');
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 pb-safe shadow-2xl">
      <div className="max-w-xl mx-auto px-2 sm:px-4 h-16 flex items-center justify-between relative">
        {/* Tab: Dashboard */}
        <button
          id="nav-dashboard-btn"
          onClick={() => handleTabClick('dashboard', 'section-dashboard')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === 'dashboard'
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title={activeTab === 'all' ? "Rolar para Painel" : "Painel"}
        >
          <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 mb-1" />
          <span className="text-[10px] tracking-tight">Painel</span>
        </button>

        {/* Tab: Transactions */}
        <button
          id="nav-transactions-btn"
          onClick={() => handleTabClick('transactions', 'section-transactions')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === 'transactions'
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title={activeTab === 'all' ? "Rolar para Extrato" : "Extrato"}
        >
          <ReceiptText className="w-4 h-4 sm:w-5 sm:h-5 mb-1" />
          <span className="text-[10px] tracking-tight">Extrato</span>
        </button>

        {/* Center Floating Action Button (New Transaction) */}
        <div className="flex-1 flex justify-center items-center">
          <button
            id="quick-add-transaction-btn"
            onClick={onOpenNewTransaction}
            className="w-12 h-12 sm:w-13 sm:h-13 -mt-6 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-transform"
            aria-label="Adicionar Nova Transação"
            title="Novo Lançamento"
          >
            <Plus className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab: Moto Maintenance */}
        <button
          id="nav-maintenance-btn"
          onClick={() => handleTabClick('maintenance', 'section-maintenance')}
          className={`relative flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === 'maintenance'
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title={activeTab === 'all' ? "Rolar para Moto" : "Moto"}
        >
          <div className="relative">
            <Wrench className="w-4 h-4 sm:w-5 sm:h-5 mb-1" />
            {maintenanceAlertCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {maintenanceAlertCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Moto</span>
        </button>

        {/* Tab: Reports */}
        <button
          id="nav-reports-btn"
          onClick={() => handleTabClick('reports', 'section-reports')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === 'reports'
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title={activeTab === 'all' ? "Rolar para Relatórios" : "Relatórios"}
        >
          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mb-1" />
          <span className="text-[10px] tracking-tight">Relatórios</span>
        </button>

        {/* Tab: Linha Index / Tudo 1x */}
        <button
          id="nav-all-in-one-btn"
          onClick={handleAllInOneClick}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === 'all'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Ver tudo em uma só linha de index"
        >
          <div className="relative">
            <div className={`w-4 h-4 sm:w-5 sm:h-5 mb-1 rounded-md border flex items-center justify-center text-[9px] font-bold ${
              activeTab === 'all'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/20 shadow-sm shadow-emerald-500/30'
                : 'border-slate-500 text-slate-400'
            }`}>
              <Layers className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </div>
          </div>
          <span className="text-[10px] tracking-tight font-medium">Index</span>
        </button>
      </div>
    </nav>
  );
};
