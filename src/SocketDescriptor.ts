import * as Types from "./Types"

type SocketMap = {
    [id: number]: Types.SocketIdentifier
}

export default class SocketDescriptor {
    private map: SocketMap = {}

    constructor(north: Types.SocketIdentifier, east: Types.SocketIdentifier, south: Types.SocketIdentifier, west: Types.SocketIdentifier) {
        this.map[Types.AdjacencyDirection.north] = north
        this.map[Types.AdjacencyDirection.east] = east
        this.map[Types.AdjacencyDirection.south] = south
        this.map[Types.AdjacencyDirection.west] = west
    }

    public at(direction: Types.AdjacencyDirection): Types.SocketIdentifier {
        return this.map[direction]
    }
}