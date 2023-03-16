import Tile from "./Tile";
import Grid from "./Grid";
import { AdjacencyDirection, AdjacencyIdentifer, PropagationResult } from "./Types";
import TileOption from "./TileOption";
declare global {
    interface String {
        reverse(): string
    }
}

String.prototype.reverse = function(this: string) {
    return this.split('').reverse().join('')
}

enum UpdateResult {
    needsUpdate,
    noAction,
    conflict
}

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
        for (let option of options) {
            let north: AdjacencyIdentifer[] = []
            let east: AdjacencyIdentifer[] = []
            let south: AdjacencyIdentifer[] = []
            let west: AdjacencyIdentifer[] = []

            for (let candidate of options) {
                // north
                if (candidate.sockets.at(AdjacencyDirection.south).reverse() === option.sockets.at(AdjacencyDirection.north)) {
                    north.push(candidate.adjacencyIdentifier)
                }

                 // east
                 if (candidate.sockets.at(AdjacencyDirection.west).reverse() === option.sockets.at(AdjacencyDirection.east)) {
                    east.push(candidate.adjacencyIdentifier)
                }

                 // south
                 if (candidate.sockets.at(AdjacencyDirection.north).reverse() === option.sockets.at(AdjacencyDirection.south)) {
                    south.push(candidate.adjacencyIdentifier)
                }

                 // west
                 if (candidate.sockets.at(AdjacencyDirection.east).reverse() === option.sockets.at(AdjacencyDirection.west)) {
                    west.push(candidate.adjacencyIdentifier)
                }
            }

            option.adjacencies[AdjacencyDirection.north] = new Set<AdjacencyIdentifer>(north)
            option.adjacencies[AdjacencyDirection.east] = new Set<AdjacencyIdentifer>(east)
            option.adjacencies[AdjacencyDirection.south] = new Set<AdjacencyIdentifer>(south)
            option.adjacencies[AdjacencyDirection.west] = new Set<AdjacencyIdentifer>(west)
        }
    }

    public static propagateTile<T>(
        initialTile: Tile<T>,
        grid: Grid<T>,
        depth: number = 0): PropagationResult {

            const updateNeighbor = (neighborTile: Tile<T>, forTile: Tile<T>): UpdateResult => {
                if (grid.propagationStrategy.shouldPropagateTile !== undefined && !grid.propagationStrategy.shouldPropagateTile(forTile, grid)) {
                    // should not propagate
                    return UpdateResult.noAction
                }

                let newOptions: TileOption<T>[] = grid.propagationStrategy.validOptionsForNeighbor(neighborTile, forTile, grid)
                let origOptionsCount = neighborTile.options.length
                //let origOptions = neighborTile.options.slice()
                if (newOptions.length === 0) {
                    return UpdateResult.conflict
                }

                //debug
                let oldOptionsSet = new Set<TileOption<T>>(neighborTile.options)

                // we are ok to set the new options to the neighbor
                neighborTile.options = newOptions

                //debug
                let newOptionsSet = new Set<TileOption<T>>(neighborTile.options)

                if (newOptions.length === 1) {
                    if (neighborTile.collapseOrder === -1 && !neighborTile.isFixed) {
                        grid.setCollapseOrder(neighborTile)
                    }
                }

                if (newOptions.length !== origOptionsCount) {
                    if (newOptions.length > origOptionsCount) {
                        throw new Error('newOptions is larger than original options count!')
                    }
                    return UpdateResult.needsUpdate
                }

                //debug
                let intersect = new Set([...newOptions].filter(i => oldOptionsSet.has(i)));
                if (intersect.size != newOptions.length || intersect.size != oldOptionsSet.size) {
                    throw new Error("laskdfjalskfjalsfkjsaldkfsdlkfjslkfj")
                }

                return UpdateResult.noAction
            }

            let que: Tile<T>[] = [initialTile]

            while (que.length > 0) {
                let tile = que.pop()!
                let row = tile.row
                let col = tile.col

                tile.updateEntropy()

                let neighborTiles = grid.propagationStrategy.neighborsForTile(tile, grid)
                for (let neighbor of neighborTiles) {
                    let result = updateNeighbor(neighbor, tile)
                    if (result === UpdateResult.needsUpdate) {
                        let idx = que.indexOf(neighbor)
                        if (idx !== -1) {
                            que.splice(idx, 1)
                        }
                        que.push(neighbor)
                    } else if (result === UpdateResult.conflict) {
                        return PropagationResult.failure
                    }
                }

            }

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
        if (tile.options.length <= 1) {
            throw new Error(`attempting to collapse a tile with ${tile.options.length} options..`)
        }

        //debug
        console.log("collapsing: ", tile.row, tile.col, "--", tile.entropy, "--", grid.collapsedTiles.length)

        let sumWeights = tile.options.reduce((acc, option) => {
            return acc + option.weight
        }, 0)
        let rand = Math.random() * sumWeights
        let acc = 0
        let chosenOption: TileOption<T> = tile.options[0] // initial assignment to appease compiler
        for (let option of tile.options) {
            if (rand <= acc + option.weight) {
                chosenOption = option
                break
            }
            acc += option.weight
        }

        let alternativeOptions = tile.options
        let idx = alternativeOptions.indexOf(chosenOption)
        if (idx !== -1){
            alternativeOptions.splice(idx, 1)
        }

        tile.options = [chosenOption]
        if (tile.isFixed) {
            throw new Error("trying to collapse a fixed tile's options.")
        }
        tile.alternatives = alternativeOptions
        tile.entropy = -1
        tile.forciblyCollapsed = true

        grid.setCollapseOrder(tile)
        grid.collapsedTiles.push(tile)
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
