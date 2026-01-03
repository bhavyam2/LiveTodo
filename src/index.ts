import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 1. Root Route - This fixes the "Cannot GET /" error
app.get('/', (req, res) => {
  res.send('Welcome to the LiveWhiteboard API!');
});

// 2. Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'LiveWhiteboard server is running!' });
});

// 3. Test Route - Create a Board in Supabase
app.post('/test-create-board', async (req, res) => {
  try {
    const newBoard = await prisma.board.create({
      data: {
        title: "My First Whiteboard",
        owner: {
          create: {
            email: "bhavumehrotra@gmail.com", // Using your email from your profile
            name: "Bhavya"
          }
        }
      }
    });
    res.json({ message: "Success!", board: newBoard });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create board" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server ready at: http://localhost:${PORT}`);
});