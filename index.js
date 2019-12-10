const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 3001

morgan.token('body', (req, res) => JSON.stringify(req.body))

app.use(bodyParser.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())
app.use(express.static('build'))

let persons = [{
                  "name": "Arto Hellas",
                  "number": "040-123456",
                  "display": true,
                  "id": 1
                },
                {
                  "name": "Ada Lovelace",
                  "number": "39-44-5323523",
                  "display": true,
                  "id": 2
                },
                {
                  "name": "Dan Abramov",
                  "number": "12-43-234345",
                  "display": true,
                  "id": 3,
                },
                {
                  "name": "Mary Poppendieck",
                  "number": "39-23-6423122",
                  "display": true,
                  "id": 4
                }]


app.get('/', (req, res) => {
  res.send('<h1>Hello!</h1>')
})

app.get('/info', (req, res) => {
  let length = persons.length
  let date = new Date()

  res.send(`<p>Phonebook has info for ${length} people</p>
            <p>${date}</p>`)
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)
  console.log(person)

  if (!!person) {
    res.json(person)
  } else {
    res.status(404).json({'error':`Person with id ${id} not found`})
  }
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)

  res.status(204).end()
})

app.post('/api/persons', (req, res) => {
  let personPost = req.body
  console.log(personPost)

  if (!personPost.name) {
    res.status(400).json({'error':'Name input was empty!'})
  } else if (!personPost.number) {
    res.status(400).json({'error': 'Number input was empty!'})
  } else if (persons.find(person => person.name === personPost.name)) {
    res.status(409).json({'error':`${personPost.name} already exists in phonebook!`})
  } else {
    let idInUse = true
    let randomId

    while (idInUse) {
      randomId = Math.floor(Math.random()*999999)
      console.log(randomId)
      if (!persons.find(person => person.id === randomId)) {
        idInUse = false
      }
    }
    
    personPost.id = randomId
    persons.push(personPost)
    res.status(201).json(personPost)
  }
  
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})