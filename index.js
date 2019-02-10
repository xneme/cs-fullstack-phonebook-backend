if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Contact = require('./models/contact')

app.use(cors())
app.use(bodyParser.json())
app.use(express.static('build'))

morgan.token('body', (req) =>
  req.method === 'POST' ? JSON.stringify(req.body) : ''
)
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
)

app.get('/api/contacts', (req, res) => {
  Contact.find({}).then((contacts) => {
    res.json(contacts.map((contact) => contact.toJSON()))
  })
})

app.get('/info', (req, res) => {
  Contact.find({}).then((contacts) => {
    res.send(
      `<p>Puhelinluettelossa on ${
        contacts.length
      } henkilön tiedot</p><p>${new Date()}</p>`
    )
  })
})

app.get('/api/contacts/:id', (req, res, next) => {
  Contact.findById(req.params.id)
    .then((contact) => {
      if (contact) {
        res.json(contact.toJSON())
      } else {
        res.status(204).end()
      }
    })
    .catch((error) => next(error))
})

app.post('/api/contacts', (req, res, next) => {
  const body = req.body

  if (body.name === undefined || body.number === undefined) {
    return res.status(400).json({ error: 'name or number missing' })
  }

  const contact = new Contact({
    name: body.name,
    number: body.number
  })

  contact
    .save()
    .then((savedNote) => {
      res.json(savedNote.toJSON())
    })
    .catch((error) => next(error))
})

app.delete('/api/contacts/:id', (req, res, next) => {
  Contact.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch((error) => next(error))
})

app.put('/api/contacts/:id', (req, res, next) => {
  const body = req.body

  const contact = {
    name: body.name,
    number: body.number
  }

  Contact.findByIdAndUpdate(req.params.id, contact, {
    new: true,
    runValidators: true,
    context: 'query'
  })
    .then((updatedContact) => {
      res.json(updatedContact.toJSON())
    })
    .catch((error) => next(error))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
