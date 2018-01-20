import React, { Component } from 'react';
import styled from 'styled-components';
import { CSSTransition } from 'react-transition-group';
import siteData from '../../api/siteData';
import introPageData from '../../api/introPageData';
import Game from '../../components/organisms/Game';


const SiteWrap = styled.section`
  align-items: center;
  display: flex;
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
`;

const Intro = styled.section`
  font-size: 1.5em;
  text-align: center;
  color: palevioletred;
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
};


export default class App extends Component {

  // State constructor
  constructor(props) {
    super(props);
    this.state = initialState;

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
            </Intro>
          </Column>
          <Column>
            <Game />
          </Column>
        </SiteWrap>
      </Fade>
    );
  }
}

