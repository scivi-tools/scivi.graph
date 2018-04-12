namespace SciViCGraph
{
    export type Point = { x: number, y: number };

    export class Geometry
    {
        private static EPSELEN = 0.000001;

        public static solveCubicEq(a: number, b: number, c: number, d: number): number[]
        {
            if (Math.abs(a) > Geometry.EPSELEN)
            {
                // Canonical form: x^3 + ax^2 + bx + d = 0.
                // Solve by Cardan formula.
                let z = a;
                a = b / z;
                b = c / z;
                c = d / z;

                let p = b - a * a / 3.0;
                let q = a * (2.0 * a * a - 9.0 * b) / 27.0 + c;
                let p3 = p * p * p;
                let D = q * q + 4.0 * p3 / 27.0;
                let offset = -a / 3.0;
                if (D > Geometry.EPSELEN) {
                    // Positive discriminant.
                    z = Math.sqrt(D)
                    let u = (-q + z) / 2.0;
                    let v = (-q - z) / 2.0;
                    u = u >= 0.0 ? Math.pow(u, 1.0 / 3.0) : -Math.pow(-u, 1.0 / 3.0);
                    v = v >= 0.0 ? Math.pow(v, 1.0 / 3.0) : -Math.pow(-v, 1.0 / 3.0);
                    return [ u + v + offset ];
                } else if (D < -Geometry.EPSELEN) {
                    // Negative discriminant.
                    let u = 2.0 * Math.sqrt(-p / 3.0);
                    let v = Math.acos(-Math.sqrt(-27.0 / p3) * q / 2.0) / 3.0;
                    return [ u * Math.cos(v) + offset, 
                             u * Math.cos(v + 2.0 * Math.PI / 3.0) + offset,
                             u * Math.cos(v + 4.0 * Math.PI / 3.0) + offset ];
                } else {
                    // Zero discriminant.
                    let u = 0.0;
                    if (q < 0.0) 
                        u = Math.pow(-q / 2.0, 1.0 / 3.0);
                    else
                        u = -Math.pow(q / 2.0, 1.0 / 3.0);
                    return [ 2.0 * u + offset,
                             -u + offset];
                }
            } else {
                // Canonical from: ax^2 + bx + c = 0.
                // Solve via discriminant.
                a = b;
                b = c;
                c = d;
                if (Math.abs(a) <= Geometry.EPSELEN) {
                    if (Math.abs(b) <= Geometry.EPSELEN)
                        return [];
                    else
                        return [-c / b];
                }
                let D = b * b - 4.0 * a * c;
                if (D <= -Geometry.EPSELEN)
                    return [];
                if (D > Geometry.EPSELEN) {
                    // Positive discriminant.
                    D = Math.sqrt(D);
                    return [ (-b - D) / (2.0 * a),
                             (-b + D) / (2.0 * a) ];
                } else if (D < -Geometry.EPSELEN) {
                    // Negative discriminant.
                    return [];
                } else {
                    // Zero discriminant.
                    return [-b / (2.0 * a)];
                }
            }
        }

        public static distance(p1: Point, p2: Point): number
        {
            const pp = { x: p1.x - p2.x, y: p1.y - p2.y };
            return Math.sqrt(pp.x * pp.x + pp.y * pp.y);
        }

        public static quadCurve(t: number, c1: Point, c2: Point, c3: Point): Point
        {
            let nt = 1.0 - t;
            let a = nt * nt;
            let b = 2.0 * t * nt;
            let c = t * t;
            return { x: a * c1.x + b * c2.x + c * c3.x, y: a * c1.y + b * c2.y + c * c3.y };
        }

        public static distanceToQuadCurve(p: Point, c1: Point, c2: Point, c3: Point): number
        {
            let pos = { x: c1.x - p.x, y: c1.y - p.y };
            let tA = { x: c2.x - c1.x, y: c2.y - c1.y };
            let tB = { x: c1.x - 2.0 * c2.x + c3.x, y: c1.y - 2.0 * c2.y + c3.y };
            
            let a = tB.x * tB.x + tB.y * tB.y;
            let b = 3.0 * (tA.x * tB.x + tA.y * tB.y);
            let c = 2.0 * (tA.x * tA.x + tA.y * tA.y) + pos.x * tB.x + pos.y * tB.y;
            let d = pos.x * tA.x + pos.y * tA.y;
            let sol = this.solveCubicEq(a, b, c, d);
            
            let dist = 0.0;
            let result = Number.MAX_VALUE;
            let d1 = this.distance(p, c1);
            let d2 = this.distance(p, c3);
            
            sol.forEach((t: number) => {
                if (t >= 0.0 && t <= 1.0) {
                    dist = this.distance(p, this.quadCurve(t, c1, c2, c3));
                    if (dist < result)
                        result = dist;
                }
            });

            if (d1 < result)
                result = d1;
            if (d2 < result)
                result = d2;

            return result;
        }
    }
}
