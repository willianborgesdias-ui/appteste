import React from 'react';
import {
  AccountType,
  Category,
  DateFilter,
  MaintenanceItem,
  Transaction,
  UserProfile,
} from '../types';
import { Dashboard } from './Dashboard';
import { TransactionsList } from './TransactionsList';
import { MotoMaintenance } from './MotoMaintenance';
import { Reports } from './Reports';
import { exportTransactionsToCSV } from '../utils/exportUtils';
import { calculateMaintenanceStatus, formatCurrency } from '../utils/formatters';
import {
  LayoutDashboard,
  ReceiptText,
  Wrench,
  BarChart3,
  Layers,
  ArrowUp,
  Plus,
  Download,
  Bike,
  Gauge,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface AllInOneIndexProps {
  activeAccount: AccountType;
  transactions: Transaction[];
  allTransactions: Transaction[];
  maintenanceItems: MaintenanceItem[];
  userProfile: UserProfile;
  dateFilter: DateFilter;
  setDateFilter: (filter: DateFilter) => void;
  onOpenNewTransactionWithDefaults?: (defaults: Partial<Transaction>) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
  onUpdateOdometer: (newKm: number) => void;
  onUpdateMaintenanceItem: (item: MaintenanceItem) => void;
  onAddMaintenanceItem: (item: MaintenanceItem) => void;
  onDeleteMaintenanceItem: (id: string) => void;
  onRegisterMaintenanceExpense: (expense: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onNavigateToTab: (tab: 'dashboard' | 'transactions' | 'maintenance' | 'reports') => void;
}

export const AllInOneIndex: React.FC<AllInOneIndexProps> = ({
  activeAccount,
  transactions,
  allTransactions,
  maintenanceItems,
  userProfile,
  dateFilter,
  setDateFilter,
  onOpenNewTransactionWithDefaults,
  onEditTransaction,
  onDeleteTransaction,
  onUpdateOdometer,
  onUpdateMaintenanceItem,
  onAddMaintenanceItem,
  onDeleteMaintenanceItem,
  onRegisterMaintenanceExpense,
  onNavigateToTab,
}) => {
  const scrollTo = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      const yOffset = -70; // offset for sticky header
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Quick summary counts
  const pendingAlerts = maintenanceItems.filter((item) => {
    const status = calculateMaintenanceStatus(item, userProfile.currentOdometer);
    return status.status === 'VENCIDO' || status.status === 'ATENCAO';
  }).length;

  const totalReceitas = transactions
    .filter((t) => t.type === 'RECEITA')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDespesas = transactions
    .filter((t) => t.type === 'DESPESA')
    .reduce((sum, t) => sum + t.amount, 0);

  const saldoPeriodo = totalReceitas - totalDespesas;

  return (
    <div className="space-y-10 pb-24 animate-in fade-in duration-300">
      {/* 1. Header Banner & Quick Summary Strip */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 p-4 sm:p-5 rounded-3xl border border-emerald-500/25 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 shrink-0">
              <Layers className="w-6 h-6 stroke-[2.3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Linha de Index Unificada
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Tudo em 1
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Painel, Extrato de Lançamentos, Manutenção da Moto e DRE em uma única tela contínua.
              </p>
            </div>
          </div>

          {/* Quick CTA */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <a
              href="/api/download-singlefile"
              download="index.html"
              title="Baixar todas as linhas de código em um único arquivo index.html (Cloudflare Pages)"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar index.html</span>
            </a>
            <button
              onClick={() => onOpenNewTransactionWithDefaults?.({})}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Novo Lançamento</span>
            </button>
          </div>
        </div>

        {/* Quick KPI pills for instant glance */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Saldo Líquido</span>
            <span className={`text-xs sm:text-sm font-bold ${saldoPeriodo >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(saldoPeriodo)}
            </span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Lançamentos</span>
            <span className="text-xs sm:text-sm font-bold text-white">
              {transactions.length} registros
            </span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Hodômetro Moto</span>
            <span className="text-xs sm:text-sm font-bold text-teal-300">
              {userProfile.currentOdometer.toLocaleString('pt-BR')} km
            </span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Alertas Moto</span>
            <span className={`text-xs sm:text-sm font-bold flex items-center gap-1 ${pendingAlerts > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {pendingAlerts > 0 ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{pendingAlerts} pendentes</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tudo em dia</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Sticky-ready fast jumping buttons */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 shrink-0 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Índice:
          </span>
          <button
            onClick={() => scrollTo('section-dashboard')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium shrink-0 transition-colors border border-slate-700/60"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
            <span>1. Painel</span>
          </button>
          <button
            onClick={() => scrollTo('section-transactions')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium shrink-0 transition-colors border border-slate-700/60"
          >
            <ReceiptText className="w-3.5 h-3.5 text-blue-400" />
            <span>2. Extrato ({transactions.length})</span>
          </button>
          <button
            onClick={() => scrollTo('section-maintenance')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium shrink-0 transition-colors border border-slate-700/60"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>3. Moto {pendingAlerts > 0 && `(${pendingAlerts})`}</span>
          </button>
          <button
            onClick={() => scrollTo('section-reports')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium shrink-0 transition-colors border border-slate-700/60"
          >
            <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
            <span>4. DRE & Relatórios</span>
          </button>
        </div>
      </div>

      {/* 1. SEÇÃO DO PAINEL / DASHBOARD */}
      <section id="section-dashboard" className="space-y-4 pt-2">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-base sm:text-lg">
                1. Painel Principal & Indicadores
              </h2>
              <p className="text-[11px] text-slate-400">
                Visão geral das finanças ({activeAccount}) e metas diárias
              </p>
            </div>
          </div>
          <button
            onClick={scrollToTop}
            title="Voltar ao Topo"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors flex items-center gap-1 text-[11px]"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Topo</span>
          </button>
        </div>

        <Dashboard
          activeAccount={activeAccount}
          transactions={transactions}
          maintenanceItems={maintenanceItems}
          userProfile={userProfile}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          onOpenNewTransactionWithDefaults={onOpenNewTransactionWithDefaults}
          onEditTransaction={onEditTransaction}
          onDeleteTransaction={onDeleteTransaction}
          onNavigateToMaintenance={() => scrollTo('section-maintenance')}
          onNavigateToReports={() => scrollTo('section-reports')}
          onNavigateToTransactions={() => scrollTo('section-transactions')}
        />
      </section>

      {/* 2. SEÇÃO DE EXTRATO / LANÇAMENTOS */}
      <section id="section-transactions" className="space-y-4 pt-8 border-t border-slate-800/80">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ReceiptText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-base sm:text-lg">
                2. Extrato Detalhado de Lançamentos
              </h2>
              <p className="text-[11px] text-slate-400">
                Histórico completo com filtros, busca, edição, exclusão e exportação CSV
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenNewTransactionWithDefaults?.({})}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar</span>
            </button>
            <button
              onClick={scrollToTop}
              title="Voltar ao Topo"
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors flex items-center gap-1 text-[11px]"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Topo</span>
            </button>
          </div>
        </div>

        <TransactionsList
          transactions={transactions}
          activeAccount={activeAccount}
          onEditTransaction={onEditTransaction}
          onDeleteTransaction={onDeleteTransaction}
          onOpenNewTransaction={() => onOpenNewTransactionWithDefaults?.({})}
          onExportCSV={() =>
            exportTransactionsToCSV(
              transactions,
              `extrato-${userProfile.name.toLowerCase().replace(/\s+/g, '-')}.csv`
            )
          }
        />
      </section>

      {/* 3. SEÇÃO DE MANUTENÇÃO DA MOTO */}
      <section id="section-maintenance" className="space-y-4 pt-8 border-t border-slate-800/80">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-base sm:text-lg">
                3. Gestão e Manutenção da Moto
              </h2>
              <p className="text-[11px] text-slate-400">
                {userProfile.motoModel || 'Motocicleta'} • Odômetro Atual: {userProfile.currentOdometer.toLocaleString('pt-BR')} km
              </p>
            </div>
          </div>
          <button
            onClick={scrollToTop}
            title="Voltar ao Topo"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors flex items-center gap-1 text-[11px]"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Topo</span>
          </button>
        </div>

        <MotoMaintenance
          maintenanceItems={maintenanceItems}
          userProfile={userProfile}
          onUpdateOdometer={onUpdateOdometer}
          onUpdateMaintenanceItem={onUpdateMaintenanceItem}
          onAddMaintenanceItem={onAddMaintenanceItem}
          onDeleteMaintenanceItem={onDeleteMaintenanceItem}
          onRegisterMaintenanceExpense={onRegisterMaintenanceExpense}
          transactions={transactions}
        />
      </section>

      {/* 4. SEÇÃO DE RELATÓRIOS & DRE */}
      <section id="section-reports" className="space-y-4 pt-8 border-t border-slate-800/80">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-base sm:text-lg">
                4. Relatórios Analíticos & DRE Gerencial
              </h2>
              <p className="text-[11px] text-slate-400">
                DRE simplificado, margem operacional, custos por km e comparativos
              </p>
            </div>
          </div>
          <button
            onClick={scrollToTop}
            title="Voltar ao Topo"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors flex items-center gap-1 text-[11px]"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Topo</span>
          </button>
        </div>

        <Reports
          transactions={allTransactions}
          userProfile={userProfile}
          maintenanceItems={maintenanceItems}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
        />
      </section>
    </div>
  );
};
