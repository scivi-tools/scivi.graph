//@ts-check
/// <reference path="../@types/ngraph.d.ts" />
import Viva from '../viva-proxy';
import * as merge from 'ngraph.merge';
import * as random from 'ngraph.random';

export default function createLayout(graph, options) {
    
    options.createSpringForce = _createSpringForce;

    return Viva.Graph.Layout.forceDirected(graph, options);
}

function _createSpringForce(options) {
    return new CustomSpringForceUpdater(options);
}

class CustomSpringForceUpdater {
    constructor(options) {
        this._options = /** @type {any} */(merge(options, {
            springCoeff: 0.0002,
            springLength: 80
        }));

        this._random = random.random(42);
    }

    /**
     * 
     * @param {*} spring 
     */
    update(spring) {
        let body1 = spring.from;
        let body2 = spring.to;
        let length = spring.length < 0 ? this._options.springLength : spring.length;
        let dx = body2.pos.x - body1.pos.x;
        let dy = body2.pos.y - body1.pos.y;
        let r = Math.sqrt(dx * dx + dy * dy);

        let springCt = ((!spring.coeff || spring.coeff < 0) ? this._options.springCoeff : spring.coeff);

        if (r === 0) {
            dx = (this._random.nextDouble() - 0.5) / 50;
            dy = (this._random.nextDouble() - 0.5) / 50;
            r = Math.sqrt(dx * dx + dy * dy);
        }

        let d = r - length;
        let coeff = (d > 0) ? (springCt * spring.weight * Math.log(1 + d) / d) : 0;

        body1.force.x += coeff * dx;
        body1.force.y += coeff * dy;

        body2.force.x -= coeff * dx;
        body2.force.y -= coeff * dy;
    }
}
