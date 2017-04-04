import React from 'react';
import TrainingSessionTable from './TrainingSessionTable';
import AddTrainingSession from './AddTrainingSession';
import EditTrainingSession from './EditTrainingSession';
import './TrainingSession.css';

import { Route } from 'react-router-dom';

class TrainingSessionContainer extends React.Component {
  // Error handling
  // const { error } = this.state;
  // { error && <p>{ error.message }</p> }

  render() {
    return (
      <div>

        <h3>Group Training Sessions</h3>

        <Route exact path='/trainingSessions' component={TrainingSessionTable} />
        <Route path='/trainingSessions/add' component={AddTrainingSession} />
        <Route path='/trainingSessions/edit/:id'
          render={({ match }) => <EditTrainingSession trainingSessionId={ match.params.id } />}
        />
      </div>
    )
  };
}

export default TrainingSessionContainer;
