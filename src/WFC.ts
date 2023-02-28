import Tile from "./Tile";
import Grid from "./Grid";
import { PropagationResult } from "./Types";
import TileOption from "./TileOption";

export default class WFC {

    public static initializeGrid<T>(grid: Grid<T>, setupTile: (tile: Tile<T>) => void) {
        grid.tiles = [[]]

        for (let row = 0; row < grid.rows; row++) {
            var rowArr: Tile<T>[] = []
            for (let col = 0; col < grid.cols; col++) {
                let tile = new Tile<T>()
                tile.row = row
                tile.col = col
                setupTile(tile)
                rowArr.push(tile)
            }
            if (row > 0) {
                grid.tiles.push(rowArr)
            } else {
                grid.tiles[0] = rowArr
            }
        }
    }

    public static generateAdjacencyRules<T>(options: TileOption<T>[]) {
        // todo
    }

    public static propagateTile<T>(tile: Tile<T>, grid: Grid<T>, depth: number): PropagationResult {
        // to do
        return PropagationResult.success
    }

    public static minimumEntropyTile<T>(grid: Grid<T>): Tile<T> | undefined {
        let candidates: Tile<T>[] = []
        for (let row of grid.tiles) {
            for (let tile of row) {
                if (!tile.isCollapsed) {
                    if (candidates.length === 0) {
                        candidates = [tile]
                    } else {
                        if (tile.entropy < candidates[0].entropy) {
                            candidates = [tile]
                        } else if (tile.entropy === candidates[0].entropy) {
                            candidates.push(tile)
                        }
                    }
                }
            }
        }
        if (candidates.length === 0) {
            return undefined
        }
        return candidates[Math.floor(Math.random() * candidates.length)]
    }

    public static collapseTile<T>(tile: Tile<T>, grid: Grid<T>) {
        // todo
    }

    public static solve<T>(grid: Grid<T>) {
        let curTile = this.minimumEntropyTile(grid)

        while (curTile !== undefined) {
            this.collapseTile(curTile, grid)
            let result = this.propagateTile(curTile, grid, 0)
            if (result === PropagationResult.failure) {
                grid.backtrack()
            }
            curTile = this.minimumEntropyTile(grid)
        }
    }

    public static step<T>(grid: Grid<T>) {
        let curTile = this.minimumEntropyTile(grid)
        if (curTile) {
            this.collapseTile(curTile, grid)
            let result = this.propagateTile(curTile, grid, 0)
            if (result === PropagationResult.failure) {
                grid.backtrack()
            }
        }
    }
}