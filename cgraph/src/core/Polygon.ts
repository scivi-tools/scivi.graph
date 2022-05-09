namespace SciViCGraph
{
    type PPoint = { x: number, y: number, color: number[] };

    export class Polygon extends Curve
    {
        private buildPoly(points: PPoint[], center: PPoint, webGLData: any)
        {
            let vertices = webGLData.points;
            let indices = webGLData.indices;

            vertices.push(center.x, center.y, center.color[0], center.color[1], center.color[2], center.color[3]);

            for (let i = 0, n = points.length; i < n; ++i) {
                vertices.push(points[i].x, points[i].y, points[i].color[0], points[i].color[1], points[i].color[2], points[i].color[3]);
                if (i > 0) {
                    indices.push(0);
                    indices.push(i);
                    indices.push(i + 1);
                }
            }
        }

        private convertColor(color: number, alpha: number): number[]
        {
            return [ (color >> 16 & 0xFF) * alpha / 255,
                     (color >> 8 & 0xFF) * alpha / 255,
                     (color & 0xFF) * alpha / 255,
                     alpha ];
        }

        private calcColor(fromColor: number, toColor: number, alpha: number, index: number, count: number): number[]
        {
            const from = this.convertColor(fromColor, alpha);
            const to = this.convertColor(toColor, alpha);
            const t = index / (count - 1);
            return [ from[0] + t * (to[0] - from[0]), from[1] + t * (to[1] - from[1]), from[2] + t * (to[2] - from[2]), alpha ];
        }

        protected updateGraphics(uid: number, gl: WebGLRenderingContext, renderer: PIXI.WebGLRenderer)
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

            let points = [];
            let center = { x: 0.0, y: 0.0, color: [0.0, 0.0, 0.0, 0.0] };
            let n = this.graphicsData.length;
            for (let i = 0; i < n; ++i) {
                center.x += this.graphicsData[i].shape.points[0];
                center.y += this.graphicsData[i].shape.points[1];
                const cColor = this.convertColor(this.m_colors[i].from, this.m_colors[i].alpha);
                center.color[0] += cColor[0];
                center.color[1] += cColor[1];
                center.color[2] += cColor[2];
                center.color[3] += cColor[3];
                for (let j = 0, m = this.graphicsData[i].shape.points.length; j < m; j += 2) {
                    points.push({ x: this.graphicsData[i].shape.points[j + 0],
                                  y: this.graphicsData[i].shape.points[j + 1],
                                  color: this.calcColor(this.m_colors[i].from, this.m_colors[i].to, this.m_colors[i].alpha, j / 2, m / 2) });
                }
            }
            center.x /= n;
            center.y /= n;
            center.color[0] /= n;
            center.color[1] /= n;
            center.color[2] /= n;
            center.color[3] /= n;
            this.buildPoly(points, center, graphicsRenderer.getWebGLData(webGL, 0));
            webGL.lastIndex++;

            renderer.bindVao(null);

            webGL.data.forEach((webGLData) => {
                if (webGLData.dirty)
                    webGLData.upload();
            });
        }
    }
}
