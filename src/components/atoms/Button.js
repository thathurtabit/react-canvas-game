import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const ButtonStyles = styled.button`
  background: palevioletred;
  border: 0;
  color: #fff;
  font-size: 1rem;
  letter-spacing: 0.1rem;
  padding: 1rem 3rem;
  text-align: center;
  text-transform: uppercase;

  &[disabled],
  &[disabled]:hover {
  	background: palevioletred;
  	cursor: not-allowed;
  	opacity: 0.5;
  }
  &:hover {
  	background: black;
  	cursor: pointer;
  }
`;

export default function Button(props)  {
  return <ButtonStyles onClick={props.gameTrigger} disabled={props.disabled}>{props.text}</ButtonStyles>
}

Button.propTypes = {
  text: PropTypes.string.isRequired,
}