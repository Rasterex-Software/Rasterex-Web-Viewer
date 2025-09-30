export interface CustomButton {
    id: string;
    label: string;
    icon?: string;
    svgIcon?: string;   // NEW: inline SVG or path to SVG
    toggle?: boolean;   // NEW
    active?: boolean;   // NEW
    onClick?: (btn: CustomButton) => void; // <-- now passes state
  }