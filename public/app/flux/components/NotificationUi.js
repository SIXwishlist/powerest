var _ = require('underscore');
var $ = window.jQuery;
var React = require('react');
var Config = require('../../config.js');

var NotificationStore = require('../stores/NotificationStore');
var NotificationActions = require('../actions/NotificationActions');
var NotificationItem = require('./NotificationItem');

function getNotificationState() {
    return {
        notifications: NotificationStore.getAll() || {}
    };
}

var NotificationUi = React.createClass({
    getInitialState: function() {
        return getNotificationState();
    },

    componentDidMount: function() {
        NotificationStore.addChangeListener(this._onChange);
        window.setTimeout(function() {
            NotificationActions.create('Testtest', 'lalalalala\nlalalalala');
            NotificationActions.create('Testtesdasdasda54sd6a46t', 'lalalalala\nlalalalala');
            NotificationActions.create('Testdasd4a6s54d 6a4test', 'lalalalala\nlalalalalalalalalala\nlalalalalalalalalala\nlalalalala');
            NotificationActions.create('Testtest', 'lalalalala\nlalalalala');
            NotificationActions.create('Testtest', 'lalalalala\nlalalalala');
            NotificationActions.create('Testtest', 'lalalalala\nlalalalala');
        }, 2000);
    },

    componentWillUnmount: function() {
        NotificationStore.removeChangeListener(this._onChange);
    },

    /**
     * @return {object}
     */
    render: function() {
        var notificationLabel;
        var newNotifications = _.where(this.state.notifications, {read: false});

        var notificationItems = _.map(this.state.notifications, function(notification) {
            return (<NotificationItem key={notification.id} notification={notification} />);
        });

        if(_.size(newNotifications) > 0) {
            notificationLabel = (
                <a href="#" className="dropdown-toggle" data-toggle="dropdown">
                    <i className="ion ion-email-unread"></i>
                    <span className="label label-primary">
                        {_.size(newNotifications).toLocaleString()}
                    </span>
                </a>
            );
        } else {
            notificationLabel = (
                <a onClick={function(e) { e.preventDefault(); }}><i className="ion ion-email"></i></a>
            );
        }

        return (
            <li className="dropdown notifications-menu">
                {notificationLabel}
                <ul className="dropdown-menu">
                    <li className="header">You have {_.size(this.state.notifications).toLocaleString()} notifications</li>
                    <li>
                        <ul className="menu">
                            {notificationItems}
                        </ul>
                    </li>
                </ul>
            </li>
        );
    },

    _onChange: function() {
        this.setState(getNotificationState());
    }

});

module.exports = NotificationUi;
