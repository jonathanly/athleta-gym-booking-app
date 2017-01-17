import React, { PropTypes } from 'react';
import { signUp } from "../../api/auth";
import { Button, Form, Input, Panel } from 'muicss/react';

class UserRegistrationForm extends React.Component {
  static propTypes = {
    onUserSignedIn: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      error: null
    }

    this.onSignUp = this.onSignUp.bind(this);
  }

  onSignUp(event) {
    event.preventDefault();

    const form = event.target
    const { elements } = form
    const newUser = {
      email: elements.email.value,
      password: elements.password.value,
      firstName: elements.firstName.value,
      lastName: elements.lastName.value,
      contactNumber: elements.contactNumber.value,
    }

    signUp(newUser)
    .then(res => {
      this.props.onUserSignedIn(res)
    })
    .catch(err => {
      this.setState({ err })
    });
    form.reset();
  }


  render() {
    return(
      <div>
        <h3>New User Registration</h3>
        <Panel>
          <Form name="newUserForm" onSubmit={this.onSignUp}>
            <Input label="Email" name="email"/>
            <Input label="Password" name="password"/>
            <Input label="Password Confirmation" name="passwordConfirmation"/>
            <Input label="First Name" name="firstName"/>
            <Input label="Last Name" name="lastName"/>
            <Input label="Contact Number" name="contactNumber"/>
            <Button variant="raised" color="primary" type="submit">
              <i className="fa fa-floppy-o" aria-hidden="true"/> Create
            </Button>
          </Form>
        </Panel>
      </div>
    )
  }
}

export default UserRegistrationForm
