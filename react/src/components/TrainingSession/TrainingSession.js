import React from 'react';
import fetchAPI from '../../api/fetchAPI';
import TrainingSessionTable from './TrainingSessionTable'

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
        <TrainingSessionTable trainingSessions={this.state.trainingSessions} />
      </div>
    )
  };
}

export default TrainingSession;
