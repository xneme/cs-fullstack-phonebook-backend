const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')

app.use(bodyParser.json())

morgan.token('body', (req, res) =>
  req.method === 'POST' ? JSON.stringify(req.body) : ''
)
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
)

app.get('/api/contacts', (req, res) => {
  res.json(contacts)
})

app.get('/info', (req, res) => {
  res.send(
    `<p>Puhelinluettelossa on ${
      contacts.length
    } henkilön tiedot</p><p>${new Date()}</p>`
  )
})

app.get('/api/contacts/:id', (req, res) => {
  const id = Number(req.params.id)
  const contact = contacts.find((contact) => contact.id === id)

  if (contact) {
    res.json(contact)
  } else {
    res.status(404).end()
  }
})

app.post('/api/contacts', (req, res) => {
  const body = req.body

  if (body.name === undefined || body.number === undefined) {
    return res.status(400).json({ error: 'name or number missing' })
  }

  if (
    contacts.some(
      (contact) => contact.name.toLowerCase() === body.name.toLowerCase()
    )
  ) {
    return res.status(400).json({ error: 'name must be unique' })
  }

  const contact = {
    id: generateId(),
    name: body.name,
    number: body.number
  }

  contacts = contacts.concat(contact)

  res.json(contact)
})

app.delete('/api/contacts/:id', (req, res) => {
  const id = Number(req.params.id)
  contacts = contacts.filter((contact) => contact.id !== id)

  res.status(204).end()
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const generateId = () => {
  return Math.floor(Math.random() * 1000000)
}

let contacts = [
  {
    name: 'Arto Hellas',
    number: '045-123456',
    id: 1
  },
  {
    name: 'Martti Tienari',
    number: '041-1234567',
    id: 2
  },
  {
    name: 'Arto Järvinen',
    number: '09-123456',
    id: 3
  },
  {
    name: 'Lea Kutvonen',
    number: '040-123456',
    id: 4
  }
]
