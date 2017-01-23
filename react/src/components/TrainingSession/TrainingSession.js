import React from 'react';
import fetchAPI, { deleteAPI, patchAPI } from '../../api/fetchAPI';
import TrainingSessionTable from './TrainingSessionTable';
import TrainingSessionForm from './TrainingSessionForm';
import AddTrainingSession from './AddTrainingSession';
import NotFound from '../Shared/NotFound';
import { validateTrainingSession } from './helpers/validateTrainingSession';
import './TrainingSession.css';

import { Link, Match, Miss } from 'react-router';

class TrainingSession extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      trainingSessions: [],
      error: null
    };

    this.loadTrainingSessions = this.loadTrainingSessions.bind(this);
    this.deleteTrainingSession = this.deleteTrainingSession.bind(this);
    this.createTrainingSession = this.createTrainingSession.bind(this);
    this.editTrainingSession = this.editTrainingSession.bind(this);
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

  createTrainingSession(values) {
    validateTrainingSession(values)
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

  editTrainingSession(values) {
    console.log(values.trainingSessionId);
    // console.log(values); // values are not being passed to function
    patchAPI(`/trainingSessions/${values.trainingSessionId}`, values)
      .then(response => {
        console.log(response)
        // Reload TrainingSessionTable
        this.loadTrainingSessions();
      })
      .catch(error => {
        this.setState({ error })
      })
  }

  // Load training sessions before rendering
  componentDidMount() {
    this.loadTrainingSessions();
  }

  render() {
    const { location, pattern, pathname, isExact } = this.props
    const { error } = this.state;
    return (
      <div>
        <h3>Group Training Sessions</h3>

        <ul>
          <Link to={`${pathname}/add`}><li>Add Training Session</li></Link>
        </ul>

        { error && <p>{ error.message }</p> }

        <Match exactly pattern={pathname}
          render={() => <TrainingSessionTable trainingSessions={this.state.trainingSessions}
          deleteTrainingSession={this.deleteTrainingSession} />}
        />
        <Match exactly pattern={`${pathname}/add`}
          render={() => <AddTrainingSession createTrainingSession={this.createTrainingSession} />}
        />
        <Match exactly pattern={`${pathname}/edit/:id`}
          render={({ params }) => <TrainingSessionForm trainingSessionId={ params.id } handleSubmit={ this.editTrainingSession } />}
        />
      </div>
    )
  };
}

export default TrainingSession;
