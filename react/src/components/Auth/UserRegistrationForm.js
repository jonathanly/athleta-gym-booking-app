import React from 'react';
import { Button, Form, Input, Panel, Row, Col } from 'muicss/react';

class UserRegistrationForm extends React.Component {
  render() {
    return(
      <div>
        <h3>New User Registration</h3>
        <Panel>
          <Form name="newUserForm">
            <Input label="Email" name="email"/>
            <Input label="Password" name="password"/>
            <Input label="Password Confirmation" name="passwordConfirmation"/>
            <Input label="First Name" name="firstName"/>
            <Input label="Last Name" name="lastName"/>
            <Input label="Contact Number" name="contactNumber"/>
          </Form>
          <Button variant="raised" color="primary">
            <i className="fa fa-floppy-o" aria-hidden="true"/> Create
          </Button>
        </Panel>
      </div>
    )
  }
}

export default UserRegistrationForm
