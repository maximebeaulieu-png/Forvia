/**
 * Dense table with a sticky header. 36 px rows (32 in dense mode), hairline separators, legible at 20+ rows.
 */
export interface DataTableColumn {
  key: string;
  header: React.ReactNode;
  /** cell renderer; falls back to row[key] */
  render?: (row: any) => React.ReactNode;
  align?: "left" | "right" | "center";
  /** tabular mono — set on every amount, date and identifier column */
  mono?: boolean;
  muted?: boolean;
  /** allow the cell to wrap; default false */
  wrap?: boolean;
  width?: number | string;
}
export interface DataTableProps {
  columns: DataTableColumn[];
  rows: any[];
  /** 32 px rows instead of 36 */
  dense?: boolean;
  onRowClick?: (row: any) => void;
  selectedId?: string | number;
  /** field used as React key and for selection; default "id" */
  rowKey?: string;
  stickyHeader?: boolean;
  /** animate row background — used for the profile-switch recolour */
  transition?: boolean;
  emptyMessage?: string;
  style?: React.CSSProperties;
}
export declare function DataTable(props: DataTableProps): JSX.Element;
