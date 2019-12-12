import axios from 'axios'

// const baseUrl = 'http://localhost:3001/api/persons'
// const baseUrl = 'https://shielded-woodland-44373.herokuapp.com/api/persons'
const baseUrl = '/api/persons'

const getAll = () => {
  return axios.get(baseUrl)
}

const create = newObject => {
  return axios.post(baseUrl, newObject)
}

const update = (id, newObject) => {
  return axios.put(`${baseUrl}/${id}`, newObject)
}

const remove = (id) => {
    return axios.delete(`${baseUrl}/${id}`)
}

export default { 
  getAll: getAll, 
  create: create, 
  update: update,
  remove: remove 
}