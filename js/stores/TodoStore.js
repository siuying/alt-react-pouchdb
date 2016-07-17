import alt from '../alt'
import merge from 'object-assign'

import TodoActions from '../actions/TodoActions'
import Database from '../services/Database'

class TodoStore {
  constructor() {
    this.bindActions(TodoActions);
    this.todos = {};
    this.database = new Database();

    // load all todos
    this.database
      .allTodos()
      .then((todos) => {
        this.todos = todos
        this.emitChange()
      }).catch((error) => {
        console.log(error)
      })
  }

  onCreate(text) {
    text = text.trim()
    if (text === '') {
      return false
    }
    const todo = {
      complete: false,
      text: text
    }

    // save todo
    this.database
      .saveTodo(todo)
      .then((todo) => {
        this.todos[todo._id] = todo
        this.emitChange()
      })
      .catch((err) => {
        console.log("error update item", err)
      })
  }

  onToggleComplete (todo) {
    var updatedTodo = merge({}, todo)
    updatedTodo.complete = !todo.complete

    // save todo
    this.database
      .saveTodo(updatedTodo)
      .then((todo) => {
        this.todos[todo._id] = todo
        this.emitChange()
      })
      .catch((err) => {
        console.log("error update item", err)
      })
  }

  onClearComplete () {
    var todosToDelete = []
    for(let id in this.todos) {
      if (this.todos[id].complete === true) {
        todosToDelete.push(this.todos[id])
      }
    }
    this.database.deleteTodos(todosToDelete)
      .then((ids) => {
        for (let id of ids) {
          delete this.todos[id]
        }
        this.emitChange()
      })
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
