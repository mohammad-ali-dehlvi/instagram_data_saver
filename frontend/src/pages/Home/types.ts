export interface LinkItem {
  id: string;
  label: string;
  url: string;
  description?: string;
  tag?: string;
  /** Optional icon element to show instead of the default LinkIcon */
  icon?: React.ReactNode;
}
