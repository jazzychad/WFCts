import PropagationStrategy from "./PropagationStrategy"
import Tile from "./Tile"
import TileOption from "./TileOption"
import { PropagationResult } from "./Types"
import  WFC from "./WFC"

export default class Grid<T> {
    public rows: number
    public cols: number
    public propagationStrategy: PropagationStrategy<T>

    public tileOptions: TileOption<T>[] = []
    public collapsedTiles: Tile<T>[] = []

    public tiles: Tile<T>[][] = []

    private collapseOrder: number = 0

    constructor(rows: number, cols: number) {
        this.rows = rows
        this.cols = cols
    }

    public setCollapseOrder(tile: Tile<T>) {
        tile.collapseOrder = this.collapseOrder
        this.collapseOrder++
    }

    public backtrack() {
        console.log("--------")
        // get the last forcibly collapsed tile (collapsedTile.last) "LAST"
        // move its alternatives to the options
        // recalculate its entropy
        // find all tiles with collapseOrder > LAST's collapseOrder
        // - reset them

        // if collapsedTile.count == 0 we are super screwed!
        // if LAST's alternatives.count == 0, then we go backward in the collapsedTile array and repeat

        let found = false
        let loopCount = 0
        
        while (!found) {
            console.log(loopCount++)
            if (this.collapsedTiles.length === 0) {
                throw new Error("We ran out of backtracking tiles... this is very bad")
            }
            console.log("L", this.collapsedTiles.length)
            let lastCollapsedTile = this.collapsedTiles.pop()!
            console.log("c:", lastCollapsedTile.row, lastCollapsedTile.col, "--", lastCollapsedTile.alternatives.length)
            if (lastCollapsedTile.alternatives.length > 0) {
                found = true
                // need to reset all the tiles collapsed after this tile
                let order = lastCollapsedTile.collapseOrder
                this.collapseOrder = order

                lastCollapsedTile.options = lastCollapsedTile.alternatives
                lastCollapsedTile.alternatives = []
                lastCollapsedTile.collapseOrder = -1
                lastCollapsedTile.updateEntropy()

                // corner case if alternative have only  one left, effectively re-collapsing it
                if (lastCollapsedTile.options.length === 1) {
                    // re-set the collapseORder so that if re-propagation below fails, it will be reset
                    lastCollapsedTile.collapseOrder = order
                    this.collapseOrder = order + 1
                    // DO NOT DO THIS // this.collapsedTiles.push(lastCollapsedTile)
                }


                let prevCount = this.collapsedTiles.length

                // reset tiles
                for (let row of this.tiles) {
                    for (let tile of row) {
                        // nuke all propagated knowledge from uncollapsed tiles,
                        // they will be recalculated below
                        if (tile.collapseOrder > order || (!tile.isCollapsed && tile !== lastCollapsedTile)) {
                            this.resetTile(tile)
                        }
                    }
                }

                

                // re-propagate everything
                let shouldBreak = false
                for (let row of this.tiles) {
                    for (let tile of row) {
                        if (tile.isCollapsed) {
                            let result = WFC.propagateTile(tile, this, 999)
                            if (result === PropagationResult.failure) {
                                // unwinding backtracking due to bad propagation
                                console.log("...f")
                                found = false
                                shouldBreak = true
                                break
                            }
                        }
                    }
                    if (shouldBreak) {
                        break
                    }
                }

                if (this.collapsedTiles.length != prevCount) {
                    throw new Error("collapsedTiles count mismatch")
                }
            }
        }
    }

    private resetTile(tile: Tile<T>) {
        if (tile.isFixed) {
            throw new Error("trying to reset a fixed tile!")
        }
        if (this.propagationStrategy.resetTileOptions) {
            tile.options = [...this.propagationStrategy.resetTileOptions(tile, this)] // must make a copy
        } else {
            tile.options = [...this.tileOptions] // must make a copy
        }
        tile.updateEntropy()
        tile.collapseOrder = -1
        tile.forciblyCollapsed = false
        tile.alternatives = []
    }
}