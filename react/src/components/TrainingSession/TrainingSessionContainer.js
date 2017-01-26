import React from 'react';
import TrainingSessionTable from './TrainingSessionTable';
import AddTrainingSession from './AddTrainingSession';
import EditTrainingSession from './EditTrainingSession';
import './TrainingSession.css';

import { Link, Match } from 'react-router';

class TrainingSession extends React.Component {
  // Error handling
  // const { error } = this.state;
  // { error && <p>{ error.message }</p> }

  render() {
    const { pathname } = this.props

    return (
      <div>

        <h3>Group Training Sessions</h3>

        <ul>
          <Link to={pathname}><li>View All</li></Link>
          <Link to={`${pathname}/add`}><li>Add Training Session</li></Link>
        </ul>

        <Match exactly pattern={pathname} component={TrainingSessionTable} />
        <Match exactly pattern={`${pathname}/add`} component={AddTrainingSession} />
        <Match exactly pattern={`${pathname}/edit/:id`}
          render={({ params }) => <EditTrainingSession trainingSessionId={ params.id } />}
        />
      </div>
    )
  };
}

export default TrainingSession;
