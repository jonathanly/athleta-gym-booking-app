import React from 'react';
import fetchAPI from '../../api/fetchAPI';
import TrainingSessionTable from './TrainingSessionTable';
import TrainingSessionForm from './TrainingSessionForm';

class TrainingSession extends React.Component {
  constructor(props) {
    super(props);

    this.loadData = this.loadData.bind(this);

    this.state = {
        trainingSessions: []
    };
  }

  loadData() {
    fetchAPI('/trainingSessions')
    .then(response => {
      this.setState({
        trainingSessions: response
      });
    })
  }

  componentWillMount() {
    this.loadData();
  }

  render() {
    return(
      <div>
        <h3>Group Training Sessions</h3>
        <TrainingSessionTable trainingSessions={this.state.trainingSessions} />
        <TrainingSessionForm />
      </div>
    )
  };
}

export default TrainingSession;
