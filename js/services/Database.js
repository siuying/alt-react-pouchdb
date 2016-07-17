import merge from 'object-assign'
import PouchDB from 'pouchdb-browser'
import {uuid} from 'pouchdb-utils'

class Database {
  constructor(name = "todo") {
    this.database = new PouchDB(name)
  }

  allTodos() {
    return this.database.allDocs({
      include_docs: true
    }).then((results) => {
      return new Promise((resolve, reject) => {
        let todos = results.rows.map((row) => {
          return row.doc
        }).reduce(function(map, value) {
          map[value._id] = value
          return map
        }, {})
        resolve(todos)
      })
    })
  }

  saveTodo(todo) {
    if (!todo._id) {
      todo._id = uuid()
    }
    return this.database
      .put(todo)
      .then((response) => {
        todo._rev = response.rev
        return new Promise((resolve, reject) => {
          resolve(todo)
        })
      })
  }

  deleteTodos(todos) {
    // prepare deleted docs
    var deleteTodos = todos.map((todo) => {
      var updatedTodo = merge({}, todo)
      updatedTodo._deleted = true
      return updatedTodo
    })

    // Send bulk updates
    return this.database.bulkDocs(deleteTodos)
      .then((response) => {
        return new Promise((resolve, reject) => {
          resolve(todos.map((todo) => todo._id))
        })
      })
  }
}

export default Database
