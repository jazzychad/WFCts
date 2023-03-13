import Grid from "./Grid"
import Tile from "./Tile"
import TileOption from "./TileOption"

export default class PropagationStrategy<T> {
    public shouldPropagateTile?: (tile: Tile<T>, grid: Grid<T>) => boolean
    public neighborsForTile: (tile: Tile<T>, grid: Grid<T>) => Tile<T>[]
    public validOptionsForNeighbor: (neighborTile: Tile<T>, forTile: Tile<T>, grid: Grid<T>) => TileOption<T>[]
    public resetTileOptions?: (tile: Tile<T>, grid: Grid<T>) => TileOption<T>[]
}