import React, { Component } from 'react';
import './App.css';
import Board from './Board/Board';
import { DragDropContextProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend'

class App extends Component {
  render() {
    return (
      <div className="App">
        <DragDropContextProvider backend={HTML5Backend}>
          <Board boardName="item" />
        </DragDropContextProvider>
      </div>
    );
  }
}

export default App;
