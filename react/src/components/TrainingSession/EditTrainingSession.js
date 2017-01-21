import React from 'react';
import TrainingSessionForm from './TrainingSessionForm';

class EditTrainingSession extends React.Component {
  render() {
    const { trainingSession } = this.props

    return (
      <div>
        <h3>Edit Training Session</h3>
        <TrainingSessionForm
          values={ trainingSession }
          handleSubmit={ (values) => this.props.editTrainingSession(trainingSession._id, values) }
        />
      </div>
    )
  }
}

export default EditTrainingSession;
