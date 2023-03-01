import TileOption from "./TileOption"

export default class Tile<T> {
  public row = 0
  public col = 0

  public entropy = 0
  public options: TileOption<T>[] = []
  public alternatives: TileOption<T>[] = [] // used after being collapsed, in case of backtracking
  public collapseOrder = -1
  public isFixed: boolean = false // whether this tile is "pre-collapsed" (such as a given value in sudoku puzzle)

  public get isCollapsed(): Boolean {
    return this.options.length == 1
  }

  public get isConflicted(): Boolean {
    return this.options.length === 0
  }

  public get collapsedChoice(): TileOption<T> | undefined {
    return this.isCollapsed ? this.options[0] : undefined
  }

  public updateEntropy() {
    /*
         from: https://robertheaton.com/2018/12/17/wavefunction-collapse-algorithm/
         shannon_entropy_for_square =
           log(sum(weight)) -
           (sum(weight * log(weight)) / sum(weight))
    */
    const sumWeight = this.options.reduce((acc: number, option: TileOption<T>): number => {
      return acc + option.weight
    }, 0)
    const logSumWeight = Math.log(sumWeight)
    const sumWeightLogWeight =- this.options.reduce((acc: number, option: TileOption<T>): number => {
      return acc + (option.weight * Math.log(option.weight))
    }, 0)
    this.entropy = logSumWeight - (sumWeightLogWeight / sumWeight)
  }

}