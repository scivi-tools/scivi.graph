namespace SciViCGraph
{
    export class Historical
    {
        constructor(public birthTS: number, public deathTS: number)
        {
        }

        public lifeSpanIntersectsTimeSpan(ts: Range): boolean
        {
            if (((this.birthTS === undefined) && (this.deathTS === undefined)) || ((ts.min === undefined) && (ts.max === undefined)))
                return true;
            else if (this.birthTS === undefined)
                return ts.min === undefined ? true : this.deathTS >= ts.min;
            else if (this.deathTS === undefined)
                return ts.max === undefined ? true : this.birthTS <= ts.max;
            else if (ts.min === undefined)
                return this.birthTS <= ts.max;
            else if (ts.max === undefined)
                return this.deathTS >= ts.min;
            else
                return (this.birthTS <= ts.max) && (this.deathTS >= ts.min);
        }
    }
}
