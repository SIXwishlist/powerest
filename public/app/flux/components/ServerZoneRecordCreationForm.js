var React = require('react');
var ServerZoneActions = require('../actions/ServerZoneActions');
var RrTypeDropdown = require('./RrTypeDropdown');
var Input = require('react-bootstrap').Input;
var Alert = require('react-bootstrap').Alert;
var Validator = require('../../core/validator');
var GenericRecord = require('../models/GenericRecord');
var Config = require('../../config');

var ActionLog = require('../ActionLog/Actions');
var Action = require('../ActionLog/Action');
var ActionStore = require('../ActionLog/Store');

var ENTER_KEY_CODE = 13;

var ServerZoneRecordCreationForm = React.createClass({
    getDomId: function () {
        if(!this._domId) {
            this._domId = _.uniqueId('record_creation_');
        }

        return this._domId;
    },

    getInitialState: function() {
        return {
            name: this.props.name,
            content: this.props.content,
            type: this.props.type,
            priority: this.props.priority,
            ttl: this.props.ttl || Config.default_record_ttl,
            prioEnabled: false
        };
    },

    validationState: function(ref) {
        var yes = 'success';
        var no = 'error';

        switch(ref) {
            case 'name':
            case 'content':
                if(_.isEmpty(this.state[ref])) {
                    return '';
                } else {
                    return Validator.domain(this.state[ref]) ? yes : no;
                }
            case 'ttl':
                if(_.isEmpty(this.state[ref].toString())) {
                    return '';
                } else {
                    return Validator.numeric(this.state[ref]) ? yes : no;
                }
            case 'priority':
                if(!this.state.prioEnabled) {
                    return '';
                } else if(_.isEmpty(this.state[ref].toString())) {
                    return no;
                } else {
                    return Validator.numeric(this.state[ref]) ? yes : no;
                }
            default:
                return yes;
        }
    },

    handleChange: function(ref, event) {
        if(_.isEmpty(this.refs)) return;
        if(!_.has(this.state, ref)) return;

        var currentState = this.state;
        currentState[ref] = this.refs[ref].getValue();

        this.setState(currentState);
    },

    handleTypeChange(dropdown, newState) {
        var currentState = this.state;
        currentState.type = newState.selected;

        if(currentState.type === 'MX') {
            currentState.prioEnabled = true;
        } else {
            currentState.prioEnabled = false;
        }

        this.setState(currentState);
    },

    /**
     * @return {object}
     */
    render: function () {
        var info;

        if(_.isEmpty(this.state.info)) {
            info = (<div className="row" />);
        } else {
            info = (
                <div className="row">
                    <div className="col-xs-12">
                        <Alert bsStyle="warning" onDismiss={this._dismissInfo}>
                            <h4><i className="icon fa fa-warning"></i> Hint</h4>
                            <p>{this.state.info}</p>
                        </Alert>
                    </div>
                </div>
            );
        }

        return (
            <div id={this.getDomId()} className="box box-success">
                <div className="box-header">
                    <h3 className="box-title" data-widget="collapse">
                        Add a new RR
                    </h3>
                    <div className="box-tools pull-right">
                        <button className="btn btn-box-tool" data-widget="collapse">
                            <i className="fa fa-plus" />
                        </button>
                    </div>
                </div>
                <div className="box-body">
                    {info}
                    <div className="row">
                        <div className="col-xs-12 col-md-2 rr-dropdown-wrapper">
                            <RrTypeDropdown onChange={this.handleTypeChange} />
                        </div>
                        <div className="col-xs-12 col-md-5">
                            <Input
                                type='text'
                                label='Resource Name'
                                placeholder='sub.example.org'
                                bsStyle={this.validationState('name')}
                                hasFeedback
                                ref='name'
                                onChange={this.handleChange.bind(this, 'name')}
                                onKeyDown={this._onKeyDown}
                            />
                        </div>
                        <div className="col-xs-12 col-md-5">
                            <Input
                                type='text'
                                label='Content'
                                placeholder='192.168.0.1'
                                bsStyle={this.validationState('content')}
                                hasFeedback
                                ref='content'
                                onChange={this.handleChange.bind(this, 'content')}
                                onKeyDown={this._onKeyDown}
                            />
                        </div>
                        <div className="col-xs-6 col-md-2 col-md-push-2">
                            <Input
                                type='number'
                                label='Priority'
                                placeholder='0'
                                bsStyle={this.validationState('priority')}
                                hasFeedback
                                ref='priority'
                                onChange={this.handleChange.bind(this, 'priority')}
                                onKeyDown={this._onKeyDown}
                                disabled={!this.state.prioEnabled}
                            />
                        </div>
                        <div className="col-xs-6 col-md-3 col-md-push-2">
                            <Input
                                type='number'
                                label='TTL'
                                defaultValue={Config.default_record_ttl}
                                placeholder='86400'
                                bsStyle={this.validationState('ttl')}
                                hasFeedback
                                ref='ttl'
                                onChange={this.handleChange.bind(this, 'ttl')}
                                onKeyDown={this._onKeyDown}
                            />
                        </div>
                        <div className="col-xs-12 col-md-5 col-md-push-2">
                            <button className="btn btn-success btn-flat btn-block icon-left new-record"
                                type="button" onClick={this._save}>
                                <i className="ion ion-ios-plus-outline" />
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    },

    /**
     * Invokes the callback passed in as onSave, allowing this component to be
     * used in different ways.
     */
    _save: function() {
        var isValid = true;
        var validationStates = [
            this.validationState('name'),
            this.validationState('content'),
            this.state.type === 'MX' ? this.validationState('priority') : 'success',
            this.validationState('ttl'),
            _.isEmpty(this.state.type) ? 'error' : 'success'
        ];

        _.each(validationStates, function (valState) {
            if(valState !== 'success') {
                isValid = false;
            }
        });

        if(isValid) {
            let action = Action.create('Adding record to zone');
            let that = this;

            this.setState({info: null});
            ActionLog.add(action);

            ActionStore.addChangeListener(() => {
                if(action.hasFailed()) {
                    ActionLog.showError(action);
                } else {
                    ActionLog.showSuccess(action);

                    // reset fields
                    $('#' + that.getDomId() + ' input').val('');
                    // reset this component's state but preserve the type dropdown
                    that.setState(_.extend(that.getInitialState(), {type: that.state.type}));
                }

                ActionStore.removeAllListeners('change');
            });

            ServerZoneActions.addRecord(this.props.zone.id, this.toRecord(), action);
        } else {
            this.setState({info: "Please ensure all fields are filled properly."});
        }
    },

    /**
     * @param  {object} event
     */
    _onKeyDown: function(event) {
        if (event.keyCode === ENTER_KEY_CODE) {
            event.preventDefault();
            event.stopPropagation();

            this._save();
        }
    },

    toRecord() {
        return new GenericRecord({
          name: this.state.name,
          type: this.state.type,
          ttl: parseInt(this.state.ttl, 10),
          priority: parseInt(this.state.priority, 10),
          content: this.state.content,
          disabled: false
        });
    },

    _dismissInfo() {
        var currentState = this.state;
        currentState.info = null;
        this.setState(currentState);
    }
});

module.exports = ServerZoneRecordCreationForm;
