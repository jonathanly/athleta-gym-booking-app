import React, { PropTypes } from 'react';
import { signIn } from '../../api/auth';
import { Form, Input, Button, Panel } from 'muicss/react';

function validatedSignIn({ email, password }) {
  // Trim to remove spaces
  email = email.trim()
  password = password.trim()

  if (email.length === 0) {
    return Promise.reject(new Error('Please enter an email'))
  }

  else if (password.length === 0) {
    return Promise.reject(new Error('Please enter a password'))
  }

  return signIn({ email, password })
}

// CSS styles we use in render() below
const styles = {
    form: {
        padding: '1rem'
    },
    label: {
      margin: '1rem'
    },
    errorMessage: {
        color: '#dd2200',
        marginBottom: 0
    }
}

class SignInForm extends React.PureComponent {
  static propTypes = {
    onUserSignedIn: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      error: null
    }

    this.onSignIn = this.onSignIn.bind(this)
  }

  onSignIn(event) {
    event.preventDefault()

    const form = event.target
    const { elements } = form

    validatedSignIn({
      email: elements.email.value,
      password: elements.password.value
    })
    // Success! Pass our signed in user along
    .then(data => {
      this.props.onUserSignedIn(data)
    })
    // Error either from validation or the server
    .catch(error => {
      // Give a nicer error message
      if (error.message === 'Unauthorized') {
        // Message inspired by Twitter’s
        error = new Error('The email and password that you entered did not match our records.')
      }

      this.setState({ error });
      form.reset();
    })

  }

  render() {
    const { error } = this.state

    return (
      <div>
        <h3>Log In</h3>
        { error && <p style={styles.errorMessage}>{error.message}</p> }
        <Panel>
          <Form onSubmit={this.onSignIn} style={styles.form}>
            <Input hint="Email" name="email" type="email" required={true} style={styles.label}/>
            <Input hint="Password" name="password" type="password" required={true} style={styles.label} />
            <Button variant="raised" color="primary" type='submit' onSubmit={this.onSignIn}>Sign In</Button>
          </Form>
        </Panel>
      </div>
    )
  }
}

export default SignInForm;
