/**
 * Header control for the active requirements profile. Changing it rescores client-side and recolours
 * table rows over 150 ms — the demo's configurability moment.
 */
export interface RequirementsProfile {
  id: string;
  /** e.g. "GPTC default", "Expert (R. Mekouar)" */
  label: string;
  /** version stamp recorded with every analysis, e.g. "v3" */
  version?: string;
  /** one-line description of what differs */
  note?: string;
}
export interface ProfileSwitcherProps {
  value: string;
  profiles: RequirementsProfile[];
  onChange?: (id: string) => void;
  style?: React.CSSProperties;
}
export declare function ProfileSwitcher(props: ProfileSwitcherProps): JSX.Element;
