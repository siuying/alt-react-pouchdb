import alt from '../alt';
import merge from 'object-assign';

import TodoActions from '../actions/TodoActions';

import PouchDB from 'pouchdb-browser';
import {uuid} from 'pouchdb-utils';

// Default adapter
var database = new PouchDB("todo");

class TodoStore {
  constructor() {
    this.bindActions(TodoActions);
    this.todos = {};
    this.loadAllTodos()
  }

  loadAllTodos() {
    database.allDocs({
      include_docs: true
    }).then((results) => {
      this.todos = results.rows.map((row) => {
        return row.doc
      }).reduce(function(map, value) {
        map[value._id] = value
        return map
      }, {})
      this.emitChange()
    }).catch((error) => {
      console.log(error)
    })
  }

  saveTodo(todo) {
    database
      .put(todo)
      .then((response) => {
        todo._rev = response.rev
        this.todos[todo._id] = todo
        this.emitChange()
      })
      .catch((err) => {
        console.log("error update item", err)
      })
  }

  deleteTodos(todos) {
    console.log("delete todos ...", todos)

    // prepare deleted docs
    var deleteTodos = todos.map((todo) => {
      var updatedTodo = merge({}, todo)
      updatedTodo._deleted = true
      return updatedTodo
    })

    // Send bulk updates
    database
      .bulkDocs(deleteTodos)
      .then((response) => {
        // update the change
        for (let todo of deleteTodos) {
          delete this.todos[todo._id]
        }
        this.emitChange()
      })
      .catch((err) => {
        console.log("error delete item", err, todos)
      })
  }

  onCreate(text) {
    text = text.trim()
    if (text === '') {
      return false
    }
    const id = uuid()
    const todo = {
      _id: id,
      complete: false,
      text: text
    }
    this.saveTodo(todo)
  }

  onToggleComplete (todo) {
    var updatedTodo = merge({}, todo)
    updatedTodo.complete = !todo.complete
    this.saveTodo(updatedTodo)
  }

  onClearComplete () {
    var toChangeTodos = []
    for(let id in this.todos) {
      if (this.todos[id].complete === true) {
        toChangeTodos.push(this.todos[id])
      }
    };
    this.deleteTodos(toChangeTodos)
  }

  static areAnyComplete() {
    const { todos } = this.getState();
    for(let id in todos) {
      if (todos[id].complete === true) {
        return true;
      }
    };
    return false;
  }
}

export default alt.createStore(TodoStore);
