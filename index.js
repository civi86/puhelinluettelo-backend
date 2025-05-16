import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());
app.use(morgan('tiny'));
app.use(cors());

const mongoUri = process.env.MONGO_URI;

mongoose.set('strictQuery', false);
console.log('Mongo URI:', mongoUri);
mongoose.connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

app.get('/api/persons', async (req, res) => {
  try {
    const persons = await Person.find({});
    res.json(persons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch persons' });
  }
});

app.get('/api/persons/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const person = await Person.findById(id);
    if (person) {
      res.json(person);
    } else {
      res.status(404).send({ error: 'Person not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch person' });
  }
});

app.delete('/api/persons/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await Person.findByIdAndDelete(id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete person' });
  }
});

app.post('/api/persons', async (req, res) => {
  const { name, number } = req.body;
  console.log("Received data:", req.body);

  if (!name || !number) {
    return res.status(400).json({ error: 'Name and number are required' });
  }

  try {
    const existingPerson = await Person.findOne({ name });
    if (existingPerson) {
      return res.status(400).json({ error: 'Name must be unique' });
    }

    const newPerson = new Person({ name, number });
    await newPerson.save();
    res.status(201).json(newPerson);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add person' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
