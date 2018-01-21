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
    this.startGameThrottledAnimation = this.startGameThrottledAnimation.bind(this);
  }

  // Refs and the dom in React 16+ // https://reactjs.org/docs/refs-and-the-dom.html?
  getCanvas() {
    const context = this.canvas.getContext('2d');
    this.setState({
      context: context,
    }, () => {
      const st = this.state;
      // Draw on canvas after we've got the ref to it
      this.drawBoxes(st.box.width, st.box.height);
    });
  }

  componentWillReceiveProps(nextProps) {
    // Animation (requestAnimationFrame throttled)
    this.setState({
      inGame: nextProps.gameRunning,
    }, () =>{
      // GAME ANIMATION
      this.setupGameThrottledAnimation();
      //console.log(`componentWillReceiveProps: inGame: ${this.state.inGame}`);
    });
  }

  componentDidMount(props) {
    // Add 'resize' listener to window
    window.addEventListener('keyup', this.handleKeyUp.bind(this, true));
    window.addEventListener('keydown', this.handleKeyDown.bind(this, true));
    window.addEventListener('resize', this.debounce((e) => { this.resizeCanvas(); }, 300));
    this.getCanvas();

    // Set inGame status
    this.setState({
      inGame: this.props.gameRunning,
    }, () =>{
      // GAME ANIMATION
      this.setupGameThrottledAnimation();
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
  // Start Animating...
  setupGameThrottledAnimation() {
    this.setState({
      gameAnimation: {
        fpsInterval: (1000 / 1),
        then: Date.now(),
      }
    }, () => {
      //console.log(`setupGameThrottledAnimation`);
      this.startGameThrottledAnimation();
    });
  }

  // GAME
  // Get things moving
  startGameThrottledAnimation() {

    
    
    // if inGame is true
    if (this.state.inGame) {

      const tsga = this.state.gameAnimation;

      let fpsInterval = tsga.fpsInterval;
      let then = tsga.then;
      
      // request another frame
      requestAnimationFrame(this.startGameThrottledAnimation);

      // calc elapsed time since last loop
      let now = Date.now();
      let elapsed = now - then;

      // if enough time has elapsed, draw the next frame
      if (elapsed > fpsInterval) {
        // Get ready for next frame by setting then=now, but...
        // Also, adjust for fpsInterval not being multiple of 16.67
        then = now - (elapsed % fpsInterval);

        //console.log(`startGameThrottledAnimation: now: ${now}, elapsed: ${elapsed}, then: ${then}, fpsInterval: ${fpsInterval}`);
        
        this.updateHero();

        //this.updateGame();

      }
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

      console.log(`Key Down`);

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
      },
      centerPos: st.screen.width / 2,
    }, () => {
      // After setState do stuff
      const st = this.state;
      console.log(`resizeCanvas: ${st} | devicePixelRatio: ${st.screen.ratio}`);
      //this.drawHero(st.hero.x, st.hero.y, st.box.width, st.box.height);
      //this.drawBoxes(st.box.width, st.box.height);

    });
  }

  // Draw Canvas
  // drawCanvas() {
  //   // After setState do stuff
  //   const st = this.state;
  //   this.drawHero(st.hero.x, st.hero.y, st.box.width, st.box.height);
  //   this.drawBoxes(st.box.width, st.box.height);

  // }
  
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

  // Update hero (no throttling)
  updateHero() {

    // if inGame is true
    if (this.state.inGame) {

      const st = this.state;
      const context = st.context;
      context.save();
      context.scale(st.screen.ratio, st.screen.ratio);

      let x = parseFloat(st.hero.x);
      let y = parseFloat(st.hero.y);
      let width = st.box.width;
      let height = st.box.height;

      // Get current direction and move accordingly
      switch (st.direction) {
        case 'up':
        y -= height;
        break;
        case 'down':
        y += height;
        break;
        case 'left':
        x -= width;
        break;
        case 'right':
        x += width;
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

        context.restore();

        // Update hero
        this.drawHero(st.hero.x, st.hero.y, st.box.width, st.box.height);

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

      let y = parseFloat(st.blocks.y);
      let width = st.box.width;
      let height = st.box.height;

      // Set the state direction based on the above logic
      // this.setState({
      //     blocks: {
      //       x: x,
      //       y: y,
      //     },
      //   }, () => {

      //   context.restore();

      //   // Update hero
      //   this.drawBoxes(st.box.width, st.box.height);

      // });
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

