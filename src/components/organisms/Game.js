import React, { Component } from 'react';
import styled from 'styled-components';

const KEY = {
  LEFT:  37,
  RIGHT: 39,
  UP: 38,
  DOWN: 40,
  A: 65,
  D: 68,
  W: 87,
  S: 83,
  SPACE: 32,
};

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


// Set my initial state
const initialState = {
  inGame: false,
  keyPressed: false,
  startTime: Date.now(),
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
    offsetY: 0,
  },
  hero: {
    x: (window.innerWidth / 2) / 2,
    y: 0,
  },
  centerPos: (window.innerWidth / 2) / 2,
  context: null,
  direction: '',
};

const GameInfoTL = styled.p`
  position: absolute;
  top: 30px;
  left: 30px;
`;


// MY GAME COMPONENT
export default class Game extends Component {

  // State constructor
  constructor(props) {
    super(props);
    this.state = initialState;
    this.getCanvas = this.getCanvas.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this, true);
    this.handleKeyDown = this.handleKeyDown.bind(this, true);
    this.startAnimation = this.startAnimation.bind(this);
  }

  // Refs and the dom in React 16+ // https://reactjs.org/docs/refs-and-the-dom.html?
  getCanvas() {
    const context = this.canvas.getContext('2d');
    this.setState({
      context: context,
    }, () => {
      const st = this.state;
      // Draw on canvas after we've got the ref to it
      this.drawHero(this.state.context, st.hero.x, st.hero.y, st.box.width, st.box.height);
      this.drawBoxes(this.state.context, boxesMatrix, st.box.width, st.box.height, st.box.offsetY);
    });
  }

  componentWillReceiveProps(nextProps) {
    // Animation (requestAnimationFrame throttled)
    this.setState({
      inGame: nextProps.gameRunning,
    }, () =>{
      // GAME ANIMATION
      this.startAnimation();
      //console.log(`componentWillReceiveProps: inGame: ${this.state.inGame}`);
    });
  }

  componentDidMount(props) {
    // Add 'resize' listener to window
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('keydown', this.handleKeyDown); 
    window.addEventListener('resize', this.debounce((e) => { this.resizeCanvas(); }, 300));
    this.getCanvas();

    // Set inGame status
    this.setState({
      inGame: this.props.gameRunning,
    }, () =>{
      // GAME ANIMATION
      this.startAnimation();
      //console.log(`componentDidMount: inGame: ${this.state.inGame}`);
    });

  }

  // Tidy up after yourself
  componentWillUnmount() {
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('keydown', this.handleKeyDown);
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

  // GAME
  // Get things moving
  startAnimation() {

    // if inGame is true
    if (this.state.inGame) {
      
      // request another frame
      requestAnimationFrame(this.startAnimation);

      const context = this.state.context;
      // Clear before redrawing
      //context.clearRect(0, 0, this.state.screen.width, this.state.screen.height);

      this.updateHero();
      this.updateGame();

    }
  }

  handleKeyUp(value, e) {    
     // if inGame is true, start setting the direction state
     if (this.state.inGame) {
      // Set directon state
      this.setState({
        keyPressed: false,
        direction: '',
      });
    }
  }

  handleKeyDown(value, e) {
  
    // if inGame is true, start setting the direction state
    if (this.state.inGame) {

      // Assign direction info
      let direction;
 
      if(e.keyCode === KEY.LEFT   || e.keyCode === KEY.A) direction = "left";
      if(e.keyCode === KEY.RIGHT  || e.keyCode === KEY.D) direction = "right";
      if(e.keyCode === KEY.UP     || e.keyCode === KEY.W) direction = "up";
      if(e.keyCode === KEY.DOWN   || e.keyCode === KEY.S) direction = "down";
           
      // Set directon state
      this.setState({
        direction: direction,
      }, () => {
        console.log(`direction: ${direction}`);
      });
      
    }
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
        offsetY: st.box.offsetY,
      },
      centerPos: st.screen.width / 2,
    }, () => {
      // After setState do stuff
      const st = this.state;
      console.log(`resizeCanvas: ${st} | devicePixelRatio: ${st.screen.ratio}`);
      this.drawHero(this.state.context, st.hero.x, st.hero.y, st.box.width, st.box.height);
      this.drawBoxes(this.state.context, boxesMatrix, st.box.width, st.box.height, st.box.offsetY);

    });
  }
  
  // Draw Hero
  drawHero(context, xPos, yPos, boxWidth, boxHeight) {
    context.fillStyle = `orange`;
    context.fillRect(xPos, yPos, boxWidth, boxHeight);
  }
  
  // Draw Boxes
  drawBoxes(context, matrix, boxWidth, boxHeight, offsetY) {

    // Rows in Matrix
    matrix.forEach((row, y) => {
       // Cols in row
       row.forEach((value, x) => {
        // If there's a value, draw something
        if(value !==0) {
          context.fillStyle = `rgba(0,0,0,${0.25 * y / 10})`;
          context.fillRect(
            boxWidth * x,
            boxHeight * y + offsetY,
            boxWidth,
            boxHeight
          );
        }
      });
    });
  }

  // Update hero (no throttling)
  updateHero() {

    // if inGame is true
    if (this.state.inGame) {

      const st = this.state;

      let x = st.hero.x;
      let y = st.hero.y;
      let xOffset = 1;
      let yOffset = 1;

      // Get current direction and move accordingly
      switch (st.direction) {
        case 'up':
        y -= yOffset;
        break;
        case 'down':
        y += yOffset;
        break;
        case 'left':
        x -= xOffset;
        break;
        case 'right':
        x += xOffset;
        break;
        default:
        break;
      }

      // Set the state direction based on the above logic
      this.setState({
          hero: {
            x: x,
            y: y,
          },
        }, () => {
        //context.restore();
        // Update hero
        this.drawHero(this.state.context, st.hero.x, st.hero.y, st.box.width, st.box.height);
        console.log(`Hero props: ${st.hero}`);
      });
    }
  }


  // Update Game (thottled)
  updateGame() {

    // if inGame is true
    if (this.state.inGame) {

      const st = this.state;
      const context = st.context;
      context.save();
      context.scale(st.screen.ratio, st.screen.ratio);

      // Move our boxes up slowly
      let offsetY = this.state.box.offsetY;
      offsetY -= 1;

      // Set the state direction based on the above logic
      this.setState({
          box: {
            width: (window.innerWidth / 2) / 10,
            height: (window.innerWidth / 2) / 10,
            offsetY: offsetY,
          },
        }, () => {
        //context.restore();
        // Update boxes
        this.drawBoxes(this.state.context, boxesMatrix, st.box.width, st.box.height, st.box.offsetY);
        console.log(`Game props: ${st.box}`);
      });
      
    }
  }


  render() {
    return (
      <div>
      <GameInfoTL>
        Game running is: {this.props.gameRunning ? 'True' : 'False'} <br />
        Game FPS: <br />
        Hero FPS: <br />
      </GameInfoTL>
      <canvas
      ref={canvas => this.canvas = canvas}
      width={this.state.screen.width}
      height={this.state.screen.height}
      />
      </div>
    );
  }
}

