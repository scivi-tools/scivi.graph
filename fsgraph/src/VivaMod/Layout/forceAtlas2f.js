import Viva from '../../viva-proxy';
import merge from 'ngraph.merge';
import * as random from 'ngraph.random';
import {_DefaultSettings} from '../../LayoutBuilder'

/**
 * @param {Ngraph.Graph.Graph} graph
 * @param {object} options
 */
export default function createLayout(graph, options) {
    
    options.createSpringForce = _createSpringForce;
    options.integrator = _integrate;

    return Viva.Layout.forceDirected(graph, options);

    function _integrate(bodies, timeStep) {
        var dx = 0, tx = 0,
            dy = 0, ty = 0,
            i,
            max = bodies.length,
            attrCompensation = 0;
      
        if (max === 0) {
            return 0;
        }
      
        for (i = 0; i < max; ++i) {
            var body = bodies[i],
                coeff = timeStep / body.mass;
        
            body.velocity.x += coeff * body.force.x;
            body.velocity.y += coeff * body.force.y;
            var vx = body.velocity.x,
                vy = body.velocity.y,
                v = Math.sqrt(vx * vx + vy * vy);
        
            if (v > 1) {
                body.velocity.x = vx / v;
                body.velocity.y = vy / v;
            }
        
            dx = timeStep * body.velocity.x;
            dy = timeStep * body.velocity.y;
        
            body.pos.x += dx;
            body.pos.y += dy;
        
            tx += Math.abs(dx); ty += Math.abs(dy);
            attrCompensation += body.mass;
        }

        options.outboundAttCompensation = attrCompensation / max;
      
        return (tx * tx + ty * ty)/max;
    }
}

function _createSpringForce(options) {
    return new CustomSpringForceUpdater(options);
}


class CustomSpringForceUpdater {
    /**
     * 
     * @param {Object} options
     */
    constructor(options) {
        this._options = merge(options, _DefaultSettings.forceAtlas2f);
        typeof _DefaultSettings.forceAtlas2f;
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
        let outAttrComp = this._options.outboundAttractionDistribution ? this._options.outboundAttCompensation : 1;

        let springCt = ((!spring.coeff || spring.coeff < 0) ? this._options.springCoeff : spring.coeff);

        if (r === 0) {
            dx = (this._random.nextDouble() - 0.5) / 50;
            dy = (this._random.nextDouble() - 0.5) / 50;
            r = Math.sqrt(dx * dx + dy * dy);
        }

        let d = r - length;
        let coeff = (d > 0) ? (outAttrComp * springCt * Math.pow(spring.weight, this._options.edgeWeightInfluence) * Math.log(1 + d) / d) : 0;

        body1.force.x += coeff * dx;
        body1.force.y += coeff * dy;

        body2.force.x -= coeff * dx;
        body2.force.y -= coeff * dy;
    }
}


