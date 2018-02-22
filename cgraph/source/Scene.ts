namespace SciViCGraph
{
    export class Scene extends PIXI.Container
    {
        constructor(public colors: number[], public maxEdgeWeight: number, public maxNodeWeight: number)
        {
            super();
        }
   }
}
