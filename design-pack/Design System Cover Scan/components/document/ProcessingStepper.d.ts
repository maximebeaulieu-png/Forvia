/**
 * The 8-step pipeline with per-step timings and a total that must stay under 30 s.
 * Under prefers-reduced-motion the steps still change state, they just don't animate.
 */
export interface ProcessingStepperProps {
  /** defaults to PIPELINE_STEPS */
  steps?: string[];
  /** index of the running step; steps.length means finished */
  current: number;
  /** milliseconds per completed step, same order as steps */
  timings?: number[];
  /** overrides the summed total, in ms */
  totalMs?: number;
  style?: React.CSSProperties;
}
export declare function ProcessingStepper(props: ProcessingStepperProps): JSX.Element;
export declare const PIPELINE_STEPS: string[];
