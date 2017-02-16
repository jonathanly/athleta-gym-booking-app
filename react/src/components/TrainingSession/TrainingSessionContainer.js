import React from 'react';
import TrainingSessionTable from './TrainingSessionTable';
import AddTrainingSession from './AddTrainingSession';
import EditTrainingSession from './EditTrainingSession';
import './TrainingSession.css';

import { Match } from 'react-router';

class TrainingSession extends React.Component {
  // Error handling
  // const { error } = this.state;
  // { error && <p>{ error.message }</p> }

  render() {
    return (
      <div>

        <h3>Group Training Sessions</h3>

        <Match exactly pattern='/trainingSessions' component={TrainingSessionTable} />
        <Match exactly pattern='/trainingSessions/add' component={AddTrainingSession} />
        <Match exactly pattern='/trainingSessions/edit/:id'
          render={({ params }) => <EditTrainingSession trainingSessionId={ params.id } />}
        />
      </div>
    )
  };
}

export default TrainingSession;
