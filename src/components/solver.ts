export class Brick {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number
  ) {}

  equals(brick: Brick): boolean {
    return this.x === brick.x && this.y === brick.y && this.z === brick.z
  }

  rotate(xAxis: boolean, yAxis: boolean, zAxis: boolean): Brick {
    let { x, y, z } = this
    if (xAxis) [y, z] = [z, y]
    if (yAxis) [x, z] = [z, x]
    if (zAxis) [x, y] = [y, x]

    return new Brick(x, y, z)
  }

  private _rotations: Brick[] = []
  get rotations(): Brick[] {
    const bools = [false, true]
    if (this._rotations.length === 0) {
      bools.forEach((xAxis) =>
        bools.forEach((yAxis) =>
          bools.forEach((zAxis) => {
            const rotation = this.rotate(xAxis, yAxis, zAxis)
            if (this._rotations.findIndex((b) => b.equals(rotation)) < 0) {
              this._rotations.push(rotation)
            }
          })
        )
      )
    }
    return this._rotations
  }
}

export class Problem {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number,
    public readonly bricks: { brick: Brick; quantity: number }[]
  ) {}
}

export class Solver {
  private availableBricks: { brick: Brick; quantity: number }[] = []
  private positionedBricks: { brick: Brick; i: number; j: number; k: number }[] = []
  private cube: boolean[][][] = []
  private solved = false

  get status(): { brick: Brick; i: number; j: number; k: number }[] {
    return [...this.positionedBricks]
  }

  constructor(private readonly problem: Problem) {}

  initSolving() {
    this.cube = []
    this.iterate((i, j, k) => {
      this.cube[i] = this.cube[i] || []
      this.cube[i][j] = this.cube[i][j] || []
      this.cube[i][j][k] = false
    })
    this.availableBricks = this.problem.bricks.map((b) => {
      return { ...b }
    })
    this.positionedBricks = []
    this.solved = false
  }

  private iterate<T>(action: (i: number, j: number, k: number) => T | undefined): T | undefined {
    for (let k = 0; k < this.problem.z; k++) {
      for (let j = 0; j < this.problem.y; j++) {
        for (let i = 0; i < this.problem.x; i++) {
          const result = action(i, j, k)
          if (result !== undefined) return result
        }
      }
    }
  }

  public nextStep() {
    if (this.solved) return false
    if (this.resolver) this.resolver(true)
    return true
  }
  private resolver = (b: boolean) => {}
  private nextStepTriggered(): Promise<boolean> {
    return new Promise((resolve) => {
      this.resolver = resolve
    })
  }

  private iteration = 0
  async startSolving(): Promise<{ brick: Brick; i: number; j: number; k: number }[] | undefined> {
    if (this.iteration++ % 100 === 0) await this.nextStepTriggered()
    var result = await this.solve()
    if (result) {
      this.solved = true
    }
    return result
  }

  private async solve(): Promise<{ brick: Brick; i: number; j: number; k: number }[] | undefined> {
    const nextSlot = this.findNextSlot()
    if (!nextSlot) return this.positionedBricks

    for (const availableBrick of this.availableBricks.filter((b) => b.quantity > 0)) {
      availableBrick.quantity--
      for (const brick of availableBrick.brick.rotations) {
        if (this.tryPutBrick(brick, nextSlot)) {
          const solution = await this.startSolving()
          if (solution) return solution
          this.removeBrick(brick, nextSlot)
        }
      }
      availableBrick.quantity++
    }
  }

  removeBrick(brick: Brick, nextSlot: { i: number; j: number; k: number }): void {
    for (let ii = 0; ii < brick.x; ii++) {
      for (let jj = 0; jj < brick.y; jj++) {
        for (let kk = 0; kk < brick.z; kk++) {
          this.cube[nextSlot.i + ii][nextSlot.j + jj][nextSlot.k + kk] = false
        }
      }
    }
    this.positionedBricks.pop()
  }
  tryPutBrick(brick: Brick, nextSlot: { i: number; j: number; k: number }): boolean {
    if (nextSlot.i + brick.x > this.problem.x) return false
    if (nextSlot.j + brick.y > this.problem.y) return false
    if (nextSlot.k + brick.z > this.problem.z) return false

    for (let ii = 0; ii < brick.x; ii++) {
      for (let jj = 0; jj < brick.y; jj++) {
        for (let kk = 0; kk < brick.z; kk++) {
          if (this.cube[nextSlot.i + ii][nextSlot.j + jj][nextSlot.k + kk]) return false
        }
      }
    }
    for (let ii = 0; ii < brick.x; ii++) {
      for (let jj = 0; jj < brick.y; jj++) {
        for (let kk = 0; kk < brick.z; kk++) {
          this.cube[nextSlot.i + ii][nextSlot.j + jj][nextSlot.k + kk] = true
        }
      }
    }
    this.positionedBricks.push({ brick, ...nextSlot })
    return true
  }

  private findNextSlot(): { i: number; j: number; k: number } | undefined {
    return this.iterate((i, j, k) => {
      if (!this.cube[i][j][k]) return { i, j, k }
    })
  }
}
