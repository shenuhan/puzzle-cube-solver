import { BoxGeometry, MeshLambertMaterial, Mesh, Scene, type ColorRepresentation, Vector3 } from 'three'
import type { Brick } from './solver'

export class DisplayBrick {
  private cube: Mesh | undefined
  constructor(
    public readonly brick: Brick,
    public readonly position: Vector3,
    public readonly scene: Scene,
    private readonly color: ColorRepresentation
  ) {}

  display() {
    if (!this.cube) {
      const geometry = new BoxGeometry(this.brick.x - 0.1, this.brick.y - 0.1, this.brick.z - 0.1)
      const material = new MeshLambertMaterial({ color: this.color })
      this.cube = new Mesh(geometry, material)
      this.cube.position.x = this.position.x + (this.brick.x - 0.1) / 2
      this.cube.position.y = this.position.y + (this.brick.y - 0.1) / 2
      this.cube.position.z = this.position.z + (this.brick.z - 0.1) / 2
      this.scene.add(this.cube)
    }
  }

  hide() {
    if (this.cube) {
      this.scene.remove(this.cube)
      this.cube = undefined
    }
  }
}
