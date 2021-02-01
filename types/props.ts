import type { IMode } from "./mode";

interface Base {
  baseProp: string;
}

/**
 * This is props
 */
export interface IProps extends Base {
  /**
   * This is props.mode
   */
  mode: IMode;
  /**
   * @type {number}
   * With strictNullChecks: true  -- number | null
   * With strictNullChecks: false -- number
   */
  num: number;
}
