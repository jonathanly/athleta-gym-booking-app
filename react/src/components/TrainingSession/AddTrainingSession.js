import React from 'react';
import { postAPI } from '../../api/fetchAPI';
import TrainingSessionForm from './TrainingSessionForm';

class AddTrainingSession extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      trainingSession: {
        title: '',
        day: '',
        time: '',
        duration: '',
        capacity: ''
      },
      error: null
    }

    this.handleUserInput = this.handleUserInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleUserInput(trainingSession) {
    this.setState({
      trainingSession: {
        title: trainingSession.title,
        day: trainingSession.day,
        time: trainingSession.time,
        duration: trainingSession.duration,
        capacity: trainingSession.capacity
      }
    })
  }

  handleSubmit() {
    const { trainingSession } = this.state;
    postAPI('/trainingSessions', trainingSession)
      .then(trainingSession => {
        console.log("Added successfully: ", trainingSession)
      })
      .catch(error => {
        this.setState({ error })
      })
  }

  render() {
    return (
      <div>
        <h3>Add Training Session</h3>
        <TrainingSessionForm handleSubmit={this.handleSubmit} handleUserInput={this.handleUserInput} trainingSession={this.state.trainingSession}/>
      </div>
    )
  }
}

export default AddTrainingSession;
