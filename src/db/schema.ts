import { integer, pgTable, serial, text, timestamp, doublePrecision, boolean } from 'drizzle-orm/pg-core';

// Tabela de Usuários (Login e Senha com persistência SQL)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  occupation: text('occupation').default('Autônomo & Motoboy'),
  motoModel: text('moto_model').default('Honda CG 160 Fan ESD'),
  motoPlate: text('moto_plate').default('BRA-3X99'),
  currentOdometer: integer('current_odometer').default(28450),
  monthlyRevenueGoal: doublePrecision('monthly_revenue_goal').default(4500),
  isDarkMode: boolean('is_dark_mode').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabela de Transações (Receitas e Despesas PF e PJ)
export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  description: text('description').notNull(),
  amount: doublePrecision('amount').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  accountType: text('account_type').notNull(), // PF | PJ
  type: text('type').notNull(), // RECEITA | DESPESA
  category: text('category').notNull(),
  paymentMethod: text('payment_method').notNull(),
  notes: text('notes'),
  odometerKm: integer('odometer_km'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabela de Itens de Manutenção da Moto
export const maintenanceItems = pgTable('maintenance_items', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  title: text('title').notNull(),
  category: text('category').notNull(),
  type: text('type').notNull(), // KM | DATE | BOTH
  lastKm: integer('last_km').notNull(),
  intervalKm: integer('interval_km').notNull(),
  lastDate: text('last_date').notNull(),
  intervalDays: integer('interval_days').notNull(),
  estimatedCost: doublePrecision('estimated_cost'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});
