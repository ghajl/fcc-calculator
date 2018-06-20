import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './scss/main.scss';

const Button = props => {
  return (
    <button id={props.id} value={props.label} className="button" onClick={props.handleClick}>{props.label}</button>
  )
}

const Display = props => {
  return (
    <div className="display">{props.output}</div>
  )
}

class Calculator extends Component {

  state = {
    output: '0',
  }

  control = {
    zero: this.createControl('zero', '0', () => this.getSymbol('0')),
    one: this.createControl('one', '1', () => this.getSymbol('1')),
    two: this.createControl('two', '2', () => this.getSymbol('2')),
    three: this.createControl('three', '3', () => this.getSymbol('3')),
    four: this.createControl('four', '4', () => this.getSymbol('4')),
    five: this.createControl('five', '5', () => this.getSymbol('5')),
    six: this.createControl('six', '6', () => this.getSymbol('6')),
    seven: this.createControl('seven', '7', () => this.getSymbol('7')),
    eight: this.createControl('eight', '8', () => this.getSymbol('8')),
    nine: this.createControl('nine', '9', () => this.getSymbol('9')),
    decimal: this.createControl('decimal', '.', () => this.getSymbol('.')),
    add: this.createControl('add', '+', () => this.getSymbol('+')),
    subtract: this.createControl('subtract', '-', () => this.getSymbol('-')),
    multiply: this.createControl('multiply', '*', () => this.getSymbol('*')),
    divide: this.createControl('divide', '/', () => this.getSymbol('/')),
    equals: this.createControl('equals', '=', () => this.getSymbol('=')),
    clear: this.createControl('clear', 'C', () => this.clear()),
  }

  createControl(key, label, action) {
    return {key, label, action};
  }

  getSymbol = (key) => {
    let expression = this.state.output;
    if (/[1-9]/.test(key) && /(.*[+\-\*\/]|^)0$/.test(expression)) {
      expression = expression.slice(0, expression.length - 1) + key
    } else if (key == '.' && /.*[+\-\*\/]$/.test(expression)) {
      expression = expression + '0.';
    } else if (/[+\-\*\/]/.test(key) && /.*[+\-\*\/]$/.test(expression)) {
      expression = expression.slice(0, expression.length - 1) + key
    } else {
      if (this.isValid(expression, key)) {
        expression = expression + key; 
      }
    }
    
    this.setState({output: expression});
  }

  clear = () => {
    this.setState({output: '0'});
  }

  isValid(expression, symbol) {
    const re = /^-?(0|[1-9]\d*)(\.\d*)?([+\-\*\/](?=$|(0|[1-9]\d*)(\.\d*)?)((0|[1-9]\d*)(\.\d*)?)?)*$/;
    const checkExpression = expression + symbol;
    return re.test(checkExpression);
  }

  renderButton(type) {
    const {key, label, action} = this.control[type];
    return (
      <div className="button-wrapper">
        <Button 
          id={key} 
          label={label}
          handleClick={action}
        />
      </div>
    )
  }

  render() {
    return (
      <div className="case">
        <div className="display-wrapper">
          <Display output={this.state.output}/>
        </div>
        <div className="controls">
          <div className="row">
            {this.renderButton('clear')}
          </div>  
          <div className="row">
            {this.renderButton('seven')}
            {this.renderButton('eight')}
            {this.renderButton('nine')}
            {this.renderButton('divide')}
          </div>
          <div className="row">
            {this.renderButton('four')}
            {this.renderButton('five')}
            {this.renderButton('six')}
            {this.renderButton('multiply')}
          </div>
          <div className="row">
            {this.renderButton('one')}
            {this.renderButton('two')}
            {this.renderButton('three')}
            {this.renderButton('subtract')}
          </div>
          <div className="row">
            {this.renderButton('zero')}
            {this.renderButton('decimal')}
            {this.renderButton('equals')}
            {this.renderButton('add')}
          </div>                              
        </div>
      </div>
    )
  }
}

const Root = (props) => {
  return (
  <div className="calc-wrapper"> <Calculator /></div>
  )
}

ReactDOM.render(
  <Root 
    />,
  document.getElementById('root')
)