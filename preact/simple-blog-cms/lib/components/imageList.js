import { h, Component } from 'preact';

import util from '../util';

const widgetName = 'ImageList';
const initialState = {};
const debug = false;
const imageWidth = 150;
const imageHeight = 100;

export default class ImageList extends Component {
    constructor(props) {
        super(props);
        this.state = Object.assign({}, initialState);
        this.parent = props.that;
        this.props = props;
        this.imageServer = this.parent.props.apiServer;
    }

    getWidth(img) {
        if (img.features) {
            return img.features.width;
        } else if (img.exif) {
            return img.exif.pixelXDimension || img.exif.exifImageWidth;
        }
    }

    getHeight(img) {
        if (img.features) {
            return img.features.height;
        } else if (img.exif) {
            return img.exif.pixelYDimension || img.exif.exifImageLength;
        }
    }

    formatPrintSize(size) {
        const parts = String(size).split('x');
        const width = util.format(parts[0], 0);
        const height = util.format(parts[1], 0);
        return `${width}x${height}cm`;
    }

    formatQuality(quality) {
        return `${util.format(quality * 100, 0)}%`;
    }

    drawCanvases() {
        this.props.imglist.map(img => {
            try {
                const colors = ['red', 'green', 'yellow', 'cyan', 'pink', 'blue'];
                const c = document.getElementById(`layer-${img.id}`)
                const ctx = c.getContext('2d');
                const width = this.getWidth(img);
                const height = this.getHeight(img);
                const sizeRatio = imageWidth / width;

                if (img.exif && width) {
                    const imageRatio = height / width;
                    c.width = imageWidth;
                    c.height = Math.ceil(imageWidth * imageRatio);
                }

                const classColor = {};
                // Make prediction squares:
                if (img.predictionsCocoSsd) {
                    img.predictionsCocoSsd.map((pre) => {
                        const x1 = Math.ceil(sizeRatio * pre.bbox[0]);
                        const y1 = Math.ceil(sizeRatio * pre.bbox[1]);
                        const w = Math.ceil(sizeRatio * pre.bbox[2]);
                        const h = Math.ceil(sizeRatio * pre.bbox[3]);

                        if (!classColor[pre.class]) {
                            classColor[pre.class] = colors.shift();
                        }
                        // Red rectangle
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = classColor[pre.class];
                        ctx.strokeRect(x1, y1, w, h);
                        // Text
                        ctx.font = '10px Georgia';
                        ctx.fillStyle = classColor[pre.class];
                        ctx.fillText(pre.class, x1, y1);
                    });
                }
            } catch (err) {
                console.log(err);
            }
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        this.props = nextProps;
        return true;
    }

    componentDidUpdate() {
        if (debug) {
            console.log(widgetName, 'componentDidUpdate', this.props);
        }
        this.drawCanvases();
    }

    render(props) {
        const styles = props.styles;
        const imglist = props.imglist;
        const handleImglistClick = props.handleImglistClick;
        const handleInput = props.handleInput;
        const handleSubmit = props.handleSubmit;
        const imageId = props.imageId;
        return (
            <div class='col-12'>
                <div class='d-flex justify-content-center'>
                    <div class="col-4 mb-2">
                        <input type="text" class="form-control" placeholder="Søk etter bilder" name="q"
                            onKeypress={handleInput}
                            onChange={handleInput}
                        />
                    </div>
                    <div class="col-2">
                        <button class="btn btn-success" onclick={handleSubmit}>Søk</button>
                    </div>
                </div>
                <table class={`table table-sm ${styles.condensed}`}>
                    <thead>
                        <tr>
                            <th scope='col'>#</th>
                            <th scope='col'>Thumb</th>
                            <th scope='col'>Src</th>
                            <th scope='col'>Bildedato</th>
                            <th scope='col'>AI predictions</th>
                            <th scope='col'>Filstr</th>
                        </tr>
                    </thead>
                    <tbody>
                        {imglist.map(img => {
                            return (
                                <tr data-id={img.id} class={imageId == img.id ? 'bg-primary text-white' : ''} onClick={handleImglistClick}>
                                    <td scope='row'>{img.id}</td>
                                    <td scope='row' style={`width: ${imageWidth}px !important;`}>
                                        <div style={`position: relative; width: ${imageWidth}px;`}>
                                            <img src={`${this.imageServer}/pho/${img.src}?w=${imageWidth}`} />
                                            <canvas id={`layer-${img.id}`} width='100'
                                                style='position: absolute; left: 0; top: 0; z-index: 1000; width: 100%; height: 100%;'></canvas>
                                        </div>
                                    </td>
                                    <td>
                                        {img.src}<br />
                                        <div class='text-muted'>
                                            {img.exif && img.exif.model && <span class='mr-1 badge badge-success'><i class="fas fa-camera"></i> {util.getString(img, 'exif', 'model')}</span>}
                                            {img.exif && img.exif.lensModel && <span class='mr-1 badge badge-success'>{util.getString(img, 'exif', 'lensModel')}</span>}
                                            {img.exif && img.exif.fNumber && <span class='mr-1 badge badge-success'>f/{util.getString(img, 'exif', 'fNumber')}</span>}
                                            {img.exif && img.exif.focalLength && <span class='mr-1 badge badge-success'>{util.getString(img, 'exif', 'focalLength')} mm</span>}
                                            {img.exif && img.exif.exposureTime && <span class='mr-1 badge badge-success'>{util.getString(img, 'exif', 'exposureTime')} sec</span>}
                                            {img.exif && img.exif.photographicSensitivity && <span class='mr-1 badge badge-success'>ISO: {util.getString(img, 'exif', 'photographicSensitivity')}</span>}
                                            <span class='mr-1 badge badge-success'><i class="fas fa-image"></i> {this.getWidth(img)} x {this.getHeight(img)}px</span>
                                        </div>
                                        <div class='text-muted'>
                                            {img.exif && img.exif.lat && <span class='mr-1 badge badge-info'>
                                                <i class="fas fa-location-arrow"></i> {util.format(img.exif.lat, 5, '.')}, {util.format(img.exif.lng, 5, '.')}
                                            </span>}
                                            {img.features}
                                            {img.features && img.features['print size'] && <span class='mr-1 badge badge-info'>
                                                <i class="fas fa-print"></i> {this.formatPrintSize(img.features['print size'])} cm
                                            </span>}
                                            {img.features && img.features.quality && <span class='mr-1 badge badge-info'>
                                                <i class="fas fa-thermometer-three-quarters"></i> {this.formatQuality(img.features.quality)}
                                            </span>}
                                        </div>
                                    </td>
                                    <td>
                                        {util.isoDateNormalized(util.getString(img, 'exif', 'dateTimeOriginal') ||
                                            util.getString(img, 'exif', 'dateTime'))}
                                    </td>
                                    <td>
                                        {img.predictions && img.predictions.filter(pre => pre.probability > 0.2).map((pre) =>
                                            <span class='badge badge-info p-2 mb-1 ml-2'>
                                                {pre.className} ({util.format(pre.probability * 100, 0)}%)
                                            </span>
                                        )}
                                        {img.predictionsCocoSsd && img.predictionsCocoSsd.map((pre) =>
                                            <span class='badge badge-warning p-2 mb-1 ml-2'>
                                                {pre.class} ({util.format(pre.score * 100, 0)}%)
                                            </span>
                                        )}
                                    </td>
                                    <td>{util.formatBytes(util.getString(img, 'stats', 'size'), 2)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    }
}
