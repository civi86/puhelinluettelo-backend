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

app.get('/api/persons', async (req, res, next) => {
  try {
    const persons = await Person.find({});
    res.json(persons);
  } catch (error) {
    next(error);
  }
});

app.get('/api/persons/:id', async (req, res, next) => {
  try {
    const person = await Person.findById(req.params.id);
    if (person) {
      res.json(person);
    } else {
      res.status(404).send({ error: 'Person not found' });
    }
  } catch (error) {
    next(error);
  }
});

app.delete('/api/persons/:id', async (req, res, next) => {
  try {
    await Person.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.post('/api/persons', async (req, res, next) => {
  const { name, number } = req.body;
  if (!name || !number) {
    return res.status(400).json({ error: 'Name and number are required' });
  }

  try {
    const existingPerson = await Person.findOne({ name });
    if (existingPerson) {
      return res.status(400).json({ error: 'Name must be unique' });
    }
    const newPerson = new Person({ name, number });
    const savedPerson = await newPerson.save();
    res.status(201).json(savedPerson);
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error.message);

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return res.status(400).send({ error: 'Wrong id' });
  } 
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }

  res.status(500).json({ error: 'Error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
