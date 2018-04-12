namespace SciViCGraph
{
    export class Scene extends PIXI.Container
    {
        constructor(public colors: number[], public edgeWeight: Range, public nodeWeight: Range)
        {
            super();
        }
   }
}
