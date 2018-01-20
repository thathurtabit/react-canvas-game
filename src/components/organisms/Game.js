import React, { Component } from 'react';
import styled from 'styled-components';
import update from 'immutability-helper';


// Set my initial state
const initialState = {
  siteTitle: "Canvas Game",
  screen: {
    width: window.innerWidth / 2,
    height: window.innerHeight,
    ratio: window.devicePixelRatio || 1,
  },
  context: null,
  gameRows: 10,
};

  
// HELPERS

// Generate random color
const randomColor = () => { 
  return('#'+Math.floor(Math.random()*16777215).toString(16));
}
 
// Generate Random Alpha
const randomAlpha = () => { 
  return((Math.random() * (1 - 0.75) + 0.75));
}

// // Hero Props
// const hero = {
//   pos: {
//     x: centerPos,
//     y: offsetY,
//   }
// }



// MY GAME COMPONENT
export default class Game extends Component {

  // State constructor
  constructor(props) {
    super(props);
    this.state = initialState;
    this.getCanvas = this.getCanvas.bind(this);
  }

  // Refs and the dom in React 16+ // https://reactjs.org/docs/refs-and-the-dom.html?
  getCanvas() {
    const context = this.canvas.getContext('2d');
    this.setState({
      context: context,
    });
  }


  // React Lifecycle
  componentWillMount() {
    //init
  }


  componentDidMount() {
    // Add 'resize' listener to window
    //window.addEventListener('resize',  this.resizeCanvas.bind(this, false));
    window.addEventListener('resize', this.debounce((e) => { this.drawCanvas(); }, 300));
    this.getCanvas();
    this.drawCanvas();
  }

  // Trim down redraw function calls to be more processor friendly
  debounce(fn, time) {
    let timeout;

    return function() {
      const functionCall = () => fn.apply(this, arguments);
      
      clearTimeout(timeout);
      timeout = setTimeout(functionCall, time);
    }
  }

  
  // Resize Canvas
  drawCanvas() {
    const st = this.state;

    this.setState({
      screen: {
        width: window.innerWidth / 2,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1,
      },
      box: {
        width: st.screen.width / st.gameRows,
        height: st.screen.width / st.gameRows,
      },
      centerPos: st.screen.width / 2,
    }, () => {
      // After setState do stuff
      const st = this.state;
      console.log(st);
      this.drawHero(st.centerPos, st.box.height, st.box.width, st.box.height);
      this.drawBoxes(st.box.width, st.box.height);

    });

  };
  
  
  // Draw Hero
  drawHero(xPos, yPos, boxWidth, boxHeight) {
    const context = this.state.context;

    context.fillStyle = `orange`;
    context.fillRect(xPos, yPos, boxWidth, boxHeight);
  }
  
  // Draw Boxes
  drawBoxes(boxWidth, boxHeight) {
    const context = this.state.context;
   
    const boxesMatrix = [
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [1,1,1,1,1,0,1,1,1,1],
      [1,1,1,1,1,0,1,1,1,1],
      [1,1,1,0,0,0,1,1,1,1],
      [1,1,1,0,1,1,1,1,1,1],
      [1,1,1,0,1,1,1,1,1,1],
      [1,0,0,0,1,1,1,1,1,1],
      [1,0,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,0,1],
      [1,1,0,0,0,0,1,0,0,1],
      [1,1,0,1,1,0,0,0,1,1],
      [1,1,0,0,0,0,1,1,1,1],
      [1,1,1,1,1,0,1,1,1,1],
    ];
    
    // Rows in Matrix
    boxesMatrix.forEach((row, y) => {
       // Cols in row
      row.forEach((value, x) => {
        // If there's a value, draw something
        if(value !==0) {
          context.fillStyle = `rgba(0,0,0,${0.25 * y / 10})`;
          context.fillRect(boxWidth * x,boxHeight * y,boxWidth, boxHeight);
        }
      });
    });
  }
  

  render() {
    return (
      <canvas
        ref={canvas => this.canvas = canvas}
        width={this.state.screen.width * this.state.screen.ratio}
        height={this.state.screen.height * this.state.screen.ratio}
      />
    );
  }
}

