import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import logRoutes from './routes/logRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Connect to MongoDB
connectDB();

// Mount Routes
app.use('/api/farmer/auth', authRoutes);
app.use('/api/farmer/logs', logRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('Farmer App Backend Service is running');
});

app.get('/api/farmer/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', message: 'Farmer App Backend Service is online' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
