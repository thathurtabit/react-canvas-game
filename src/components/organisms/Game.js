import React, { Component } from 'react';

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


const COUNTBLOCKS = (type) => {
  let pathRowCount = 0;
  let pathBlockCount = 0;

  // rows
  BLOCKMATRIX.forEach((row, y) => {
    pathRowCount += 1;

    // Cols in row
    row.forEach((value, x) => {
      // If there's a value, draw the BG blocks
      if(value === 0) {
        pathBlockCount += 1;
      }
    });
  });

  if(type === 'rows') {
    return pathRowCount;
  } else {
    return pathBlockCount;
  }
}

const GAMEROWARRAY = () => {
  let gameRowArray = [];
  let blockHeight = (window.innerWidth / 3) / 10;
  
  for (let i = 0; i < COUNTBLOCKS('rows'); i++) {
    let rowY = blockHeight * i;
    gameRowArray.push({y: rowY});
  }

  return gameRowArray;
}


// Set my initial state
const initialState = {
  inGame: false,
  keyPressed: false,
  startTime: Date.now(),
  siteTitle: "Canvas Game",
  
  screen: {
    width: window.innerWidth / 3,
    height: window.innerHeight,
    ratio: window.devicePixelRatio || 1,
  },
  gameRows: COUNTBLOCKS('rows'),
  gameRowsArray: GAMEROWARRAY(),
  gameCols: 10,
  gameSpeed: 1,
  gameHeight: '', // set in componentDidMount
  gamePathBlocks: COUNTBLOCKS('pathBlocks'),
  block: {
    width: (window.innerWidth / 3) / 10,
    height: (window.innerWidth / 3) / 10,
    yPos: 0,
    history: Array(COUNTBLOCKS('pathBlocks')).fill({x: 0, y: 0}),
  },
  hero: {
    xPos: (window.innerWidth / 3) / 2,
    yPos: 0,
    width: (window.innerWidth / 10) / 15,
    height: (window.innerWidth / 10) / 8,
    trailLength: 10,
    history: [],
  },
  centerPos: (window.innerWidth / 3) / 2,
  context: null,
  direction: 'down',
};

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

    this.setState({
      context: context,

    }, () => {
      // Draw on canvas after we've got the ref to it
      this.triggerHero();
      this.triggerGame();
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
      gameHeight: this.state.gameRows * this.state.block.height,
    }, () =>{
      // GAME ANIMATION
      this.startAnimation();
      console.log(`Game Height: ${this.state.gameHeight} | Row Count: ${this.state.gameRows}`);
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
      gameHeight: this.state.gameRows * this.state.block.height,
    }), () => {

      // Start updates / redrawing
      this.triggerHero();
      this.triggerGame();

    });
  }


  // Loop
  checkCollision() {
    

    const st = this.state;
    const heroPosX = st.hero.xPos;
    const heroPosY = st.hero.yPos;

    if (st.direction === 'up' || st.direction === 'down') {
      
      console.log(`collision direction: ${st.direction}`);

      for (let i = 0; i < st.gameRowsArray.length; i++) {

        console.log(`Hero y: ${st.hero.yPos} | Path y: ${st.gameRowsArray[i].y}`);

        if (heroPosY === st.gameRowsArray[i].y) {
          console.error(`It's a hit.`);
        }
      }
    }

    /*

      If hero current position is inside of BLOCK ROW 
      then target the path blocks on that row

    */
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
    }), ()=> {

      // Check for collisions based on current state data
      this.checkCollision();
    });
  }
  
  // Draw Hero (over and over)
  drawHero(context, xPos, yPos, heroRadius) {
    const sth = this.state.hero;

    // Draw Hero Trail
    for (let i = 0; i < sth.history.length; i++) {
      context.fillStyle = `rgba(0, 0, 0, ${i/sth.history.length})`;
      context.beginPath();
      context.arc(sth.history[i].x, sth.history[i].y, 5, 0, 2 * Math.PI);
      context.fill();
    }

    // Draw Hero
    context.fillStyle = `#4E1887`;
    context.beginPath();
    context.arc(xPos, yPos, heroRadius, 0, 2 * Math.PI);
    context.fill();
    
    this.storeHeroHistory(xPos, yPos);
    
  }

  // Store Block Path History
  storeBlockPathData(index, xPos, yPos) {
    const st = this.state;
    let blockHistory = st.block.history;
  
    blockHistory[index].x = xPos,
    blockHistory[index].y = yPos,

    // Set with updated history
    this.setState(prevState => ({
      block: {
        ...prevState.block,
        history: blockHistory,
      },
    }));
  }
 

  // Draw Blocks (over and over)
  drawBlocks(context, matrix, blockWidth, blockHeight, yPos) {
    let blockPathIndex = 0;

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
          
          //console.log(`path block x: ${x} | path block y: ${y} `);

          context.fillStyle = `rgba(255, 0, 0, ${0.25 * y / 10})`;
          context.fillRect(
            blockWidth * x, // xPos
            blockHeight * y + yPos, // yPos
            blockWidth,
            blockHeight
          );
         
          // Store the CENTER of the path block
          this.storeBlockPathData(blockPathIndex, (blockWidth * x) + blockWidth, (blockHeight * y + yPos) + blockWidth);

          // Increment blockPathIndex after each send to storeBlockPathData
          blockPathIndex += 1;
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
      <canvas
      ref={canvas => this.canvas = canvas}
      width={this.state.screen.width}
      height={this.state.screen.height}
      />
      </div>
    );
  }
}

