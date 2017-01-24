import React from 'react';
import SearchTrainingSession from './SearchTrainingSession';
import TrainingSessionRow from './TrainingSessionRow';
import fetchAPI, { deleteAPI } from '../../api/fetchAPI';
import { Panel } from 'muicss/react';

// Styling
let s1 = { textAlign: "center" };

class TrainingSessionTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      trainingSessions: [],
      error: null
    }

    this.loadTrainingSessions = this.loadTrainingSessions.bind(this);
    this.deleteTrainingSession = this.deleteTrainingSession.bind(this);
  }

  loadTrainingSessions(conditions) {
    console.log(conditions)
    fetchAPI('/trainingSessions', conditions)
    .then(trainingSessions => {
      this.setState({ trainingSessions });
    })
    .catch(error => {
      this.setState({ error })
    });
  }

  deleteTrainingSession(id) {
    if (confirm('Are you sure you want to delete this session?')) {
      console.log("Blasting data into smithereens...");
      deleteAPI(`/trainingSessions/${id}`)
      .then(response => {
        // Filter out the deleted session
        const trainingSessions = this.state.trainingSessions.filter((trainingSession) => (trainingSession._id !== id))
        // Update the sessions in state, which will re-render
        this.setState({ trainingSessions });
      })
      .catch(error => {
        this.setState({ error })
      });
    }
  }

  // Get training sessions before rendering
  componentDidMount() {
    this.loadTrainingSessions();
  }

  render() {
    const trainingSessionRows = this.state.trainingSessions.map(trainingSession => {
      return <TrainingSessionRow key={trainingSession._id}
        trainingSession={trainingSession}
        onDelete={() => this.deleteTrainingSession(trainingSession._id)}
      />
    })

    return(
      <div>
        <h3>Search</h3>
        <Panel>
          <SearchTrainingSession loadTrainingSessions={this.loadTrainingSessions} />
        </Panel>
        <Panel>
          <table className="mui-table mui-table-bordered" id="training-session-table">
            <thead>
              <tr>
                <th style={s1}>Title</th>
                <th style={s1}>Day</th>
                <th style={s1}>Time</th>
                <th style={s1}>Capacity</th>
                <th style={s1}>Duration</th>
                <th style={s1}>Date Added</th>
                <th style={s1}>Last Updated</th>
                <th style={s1}></th>
                <th style={s1}></th>
              </tr>
            </thead>
            <tbody>
              {trainingSessionRows}
            </tbody>
          </table>
        </Panel>
      </div>
    );
  }
}

export default TrainingSessionTable;
