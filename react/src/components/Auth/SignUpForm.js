import React, { PropTypes } from 'react';
import { signUp } from "../../api/auth";
import { Button, Form, Input, Panel } from 'muicss/react';
import { Link } from 'react-router-dom';

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
            <Input label="Email" name="email" type="email" required={true} />
            <Input label="Password" name="password" type="password" required={true} />
            <Input label="Password Confirmation" name="passwordConfirmation" type="password" required={true} />
            <Input label="First Name" name="firstName" type="text" required={true} />
            <Input label="Last Name" name="lastName" type="text" required={true}/>
            <Input label="Contact Number" name="contactNumber" type="tel" required={true} />
            <Button variant="raised" color="primary" type="submit">
              <i className="fa fa-floppy-o" aria-hidden="true" /> Create
            </Button>
          </Form>
          <Link to='/account'><Button variant="raised" color="accent">Go To Account</Button></Link>
        </Panel>
      </div>
    )
  }
}

export default UserRegistrationForm
