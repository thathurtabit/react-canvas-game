import React, { Component } from 'react';
import styled from 'styled-components';
import { CSSTransition } from 'react-transition-group';
import siteData from '../../api/siteData';
import introPageData from '../../api/introPageData';
import Game from '../../components/organisms/Game';
import Button from '../../components/atoms/Button';


const SiteWrap = styled.section`
  align-items: center;
  color: #4E1887;
  display: flex;
  font-family: 'VT323', sans-serif;
  font-size: 1rem;
  flex-direction: row;
  justify-content: center;
  height: 100%;
`;

const Column = styled.section`
  align-items: center;
  display: flex;
  flex: 1;
  height: calc(100% - 40px);
  justify-content: center;
  padding: 20px;
  position: relative;
`;

const Intro = styled.section`
  font-size: 1.5em;
  text-align: center;
`;

const duration = 300;

// Fade handler
const Fade = ({ children, ...props }) => (
  <CSSTransition
    {...props}
    timeout={duration}
    classNames="fade"
  >
    {children}
  </CSSTransition>
);

// Set my initial state
const initialState = {
  siteTitle: siteData.title,
  siteIntro: introPageData.p1,
  siteInstructions: introPageData.p2,
  button: {
    text: "Start",
    disabled: false,
  },
  gameRunning: false,
};


export default class App extends Component {

  // State constructor
  constructor(props) {
    super(props);
    this.state = initialState;
    this.gameTrigger = this.gameTrigger.bind(this);
  }

  // React Lifecycle
  componentWillMount() {

    // Fade Transition In (first page load)
    setTimeout(() => {
      this.setState({
        show: !this.state.show,
      });
    }, duration);
  }

  gameTrigger() {
    this.setState({
      button: {
        text: this.state.gameRunning ? "Start" : "Stop",
        disabled: false,
      },
      gameRunning: !this.state.gameRunning,
    });
  }

  handleKeyPress() {
    console.error('KEY PRESS BABY');
  }

  render() {
    return (
      <Fade in={this.state.show}>
        <SiteWrap>
          <Column>
            <Intro>
              <header className="App-header">
                <h1 className="App-title">{this.state.siteTitle}</h1>
              </header>
              <p className="App-intro">
                {this.state.siteIntro}
              </p>
              <p className="App-intro">
                {this.state.siteInstructions}
              </p>
              <Button gameTrigger={this.gameTrigger} text={this.state.button.text} disabled={this.state.button.disabled} />
            </Intro>
          </Column>
          <Column>
            <Game gameRunning={this.state.gameRunning} handleKeyPress={this.handleKeyPress} />
          </Column>
        </SiteWrap>
      </Fade>
    );
  }
}

