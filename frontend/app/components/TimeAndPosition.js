import React, { Component } from 'react';
import { Col, Row, Form, Table, Button, FormGroup, FormControl, Glyphicon, InputGroup, ControlLabel } from 'react-bootstrap';

import Toggle from 'react-bootstrap-toggle';
import DateTime from 'react-bootstrap-datetimepicker';

import InlineEdit from 'react-edit-inline';
import Panel from './Panel';

import '../styles/map.css';

import { isSelectionElement, Types } from '../constants/Selection';

class GeoInputForm extends Component {
    constructor(props) {
        super(props);

        this.actions = props.actions;

        this.latFromChange = this.latFromChange.bind(this);
        this.latToChange = this.latToChange.bind(this);
        this.lngFromChange = this.lngFromChange.bind(this);
        this.lngToChange = this.lngToChange.bind(this);
    }

    latFromChange(e) {
        this.actions.latFromInput(parseFloat(e.target.value));
    }

    latToChange(e) {
        this.actions.latToInput(parseFloat(e.target.value));
    }

    lngFromChange(e) {
        this.actions.lngFromInput(parseFloat(e.target.value));
    }

    lngToChange(e) {
        this.actions.lngToInput(parseFloat(e.target.value));
    }

    render() {
        var opts = this.props.options;

        return (
            <div>
                <FormGroup controlId = 'Latitude'>
                    <Col componentClass={ControlLabel} sm={2}>
                        Latitude
                    </Col>
                    <Col sm={5}>
                        <InputGroup>
                            <InputGroup.Addon>From</InputGroup.Addon>
                            <FormControl onChange = {this.latFromChange} value = {opts.latFrom} type="number" />
                            <InputGroup.Addon>&deg;</InputGroup.Addon>
                        </InputGroup>
                    </Col>
                    <Col sm={5}>
                        <InputGroup>
                            <InputGroup.Addon>To</InputGroup.Addon>
                            <FormControl onChange = {this.latToChange} value = {opts.latTo} type="number" />
                            <InputGroup.Addon>&deg;</InputGroup.Addon>
                        </InputGroup>
                    </Col>
                </FormGroup>
                <FormGroup controlId = 'Longitude'>
                    <Col componentClass={ControlLabel} sm={2}>
                        Longitude
                    </Col>
                    <Col sm={5}>
                        <InputGroup>
                            <InputGroup.Addon>From</InputGroup.Addon>
                            <FormControl onChange = {this.lngFromChange} value = {opts.lngFrom} type="number" />
                            <InputGroup.Addon>&deg;</InputGroup.Addon>
                        </InputGroup>
                    </Col>
                    <Col sm={5}>
                        <InputGroup>
                            <InputGroup.Addon>To</InputGroup.Addon>
                            <FormControl onChange = {this.lngToChange} value = {opts.lngTo} type="number" />
                            <InputGroup.Addon>&deg;</InputGroup.Addon>
                        </InputGroup>
                    </Col>
                </FormGroup>
            </div>
        );
    }
}

function InfoBox(props) {
    return (
        <div className = 'infobox'>{props.children}</div>
    )
}

class SelectionElements extends Component {
    constructor(props) {
        super(props);

        this.deleteMe = this.deleteMe.bind(this);
    }

    deleteMe() {
        this.props.actions.clearSelection(this.props.rootIndex);
    }

    render() {
        let active = this.props.selection[this.props.rootIndex];
        let actions = this.props.actions;
        let rootIndex = this.props.rootIndex;
        let tableData = new Array();


        switch(active.type) {
            case Types.Rect:
                tableData.push(new Array('From', active.data[0][0], active.data[0][1]));
                tableData.push(new Array('To', active.data[1][0], active.data[1][1]));
            break;

            case Types.Circle:
                tableData.push(new Array('Center', active.data[0][0], active.data[0][1]));
                tableData.push(new Array('Radius', active.data[1]));
            break;

            case Types.Polygon:
                active.data.forEach(function(point, index) {
                    tableData.push(new Array('Point #' + index, point[0], point[1]));
                });
            break;
        }

        return (
            <div>
                <Table responsive striped hover>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Latitude</th>
                            <th>Longitude</th>
                        </tr>
                    </thead>
                    <tbody>
                        { tableData.map(function(row, itemIndex) {
                            let dsc = row[0];
                            let lat = String(row[1]);
                            let rad = String(row[1]);
                            let lng = String(row[2]);

                            function saveLat(obj) {
                                actions.editSelection(itemIndex, [parseFloat(obj.value), parseFloat(lng)], rootIndex);
                            }

                            function saveLng(obj) {
                                actions.editSelection(itemIndex, [parseFloat(lat), parseFloat(obj.value)], rootIndex);
                            }

                            function saveRad(obj) {
                                actions.editSelection(itemIndex, parseFloat(obj.value), rootIndex);
                            }

                            /* circle radius */
                            if(row.length == 2)
                            {
                                return (
                                    <tr key = {itemIndex}>
                                        <td className = 'desc'>{dsc}</td>
                                        <td className = 'centered' colSpan = {2}>
                                            <InlineEdit change = {saveRad} text = {rad} paramName = 'value' />
                                        </td>
                                    </tr>
                                )
                            } else {
                                return (
                                    <tr key = {itemIndex}>
                                        <td className = 'desc'>{dsc}</td>
                                        <td><InlineEdit change = {saveLat} text = {lat} paramName = 'value' /></td>
                                        <td><InlineEdit change = {saveLng} text = {lng} paramName = 'value' /></td>
                                    </tr>
                                )
                            }
                        }) }
                    </tbody>
                </Table>
                <Button bsSize = 'small' bsStyle = 'danger' onClick = {this.deleteMe}>
                    <Glyphicon glyph = 'remove'/> Delete
                </Button>
            </div>
        )
    }
}

class MapSelection extends Component {
    constructor(props) {
        super(props);

        this.empty = -1;
        this.state = {
            editableIndex: this.empty
        }

        this.updateEditable = this.updateEditable.bind(this);
    }

    updateEditable(event) {
        event.persist();

        let index = parseInt(event.target.value);

        this.setState(function() {
            return {
                editableIndex: index
            }
        }, this.props.actions.highlightSelection(index));
    }

    render() {
        let selection = this.props.selection;
        let current = this.props.selection.elements[this.props.selection.current];
        let actions = this.props.actions;
        let preview = this.props.preview;

        if(selection.active) {
            return (
                <InfoBox>{current.type}, next point (lat, lng): {preview[0]}, {preview[1]}</InfoBox>
            )
        } else {
            if(isSelectionElement(selection.elements[0]) && selection.elements[0].data.length > 0)
            {
                return (
                    <div>
                        <FormControl
                            onChange = {this.updateEditable}
                            componentClass = 'select'
                            defaultValue = {this.empty}
                            placeholder = 'select'
                        >
                            <option key = {0} value = {this.empty}>Please select element to edit</option>
                            { selection.elements.map(function(collection, rootIndex) {
                                let i = rootIndex + 1;

                                return (
                                    <option key = {i} value = {rootIndex}>
                                        { '#' + String(i) + ' : ' + String(collection.type) }
                                    </option>
                                )
                            }) }
                        </FormControl>
                        <br />
                        { (this.state.editableIndex != this.empty) &&
                            <SelectionElements
                                actions = {actions}
                                rootIndex = {this.state.editableIndex}
                                selection = {selection.elements}
                            />
                        }
                    </div>
                );
            } else {
                return (
                    <InfoBox>Selection is empty</InfoBox>
                );
            }
        }
    }
}


export default class TimeAndPositionInput extends Component {
    constructor(props) {
        super(props);

        this.actions = props.genericActions;

        this.state = {
            preview: new Array(0, 0)
        }

        this.toggleMap = this.toggleMap.bind(this);
        this.updatePreview = this.updatePreview.bind(this);
        this.dateFromChange = this.dateFromChange.bind(this);
        this.dateToChange = this.dateToChange.bind(this);
        this.altFromChange = this.altFromChange.bind(this);
        this.altToChange = this.altToChange.bind(this);
    }

    componentWillMount() {
        this.props.ee.on('nextPoint', this.updatePreview);
    }

    componentWillUnmount() {
        this.props.ee.off('nextPoint', this.updatePreview);
    }

    updatePreview(data) {
        this.setState(function() {
            return {
                preview: data
            }
        });
    }

    toggleMap() {
        this.actions.mapToggled(! this.props.options.mapEnabled);
    }

    dateFromChange(newFrom) {
        this.actions.dateFromInput(newFrom);
    }

    dateToChange(newTo) {
        this.actions.dateToInput(newTo);
    }

    altFromChange(e) {
        this.actions.altFromInput(parseInt(e.target.value));
    }

    altToChange(e) {
        this.actions.altToInput(parseInt(e.target.value));
    }

    render() {
        let opts = this.props.options;
        let prev = this.state.preview;

        return (
            <Panel title = 'Time and position'>
                <Form horizontal>
                    <FormGroup controlId = 'TimeAndDate'>
                        <Col componentClass={ControlLabel} sm={2}>
                            Interval
                        </Col>
                        <Col sm={5}>
                            <DateTime onChange = {this.dateFromChange} />
                        </Col>
                        <Col sm={5}>
                            <DateTime onChange = {this.dateToChange} />
                        </Col>
                    </FormGroup>
                    <FormGroup controlId = 'Altitude'>
                        <Col componentClass={ControlLabel} sm={2}>
                            Altitude
                        </Col>
                        <Col sm={5}>
                            <InputGroup>
                                <InputGroup.Addon>From</InputGroup.Addon>
                                <FormControl onChange = {this.altFromChange} value = {opts.altFrom} type="number" />
                                <InputGroup.Addon>m</InputGroup.Addon>
                            </InputGroup>
                        </Col>
                        <Col sm={5}>
                            <InputGroup>
                                <InputGroup.Addon>To</InputGroup.Addon>
                                <FormControl onChange = {this.altToChange} value = {opts.altTo} type="number" />
                                <InputGroup.Addon>m</InputGroup.Addon>
                            </InputGroup>
                        </Col>
                    </FormGroup>
                    <FormGroup controlId = 'InputType'>
                        <Col componentClass={ControlLabel} sm={2}>
                            Geo input
                        </Col>
                        <Col sm={10}>
                            <Toggle onClick = {this.toggleMap} 
                                on = {<span><Glyphicon glyph = 'screenshot' /> Use map</span>}
                                off = {<span><Glyphicon glyph = 'list-alt' /> Manual</span>}
                                active = {opts.mapEnabled} 
                            />
                        </Col>
                    </FormGroup>
                    { ! opts.mapEnabled ? (
                    <GeoInputForm actions = {this.actions} options = {opts} />) : (
                    <FormGroup controlId = 'MapSelection'>
                        <Col componentClass = {ControlLabel} sm = {2}>
                            Selection
                        </Col>
                        <Col sm = {10}>
                            <MapSelection preview = {prev} selection = {this.props.selection} actions = {this.props.selectionActions} />
                        </Col>
                    </FormGroup>) }
                </Form>
            </Panel>
        );
    }
}
