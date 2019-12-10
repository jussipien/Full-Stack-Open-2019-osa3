const mongoose = require('mongoose')
const dbUrl = `mongodb+srv://jussipien:<${password}?>@cluster0-bmmee.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.connect(dbUrl, { useNewUrlParser: true })

const personSchema = new mongoose.Schema({
  name: String,
  date: Date,
  display: Boolean,
  id: Number
})

const Person = mongoose.model('Person', personSchema)