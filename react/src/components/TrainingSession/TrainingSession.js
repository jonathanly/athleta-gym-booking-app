import React from 'react';
import fetchAPI, { deleteAPI, postAPI } from '../../api/fetchAPI';
import TrainingSessionTable from './TrainingSessionTable';
import TrainingSessionForm from './TrainingSessionForm';
import './TrainingSession.css';

import { Link, Match } from 'react-router';

// Form validation
function createTrainingSession(values) {
  // Invalid title
  if (values.title.length === 0) {
    return Promise.reject(new Error('Enter valid title'))
  }

  return postAPI('/trainingSessions', values)
}

class TrainingSession extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        trainingSessions: [],
        error: null
    };

    this.loadTrainingSessions = this.loadTrainingSessions.bind(this);
    this.deleteTrainingSession = this.deleteTrainingSession.bind(this);
    this.addTrainingSession = this.addTrainingSession.bind(this);
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

  addTrainingSession(params) {
    createTrainingSession(params)
    .then(response => {
      const trainingSessions = this.state.trainingSessions.concat(response)
      this.setState({
        trainingSessions: trainingSessions,
        error: null
      });
    })
    .catch(error => {
      this.setState({ error })
    })
  }

  deleteTrainingSession(id) {
    if (confirm('Are you sure you want to delete this session?')) {
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
  }

  // Load training sessions before rendering
  componentWillMount() {
    this.loadTrainingSessions();
  }

  render() {
    const { location, pattern, pathname, isExact } = this.props
    const { error } = this.state;
    return (
      <div>
        <h3>Group Training Sessions</h3>

        <ul>
          <Link to='/trainingSessions'><li>View All</li></Link>
          <Link to={`${pathname}/add`}><li>Add Training Session</li></Link>
        </ul>

        { error && <p>{ error.message }</p> }

        <Match exactly pattern='/trainingSessions'
          render={() => <TrainingSessionTable trainingSessions={this.state.trainingSessions}
          deleteTrainingSession={this.deleteTrainingSession} />}
        />
        <Match pattern='/trainingSessions/add'
          render={() => <TrainingSessionForm addTrainingSession={this.addTrainingSession} />}
        />
      </div>
    )
  };
}

export default TrainingSession;
