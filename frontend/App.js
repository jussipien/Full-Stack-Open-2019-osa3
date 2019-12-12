import React, { useState, useEffect  } from 'react'
import Services from './services/services'
import './App.css'

// dictates how long a message from axios operation stays on screen
const messageTimeout = 5000

// returns a message when the state of messageText changes, styled depending on parameter type
const Message = ({text, type}) => {
  if (!!text) {
    const classes = `Message ${type}`
    return (
    <div className={classes}>
      <p>{text}</p>
    </div>
    )
  } else {
    return <></>
  }
}

// component for search filter input and its label
const Filter = ({inputFilter, newFilter}) => {
  return (
  <>
    <label htmlFor="filter">filter shown with</label>
    <input type="text" id="filter" name="filter" onChange={inputFilter} value={newFilter}/>
  </>
  )
}

// used for manipulating record data: can add new names and numbers to the phonebook and change numbers
// attached to existing names
const PersonForm = ({inputName, newName, inputNumber, newNumber, onSubmit}) => {
  return (
    <>
    <form onSubmit={onSubmit}>
      <table>
        <tbody>
          <tr>
            <td>
              <label htmlFor="name">name</label>
            </td>
            <td>
              <input type="text" id="name" name="name" required={true} onChange={inputName} value={newName}/>
            </td>
          </tr>
          <tr>
            <td>
              <label htmlFor="number">number</label>
            </td>
            <td>
              <input type="text" id="number" name="number" required={true} onChange={inputNumber} value={newNumber}/>
            </td>
          </tr>
          <tr>
            <td>
              <button type="submit">add</button>
            </td>
          </tr>
        </tbody>
      </table>
    </form>
    </>
  )
}

// displays the names and numbers in the phonebook as table rows, along with a delete button
// that deletes the row's record
const PersonTable = ({persons, onClickDelete}) => {
  const personsToShow = persons.filter(person => person.display === true)

  const tableItems = () => personsToShow.map(person => {
    return(
      <tr key={person.name + "-" + person.id}>
        <td>{person.name}</td>
        <td>{person.number}</td>
        <td><button onClick={onClickDelete} data-id={person.id}>delete</button></td>
      </tr>
    )
  })

  return (
    <table>
      <tbody>
        {tableItems()}
      </tbody>
    </table>
  )
}

const App = () => {
  // const [persons, setPersons] = useState([
  //   { name: 'Arto Hellas', number: '040-123456', display: true },
  //   { name: 'Ada Lovelace', number: '39-44-5323523', display: true },
  //   { name: 'Dan Abramov', number: '12-43-234345', display: true },
  //   { name: 'Mary Poppendieck', number: '39-23-6423122', display: true }
  // ])

  const [ persons, setPersons ] = useState([])
  const [ newName, setNewName ] = useState('')
  const [ newNumber, setNewNumber ] = useState('')
  const [ newFilter, setNewFilter ] = useState('')
  const [ messageText, setMessageText ] = useState('')
  const [ messageType, setMessageType ] = useState('')

  // initializes the phonebook data when the app is first rendered
  useEffect(() => {
    // axios
    //   .get('http://localhost:3001/persons')
      Services.getAll()
      .then(response => {
        response.data.forEach((person, index) => response.data[index].display = true)
        setPersons(response.data)
      })
  }, [])

  // filters the phonebook each time the value in the filter field changes; sets everything to be
  // displayed if the filter is empty
  const inputFilter = (event) => {
    const string = event.target.value
    setNewFilter(string)
    let personsCopy = [...persons]
    if (!!string) {
      console.log('string exists')
      personsCopy.forEach(person => person.display = person.name.toLowerCase().includes(string.toLowerCase()))
    } else {
      console.log('no string')
      personsCopy.forEach(person => person.display = true)
    }
    console.log('personsCopy', personsCopy)
    return setPersons(personsCopy)
  }

  const inputName = (event) => setNewName(event.target.value)

  const inputNumber = (event) => setNewNumber(event.target.value)

  const onSubmit = (event) => {
    return handleSubmit(event)
  }

  // handles the deletion of a row in the phonebook table; uses custom attribute 'data-id- of button
  // to get the id of the record
  const onClickDelete = (event) => {
    const id = event.target.getAttribute('data-id')
    console.log(id)
    const personToDelete = persons.find(person => person.id === id)
    console.log(personToDelete)
    if (window.confirm(`Delete ${personToDelete.name}?`)) {
        const personsCopy = persons.filter(person => person.id !== id)
        console.log(`removing record with id ${id}`)
        Services.remove(id)
        .then(displayMessage(`Removed ${personToDelete.name} from phonebook`, 'success', messageTimeout))
        .catch(error => {
          console.log(error)
          displayMessage(`Information of ${newName} has already been removed from server`, 'error', messageTimeout)
        })
        return setPersons(personsCopy)
    }
  }

  // sets the display message and type, making a message appear on screen
  // message disappears after timeout
  const displayMessage = (text, type, timeout) => {
      setMessageText(text)
      setMessageType(type)
      setTimeout(() => {
      setMessageText('')
      }, timeout)
  }

  // decides whether to create a new record or update an exisiting one
  const handleSubmit = (event) => {
    event.preventDefault()
    console.log({persons})
    const index = persons.findIndex(person => person.name === newName)
    console.log(index)
    if (index !== -1) {
      // alert(`${newName} is already added to phonebook!`)
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        let personsCopy = [...persons]
        console.log({personsCopy})
        let newDisplay = true

        if (!!newFilter) {
          newDisplay = newName.toLowerCase().includes(newFilter.toLowerCase())
        }

        console.log(newDisplay)

        let updated = {...personsCopy[index], number: newNumber, display: newDisplay}
        console.log({updated})

        personsCopy[index] = updated

        setPersons(personsCopy)
        
        delete updated.display
        Services.update(updated.id, updated)
        .then(response => {
          displayMessage(`Number of ${newName} changed`, 'success', messageTimeout)
          console.log(response)
        })
        .catch(error => {
          console.log(error)
          displayMessage(`Information of ${newName} has already been removed from server`, 'error', messageTimeout)
          Services.getAll()
          .then(response => {
            response.data.forEach((person, index) => response.data[index].display = true)
            setPersons(response.data)
          })
        })
      }
    } else {
      let personObject = {
        name: newName,
        number: newNumber,
        display: true
      }

      if (!!newFilter) {
        personObject.display = personObject.name.toLowerCase().includes(newFilter.toLowerCase())
      }
      let serviceObject = {...personObject}
      delete serviceObject.display

      console.log(serviceObject)

      Services.create(personObject)
      .then(response => {
        console.log(response)
        response.data.display = true
        setPersons(persons.concat(response.data))
        displayMessage(`${newName} added to phonebook`, 'success', messageTimeout)
      })
      .catch(error => {
        console.log(error.response.data.error)
        displayMessage(`${error.response.data.error}`, 'error', messageTimeout)
      })
    }
    setNewName('')
    setNewNumber('')
    // setNewFilter('')
  }

  return (
    <div>
      <div>
        {/* <Message text="TEST ERROR" type="error"/> */}
        <h2>Phonebook</h2>
        <Message text={messageText} type={messageType}/>
        <Filter inputFilter={inputFilter} newFilter={newFilter}/>
      </div>
      <div>
        <h3>add a new</h3>
        <PersonForm inputName={inputName} newName={newName} inputNumber={inputNumber} newNumber={newNumber} onSubmit={onSubmit}/>
      </div>
      <div>
        <h3>Numbers</h3>
        <PersonTable persons={persons} onClickDelete={onClickDelete}/>
        {/* <Message text="TEST SUCCESS" type="success"/> */}
      </div>
    </div>
  )

}

export default App