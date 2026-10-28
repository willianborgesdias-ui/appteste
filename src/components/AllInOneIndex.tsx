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
import {
  LayoutDashboard,
  ReceiptText,
  Wrench,
  BarChart3,
  Layers,
  Sparkles
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
  onAddMaintenanceItem: (item: Omit<MaintenanceItem, 'id'>) => void;
  onDeleteMaintenanceItem: (id: string) => void;
  onRegisterMaintenanceExpense: (item: MaintenanceItem, amount: number, notes: string) => void;
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
  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-300">
      {/* Visual Header Banner for Consolidated Single Page View */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900/90 p-4 rounded-3xl border border-emerald-500/20 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Visão Geral Unificada</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold uppercase">
                Página Única (Index)
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Painel, Extrato, Manutenção da Moto e Relatórios completos em fluxo contínuo.
            </p>
          </div>
        </div>
      </div>

      {/* 1. SEÇÃO DO PAINEL / DASHBOARD */}
      <section id="section-dashboard" className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-slate-100 text-base sm:text-lg">1. Painel Principal & Indicadores</h3>
          </div>
          <span className="text-xs text-slate-400">Resumo financeiro & metas</span>
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
          onNavigateToMaintenance={() => onNavigateToTab('maintenance')}
          onNavigateToReports={() => onNavigateToTab('reports')}
          onNavigateToTransactions={() => onNavigateToTab('transactions')}
        />
      </section>

      {/* 2. SEÇÃO DE EXTRATO / LANÇAMENTOS */}
      <section id="section-transactions" className="space-y-3 pt-6 border-t border-slate-800/80">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-slate-100 text-base sm:text-lg">2. Extrato Detalhado de Lançamentos</h3>
          </div>
          <span className="text-xs text-slate-400">{transactions.length} registros no período</span>
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
      <section id="section-maintenance" className="space-y-3 pt-6 border-t border-slate-800/80">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-slate-100 text-base sm:text-lg">3. Gestão e Manutenção da Moto</h3>
          </div>
          <span className="text-xs text-slate-400">Odômetro: {userProfile.currentOdometer.toLocaleString('pt-BR')} km</span>
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
      <section id="section-reports" className="space-y-3 pt-6 border-t border-slate-800/80">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-slate-100 text-base sm:text-lg">4. Relatórios Analíticos & DRE Gerencial</h3>
          </div>
          <span className="text-xs text-slate-400">Gráficos, Categorias & Exportações</span>
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
