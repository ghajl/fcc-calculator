import React, {Component, PureComponent} from 'react';
import ReactDOM from 'react-dom';
import Big from 'big.js';
import './scss/main.scss';

class Button extends PureComponent {
  render() {
    return (
      <button id={this.props.id} className="button" onClick={this.props.handleClick}>{this.props.label}</button>
    )
  }
}

const Display = props => {
  const alert = props.isAlertOn ? 'alert' : '';
  const classes = `${alert} display`;
  return (
    <div className={classes}><span id="display">{props.output}</span></div>
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

  specsymbol = {
    'multiply': String.fromCharCode(215),
    'divide': String.fromCharCode(247),
  }
  
  button = {
    zero: this.createControl('zero', '0', () => this.handleInput('zero')),
    one: this.createControl('one', '1', () => this.handleInput('one')),
    two: this.createControl('two', '2', () => this.handleInput('two')),
    three: this.createControl('three', '3', () => this.handleInput('three')),
    four: this.createControl('four', '4', () => this.handleInput('four')),
    five: this.createControl('five', '5', () => this.handleInput('five')),
    six: this.createControl('six', '6', () => this.handleInput('six')),
    seven: this.createControl('seven', '7', () => this.handleInput('seven')),
    eight: this.createControl('eight', '8', () => this.handleInput('eight')),
    nine: this.createControl('nine', '9', () => this.handleInput('nine')),
    decimal: this.createControl('decimal', '.', () => this.handleInput('decimal')),
    add: this.createControl('add', '+', () => this.handleInput('add')),
    subtract: this.createControl('subtract', '-', () => this.handleInput('subtract')),
    multiply: this.createControl('multiply', '*', () => this.handleInput('multiply')),
    divide: this.createControl('divide', '/', () => this.handleInput('divide')),
    equals: this.createControl('equals', '=', () => this.compute()),
    clear: this.createControl('clear', 'AC', () => this.clear()),
  }

  createControl(key, symbol, action) {
    return {key, symbol, action};
  }

  handleInput = (key) => {
    let symbol = this.button[key].symbol;
    let output = this.state.output;

    if (!this.state.typing) {//new calculation
      if (/[\d\-]/.test(symbol)) {//replace zero
        this.expression = symbol;
        
        output = symbol;
      } else {
        if (symbol === '.') {
          this.expression = '0';
        }
        this.expression += symbol;
        if (key === 'multiply' || key === 'divide') {
          output += this.specsymbol[key];
        } else {
          output += symbol;
        }
      }
    } else if (this.answer !== '') {//continue calculation with previous answer
      if (/(\d|\.)/.test(symbol)) {//start new calculation
        this.expression = '';
        if (symbol === '.') {
          this.expression = '0';
        }
        this.expression += symbol;
        output = symbol;
      } else {//continue calculation
        this.expression = this.answer;
        this.expression += symbol;
        if (key === 'multiply' || key === 'divide') {
          output += this.specsymbol[key];
        } else {
          output += symbol;
        }
      }
      this.answer = '';
    } else {//continue calculation
      if (/[1-9]/.test(symbol) && /.*[+\-\*\/]0$/.test(this.expression)) {//replace zero
        this.expression = this.expression.slice(0, this.expression.length - 1) + symbol;
        output = output.slice(0, output.length - 1) + symbol;
      } else if (symbol === '.' && /.*[+\-\*\/]$/.test(this.expression)) { //insert zero before decimal
        this.expression += '0.';
        output += symbol;
      } else if (/[+\-\*\/]/.test(symbol) && /.+[+\-\*\/]$/.test(this.expression)) { //replace arithmetic signs
        this.expression = this.expression.slice(0, this.expression.length - 1) + symbol;
        if (key === 'multiply' || key === 'divide') {
          output = output.slice(0, output.length - 1) + this.specsymbol[key];
        } else {
          output = output.slice(0, output.length - 1) + symbol;
        }
      } else {
        if (this.isValid(this.expression, symbol)) {
          this.expression += symbol; 
          if (key === 'multiply' || key === 'divide') {
            output += this.specsymbol[key];
          } else {
            output += symbol;
          }
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
        continueOperation = false;
      } else {

        this.answer = result;
        output = result.toString();
        
        if (output.length > 17) {
          output = result.toFixed(11);
          console.log(output)
          if (output.length > 17) {
            console.log(output)
            output = result.toExponential(7);
          }
        }
      }
      this.expression = '';
        
      this.setState({output, typing: continueOperation});
    } catch(e) {
      console.log(e)
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

      insertAction: function(action) {
        const newNode = new treeNode(action);
        newNode.type = 'action';
        if (this.root === null)  {
          throw 'invalid operation';
        }
        if (
          (this.root.type === 'number')
          || (action === '+' || action === '-')
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
      tree.insertAction('-');
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
      tree.insertAction(symbol);
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

  renderButton = (type) => {
    let {key, symbol, action} = this.button[type];
    if (key === 'multiply' || key === 'divide') {
      symbol = this.specsymbol[key];
    }
    return (
      <div className="button-wrapper">
        <Button 
          id={key} 
          label={symbol}
          handleClick={action}
        />
      </div>
    )
  }

  render() {
    return (
      <div className="case">
        <div className="display-wrapper">
          <Display isAlertOn={this.state.alert} output={this.state.output}/>
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