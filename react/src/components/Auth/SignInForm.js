import React, { PropTypes } from 'react'
import { signIn } from '../../api/auth'

// Validate passed email and password, and sign in
function validatedSignIn({ email, password }) {
    // Trim to remove spaces
    email = email.trim()
    password = password.trim()

    // Check for missing email
    if (email.length === 0) {
        return Promise.reject(new Error('Please enter an email'))
    }
    // Check for missing password
    else if (password.length === 0) {
        return Promise.reject(new Error('Please enter a password'))
    }

    // All validated, so sign in
    return signIn({ email, password })
}

// CSS styles we use in render() below
const styles = {
    form: {
        padding: '1rem'
    },
    label: {
        display: 'block'
    },
    errorMessage: {
        color: '#dd2200',
        marginBottom: 0
    }
}

export default class SignInForm extends React.PureComponent {
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

            this.setState({ error })
        })
    }

    render() {
        const { error } = this.state

        return (
            <div>
                { error &&
                    <p style={ styles.errorMessage }>{ error.message }</p>
                }
                <form onSubmit={ this.onSignIn } style={ styles.form }>
                    <label style={ styles.label }>
                        Email:
                        <input name='email' type='email' />
                    </label>
                    <label style={ styles.label }>
                        Password:
                        <input name='password' />
                    </label>
                    <button type='submit'>Sign In</button>
                </form>
            </div>
        )
    }
}