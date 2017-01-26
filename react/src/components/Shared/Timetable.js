import React from 'react';
import './Timetable.css';
import '../../App.css';


const Timetable = (props) => {
  return (
    <div id="timetable">
      <h1>Group Training Timetable</h1>
      <img src={require('../../images/timetable.jpg')} alt="Group Training Timetable"></img>
      <div>
        <div className="timetable-text">
          <h3>STRONG</h3>
          <p>A full body workout focusing on working your major upper and lower body muscles. You will feel stronger and improve your overall body shape.</p>
        </div>
        <div className="timetable-text">
          <h3>HIIT</h3>
          <p>A short, intense interval training workout aimed at high reps, low rest and hard work.</p>
        </div>
        <div className="timetable-text">
          <h3>TRX</h3>
          <p>A challenging workout using the popular TRX training tool. A great combination of upper and lower body movements learning how to control your own bodyweight. A fantastic way to strengthen your core.</p>
        </div>
        <div className="timetable-text">
          <h3>SHRED</h3>
          <p>Shred is a time efficient, concentrated group training session designed to tone, shape and sculpt your body with an effective fat burning workout.</p>
        </div>
        <div className="timetable-text">
          <h3>BOXING</h3>
          <p>An intense combination of glove & pad work, cardiovascular activities and heavy bag work. A great overall workout designed to de-stress and improve your fitness.</p>
        </div>
        <div className="timetable-text">
          <h3>CORE & ABS</h3>
          <p>An isolated workout aimed to strengthen your abs, core & lower back.</p>
        </div>
        <div className="timetable-text">
          <h3>SILENT YOGA</h3>
          <p>Stretch, relax and improve your mobility & flexibility to help improve your performance in all of our other classes - incorporating Silent Yoga Headphones, allowing participants to tune out from external auditory distractions and tune into their mind/body experience</p>
        </div>
      </div>
    </div>
  )
}

export default Timetable;
