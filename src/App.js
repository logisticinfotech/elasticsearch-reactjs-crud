import React, { Component } from 'react';
import './App.css';
var client = require('./connection.js');
var indexName = "crud";
var docType = "doc";
var payload;
class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			id: "",
			nameValue: "",
			dataList: []
		}
	}
	onChangeFunc = (event) => {
		this.setState({
			nameValue: event.target.value
		})
	}
	componentDidMount() {
		this.getElasticSearchData();
	}
	getElasticSearchData = () => {
		var that = this;
		client.search({
			index: indexName,
			type: docType,
			// refresh: true,
			// body: payload
		}).then(function (resp) {
			console.log(resp.hits.hits);
			that.setState({
				dataList: resp.hits.hits
			})
		}, function (err) {
			console.log(err.message);
		});
	}
	onEditClick = (ch) => {
		this.setState({
			nameValue: ch._source.message,
			id: ch._id
		});
	}
	onDeleteClick = (ch) => {
		// this.setState({
		// 	nameValue: ch._source.message,
		// 	id: ch._id
		// });
		console.log("onDeleteClick :", ch)
		var that = this;
		client.delete({
			index: indexName,
			type: docType,
			refresh: true,
			id: ch._id,
		}, function (err, resp) {
			if (err) {
				console.log(err)
			} else {
				that.getElasticSearchData();
			}
		});
	}
	handleKeyUp = (evt) => {
		var that = this;
		if (evt.keyCode === 13) {
			evt.persist();
			if (this.state.id !== "") {
				payload = {
					"doc": { // for update this is required
						"message": evt.target.value
					}
				}
				var _id = this.state.id;
				client.update({
					index: indexName,
					type: docType,
					refresh: true,
					id: _id,
					body: payload
				}, function (err, resp) {
					if (!err) {
						that.getElasticSearchData();
						that.setState({
							id: "",
							nameValue:""
						})
					} else {
						console.log(err);
					}
				})
			} else {
				payload = {
					"user": "elastic",
					"post_date": "2010-01-15T01:46:38",
					"message": evt.target.value
				}
				//create documents
				client.index({
					index: indexName,
					type: docType,
					refresh: true,
					// id: _id,
					body: payload
				}).then(function (resp) {
					that.getElasticSearchData();
					that.setState({
						id: "",
						nameValue:""
					})
				}, function (err) {
					console.log(err.message);
				});
			}
		};
	}
	render() {
		return (
			<div className="container">
				<div className="row justify-content-md-center">
					<div className="col-md-8">
						<center><h3 className="main-title">Channel List</h3></center>
						<hr />
						<div className="input-group mb-3">
							<input
								type="text"
								className="form-control"
								placeholder="Enter Channel"
								onKeyUp={this.handleKeyUp}
								value={this.state.nameValue}
								onChange={this.onChangeFunc} />
						</div>

					</div>
				</div>
				<ul className="list-group">
					{this.state.dataList.map(ch =>
						<li key={"div_" + ch._id} className="list-group-item">
							<label htmlFor="checkbox5">
								{ch._source.message}
							</label>
							<div className="pull-right action-buttons">
								<a onClick={() => this.onEditClick(ch)} href="#"><span className="fa fa-pencil"></span></a>
								<a onClick={() => this.onDeleteClick(ch)} className="trash" href="#" ><span className="fa fa-trash"></span></a>
							</div>
						</li>
					)}
				</ul>
			</div>

		);
	}
}

export default App;
