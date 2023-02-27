import * as Types from "./Types"
import SocketDescriptor from "./SocketDescriptor"

type AdjacencyMap = { [id: number]: Set<Types.AdjacencyIdentifer>; }

export default class TileOption<T> {
    public isEnabled = true
    public weight = 0
    public value: T
    public rotations = 0 // number of rotations (each 90 deg clockwise) 0 - 3
    public isFlippedHorizontally = false
    public isFlippedVertically = false
    public adjacencyIdentifier: Types.AdjacencyIdentifer
    public adjacencies: AdjacencyMap = {}
    public sockets = new SocketDescriptor("", "", "", "") // up to programmer to correctly assign this later

    constructor(value: T) {
        this.value = value

        this.adjacencies[Types.AdjacencyDirection.north] = new Set<Types.AdjacencyIdentifer>()
        this.adjacencies[Types.AdjacencyDirection.east] = new Set<Types.AdjacencyIdentifer>()
        this.adjacencies[Types.AdjacencyDirection.south] = new Set<Types.AdjacencyIdentifer>()
        this.adjacencies[Types.AdjacencyDirection.west] = new Set<Types.AdjacencyIdentifer>()
    }

    private rotateAdjacencies(times: number) {
        for (let i = 0; i < times; i++) {
            let temp = this.adjacencies[Types.AdjacencyDirection.west]
            this.adjacencies[Types.AdjacencyDirection.west] = this.adjacencies[Types.AdjacencyDirection.south]
            this.adjacencies[Types.AdjacencyDirection.south] = this.adjacencies[Types.AdjacencyDirection.east]
            this.adjacencies[Types.AdjacencyDirection.east] = this.adjacencies[Types.AdjacencyDirection.north]
            this.adjacencies[Types.AdjacencyDirection.north] = temp
        }
    }

    private rotateSockets(times: number) {
        for (let i = 0; i < times; i++) {
            this.sockets = new SocketDescriptor(
                this.sockets.at(Types.AdjacencyDirection.west),
                this.sockets.at(Types.AdjacencyDirection.north),
                this.sockets.at(Types.AdjacencyDirection.east),
                this.sockets.at(Types.AdjacencyDirection.south)
                )
        }
    }

    private flipAdjacencies(direction: Types.FlipDirection) {
        if (direction === Types.FlipDirection.horrizontal) {
            let temp = this.adjacencies[Types.AdjacencyDirection.west]
            this.adjacencies[Types.AdjacencyDirection.west] = this.adjacencies[Types.AdjacencyDirection.east]
            this.adjacencies[Types.AdjacencyDirection.east] = temp
        } else if (direction === Types.FlipDirection.veritcal) {
            let temp = this.adjacencies[Types.AdjacencyDirection.north]
            this.adjacencies[Types.AdjacencyDirection.north] = this.adjacencies[Types.AdjacencyDirection.south]
            this.adjacencies[Types.AdjacencyDirection.south] = temp
        }
    }

    private flipSockets(direction: Types.FlipDirection) {
        if (direction === Types.FlipDirection.horrizontal) {
            this.sockets = new SocketDescriptor(
                this.sockets.at(Types.AdjacencyDirection.north),
                this.sockets.at(Types.AdjacencyDirection.west),
                this.sockets.at(Types.AdjacencyDirection.south),
                this.sockets.at(Types.AdjacencyDirection.east),
            )
        } else if (direction === Types.FlipDirection.veritcal) {
            this.sockets = new SocketDescriptor(
                this.sockets.at(Types.AdjacencyDirection.south),
                this.sockets.at(Types.AdjacencyDirection.east),
                this.sockets.at(Types.AdjacencyDirection.north),
                this.sockets.at(Types.AdjacencyDirection.west),
            )
        }
    }

    // each rotation is 90 degrees clockwise
    public rotatedTileOption(turns: number, adjacencyIdentifier: Types.AdjacencyIdentifer | undefined = undefined): TileOption<T> {
        let option = new TileOption<T>(this.value)
        option.weight = this.weight
        option.adjacencyIdentifier = adjacencyIdentifier ?? this.adjacencyIdentifier
        option.adjacencies = this.adjacencies
        option.rotateAdjacencies(turns)
        option.sockets = this.sockets
        option.rotateSockets(turns)
        option.rotations = this.rotations + turns
        option.isFlippedHorizontally = this.isFlippedHorizontally
        option.isFlippedVertically = this.isFlippedVertically

        return option
    }

    public flipTileOption(direction: Types.FlipDirection, adjacencyIdentifier: Types.AdjacencyIdentifer | undefined = undefined): TileOption<T> {
        let option = new TileOption<T>(this.value)
        option.weight = this.weight
        option.adjacencyIdentifier = adjacencyIdentifier ?? this.adjacencyIdentifier
        option.adjacencies = this.adjacencies
        option.sockets = this.sockets
        option.rotations = this.rotations
        option.isFlippedHorizontally = (direction === Types.FlipDirection.horrizontal) ? !this.isFlippedHorizontally : this.isFlippedHorizontally
        option.isFlippedVertically = (direction === Types.FlipDirection.veritcal) ? !this.isFlippedVertically : this.isFlippedVertically

        return option
    }
}