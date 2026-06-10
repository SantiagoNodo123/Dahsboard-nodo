// server/index.js

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mapping between frontend keys and Prisma models
const modelMap = {
  'nodo_sales': prisma.sale,
  'nodo_investments': prisma.investment,
  'nodo_capital': prisma.capitalMovement,
  'nodo_investors': prisma.investor,
  'nodo_expenses': prisma.expense,
  'nodo_fixed_costs': prisma.fixedCost,
  'nodo_variable_costs': prisma.variableCost,
  'nodo_social_posts': prisma.socialPost
};

// Generic GET all
app.get('/api/:entity', async (req, res) => {
  const model = modelMap[req.params.entity];
  if (!model) return res.status(404).json({ error: 'Entity not found' });
  
  try {
    const data = await model.findMany();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Generic GET by ID
app.get('/api/:entity/:id', async (req, res) => {
  const model = modelMap[req.params.entity];
  if (!model) return res.status(404).json({ error: 'Entity not found' });
  
  try {
    const item = await model.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Generic POST (Create)
app.post('/api/:entity', async (req, res) => {
  const model = modelMap[req.params.entity];
  if (!model) return res.status(404).json({ error: 'Entity not found' });
  
  try {
    // If id is provided, we can either use it or ignore it since we have @default(uuid())
    // but the frontend might be sending it. Let's let Prisma handle the ID if it's missing.
    const { id, ...data } = req.body;
    
    // We pass the id if it exists, otherwise prisma generates it.
    const createData = req.body.id ? req.body : data;
    
    const newItem = await model.create({ data: createData });
    res.status(201).json(newItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// Generic PUT (Update)
app.put('/api/:entity/:id', async (req, res) => {
  const model = modelMap[req.params.entity];
  if (!model) return res.status(404).json({ error: 'Entity not found' });
  
  try {
    // Exclude id from update data if present
    const { id, ...updateData } = req.body;
    
    const updatedItem = await model.update({
      where: { id: req.params.id },
      data: updateData
    });
    res.json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// Generic DELETE
app.delete('/api/:entity/:id', async (req, res) => {
  const model = modelMap[req.params.entity];
  if (!model) return res.status(404).json({ error: 'Entity not found' });
  
  try {
    await model.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend de Nodo Tech & Growth corriendo en http://localhost:${PORT}`);
});
