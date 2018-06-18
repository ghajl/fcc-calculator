import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './scss/main.scss';

const Button = props => {
	return (
		<div className="button"></div>
	)
}

const Display = props => {
	return (
		<div className="display"></div>
	)
}

class Calculator extends Component {

	render() {
		return (
			<div className="case">
				<div className="display-wrapper">
					<Display />
				</div>
				<div className="controls">
					<div className="row">
						<div className="button-wrapper align-end">
							<Button />
						</div>
					</div>	
					<div className="row">
						<div className="button-wrapper">
							<Button />
						</div>
						<div className="button-wrapper">
							<Button />
						</div>
						<div className="button-wrapper">
							<Button />
						</div>
						<div className="button-wrapper">
							<Button />
						</div>
					</div>
					<div className="row">
						<div className="button-wrapper">
							<Button />
						</div>
						<div className="button-wrapper">
							<Button />
						</div>
						<div className="button-wrapper">
							<Button />
						</div>
						<div className="button-wrapper">
							<Button />
						</div>
					</div>
					<div className="row">
						<div className="button-wrapper">
							<Button />
						</div>
						<div className="button-wrapper">
							<Button />
						</div>
						<div className="button-wrapper">
							<Button />
						</div>
						<div className="button-wrapper">
							<Button />
						</div>
					</div>
					<div className="row">
						<div className="button-wrapper">
							<Button />
						</div>
						<div className="button-wrapper">
							<Button />
						</div>
						<div className="button-wrapper">
							<Button />
						</div>
						<div className="button-wrapper">
							<Button />
						</div>
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