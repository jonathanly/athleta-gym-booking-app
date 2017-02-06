import React from 'react';
import '../../App.css';

const Header = (props) => {
  return (
    <header id="header">
      <div className="mui-appbar mui--appbar-line-height">
        <div className="mui-container-fluid">
          <a className="sidebar-toggle mui--visible-xs-inline-block mui--visible-sm-inline-block js-show-sidebar">☰</a>
          <a className="sidebar-toggle mui--hidden-xs mui--hidden-sm js-hide-sidebar"></a>
          <span className="mui--text-title mui--visible-xs-inline-block">Athleta 24/7</span>
        </div>
      </div>
    </header>
  )
}

export default Header;
