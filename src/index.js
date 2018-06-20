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
    <div className="display"><span>{props.output}</span></div>
  )
}

class Calculator extends Component {

  state = {
    output: '0',
  }

  expression = '0';

  specsign = {
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
    clear: this.createControl('clear', 'C', () => this.clear()),
  }

  createControl(key, symbol, action) {
    return {key, symbol, action};
  }

  handleInput = (key) => {
    let symbol = this.button[key].symbol;
    let output = this.state.output;
    if (output === 'error') {
      output = '0';
    }
    if (/[1-9]/.test(symbol) && /(.*[+\-\*\/]|^)0$/.test(this.expression)) {//remove zero
      this.expression = this.expression.slice(0, this.expression.length - 1) + symbol;
      output = output.slice(0, output.length - 1) + symbol;
    } else if (symbol == '.' && /.*[+\-\*\/]$/.test(this.expression)) { //insert zero before decimal
      this.expression += '0.';
      output += '0.';
    } else if (/[+\-\*\/]/.test(symbol) && /.*[+\-\*\/]$/.test(this.expression)) { //replace arithmetic signs
      this.expression = this.expression.slice(0, this.expression.length - 1) + symbol;
      if (key === 'multiply' || key === 'divide') {
        output = output.slice(0, output.length - 1) + this.specsign[key];
        
      } else {
        output = output.slice(0, output.length - 1) + symbol;
      }
    } else {
      if (this.isValid(this.expression, symbol)) {
        this.expression += symbol; 
        if (key === 'multiply' || key === 'divide') {
          output += this.specsign[key];
        } else {
          output += symbol;
        }
      }
    }
    
    this.setState({output});
  }

  clear = () => {
    this.expression = '0';
    this.setState({output: '0'});
  }

  compute = () => {
    const expressionRoot = this.parse(this.expression);

    const result = this.getResult(expressionRoot);
    if (result == 'error') {
      this.expression = '0';
    } else {
      this.expression = result;
    }
    this.setState({output: result});
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
    const re = /\d+(?:\.\d+)?/g;

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

    let token;

    while ((token = re.exec(expression)) !== null) {
      const currentNumber = Number(token);
      if (Number.isNaN(currentNumber)) {
        throw 'invalid operation';
      }
      tree.insertNumber(currentNumber);
      if (re.lastIndex === expression.length) {
        return tree.root;
      }
      const symbol = expression.charAt(re.lastIndex);
      tree.insertAction(symbol);
    }
    return tree.root;
  }

  getResult(root) {

    const result = (function getValue(node) {
      if (node.type === 'number') {
        return node.value;
      }
      const leftValue = getValue(node.left);
      const rightValue = getValue(node.right);
      if (rightValue === 'error' || leftValue === 'error') {
        return 'error';
      }
      let res;
      switch (node.value) {
        case '+': {
          res = leftValue + rightValue;
          break;
        }
        case '-': {
          res = leftValue - rightValue;
          break;
        }
        case '*': {
          res = leftValue * rightValue;
          break;
        }
        case '/': {
          if (rightValue === 0) {
            res = 'error';
          } else {
            res = leftValue / rightValue;
          }
          
          break;
        }
      }
      return res;
    })(root);
    return result;
  }

  isValid(expression, symbol) {
    const re = /^-?(0|[1-9]\d*)(\.\d*)?([+\-\*\/](?=$|(0|[1-9]\d*)(\.\d*)?)((0|[1-9]\d*)(\.\d*)?)?)*$/;
    const checkExpression = expression + symbol;
    return re.test(checkExpression);
  }

  renderButton(type) {
    let {key, symbol, action} = this.button[type];
    if (key === 'multiply' || key === 'divide') {
      symbol = this.specsign[key];
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