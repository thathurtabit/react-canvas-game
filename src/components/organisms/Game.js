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
  [1,1,1,1,1,1,0,1,1,1],
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
  gameSpeed: 1,
  heroSpeed: 3,
  box: {
    width: (window.innerWidth / 2) / 10,
    height: (window.innerWidth / 2) / 10,
    yPos: 0,
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
    return this.drawBoxes(st.context, boxesMatrix, st.box.width, st.box.height, st.box.yPos);
  }

  // Refs and the dom in React 16+ // https://reactjs.org/docs/refs-and-the-dom.html?
  getCanvas() {
    const context = this.canvas.getContext('2d');
    this.setState({
      context: context,
    }, () => {
      // Draw on canvas after we've got the ref to it
      this.triggerHero();
      this.triggerGame();
    });
  }

  componentWillReceiveProps(nextProps) {
    // Animation (requestAnimationFrame throttled)
    this.setState({
      inGame: nextProps.gameRunning,
    }, () =>{
      // GAME ANIMATION
      this.startAnimation();
    });
  }

  componentDidMount(props) {    
    window.addEventListener('keydown', this.handleKeyDown); 
    window.addEventListener('resize', this.debounce((e) => { this.resizeCanvas(); }, 300));
    this.getCanvas();

    // Set inGame status
    this.setState({
      inGame: this.props.gameRunning,
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
      box: {
        ...prevState.box,
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
      // After setState do stuff
      const st = this.state;
      console.log(`resizeCanvas: ${st} | devicePixelRatio: ${st.screen.ratio}`);

      // Start updates / redrawing
      this.triggerHero();
      this.triggerGame();

    });
  }

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

  
  // Draw Hero
  drawHero(context, xPos, yPos, heroRadius) {
    const sth = this.state.hero;

    // Draw Hero Trail
    for (let i = 0; i < sth.history.length; i++) {
      context.fillStyle = `rgba(255, 0, 0, ${i/sth.history.length})`;
      context.beginPath();
      context.arc(sth.history[i].x, (sth.history[i].y -= this.state.gameSpeed), heroRadius - (0.25 * i), 0, 2 * Math.PI);
      context.fill();
    }

    // Draw Hero
    context.fillStyle = `rgb(255,165,0)`;
    context.beginPath();
    context.arc(xPos, yPos, heroRadius, 0, 2 * Math.PI);
    context.fill();

    this.storeHeroHistory(xPos, yPos);

    console.log(sth.history);

  }
  
  // Draw Boxes
  drawBoxes(context, matrix, boxWidth, boxHeight, yPos) {

    // Rows in Matrix
    matrix.forEach((row, y) => {
       // Cols in row
       row.forEach((value, x) => {
        // If there's a value, draw something
        if(value !==0) {
          context.fillStyle = `rgba(0,0,0,${0.25 * y / 10})`;
          context.fillRect(
            boxWidth * x, // xPos
            boxHeight * y + yPos, // yPos
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

      // Move our boxes upwards (at Game Speed)
      let offsetY = st.box.yPos;
      offsetY -= st.gameSpeed;

      // Set the state direction based on the above logic
      this.setState(prevState => ({
          box: {
            ...prevState.box,
            yPos: offsetY,
          },
        }), () => {
        // Update boxes
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

