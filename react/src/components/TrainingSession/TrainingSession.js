import React from 'react';
import fetchAPI, { deleteAPI } from '../../api/fetchAPI';
import TrainingSessionTable from './TrainingSessionTable';
import TrainingSessionForm from './TrainingSessionForm';

class TrainingSession extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        trainingSessions: [],
        error: null
    };

    this.loadTrainingSessions = this.loadTrainingSessions.bind(this);
    this.deleteTrainingSession = this.deleteTrainingSession.bind(this);
  }

  loadTrainingSessions() {
    fetchAPI('/trainingSessions')
    .then(response => {
      this.setState({
        trainingSessions: response
      });
    })
    .catch(error => {
      this.setState({ error })
    });
  }

  deleteTrainingSession(id) {
    console.log("Blasting data into smithereens...");
    deleteAPI(`/trainingSessions/${id}`)
    .then(response => {
      // Filter out the deleted session
      const trainingSessions = this.state.trainingSessions.filter((trainingSession) => (trainingSession._id !== id))
      // Update the sessions in state, which will re-render
      this.setState({
        trainingSessions: trainingSessions
      });
    })
    .catch(error => {
      this.setState({ error })
    });
  }

  componentWillMount() {
    this.loadTrainingSessions();
  }

  // componentDidUpdate() {
  //   this.onChange();
  // }

  render() {
    const { error } = this.state;
    return(
      <div>
        <h3>Group Training Sessions</h3>

        { error &&
          <p>{ error.message }</p>
        }

        <TrainingSessionTable trainingSessions={this.state.trainingSessions} deleteTrainingSession={ this.deleteTrainingSession } />
        <TrainingSessionForm />
      </div>
    )
  };
}

export default TrainingSession;
