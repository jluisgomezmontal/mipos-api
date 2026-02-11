import express from 'express';
import morgan from 'morgan';
import compression from 'compression';
import { setupSecurity } from './middlewares/security.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import routes from './routes/index.js';
import env from './config/env.js';

const app = express();

app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

app.use(compression());

setupSecurity(app);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/v1', routes);

app.use(notFound);

app.use(errorHandler);

export default app;
