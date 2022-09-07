namespace SciViCGraph
{
    export class Historical
    {
        constructor(public birthTS: number, public deathTS: number)
        {
        }

        public aliveAtTimestamp(ts: number): boolean
        {
            if ((this.birthTS === undefined) && (this.deathTS === undefined))
                return true;
            else if (this.birthTS === undefined)
                return ts < this.deathTS;
            else if (this.deathTS === undefined)
                return ts > this.birthTS;
            else
                return (ts > this.birthTS) && (ts < this.deathTS);
        }
    }
}
