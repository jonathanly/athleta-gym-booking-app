import React from 'react';
import fetchAPI, { patchAPI } from '../../api/fetchAPI';
import TrainingSessionForm from './TrainingSessionForm';

class EditTrainingSession extends React.Component {
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

    this.loadTrainingSession = this.loadTrainingSession.bind(this);
    this.handleUserInput = this.handleUserInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  loadTrainingSession() {
    const id = this.props.trainingSessionId
    fetchAPI(`/trainingSessions/${id}`)
      .then(trainingSession => {
        this.setState({ trainingSession })
      })
      .catch(error => {
        this.setState({ error })
      })
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
    const id = this.props.trainingSessionId;
    patchAPI(`/trainingSessions/${id}`, trainingSession)
      .then(trainingSession => {
        console.log("Edit successful: ", trainingSession)
      })
      .catch(error => {
        this.setState({ error })
      })
  }

  componentWillMount() {
    this.loadTrainingSession();
  }

  render() {
    const { error } = this.state;
    return (
      <div>

        { error && <p>{ error.message }</p> }

        <h3>Edit Training Session</h3>
        <TrainingSessionForm handleSubmit={this.handleSubmit} handleUserInput={this.handleUserInput} trainingSession={this.state.trainingSession}/>
      </div>
    )
  }
}

export default EditTrainingSession;
