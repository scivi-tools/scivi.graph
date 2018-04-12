namespace SciViCGraph
{
    export class Curve extends PIXI.Graphics
    {
        protected m_colors: { from: number, to: number, alpha: number }[];

        constructor()
        {
            super();

            this.m_colors = [];
        }

        private addVertex(vertices: number[], px: number, py: number, nx: number, ny: number,
                          wIn: number, wOut: number, r: number, g: number, b: number, a: number)
        {
            let dx = nx * wIn;
            let dy = ny * wIn;

            vertices.push(px - dx, py - dy, r, g, b, a);
            vertices.push(px + dx, py + dy, r, g, b, a);

            dx = nx * wOut;
            dy = ny * wOut;
            
            vertices.push(px - dx, py - dy, 0, 0, 0, 0);
            vertices.push(px + dx, py + dy, 0, 0, 0, 0);
        }

        private buildLine(graphicsData, webGLData, fromColor: number, toColor: number, alpha: number)
        {
            graphicsData.points = graphicsData.shape.points.slice();
            let points = graphicsData.points;
            if (points.length === 0)
                return;

            let vertices = webGLData.points;
            let indices = webGLData.indices;
            let length = points.length / 2;
            let indexCount = points.length;
            let indexStart = vertices.length / 6;

            const feather = 1;
            let widthIn = graphicsData.lineWidth / 2;
            let widthOut = widthIn + feather;

            let p1x = 0;
            let p1y = 0;
            let p2x = 0;
            let p2y = 0;
            let p3x = 0;
            let p3y = 0;

            let totalLength = 0;
            for (let i = 0; i < length - 1; ++i) {
                p1x = points[i * 2] - points[(i + 1) * 2];
                p1y = points[i * 2 + 1] - points[(i + 1) * 2 + 1];
                totalLength += Math.sqrt(p1x * p1x + p1y * p1y);
            }

            let rFrom = (fromColor >> 16 & 0xFF) * alpha / 255;
            let gFrom = (fromColor >> 8 & 0xFF) * alpha / 255;
            let bFrom = (fromColor & 0xFF) * alpha / 255;
            let rTo = (toColor >> 16 & 0xFF) * alpha / 255;
            let gTo = (toColor >> 8 & 0xFF) * alpha / 255;
            let bTo = (toColor & 0xFF) * alpha / 255;
            let r = rFrom;
            let g = gFrom;
            let b = bFrom;
            let t = 0;

            let n1x = 0;
            let n1y = 0;
            let n2x = 0;
            let n2y = 0;
            let n3x = 0;
            let n3y = 0;
            let d = 0;
            let nLen = 0;
            let currentLength = 0;

            for (let i = 0; i < length; ++i) {
                if (i == 0) {
                    p1x = points[0];
                    p1y = points[1];

                    p2x = points[0];
                    p2y = points[1];
                    
                    p3x = points[2];
                    p3y = points[3];

                    r = rFrom;
                    g = gFrom;
                    b = bFrom;
                } else if (i == length - 1) {
                    p1x = points[(i - 1) * 2];
                    p1y = points[(i - 1) * 2 + 1];
                    
                    p2x = points[i * 2];
                    p2y = points[i * 2 + 1];
                    
                    p3x = points[i * 2];
                    p3y = points[i * 2 + 1];

                    r = rTo;
                    g = gTo;
                    b = bTo;                    
                } else {
                    p1x = points[(i - 1) * 2];
                    p1y = points[(i - 1) * 2 + 1];
                    
                    p2x = points[i * 2];
                    p2y = points[i * 2 + 1];
                    
                    p3x = points[(i + 1) * 2];
                    p3y = points[(i + 1) * 2 + 1];

                    t = currentLength / totalLength;
                    r = rFrom + t * (rTo - rFrom);
                    g = gFrom + t * (gTo - gFrom);
                    b = bFrom + t * (bTo - bFrom);
                }

                n1x = -(p2y - p1y);
                n1y = p2x - p1x;
                n2x = -(p3y - p2y);
                n2y = p3x - p2x;

                nLen = Math.sqrt(n1x * n1x + n1y * n1y);
                if (nLen < 0.1) {
                    nLen = Math.sqrt(n2x * n2x + n2y * n2y);
                    if (nLen < 0.1) {
                        continue;
                    } else {
                        n2x /= nLen;
                        n2y /= nLen;
                        n1x = n2x;
                        n1y = n2y;
                    }
                } else {
                    n1x /= nLen;
                    n1y /= nLen;
                    let l = Math.sqrt(n2x * n2x + n2y * n2y);
                    if (l < 0.1) {
                        n2x = n1x;
                        n2y = n1y;
                    } else {
                        nLen = l;
                        n2x /= nLen;
                        n2y /= nLen;
                    }
                }

                currentLength += nLen;

                d = n1x * n2x + n1y * n2y;

                if (d < -0.5) {
                    n3x = n1x - n2x;
                    n3y = n1y - n2y;
                } else {
                    n3x = n1x + n2x;
                    n3y = n1y + n2y;
                }

                nLen = Math.sqrt(n3x * n3x + n3y * n3y);
                n3x /= nLen;
                n3y /= nLen;

                d = n1x * n3x + n1y * n3y;

                this.addVertex(vertices, p2x, p2y, n3x, n3y, widthIn / d, widthOut / d, r, g, b, alpha);

                if (i < length - 1) {
                    indices.push(indexStart + 2);
                    indices.push(indexStart + 6);
                    indices.push(indexStart + 0);

                    indices.push(indexStart + 0);
                    indices.push(indexStart + 6);
                    indices.push(indexStart + 4);
                    
                    indices.push(indexStart + 0);
                    indices.push(indexStart + 4);
                    indices.push(indexStart + 1);
                    
                    indices.push(indexStart + 1);
                    indices.push(indexStart + 4);
                    indices.push(indexStart + 5);

                    indices.push(indexStart + 1);
                    indices.push(indexStart + 5);
                    indices.push(indexStart + 3);

                    indices.push(indexStart + 3);
                    indices.push(indexStart + 5);
                    indices.push(indexStart + 7);

                    indexStart += 4;
                }
            }
        }

        private updateGraphics(uid: number, gl: WebGLRenderingContext, renderer: PIXI.WebGLRenderer)
        {
            let webGL = this._webGL[uid];
            let graphicsRenderer = renderer.plugins.graphics;

            if (!webGL)
                webGL = this._webGL[uid] = { lastIndex: 0, data: [], gl: gl, clearDirty: -1, dirty: -1 };

            webGL.dirty = this.dirty;

            if (this.clearDirty !== webGL.clearDirty) {
                webGL.clearDirty = this.clearDirty;

                webGL.data.forEach((webGLData) => {
                    graphicsRenderer.graphicsDataPool.push(webGLData);
                });

                webGL.data.length = 0;
                webGL.lastIndex = 0;
            }

            let webGLData = void 0;

            for (let i = webGL.lastIndex; i < this.graphicsData.length; ++i) {
                this.buildLine(this.graphicsData[i], graphicsRenderer.getWebGLData(webGL, 0), 
                               this.m_colors[i].from, this.m_colors[i].to, this.m_colors[i].alpha);
                webGL.lastIndex++;
            }

            renderer.bindVao(null);

            webGL.data.forEach((webGLData) => {
                if (webGLData.dirty)
                    webGLData.upload();
            });
        }

        public _renderWebGL(renderer: PIXI.WebGLRenderer)
        {
            renderer.setObjectRenderer(renderer.plugins.graphics);

            let gl = renderer.gl;
            let uid = renderer.plugins.graphics.CONTEXT_UID;

            let webGLData = void 0;
            let webGL = this._webGL[uid];

            if (!webGL || this.dirty !== webGL.dirty) {
                this.updateGraphics(uid, gl, renderer);
                webGL = this._webGL[uid];
            }

            let shader = renderer.plugins.graphics.primitiveShader;

            renderer.bindShader(shader);
            renderer.state.setBlendMode(this.blendMode);

            webGL.data.forEach((webGLData) => {
                let shaderTemp = webGLData.shader;

                renderer.bindShader(shaderTemp);
                shaderTemp.uniforms.translationMatrix = this.transform.worldTransform.toArray(true);
                shaderTemp.uniforms.tint = [1, 1, 1];
                shaderTemp.uniforms.alpha = this.worldAlpha;

                renderer.bindVao(webGLData.vao);

                webGLData.vao.draw(gl.TRIANGLES, webGLData.indices.length);
            });
        }

        private distance(x1: number, y1: number, x2: number, y2: number): number
        {
            const x = x2 - x1;
            const y = y2 - y1;
            return Math.sqrt(x * x + y * y);
        }

        private quadraticCurveLength(fromX: number, fromY: number, cpX: number, cpY: number, toX: number, toY: number): number
        {
            const eps = 1.0e-3;

            const ax = fromX - 2.0 * cpX + toX;
            const ay = fromY - 2.0 * cpY + toY;
            const bx = 2.0 * cpX - 2.0 * fromX;
            const by = 2.0 * cpY - 2.0 * fromY;

            const a = 4.0 * (ax * ax + ay * ay);
            if (Math.abs(a) < eps)
                return this.distance(fromX, fromY, toX, toY);

            const b = 4.0 * (ax * bx + ay * by);
            const c = bx * bx + by * by;

            const s = 2.0 * Math.sqrt(a + b + c);
            const a2 = Math.sqrt(a);
            const a32 = 2.0 * a * a2;
            const c2 = 2.0 * Math.sqrt(c);
            const ba = b / a2;

            const l1 = 2.0 * a2 + ba + s;
            const l2 = ba + c2;

            if (Math.abs(l2) < eps)
                return this.distance(fromX, fromY, toX, toY);

            const l3 = l1 / l2;
            if (l3 < 0.0 || Math.abs(l3) < eps)
                return this.distance(fromX, fromY, toX, toY);

            return (a32 * s +
                    a2 * b * (s - c2) +
                    (4.0 * c * a - b * b) * Math.log(l3)) /
                   (4.0 * a32);
        }

        private segmentsCount(length: number): number
        {
            let result = Math.ceil(length / 10.0);
            if (result < 8)
                result = 8;
            else if (result > 2048)
                result = 2048;
            return result;
        }

        public quadraticCurveTo(cpX: number, cpY: number, toX: number, toY: number)
        {
            if (this.currentPath)
            {
                if (this.currentPath.shape.points.length === 0)
                {
                    this.currentPath.shape.points = [0, 0];
                }
            }
            else
            {
                this.moveTo(0, 0);
            }

            const points = this.currentPath.shape.points;
            let xa = 0;
            let ya = 0;

            if (points.length === 0)
            {
                this.moveTo(0, 0);
            }

            const fromX = points[points.length - 2];
            const fromY = points[points.length - 1];
            const n = this.segmentsCount(this.quadraticCurveLength(fromX, fromY, cpX, cpY, toX, toY));

            for (let i = 1; i <= n; ++i)
            {
                const j = i / n;

                xa = fromX + ((cpX - fromX) * j);
                ya = fromY + ((cpY - fromY) * j);

                points.push(xa + (((cpX + ((toX - cpX) * j)) - xa) * j),
                    ya + (((cpY + ((toY - cpY) * j)) - ya) * j));
            }

            this.dirty++;

            return this;
        }

        public arc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number, anticlockwise = false)
        {
            if (startAngle === endAngle)
            {
                return this;
            }

            if (!anticlockwise && endAngle <= startAngle)
            {
                endAngle += Math.PI * 2;
            }
            else if (anticlockwise && startAngle <= endAngle)
            {
                startAngle += Math.PI * 2;
            }

            const sweep = endAngle - startAngle;
            const segs = this.segmentsCount(Math.abs(sweep) * radius);

            if (sweep === 0)
            {
                return this;
            }

            const startX = cx + (Math.cos(startAngle) * radius);
            const startY = cy + (Math.sin(startAngle) * radius);

            // If the currentPath exists, take its points. Otherwise call `moveTo` to start a path.
            let points = this.currentPath ? this.currentPath.shape.points : null;

            if (points)
            {
                if (points[points.length - 2] !== startX || points[points.length - 1] !== startY)
                {
                    points.push(startX, startY);
                }
            }
            else
            {
                this.moveTo(startX, startY);
                points = this.currentPath.shape.points;
            }

            const theta = sweep / (segs * 2);
            const theta2 = theta * 2;

            const cTheta = Math.cos(theta);
            const sTheta = Math.sin(theta);

            const segMinus = segs - 1;

            const remainder = (segMinus % 1) / segMinus;

            for (let i = 0; i <= segMinus; ++i)
            {
                const real = i + (remainder * i);

                const angle = ((theta) + startAngle + (theta2 * real));

                const c = Math.cos(angle);
                const s = -Math.sin(angle);

                points.push(
                    (((cTheta * c) + (sTheta * s)) * radius) + cx,
                    (((cTheta * -s) + (sTheta * c)) * radius) + cy
                );
            }

            this.dirty++;

            return this;
        }

        public addColor(c: { from: number, to: number, alpha: number })
        {
            this.m_colors.push(c);
        }

        public bringToFront()
        {
            let p = this.parent;
            if (p) {
                p.removeChild(this);
                p.addChild(this);
            }
        }

        public bringToBack()
        {
            let p = this.parent;
            if (p) {
                p.removeChild(this);
                p.addChildAt(this, 0);
            }
        }
    }
}
