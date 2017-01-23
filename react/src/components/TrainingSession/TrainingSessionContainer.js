import React from 'react';
import TrainingSessionTable from './TrainingSessionTable';
import TrainingSessionForm from './TrainingSessionForm';
import AddTrainingSession from './AddTrainingSession';
import { validateTrainingSession } from './helpers/validateTrainingSession';
import './TrainingSession.css';

import { Link, Match } from 'react-router';

class TrainingSession extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      trainingSessions: [],
      error: null
    };

    // this.editTrainingSession = this.editTrainingSession.bind(this);
  }

  // Won't need this if TrainingSessionTable is being rerender'ed on load
  // createTrainingSession(values) {
  //   validateTrainingSession(values)
  //   .then(response => {
  //     const trainingSessions = this.state.trainingSessions.concat(response)
  //     this.setState({
  //       trainingSessions: trainingSessions,
  //       error: null
  //     });
  //   })
  //   .catch(error => {
  //     this.setState({ error })
  //   })
  // }

  // editTrainingSession(values) {
  //   console.log(values.trainingSessionId);
  //   // console.log(values); // values are not being passed to function
  //   patchAPI(`/trainingSessions/${values.trainingSessionId}`, values)
  //     .then(response => {
  //       console.log(response)
  //       // Reload TrainingSessionTable
  //       this.loadTrainingSessions();
  //     })
  //     .catch(error => {
  //       this.setState({ error })
  //     })
  // }

  render() {
    const { location, pattern, pathname, isExact } = this.props
    const { error } = this.state;
    return (
      <div>
        <h3>Group Training Sessions</h3>

        <ul>
          <Link to={pathname}><li>View All</li></Link>
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
      </div>
    )
  };
}

export default TrainingSession;


{/* <Match exactly pattern={`${pathname}/edit/:id`}
  render={({ params }) => <TrainingSessionForm trainingSessionId={ params.id } handleSubmit={ this.editTrainingSession } />}
/> */}
