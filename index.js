require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const app = express()

const PORT = process.env.PORT

morgan.token('body', (req, res) => JSON.stringify(req.body))

app.use(express.static('build'))
app.use(bodyParser.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())

app.get('/', (req, res) => {
  res.send('<h1>Hello!</h1>')
})

app.get('/info', (req, res) => {
  Person.countDocuments({}).then(count => {
    const date = new Date()

    res.send(`<p>Phonebook has info for ${count} people</p>
              <p>${date}</p>`)
  })
  .catch(error => next(error))
})

app.get('/api/persons', (req, res) => {
  Person.find({})
    .then(persons => {
    console.log('fetched all persons from database')
    res.json(persons.map(person => person.toJSON()))
  })
  .catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person.toJSON())
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    res.json(savedPerson.toJSON())
  })
  .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number,
}

  console.log(person)

  Person.findByIdAndUpdate(req.params.id, person, { new: true, runValidators: true, context: 'query' , } )
    .then(updatedPerson => {
      res.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
  .then(result => {
    res.status(204).end()
  })
  .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.name)
  console.error(error.errors)

  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError' && !!error.errors.name && error.errors.name.properties.type === 'unique') {
      return res.status(409).json({ error: error.message })
  } else {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})