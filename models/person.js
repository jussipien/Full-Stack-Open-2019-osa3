const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator');

mongoose.set('useFindAndModify', false)
mongoose.set('useUnifiedTopology', true)

const dbUrl = process.env.MONGODB_URI

mongoose.connect(dbUrl, {useNewUrlParser: true})
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })  

console.log('connecting to', dbUrl)

const personSchema = new mongoose.Schema({
  name:
  {
    type: String,
    minlength: 3,
    index: true,
    required: true,
    unique: true
  },
  number: 
  {
    type: String,
    minlength: 8,
    required: true,
  },
  // display: Boolean,
})

personSchema.plugin(uniqueValidator);

const Person = mongoose.model('Person', personSchema)

personSchema.set('toJSON', {
    transform: (document, object) => {
      object.id = object._id.toString()
      delete object._id
      delete object.__v
    }
  })

module.exports = mongoose.model('Person', personSchema)

