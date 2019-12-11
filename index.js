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

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
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
  console.error(error)

  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(409).json({ error: error.message })
  }

  // ) {
  //   return res.status(409).send({ error: `person with name ${error.value} is already in phonebook` })
  // } else if (error.name === 'ValidatorError' && error.kind === 'minlength') {
  //   return res.status(409).send({ error: 'number must be at least 8 characters long' })
  // }

  next(error)
}

app.use(errorHandler)

// let persons = [{
//                   "name": "Arto Hellas",
//                   "number": "040-123456",
//                   "display": true,
//                   "id": 1
//                 },
//                 {
//                   "name": "Ada Lovelace",
//                   "number": "39-44-5323523",
//                   "display": true,
//                   "id": 2
//                 },
//                 {
//                   "name": "Dan Abramov",
//                   "number": "12-43-234345",
//                   "display": true,
//                   "id": 3,
//                 },
//                 {
//                   "name": "Mary Poppendieck",
//                   "number": "39-23-6423122",
//                   "display": true,
//                   "id": 4
//                 }]

// app.get('/info', (req, res) => {
//   let length = persons.length
//   let date = new Date()

//   res.send(`<p>Phonebook has info for ${length} people</p>
//             <p>${date}</p>`)
// })

// app.get('/api/persons', (req, res) => {
//   res.json(persons)
// })

// app.get('/api/persons/:id', (req, res) => {
//   const id = Number(req.params.id)
//   const person = persons.find(person => person.id === id)
//   console.log(person)

//   if (!!person) {
//     res.json(person)
//   } else {
//     res.status(404).json({'error':`Person with id ${id} not found`})
//   }
// })

// app.delete('/api/persons/:id', (req, res) => {
//   const id = Number(req.params.id)
//   persons = persons.filter(person => person.id !== id)

//   res.status(204).end()
// })

// app.post('/api/persons', (req, res) => {

  // let personPost = req.body
  // console.log(personPost)

  // if (!personPost.name) {
  //   res.status(400).json({'error':'Name input was empty!'})
  // } else if (!personPost.number) {
  //   res.status(400).json({'error': 'Number input was empty!'})
  // } else if (persons.find(person => person.name === personPost.name)) {
  //   res.status(409).json({'error':`${personPost.name} already exists in phonebook!`})
  // } else {
    // let idInUse = true
    // let randomId

    // while (idInUse) {
    //   randomId = Math.floor(Math.random()*999999)
    //   console.log(randomId)
    //   if (!persons.find(person => person.id === randomId)) {
    //     idInUse = false
    //   }
    // }
    
    // personPost.id = randomId
    // persons.push(personPost)
    // res.status(201).json(personPost)
  // }
  
// })

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})