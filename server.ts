import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index.ts';
import { users, transactions, maintenanceItems } from './src/db/schema.ts';
import { eq, desc } from 'drizzle-orm';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // ----------------------------------------------------
  // API: Health / Ping
  // ----------------------------------------------------
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ----------------------------------------------------
  // API: Download Standalone Single-File index.html (Cloudflare ready)
  // ----------------------------------------------------
  app.get('/api/download-singlefile', (req, res) => {
    const distPath = path.resolve(process.cwd(), 'dist/index.html');
    if (fs.existsSync(distPath)) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="index.html"');
      res.sendFile(distPath);
    } else {
      res.status(404).send('Arquivo index.html ainda não gerado. Execute npm run build.');
    }
  });

  // ----------------------------------------------------
  // API: Usuários & Autenticação (Database Cloud SQL)
  // ----------------------------------------------------

  // Obter todos os usuários para tela de login
  app.get('/api/users', async (req, res) => {
    try {
      const allUsers = await db.select({
        id: users.id,
        username: users.username,
        name: users.name,
        occupation: users.occupation,
        motoModel: users.motoModel,
        motoPlate: users.motoPlate,
        currentOdometer: users.currentOdometer,
        monthlyRevenueGoal: users.monthlyRevenueGoal,
        isDarkMode: users.isDarkMode,
      }).from(users);

      res.json(allUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Erro ao buscar usuários do banco de dados.' });
    }
  });

  // Autenticar com username e password
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
      }

      const cleanUser = String(username).trim().toLowerCase();
      const cleanPass = String(password).trim();

      const userList = await db
        .select()
        .from(users)
        .where(eq(users.username, cleanUser));

      if (userList.length === 0) {
        return res.status(401).json({ error: 'Usuário não encontrado.' });
      }

      const matchedUser = userList[0];
      if (matchedUser.password !== cleanPass) {
        return res.status(401).json({ error: 'Senha incorreta.' });
      }

      // Login bem sucedido
      const { password: _, ...userSafe } = matchedUser;
      res.json({ success: true, user: userSafe });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Erro interno ao autenticar no banco de dados.' });
    }
  });

  // Cadastrar novo usuário no banco de dados
  app.post('/api/auth/register', async (req, res) => {
    try {
      const {
        username,
        password,
        name,
        occupation,
        motoModel,
        motoPlate,
        currentOdometer,
        monthlyRevenueGoal,
      } = req.body;

      if (!username || !password || !name) {
        return res.status(400).json({ error: 'Nome, usuário e senha são obrigatórios.' });
      }

      const cleanUser = String(username).trim().toLowerCase();

      // Verificar duplicidade
      const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, cleanUser));

      if (existing.length > 0) {
        return res.status(409).json({ error: 'Este nome de usuário já está em uso.' });
      }

      const inserted = await db
        .insert(users)
        .values({
          username: cleanUser,
          password: String(password).trim(),
          name: String(name).trim(),
          occupation: occupation || 'Autônomo & Motoboy',
          motoModel: motoModel || 'Honda CG 160 Fan ESD',
          motoPlate: motoPlate || '',
          currentOdometer: Number(currentOdometer) || 0,
          monthlyRevenueGoal: Number(monthlyRevenueGoal) || 4500,
          isDarkMode: true,
        })
        .returning();

      const { password: _, ...newUserSafe } = inserted[0];
      res.status(201).json({ success: true, user: newUserSafe });
    } catch (error: any) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Erro ao cadastrar usuário no banco de dados.' });
    }
  });

  // Atualizar perfil do usuário
  app.put('/api/users/:id', async (req, res) => {
    try {
      const userId = Number(req.params.id);
      const updates = req.body;

      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.password) updateData.password = updates.password;
      if (updates.occupation) updateData.occupation = updates.occupation;
      if (updates.motoModel) updateData.motoModel = updates.motoModel;
      if (updates.motoPlate !== undefined) updateData.motoPlate = updates.motoPlate;
      if (updates.currentOdometer !== undefined) updateData.currentOdometer = Number(updates.currentOdometer);
      if (updates.monthlyRevenueGoal !== undefined) updateData.monthlyRevenueGoal = Number(updates.monthlyRevenueGoal);
      if (updates.isDarkMode !== undefined) updateData.isDarkMode = Boolean(updates.isDarkMode);

      const updated = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();

      if (updated.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      const { password: _, ...userSafe } = updated[0];
      res.json({ success: true, user: userSafe });
    } catch (error: any) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Erro ao atualizar dados do usuário.' });
    }
  });

  // ----------------------------------------------------
  // API: Transações (Sincronização com Cloud SQL)
  // ----------------------------------------------------
  app.get('/api/transactions', async (req, res) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      const query = db.select().from(transactions);
      
      const list = userId 
        ? await query.where(eq(transactions.userId, userId)).orderBy(desc(transactions.date))
        : await query.orderBy(desc(transactions.date));

      res.json(list);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Erro ao buscar transações.' });
    }
  });

  app.post('/api/transactions', async (req, res) => {
    try {
      const tx = req.body;
      const inserted = await db.insert(transactions).values({
        id: tx.id || `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: tx.userId ? Number(tx.userId) : 1,
        description: tx.description,
        amount: Number(tx.amount),
        date: tx.date,
        accountType: tx.accountType,
        type: tx.type,
        category: tx.category,
        paymentMethod: tx.paymentMethod,
        notes: tx.notes || null,
        odometerKm: tx.odometerKm ? Number(tx.odometerKm) : null,
      }).returning();

      res.status(201).json(inserted[0]);
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      res.status(500).json({ error: 'Erro ao salvar transação.' });
    }
  });

  app.put('/api/transactions/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const tx = req.body;
      const updated = await db.update(transactions).set({
        description: tx.description,
        amount: Number(tx.amount),
        date: tx.date,
        accountType: tx.accountType,
        type: tx.type,
        category: tx.category,
        paymentMethod: tx.paymentMethod,
        notes: tx.notes || null,
        odometerKm: tx.odometerKm ? Number(tx.odometerKm) : null,
      }).where(eq(transactions.id, id)).returning();

      res.json(updated[0]);
    } catch (error: any) {
      console.error('Error updating transaction:', error);
      res.status(500).json({ error: 'Erro ao atualizar transação.' });
    }
  });

  app.delete('/api/transactions/:id', async (req, res) => {
    try {
      const id = req.params.id;
      await db.delete(transactions).where(eq(transactions.id, id));
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      res.status(500).json({ error: 'Erro ao deletar transação.' });
    }
  });

  // ----------------------------------------------------
  // Montar Vite middleware em desenvolvimento
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();
