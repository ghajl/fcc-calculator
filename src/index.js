import React, {Component, PureComponent} from 'react';
import ReactDOM from 'react-dom';
import Big from 'big.js';
import './scss/main.scss';
import { hydrate, render } from 'react-dom';


class Button extends PureComponent {

  render() {
    const {className, ...props} = this.props;
    return (
      <button 
        className={`button ${this.props.className}`} 
        {...props}
      >
        <span>{this.props.label}</span>
      </button>
    )
  }
}

const Display = props => {
  const alert = props.isAlertOn ? 'alert' : '';
  const className = `${alert} display`;
  return (
    <div className={className}><span id="display">{props.output}</span></div>
  )
}

class Calculator extends Component {

  state = {
    output: '0',
    typing: false,
    alert: false,
  }

  expression = '';
  answer = '';

  createButtonObject(symbol, label, type) {
    return {symbol, label, type};
  }

  button = {
    zero: this.createButtonObject('0', '0', 'digit'),
    one: this.createButtonObject('1', '1', 'digit'),
    two: this.createButtonObject('2', '2', 'digit'),
    three: this.createButtonObject('3', '3', 'digit'),
    four: this.createButtonObject('4', '4', 'digit'),
    five: this.createButtonObject('5', '5', 'digit'),
    six: this.createButtonObject('6', '6', 'digit'),
    seven: this.createButtonObject('7', '7', 'digit'),
    eight: this.createButtonObject('8', '8', 'digit'),
    nine: this.createButtonObject('9', '9', 'digit'),
    decimal: this.createButtonObject('.', '.', 'digit'),
    add: this.createButtonObject('+', '+', 'operation'),
    subtract: this.createButtonObject('-', '-', 'operation'),
    multiply: this.createButtonObject('*', String.fromCharCode(215), 'operation'),
    divide: this.createButtonObject('/', String.fromCharCode(247), 'operation'),
    equals: this.createButtonObject('=', '=', 'equality'),
    clear: this.createButtonObject('AC', 'AC', 'clear'),
  }

  keys = {
    '0':'zero',
    '1':'one',
    '2':'two',
    '3':'three',
    '4':'four',
    '5':'five',
    '6':'six',
    '7':'seven',
    '8':'eight',
    '9':'nine',
    '/':'divide',
    '*':'multiply',
    '-':'subtract',
    '+':'add',
    '.':'decimal',
    'Enter': 'equals',
    'Delete': 'clear'
  }


  componentWillMount() {
      document.addEventListener("keydown", (e) => this.onKeyPressed(e));
  }

  componentWillUnmount() {
      document.removeEventListener("keydown", (e) => this.onKeyPressed(e));
  }      

  onKeyPressed = (e) => {
    e.preventDefault()
    if (typeof this.keys[e.key] !== 'undefined') {
      if (this.button[this.keys[e.key]].type === 'digit' || this.button[this.keys[e.key]].type === 'operation') {
        this.handleInput(this.keys[e.key]);
      } else if (this.button[this.keys[e.key]].type === 'equality') {
        this.compute();
      } else {
        this.clear();
      }
    }
  }

  handleInput = (name) => {
    const {symbol, label} = this.button[name];
    let output = this.state.output;

    if (!this.state.typing) {//new calculation
      if (/[\d\-]/.test(symbol)) {//replace zero
        this.expression = symbol;
        
        output = label;
      } else {
        this.expression = '0' + symbol;
        output += label;
      }
    } else if (this.answer !== '') {//continue calculation with previous answer
      if (/(\d|\.)/.test(symbol)) {//start new calculation
        this.expression = '';
        if (symbol === '.') {
          this.expression = '0';
        }
        this.expression += symbol;
        output = label;
      } else {//continue calculation
        this.expression = this.answer;
        this.expression += symbol;
        output += label;
      }
      this.answer = '';
    } else {//continue calculation
      if (/[1-9]/.test(symbol) && /.*[+\-\*\/]0$/.test(this.expression)) {//replace zero
        this.expression = this.expression.slice(0, this.expression.length - 1) + symbol;
        output = output.slice(0, output.length - 1) + label;
      } else if (symbol === '.' && /.*[+\-\*\/]$/.test(this.expression)) { //insert zero before decimal
        this.expression += '0.';
        output += label;
      } else if (/[+\-\*\/]/.test(symbol) && /.+[+\-\*\/]$/.test(this.expression)) { //replace arithmetic signs
        this.expression = this.expression.slice(0, this.expression.length - 1) + symbol;
        output = output.slice(0, output.length - 1) + label;
      } else {
        if (this.isValid(this.expression, symbol)) {
          this.expression += symbol; 
          output += label;
        }
      }
    }

    this.setState({output, typing: true});
  }

  clear = () => {
    this.expression = '';
    this.answer = '';
    this.setState({output: '0', typing: false});
  }

  compute = () => {
    
    try {
      const expressionRoot = this.parse(this.expression);
      let result = this.getResult(expressionRoot);
      let output;
      let continueOperation = true;
      if (result === 'error') {
        output = 'error';
        this.answer = '';
        this.expression = '';

        continueOperation = false;
      } else {

        this.answer = result;
        output = result.toString();
        this.expression = output
        if (output.length > 17) {
          output = result.toFixed(11);
          if (output.length > 17) {
            output = result.toExponential(7);
          }
        }
      }
        
      this.setState({output, typing: continueOperation}); 
    } catch(e) {
      this.alert();
    }
  }


  /*
   *return treeNode = {
    value: number or 'add',...
    type: 'number' or 'action'
    left: treeNode,
    right: treeNode,
   } 
   */
  parse(expression) {
    const treeNode = function(value) {
      this.value = value;
      this.type = null;
      this.left = null;
      this.right = null;
    }

    const tree = {
      root: null,
      insertNumber: function(num) {
        const newNode = new treeNode(num);
        newNode.type = 'number';
        if (this.root === null) {
          this.root = newNode;
        } else {
          const parent = (function findNode(node){
            if (node.right == null) {
              return node;
            } 
            return findNode(node.right);
          })(this.root);
          parent.right = newNode;
        }
      },
      insertOperation: function(operation) {
        const newNode = new treeNode(operation);
        newNode.type = 'operation';
        if (this.root === null)  {
          throw 'invalid operation';
        }
        if (
          (this.root.type === 'number')
          || (operation === '+' || operation === '-')
          || (this.root.value === '*' || this.root.value === '/')
        ) {
          newNode.left = this.root;
          this.root = newNode;
        } else {
          newNode.left = this.root.right;
          this.root.right = newNode;
        }
      },
    }

    const re = /\d+(?:\.\d+)?/g;
    let token;
    if (expression.charAt(re.lastIndex) === '-') { //expression starts with minus
      tree.insertNumber(0);
      tree.insertOperation('-');
    }

    while ((token = re.exec(expression)) !== null) {
      const currentNumber = Number(token);

      if (Number.isNaN(currentNumber)) {

        throw 'invalid operation';
      }
      tree.insertNumber(currentNumber);
      if (re.lastIndex === expression.length) {
        break;
      }
      const symbol = expression.charAt(re.lastIndex);
      tree.insertOperation(symbol);
    }
    if (re.lastIndex < expression.length) {

      throw 'invalid operation';
    }
    return tree.root;
  }

  getResult(root) {
    const result = (function getValue(node) {
      if (node.type === 'number') {
        return new Big(node.value);
      }
      const leftValue = getValue(node.left);
      const rightValue = getValue(node.right);
      if (rightValue === 'error' || leftValue === 'error') {
        return 'error';
      }
      let res;
      switch (node.value) {
        case '+': {
          res = leftValue.plus(rightValue);
          break;
        }
        case '-': {
          res = leftValue.minus(rightValue);
          break;
        }
        case '*': {
          res = leftValue.times(rightValue);
          break;
        }
        case '/': {
          if (rightValue.eq(0)) {
            res = 'error';
          } else {
            res = leftValue.div(rightValue);
          }
          
          break;
        }
      }
      return res;
    })(root);
    return result;
  }

  alert() {
    this.setState({alert: true}, () => {
      setTimeout(() => this.setState({
        alert: false
      }), 300);
    })
  }

  isValid(expression, symbol) {
    const re = /^-?(0|[1-9]\d*)(\.\d*)?([+\-\*\/](?=$|(0|[1-9]\d*)(\.\d*)?)((0|[1-9]\d*)(\.\d*)?)?)*$/;
    const checkExpression = expression + symbol;
    return re.test(checkExpression);
  }

  renderButton = (name) => {
    const props = {
      label: this.button[name].label,
    }

    if (this.button[name].type === 'digit' || this.button[name].type === 'operation') {
      props.onClick = () => this.handleInput(name);
      if (this.button[name].type === 'digit') {
        props.className = 'button-digit';
      } else {
        props.className = 'button-operation';
      }
    } else if (this.button[name].type === 'equality') {
      props.onClick = () => this.compute();
      props.className = 'button-equals';
    } else {
      props.onClick = () => this.clear();
      props.className = 'button-clear';
    }

    return (
      <div key={name} className="button-wrapper">
        <Button 
          id={name} 
          {...props}
        />
      </div>
    )
  }

  render() {
    const buttons = [
      'clear',
      'seven',
      'eight',
      'nine',
      'divide',
      'four',
      'five',
      'six',
      'multiply',
      'one',
      'two',
      'three',
      'subtract',
      'zero',
      'decimal',
      'equals',
      'add',
    ];
    return (
      <div className="case">
        <div className="display-wrapper">
          <Display isAlertOn={this.state.alert} output={this.state.output}/>
        </div>
        <div className="controls-wrapper">
          <div className="row">
            {this.renderButton(buttons[0])}
          </div>  
          <div className="row">
            {buttons.slice(1, 5).map(button => this.renderButton(button))}
          </div>
          <div className="row">
            {buttons.slice(5, 9).map(button => this.renderButton(button))}
          </div>
          <div className="row">
            {buttons.slice(9, 13).map(button => this.renderButton(button))}
          </div>
          <div className="row">
            {buttons.slice(13).map(button => this.renderButton(button))}
          </div>                              
        </div>
      </div>
    )
  }
}


const rootElement = document.getElementById('root');
if (rootElement.hasChildNodes()) {
  hydrate(<Calculator />, rootElement);
} else {
  render(<Calculator />, rootElement);
}
