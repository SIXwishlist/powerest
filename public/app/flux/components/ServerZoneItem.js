var React = require('react');
var ButtonGroup = require('react-bootstrap').ButtonGroup;
var ButtonToolbar = require('react-bootstrap').ButtonToolbar;

var ServerZoneActions = require('../actions/ServerZoneActions');

var ServerZoneItem = React.createClass({
    /**
     * @return {object}
     */
    render: function() {
        var dnssecIcon;
        var notifiedSerial;

        if (!!this.props.item.dnssec) {
            dnssecIcon = (<i className="ion ion-ios-locked text-green" data-toggle="tooltip" title="DNSSEC active" />)
        } else {
            dnssecIcon = (<i className="ion ion-ios-unlocked-outline text-muted" data-toggle="tooltip" title="DNSSEC inactive" />)
        }

        if (this.props.item.serial === this.props.item.notified_serial) {
            notifiedSerial = (
                <span className="text-green">
                    {this.props.item.notified_serial}
                    <i className="ion ion-checkmark" />
                </span>
            );
        } else {
            notifiedSerial = (
                <span className="text-red" data-toggle="tooltip" title="PowerDNS is notifying slaves about an updated zone.">
                    {this.props.item.notified_serial}
                    <i className="ion ion-loop fa-spin" />
                </span>
            );
        }

        return (
            <tr>
                <td className="leading-icon">
                    {dnssecIcon}
                    <strong className="lg">{this.props.item.name}</strong>
                </td>
                <td>{this.props.item.serial}</td>
                <td>{notifiedSerial}</td>
                <td>{this.props.item.account}</td>
                <td>
                    <ButtonToolbar>
                        <ButtonGroup bsSize="small">
                            <a href="#" className="btn btn-primary btn-flat"><i className="ion ion-edit" /></a>
                            <a href="#" className="btn btn-default btn-flat"><i className="ion ion-loop" /></a>
                        </ButtonGroup>
                        <ButtonGroup bsSize="small">
                            <a href="#" className="btn btn-danger btn-flat"><i className="ion ion-trash-a" /></a>
                        </ButtonGroup>
                    </ButtonToolbar>
                </td>
            </tr>
        );
    }
});

module.exports = ServerZoneItem;
