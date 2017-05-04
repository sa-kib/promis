import React, { Component } from 'react';

import { toDegrees } from 'cesium/Source/Core/Math';
import Viewer from 'cesium/Source/Widgets/Viewer/Viewer';
import Matrix4 from 'cesium/Source/Core/Matrix4';
import defined from 'cesium/Source/Core/defined';
import BingMapsApi from 'cesium/Source/Core/BingMapsApi';
import BingMapsStyle from 'cesium/Source/Scene/BingMapsStyle';
import BingMapsImageryProvider from 'cesium/Source/Scene/BingMapsImageryProvider';
import GridImageryProvider from 'cesium/Source/Scene/GridImageryProvider';
import Cartographic from 'cesium/Source/Core/Cartographic';
import ScreenSpaceEventHandler from 'cesium/Source/Core/ScreenSpaceEventHandler';
import ScreenSpaceEventType from 'cesium/Source/Core/ScreenSpaceEventType';

import { BingKey } from '../constants/Map';

import 'cesium/Source/Widgets/widgets.css';

export default class CesiumContainer extends Component {
    constructor(props) {
        super(props);

        /* map options */
        BingMapsApi.defaultKey = BingKey;

        this.options = {
            infoBox: false,
            animation: false,
            timeline: false,
            homeButton: false,
            scene3DOnly: true,
            fullscreenButton: false,
            baseLayerPicker: false,
            sceneModePicker: false,
            selectionIndicator: false
        }

        /* main handle */
        this.viewer = null;

        /* object handles */
        this.geolines = new Array();
        this.pointHandles = new Array();
        this.shapeHandles = new Array();
        this.previewHandle = null;

        /* for render suspension */
        this.lastmove = Date.now();
        this.lastmatrix = new Matrix4();

        /* enable render on this events */
        this.eventHandler = null;
        this.renderEvents = new Array('mousemove', 'mousedown', 'mouseup', 'mousewheel', 'mouseclick', 'wheel', 
                                      'touchstart', 'touchmove', 'touchend', 'pointerdown', 'pointermove', 'pointerup');

        // scroll to startpos
        //this.scrollToView(startpos[0], startpos[1]);
        this.repaint = this.repaint.bind(this);
        this.currentView = this.currentView.bind(this);
        this.currentPosition = this.currentPosition.bind(this);

        /* events */
        this.initEvents = this.initEvents.bind(this);
        this.postRender = this.postRender.bind(this);
        this.clearEvents = this.clearEvents.bind(this);
        this.justDrawEvent = this.justDrawEvent.bind(this);
        this.moveDrawEvent = this.moveDrawEvent.bind(this);
        
    }

    /* update only for fullscreen toggling */
    shouldComponentUpdate(nextProps) {
        return (nextProps.options.full !== this.props.options.full) ||
               (this.props.options.dims.width !== nextProps.options.dims.width ||
                this.props.options.dims.height !== nextProps.options.dims.height);
    }

    componentWillReceiveProps(nextProps) {
        this.repaint();
    }

    componentDidUpdate() {
        this.repaint();
    }

    componentWillUnmount() {
        this.clearEvents();

        this.map = null;
    }

    componentDidMount() {
        /* mount to div */
        if(! this.viewer) {
            this.viewer = new Viewer(this.mapNode, this.options);

            this.viewer.imageryLayers.removeAll();

            this.bing = this.viewer.imageryLayers.addImageryProvider(
                new BingMapsImageryProvider({ url : '//dev.virtualearth.net', mapStyle: BingMapsStyle.AERIAL_WITH_LABELS }));
            this.grid = this.viewer.imageryLayers.addImageryProvider(
                new GridImageryProvider());
            this.grid.alpha = 0.0;

            this.ellipsoid = this.viewer.scene.mapProjection.ellipsoid;
            this.cartographic = new Cartographic();

            /* get rid of camera inertia */
            this.viewer.scene.screenSpaceCameraController.inertiaSpin = 0;
            this.viewer.scene.screenSpaceCameraController.inertiaZoom = 0;
            this.viewer.scene.screenSpaceCameraController.inertiaTranslate = 0;

            this.initEvents();
        }

        this.repaint();
    }

    repaint() {
        if(this.viewer) {
            this.lastmove = Date.now();

            if(! this.viewer.useDefaultRenderLoop) {
                this.viewer.useDefaultRenderLoop = true;
                console.log('render resumed @', this.lastmove);
            }
        }
    }

    currentView() {
        return this.ellipsoid.cartesianToCartographic(this.viewer.camera.positionWC, this.cartographic);
    }

    /* to be called only when drawing */
    currentPosition(position) {
        let pickedObject = this.viewer.scene.pick(position);
        let point = this.viewer.camera.pickEllipsoid(position);
        let coords = null;
        let carrad = null;

        if(point) {
            //if(Cesium.defined(pickedObject) && pickedObject.id === go.polygon) {
            //inside polygon, don't make the point (or make?)
            carrad = this.ellipsoid.cartesianToCartographic(point);
            coords = [
                        this.props.onSelect.fixedPoint(toDegrees(carrad.latitude)),
                        this.props.onSelect.fixedPoint(toDegrees(carrad.longitude))
                    ];
        }

        return { 'point' : point, 'coords' : coords }
    }

    initEvents() {
        this.eventHandler = new ScreenSpaceEventHandler(this.viewer.canvas);

        this.viewer.scene.camera.moveEnd.addEventListener(function() {
            //GeoObject.updateSelectionPoints(); // scale selection points
        });

        /* draw events */
        this.eventHandler.setInputAction(this.justDrawEvent, ScreenSpaceEventType.LEFT_CLICK);
        this.eventHandler.setInputAction(this.moveDrawEvent, ScreenSpaceEventType.MOUSE_MOVE);
        //handler.setInputAction(this.stopDrawEvent, Cesium.ScreenSpaceEventType.LEFT_UP);

        /* shut down render sometimes */
        this.viewer.scene.postRender.addEventListener(this.postRender);

        /* enable render back */
        this.renderEvents.forEach(function(eventname) {
            this.viewer.canvas.addEventListener(eventname, this.repaint, false);
        }.bind(this));
    }

    clearEvents() {
        this.renderEvents.forEach(function(eventname) {
            this.viewer.canvas.removeEventListener(eventname, this.repaint, false);
        }.bind(this));

        this.eventHandler = this.eventHandler && this.eventHandler.destroy();
    }

    justDrawEvent(event) {
        if(this.props.selection.active) {
            let position = this.currentPosition(event.position);

            console.log(position.coords);
            //this.props.onSelect.addToSelection(this.eventToPoint(e));
        }
    }

    moveDrawEvent(event) {
        if(this.props.selection.active) {
            let position = this.currentPosition(event.endPosition);

            if(this.props.onPreview)
                this.props.onPreview(position.coords);
        }
    }

    /* © terriaJS */
    postRender(scene, date) {
        var now = Date.now();

        if (!Matrix4.equalsEpsilon(this.lastmatrix, scene.camera.viewMatrix, 1e-5)) {
            this.lastmove = now;
        }

        var cameraMovedInLastSecond = (now - this.lastmove) < 1000;

        if(scene) {
            var surface = scene.globe._surface;
            var tilesWaiting = !surface._tileProvider.ready || surface._tileLoadQueueHigh.length > 0 || surface._tileLoadQueueMedium.length > 0 || surface._tileLoadQueueLow.length > 0 || surface._debug.tilesWaitingForChildren > 0;

            if (!cameraMovedInLastSecond && !tilesWaiting && scene.tweens.length === 0) {
                if(this.viewer.useDefaultRenderLoop) {
                    this.viewer.useDefaultRenderLoop = false;
                console.log('render suspended @' + now);
                }
            }
        }

        Matrix4.clone(scene.camera.viewMatrix, this.lastmatrix);
    }

    render() {
        var height = {height: this.props.options.full ? this.props.options.dims.height : 300};

        return (
            <div>
                <div style = {height} ref={ function(node) { this.mapNode = node; }.bind(this) } id = 'cesium'></div>
            </div>
        )
    }
}
