const express = require('express');
const app = express();
const morgan = require('morgan');

app.use(express.json());
app.use(morgan('tiny'));

let persons = [
    { id: 1, name: "Arto Hellas", number: "040-123456" },
    { id: 2, name: "Ada Lovelace", number: "39-44-5323523" },
    { id: 3, name: "Dan Abramov", number: "12-43-234345" },
    { id: 4, name: "Mary Poppendieck", number: "39-23-6423122" }
];

app.get('https://puhelinluettelo-backend-3pv8.onrender.com/api/persons', (req, res) => {
    res.json(persons);
});

app.get('https://puhelinluettelo-backend-3pv8.onrender.com/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);
    const person = persons.find(parameter => parameter.id === id);

    if (person) {
        res.json(person);
    } else {
        res.status(404).send({ error: "Person not found" });
    }
});

app.delete('https://puhelinluettelo-backend-3pv8.onrender.com/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);
    persons = persons.filter(parameter => parameter.id !== id);
    res.status(204).end();
});

app.post('https://puhelinluettelo-backend-3pv8.onrender.com/api/persons', (req, res) => {
    const {name, number} = req.body;
    
    if (!name || !number) {
        return res.status(400).json({ error: "Name and number are required" });
    }
    
    if (persons.some(parameter => parameter.name === name)) {
        return res.status(400).json({ error: "Name must be unique" });
    }
    
    const newPerson = {
        id: Math.floor(Math.random() * 9999999),
        name,
        number
    };
    
    persons = [...persons, newPerson];
    res.status(201).json(newPerson);
});

app.get('/info', (req, res) => {
    const currentTime = new Date().toString();
    const responseText = `Phonebook has info for ${persons.length} people\n${currentTime}`;
    res.send(`<pre>${responseText}</pre>`);
});

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

