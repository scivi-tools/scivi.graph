namespace SciViGraph
{
    export class RenderingCache
    {
        private static readonly m_transitionDuration = 1.0;

        private m_cache: PIXI.RenderTexture;
        //private m_oldCache: PIXI.RenderTexture;
        private m_displayer: PIXI.Sprite;
        private m_transition: PIXI.Filter<any>;
        private m_timeStamp: number;

        constructor(private m_stage: Scene, private m_renderer: PIXI.SystemRenderer)
        {
            this.m_cache = null;
            //this.m_oldCache = null;
            this.m_displayer = null;
            this.m_transition = new PIXI.Filter(this.vCode(), this.fCode());
            this.m_transition.enabled = false;
            this.m_transition.apply = (filterManager, input, output, clear) => {
                this.m_transition.uniforms.dimensions[0] = input.sourceFrame.width;
                this.m_transition.uniforms.dimensions[1] = input.sourceFrame.height;
                filterManager.applyFilter(this.m_transition, input, output, clear);
            };
            this.m_timeStamp = 0;
        }

        private vCode(): string
        {
            return "" +
            "uniform mat3 projectionMatrix;\n" +

            "attribute vec2 aVertexPosition;\n" +
            "attribute vec2 aTextureCoord;\n" +

            "varying vec2 vTextureCoord;\n" +

            "void main(void)\n" +
            "{\n" +
            "    vTextureCoord = aTextureCoord;\n" +
            "    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n" +
            "}\n";
        }

        private fCode(): string
        {
            return "" +
            "precision highp float;\n" +
            "precision lowp int;\n" +

            "uniform sampler2D uSampler;\n" +
            "uniform vec4 filterArea;\n" +
            "uniform vec2 dimensions;\n" +
            "uniform float uFactor;\n" +

            "varying vec2 vTextureCoord;\n" +

            "vec2 map(vec2 uv)\n" +
            "{\n" +
            "    return uv * filterArea.xy / dimensions;\n" +
            "}\n" +

            "vec2 unmap(vec2 uv)\n" +
            "{\n" +
            "    return uv * dimensions / filterArea.xy;\n" +
            "}\n" +

            "vec3 rgb2hsv(vec3 c)\n" +
            "{\n" +
            "    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);\n" +
            "    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));\n" +
            "    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));\n" +
            "    float d = q.x - min(q.w, q.y);\n" +
            "    float e = 1.0e-10;\n" +
            "    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);\n" +
            "}\n" +

            "vec3 hsv2rgb(vec3 c)\n" +
            "{\n" +
            "    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n" +
            "    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n" +
            "    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n" +
            "}\n" +

            "float shockwave(float d, float t)\n" +
            "{\n" +
            "    const float len = 0.1;\n" +
            "    const float phase = 10.0;\n" +
            "    const float strength = 0.8;\n" +
            "    float diff = d - t;\n" +
            "    float powDiff = 1.0 - pow(abs(diff * phase), strength);\n" +
            "    return diff * powDiff * step(d, t + len) * step(t - len, d);\n" +
            "}\n" +

            "vec4 vignet(float d, float t)\n" +
            "{\n" +
            "    const float feather = 0.08;\n" +
            "    return vec4(1.0, 1.0, 1.0, smoothstep(1.0, 0.0, clamp((d - t) / feather, 0.0, 1.0)));\n" +
            "}\n" +

            "void main()\n" +
            "{\n" +
            "    const vec2 center = vec2(0.5, 0.5);\n" +
            "    const float specStrength = 10.0;\n" +
            "    vec2 texCoord = map(vTextureCoord);\n" +
            "    float d = distance(texCoord, center);\n" +
            "    float t = uFactor * 0.5;\n" +
            "    float sw = shockwave(d, t);\n" +
            "    float ssw = abs(sw * specStrength);\n" +
            "    vec2 offset = normalize(texCoord - center);\n" +
            "    vec4 mask = vignet(d, t);\n" +
            "    vec4 color = texture2D(uSampler, unmap(texCoord + offset * sw));\n" +
            "    vec3 hsv = rgb2hsv(color.rgb);\n" +
            "    hsv.yz = clamp(hsv.yz + vec2(ssw), 0.0, 1.0);\n" +
            "    color = vec4(hsv2rgb(hsv), clamp(color.a + ssw, 0.0, 1.0) * (1.0 - step(color.a, 0.0)));\n" +
            "    gl_FragColor = color * mask;\n" +
            "}\n";
        }

        private renderTransition()
        {
            let t = Date.now();
            let delta = (t - this.m_timeStamp) / 1000.0;
            let speed = 1.0 / RenderingCache.m_transitionDuration;
            this.m_transition.uniforms.uFactor += speed * delta;
            this.m_timeStamp = t;
            if (this.m_transition.uniforms.uFactor < 1.3) {
                this.render();
                requestAnimationFrame(() => { this.renderTransition(); });
            } else {
                this.m_transition.enabled = false;
                this.render();
            }
        }

        public init(radius: number, screenWidth: number, screenHeight: number)
        {
            let s = (radius + 4.0) * this.m_stage.scale.x * 2.0;
            this.m_cache = PIXI.RenderTexture.create(s, s, PIXI.SCALE_MODES.LINEAR, 2);
            this.m_displayer = new PIXI.Sprite(this.m_cache);
            s = s / 2.0;
            this.m_stage.position.set(s, s);
            this.m_displayer.position.set(screenWidth / 2.0, screenHeight / 2.0);
            this.m_displayer.anchor.set(0.5, 0.5);

            this.m_transition.resolution = window.devicePixelRatio;
            this.m_displayer.filters = [this.m_transition];
        }

        public update()
        {
            this.m_renderer.render(this.m_stage, this.m_cache);
        }

        public render()
        {
            this.m_renderer.render(this.m_displayer);
        }

        public transit()
        {
            this.m_transition.uniforms.uFactor = 0;
            this.m_transition.enabled = true;
            this.m_timeStamp = Date.now();
            this.renderTransition();
        }

        public currentScale(): number
        {
            return this.m_stage.scale.x * this.m_displayer.scale.x;
        }

        get x(): number
        {
            return this.m_displayer.position.x;
        }

        set x(value: number)
        {
            this.m_displayer.position.x = value;
        }

        get y(): number
        {
            return this.m_displayer.position.y;
        }

        set y(value: number)
        {
            this.m_displayer.position.y = value;
        }

        get scale(): number
        {
            return this.m_displayer.scale.x;
        }

        set scale(value: number)
        {
            this.m_displayer.scale.set(value, value);
        }
    }
}
