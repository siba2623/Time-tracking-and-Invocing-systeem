import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import { authRoutes } from './routes/auth.routes.js';
import { timeEntriesRoutes } from './routes/time-entries.routes.js';
import auditLogsRoutes from './routes/audit-logs.routes.js';
import clientsRoutes from './routes/clients.routes.js';
import ratesRoutes from './routes/rates.routes.js';
import servicesRoutes from './routes/services.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import payrollRoutes from './routes/payroll.routes.js';
import invoicesRoutes from './routes/invoices.routes.js';
import usersRoutes from './routes/users.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/time-entries', timeEntriesRoutes);
app.use('/api/audit-logs', auditLogsRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/rates', ratesRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/users', usersRoutes);

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app };
