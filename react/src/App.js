import React, { Component } from 'react';
import 'whatwg-fetch'; // Polyfills window.fetch
import fetchAPI from './api/fetchAPI'
import { fetchCurrentUser } from './api/auth'
import replaceItemWithID from './utils/replaceItemWithID'
import Counter from './components/Counter'
import SignInForm from './components/Auth/SignInForm'
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      // We first check with the API if a user is signed in
      needsToCheckSignIn: true,
      currentUser: null,
      counters: []
    };

    this.onUserSignedIn = this.onUserSignedIn.bind(this);

    fetchCurrentUser()
      .then(user => {
        this.setState({
          needsToCheckSignIn: false,
          currentUser: user
        })
      })
      .catch(error => {
        this.setState({
          needsToCheckSignIn: false
        })
      })

    fetchAPI('/counters')
      .then(counters => {
        this.setState({ counters })
      })
      .catch(error => {
        console.error('Error loading counter api', error.message)
      })
  }
  
  onChangeCount(id, change) {
    fetchAPI(`/counters/${ id }`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        change: change
      })
    })
      .then(newCounter => {
        this.setState(({ counters }) => ({
          // Transform counters, replacing the changed counter,
          // which has an `_id` of the passed `id`.
          counters: replaceItemWithID(counters, id, newCounter)
        }))
      })
  }

  onAddCounter() {
    fetchAPI(`/counters`, {
      method: 'POST'
    })
      .then(newCounter => {
        this.setState(({ counters }) => ({
          // Transform counters, replacing the changed counter,
          // which has an `_id` of the passed `id`.
          counters: counters.concat(newCounter)
        }))
      })
  }

  onUserSignedIn(user) {
    this.setState({ currentUser: user })
  }
  
  render() {
    const { needsToCheckSignIn, currentUser, counters } = this.state

    return (
      <main className="App">
      {
        needsToCheckSignIn ? (
          <p>Loading…</p>
        ) : currentUser ? (
          currentUser.email
        ) : (
          <SignInForm onUserSignedIn={ this.onUserSignedIn } />
        )
      }
      {
        counters.map((counter, index) => {
          return (
            <Counter key={ index }
              count={ counter.count }
              onIncrement={ this.onChangeCount.bind(this, counter._id, 1) }
              onDecrement={ this.onChangeCount.bind(this, counter._id, -1) }
            />
          )
        })
      }
        <button onClick={ this.onAddCounter.bind(this) }>Add</button>
      </main>
    );
  }
}

export default App;
