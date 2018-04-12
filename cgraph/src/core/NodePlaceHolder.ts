namespace SciViCGraph
{
    export class NodePlaceHolder extends Curve
    {
        constructor(inRaduis: number, outRadius: number)
        {
            super();

            this.lineStyle(3.0, 0x0, 1);
            this.addColor({ from: 0xFD3C00, to: 0xFD3C00, alpha: 1.0 });
            this.moveTo(inRaduis, 0.0);
            this.lineTo(outRadius, 0.0);
        }
    }
}
