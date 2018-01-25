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

const BLOCKMATRIX = [
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
  [1,1,1,1,1,0,1,1,1,1],
  [0,0,0,0,0,0,1,1,1,1],
  [0,1,1,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1,1,1],
  [0,0,0,1,0,0,0,0,1,1],
  [1,1,0,1,0,1,1,0,1,1],
  [1,0,0,1,0,1,0,0,1,1],
  [1,0,1,1,0,1,0,1,1,1],
  [1,0,0,0,0,1,0,0,1,1],
  [1,1,1,1,1,1,1,0,1,1],
  [1,1,1,1,1,1,1,0,0,0],
  [1,1,1,1,1,1,1,1,1,0],
  [1,1,1,0,0,0,0,0,0,0],
  [1,1,1,0,1,1,1,1,1,1],
  [1,1,1,0,0,1,1,1,1,1],
  [1,1,1,1,0,0,1,1,1,1],
  [1,1,1,1,1,0,0,1,1,1],
  [1,1,1,1,1,1,0,1,1,1],
  [1,1,1,1,1,0,0,1,1,1],
];


const COUNTPATHBLOCKS = () => {
  let pathBlockCount = 0;

  BLOCKMATRIX.forEach((row, y) => {
    // Cols in row
    row.forEach((value, x) => {
      // If there's a value, draw the BG blocks
      if(value === 0) {
        pathBlockCount += 1;
      }
    });
  });

  return pathBlockCount;
}

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
  gameSpeed: 1,
  gamePathBlocks: COUNTPATHBLOCKS(),
  block: {
    width: (window.innerWidth / 2) / 10,
    height: (window.innerWidth / 2) / 10,
    yPos: 0,
    history: Array(COUNTPATHBLOCKS()).fill({x: 0, y: 0}),
  },
  hero: {
    xPos: (window.innerWidth / 2) / 2,
    yPos: 0,
    width: (window.innerWidth / 10) / 8,
    height: (window.innerWidth / 10) / 8,
    trailLength: 15,
    history: [],
  },
  centerPos: (window.innerWidth / 2) / 2,
  context: null,
  direction: 'down',
};

const GameInfoTL = styled.p`
  position: absolute;
  top: 30px;
  left: 30px;#FF6A00FF
`;


console.log(initialState.block.history[10].x);

// MY GAME COMPONENT
export default class Game extends Component {

  // State constructor
  constructor(props) {
    super(props);
    this.state = initialState;
    this.getCanvas = this.getCanvas.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this, true);
    this.startAnimation = this.startAnimation.bind(this);
  }

  // Shortcut to Draw Hero
  triggerHero() {
    let st = this.state;
    return this.drawHero(st.context, st.hero.xPos, st.hero.yPos, st.hero.width);
  }

  // Shortcut to Draw Game
  triggerGame() {
    let st = this.state;
    return this.drawBlocks(st.context, BLOCKMATRIX, st.block.width, st.block.height, st.block.yPos);
  }

  // Refs and the dom in React 16+ // https://reactjs.org/docs/refs-and-the-dom.html?
  getCanvas() {
    const context = this.canvas.getContext('2d');
    const st = this.state;

    this.setState({
      context: context,
    }, () => {
      // Draw on canvas after we've got the ref to it
      this.triggerHero();
      this.triggerGame();
      this.getInitialPath(context, BLOCKMATRIX, st.block.width, st.block.height);
    });
  }

  // Triggered when new props received
  componentWillReceiveProps(nextProps) {
    // Animation (requestAnimationFrame throttled)
    this.setState({
      inGame: nextProps.gameRunning,
    }, () =>{
      // GAME ANIMATION
      this.startAnimation();
    });
  }

  // Triggered at the start
  componentDidMount(props) {    
    window.addEventListener('keydown', this.handleKeyDown); 
    window.addEventListener('resize', this.debounce((e) => { this.resizeCanvas(); }, 300));
    this.getCanvas();

    // Set inGame status
    this.setState({
      inGame: this.props.gameRunning,
      // Make sure hero moves twice as fast as the game
      heroSpeed: this.state.gameSpeed * 2,
    }, () =>{
      // GAME ANIMATION
      this.startAnimation();
    }); 

  }

  // Tidy up after yourself
  componentWillUnmount() {
    //window.removeEventListener('keyup', this.handleKeyUp);
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
      context.clearRect(0, 0, this.state.screen.width, this.state.screen.height);

      this.updateGame();
      this.updateHero();

    }
  }

  handleKeyDown(value, e) {
  
    // if inGame is true, start setting the direction state
    if (this.state.inGame) {

      // Assign direction info
      let direction;
  
      // Note: is event.keyCode deprecated?
      if(e.keyCode === KEY.LEFT   || e.keyCode === KEY.A) direction = "left";
      if(e.keyCode === KEY.RIGHT  || e.keyCode === KEY.D) direction = "right";
      if(e.keyCode === KEY.UP     || e.keyCode === KEY.W) direction = "up";
      if(e.keyCode === KEY.DOWN   || e.keyCode === KEY.S) direction = "down";
           
      // Set directon state
      this.setState({
        direction: direction,
      });
      
    }
  }
  
  // Resize Canvas
  // (only runs on resize event)
  resizeCanvas() {
    const st = this.state;

    this.setState(prevState => ({
      screen: {
        width: window.innerWidth / 2,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1,
      },
      block: {
        ...prevState.block,
        width: (window.innerWidth / 2) / 10,
        height: (window.innerWidth / 2) / 10,
      },
      hero: {
        ...prevState.hero,
        xPos: (window.innerWidth / 2) / 2,
        width: (window.innerWidth / 10) / 8,
        height: (window.innerWidth / 10) / 8,
      },
      centerPos: st.screen.width / 2,
    }), () => {

      // Start updates / redrawing
      this.triggerHero();
      this.triggerGame();

    });
  }

  // Store Hero History
  storeHeroHistory(xPos, yPos) {
    const st = this.state;
    let heroHistory = st.hero.history;

    // push an item
    heroHistory.push({
      x: xPos,
      y: yPos,
    });

    // get rid of first item
    if (st.hero.history.length > st.hero.trailLength) {
      heroHistory.shift();
    }

    // Set with updated history
    this.setState(prevState => ({
      hero: {
        ...prevState.hero,
        history: heroHistory,
      },
    }));
  }
  
  // Draw Hero (over and over)
  drawHero(context, xPos, yPos, heroRadius) {
    const sth = this.state.hero;

    // Draw Hero Trail
    for (let i = 0; i < sth.history.length; i++) {
      context.fillStyle = `rgba(0, 0, 0, ${i/sth.history.length})`;
      context.beginPath();
      context.arc(sth.history[i].x, (sth.history[i].y -= this.state.gameSpeed), heroRadius - (0.15 * i), 0, 2 * Math.PI);
      context.fill();
    }

    // Draw Hero
    context.fillStyle = `#4E1887`;
    context.beginPath();
    context.arc(xPos, yPos, heroRadius, 0, 2 * Math.PI);
    context.fill();

    this.storeHeroHistory(xPos, yPos);
  }

  // Get the initial hero path (only triggers on page load or resize)
  getInitialPath(context, matrix, blockWidth, blockHeight) {
    const st = this.state;
    let blockHistory = st.block.history;
    let index = 0;
    let next = index + 1;
    let curBlockX;
    let curBlockY;

    console.log(`Context is: ${context}`);

    // Start Line drawing
    context.beginPath();
    context.strokeStyle = "black";
    context.lineWidth = 10;

    // Rows in Matrix
    matrix.forEach((row, y) => {
       // Cols in row
       row.forEach((value, x) => {
        // If there's a value, plot the path
        if(value === 0) {

          curBlockX = blockWidth * x, // xPos
          curBlockY = blockWidth * y, // yPos
      
          // Update position data at [index]
          blockHistory[index].x = curBlockX;
          blockHistory[index].y = curBlockY;
          
          context.moveTo(blockHistory[index].x, blockHistory[index].y);
          context.lineTo(blockHistory[next].x, blockHistory[next].y);    
          
          console.log(`${index}X:${blockHistory[index].x} | ${index}Y:${blockHistory[index].y} `);

          index += 1; // increment
        }
      });
    });

    context.stroke();

  }

  // Draw Blocks (over and over)
  drawBlocks(context, matrix, blockWidth, blockHeight, yPos) {
    let pathIndex = -1;

    // Rows in Matrix
    matrix.forEach((row, y) => {
       // Cols in row
       row.forEach((value, x) => {
        // If there's a value, draw the BG blocks
        if(value !==0) {

          // Fill
          context.fillStyle = `rgba(0,0,0,${0.25 * y / 10})`;
          context.fillRect(
            blockWidth * x, // xPos
            blockHeight * y + yPos, // yPos
            blockWidth,
            blockHeight
          );

          // Border
          context.lineWidth = 5;
          context.strokeStyle = `rgba(255, 255, 255, 1)`;
          context.stroke();

        // Else draw hero block path
        } else {
          context.fillStyle = `rgba(255, 0, 0, ${0.25 * y / 10})`;
          context.fillRect(
            blockWidth * x, // xPos
            blockHeight * y + yPos, // yPos
            blockWidth,
            blockHeight
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

      let x = st.hero.xPos;
      let y = st.hero.yPos;
      let heroSpeed = st.heroSpeed;
      let gameSpeed = st.gameSpeed;

      // Get current direction and move accordingly
      switch (st.direction) {
        case 'up':
        y -= heroSpeed;
        break;
        case 'down':
        y += heroSpeed;
        break;
        case 'left':
        x -= heroSpeed;
        y -= gameSpeed;
        break;
        case 'right':
        x += heroSpeed;
        y -= gameSpeed;
        break;
        default:
        break;
      }

      // Set the state direction based on the above logic
      this.setState(prevState => ({
        hero: {
          ...prevState.hero,
          xPos: x,
          yPos: y,
        }
      }), () => {
        // Update hero
        this.triggerHero();
      });
    }
  }


  // Update Game (thottled)
  updateGame() {

    // if inGame is truews
    if (this.state.inGame) {

      const st = this.state;
      const context = st.context;
      context.save();

      // Move our Blocks upwards (at Game Speed)
      let offsetY = st.block.yPos;
      offsetY -= st.gameSpeed;

      // Set the state direction based on the above logic
      this.setState(prevState => ({
          block: {
            ...prevState.block,
            yPos: offsetY,
          },
        }), () => {
        // Update Blocks
        this.triggerGame();        
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

