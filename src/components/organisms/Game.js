import React, { Component } from 'react';
import update from 'immutability-helper';

const KEY = {
  LEFT:  37,
  RIGHT: 39,
  UP: 38,
  DOWN: 40,
  A: 65,
  D: 68,
  W: 87,
  S: 83,
  SPACE: 32
};


// Set my initial state
const initialState = {
  siteTitle: "Canvas Game",
  screen: {
    width: window.innerWidth / 2,
    height: window.innerHeight,
    ratio: window.devicePixelRatio || 1,
  },
  gameRows: 10,
  box: {
    width: (window.innerWidth / 2) / 10,
    height: (window.innerWidth / 2) / 10,
  },
  hero: {
    x: (window.innerWidth / 2) / 2,
    y: 0,
  },
  centerPos: (window.innerWidth / 2) / 2,
  context: null,
  keys : {
    left  : 0,
    right : 0,
    up    : 0,
    down  : 0,
    space : 0,
  },
};

  
// HELPERS

// Generate random color
// const randomColor = () => { 
//   return('#'+Math.floor(Math.random()*16777215).toString(16));
// }
 
// // Generate Random Alpha
// const randomAlpha = () => { 
//   return((Math.random() * (1 - 0.75) + 0.75));
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
    }, () => {
      // Draw on canvas after we've got the ref to it
      this.drawCanvas();
    });
  }

  // React Lifecycle
  componentWillMount() {
    //init
  }

  componentDidMount() {
    // Add 'resize' listener to window
    window.addEventListener('keyup',   this.handleKeys.bind(this, false));
    window.addEventListener('keydown', this.handleKeys.bind(this, true));
    window.addEventListener('resize', this.debounce((e) => { this.resizeCanvas(); }, 300));
    this.getCanvas();

    // Request next frame
    requestAnimationFrame(() => {this.update()});
  }

  // Tidy up after yourself
  componentWillUnmount() {
    window.removeEventListener('keyup', this.handleKeys);
    window.removeEventListener('keydown', this.handleKeys);
    window.removeEventListener('resize', this.debounce);
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

  handleKeys(value, e){
    let keys = this.state.keys;
    if(e.keyCode === KEY.LEFT   || e.keyCode === KEY.A) keys.left  = value;
    if(e.keyCode === KEY.RIGHT  || e.keyCode === KEY.D) keys.right = value;
    if(e.keyCode === KEY.UP     || e.keyCode === KEY.W) keys.up    = value;
    if(e.keyCode === KEY.DOWN   || e.keyCode === KEY.S) keys.down  = value;
    if(e.keyCode === KEY.SPACE) keys.space = value;
        
    this.setState({
      keys: keys,
    }, () => {
      console.log(this.state.keys);
    });
  }
  
  // Resize Canvas
  // (only runs on resize event)
  resizeCanvas() {
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
      console.log(`resizeCanvas: ${st}`);
      this.drawHero(st.hero.x, st.hero.y, st.box.width, st.box.height);
      this.drawBoxes(st.box.width, st.box.height);

    });

  };

  // Draw Canvas
  drawCanvas() {   
    // After setState do stuff
    const st = this.state;
    console.log(`drawCanvas: ${st}`);
    this.drawHero(st.hero.x, st.hero.y, st.box.width, st.box.height);
    this.drawBoxes(st.box.width, st.box.height);
   
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


  // Update
  update() {
    const context = this.state.context;
    const keys = this.state.keys;

    context.save();
    context.scale(this.state.screen.ratio, this.state.screen.ratio);

    context.restore();

    // Next frame
    requestAnimationFrame(() => {this.update()});

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

