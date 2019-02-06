const mongoose = require('mongoose')

console.log(process.argv)
if (process.argv.length < 3) {
  console.log(
    'usage: npm mongo.js <password> or npm mongo.js <password> <name> <number>'
  )
  process.exit(1)
}

const password = process.argv[2]
const url = `mongodb://fullstack-phonebook:${password}@ds227110.mlab.com:27110/cs-fullstack-phonebook`

mongoose.connect(url, { useNewUrlParser: true })

const contactSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Contact = mongoose.model('Contact', contactSchema)

if (process.argv.length == 5) {
  const contact = new Contact({
    name: process.argv[3],
    number: process.argv[4]
  })

  contact.save().then((response) => {
    console.log(response)
    console.log(
      `lisätään ${process.argv[3]} numero ${process.argv[4]} luetteloon`
    )
    mongoose.connection.close()
  })
} else {
  Contact.find({}).then((result) => {
    console.log('puhelinluettelo:')
    result.forEach((contact) => {
      console.log(contact.name, contact.number)
    })
    mongoose.connection.close()
  })
}
