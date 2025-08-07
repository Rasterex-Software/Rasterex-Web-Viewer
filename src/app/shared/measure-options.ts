export interface PresetOption {
  pageScaleValue: number;
  customScaleValue: number;
  label: string;
  imperialNumerator?: number;
  imperialDenominator?: number;
}

export interface MeasureOption {
  value: string | number;
  label: string;
  shortLabel?: string;
  imgSrc?: string;
  hidden?: boolean;
}

export const metricUnitsOptions: MeasureOption[] = [
  {
    value: 'MILLIMETER',
    label: 'Millimeter',
    shortLabel: 'mm',
  },
  {
    value: 'CENTIMETER',
    label: 'Centimeter',
    shortLabel: 'cm',
  },
  {
    value: 'DECIMETER',
    label: 'Decimeter',
    shortLabel: 'dm',
  },
  { 
    value: 'METER', 
    label: 'Meter', 
    shortLabel: 'm' 
  },
  {
    value: 'KILOMETER',
    label: 'Kilometer',
    shortLabel: 'km',
  },
];

export const imperialUnitsOptions: MeasureOption[] = [
  { 
    value: 'INCH', 
    label: 'Inch', 
    shortLabel: 'in' 
  },
  { 
    value: 'FEET', 
    label: 'Feet', 
    shortLabel: 'ft' 
  },
  { 
    value: 'YARD', 
    label: 'Yard', 
    shortLabel: 'yd' 
  },
  { 
    value: 'MILE', 
    label: 'Mile', 
    shortLabel: 'mi' 
  },
  {
    value: 'NAUTICAL_MILES',
    label: 'Nautical Miles',
    shortLabel: 'nmi',
  },
];

export const imperialPrecisionOptions: MeasureOption[] = [
  { 
    value: 0.01, 
    label: `0'-0 1/32"`, 
  },
];

export const precisionOptions: MeasureOption[] = [
  { 
    value: 1, 
    label: 'Rounded', 
    shortLabel: '1' 
  },
  { 
    value: 0.1, 
    label: '0.1' 
  },
  { 
    value: 0.01, 
    label: '0.01' 
  },
  { 
    value: 0.001, 
    label: '0.001' 
  },
  { 
    value: 0.0001, 
    label: '0.0001' 
  },
];

export const metricSystemOptions: MeasureOption[] = [
  { value: '0', label: 'Metric' },
  { value: '1', label: 'Imperial' },
];

export const presetOptions: PresetOption[] = [
  { pageScaleValue: 1, customScaleValue: 1, label: '1:1' },
  { pageScaleValue: 1, customScaleValue: 10, label: '1:10' },
  { pageScaleValue: 1, customScaleValue: 64, label: '1:64' },
  { pageScaleValue: 1, customScaleValue: 100, label: '1:100' },
  { pageScaleValue: 1, customScaleValue: 2, label: '1:2' },
  { pageScaleValue: 1, customScaleValue: 4, label: '1:4' },
  { pageScaleValue: 1, customScaleValue: 5, label: '1:5' },
  { pageScaleValue: 1, customScaleValue: 8, label: '1:8' },
  { pageScaleValue: 1, customScaleValue: 10, label: '1:10' },
  { pageScaleValue: 1, customScaleValue: 12, label: '1:12' },
  { pageScaleValue: 1, customScaleValue: 16, label: '1:16' },
  { pageScaleValue: 1, customScaleValue: 20, label: '1:20' },
  { pageScaleValue: 1, customScaleValue: 25, label: '1:25' },
  { pageScaleValue: 1, customScaleValue: 32, label: '1:32' },
  { pageScaleValue: 1, customScaleValue: 40, label: '1:40' },
  { pageScaleValue: 1, customScaleValue: 50, label: '1:50' },
  { pageScaleValue: 1, customScaleValue: 100, label: '1:100' },
  { pageScaleValue: 1, customScaleValue: 125, label: '1:125' },
  { pageScaleValue: 1, customScaleValue: 200, label: '1:200' },
  { pageScaleValue: 1, customScaleValue: 500, label: '1:500' },
  { pageScaleValue: 1, customScaleValue: 1000, label: '1:1000' },
  { pageScaleValue: 2, customScaleValue: 1, label: '2:1' },
  { pageScaleValue: 4, customScaleValue: 1, label: '4:1' },
  { pageScaleValue: 8, customScaleValue: 1, label: '8:1' },
  { pageScaleValue: 10, customScaleValue: 1, label: '10:1' },
  { pageScaleValue: 100, customScaleValue: 1, label: '100:1' },
];

export const imperialPresetOptions: PresetOption[] = [
  { pageScaleValue: 1/128, customScaleValue: 1, label: '1/128" = 1\'', imperialNumerator: 1, imperialDenominator: 128 },
  { pageScaleValue: 1/64, customScaleValue: 1, label: '1/64" = 1\'', imperialNumerator: 1, imperialDenominator: 64 },
  { pageScaleValue: 1/32, customScaleValue: 1, label: '1/32" = 1\'', imperialNumerator: 1, imperialDenominator: 32 },
  { pageScaleValue: 1/16, customScaleValue: 1, label: '1/16" = 1\'', imperialNumerator: 1, imperialDenominator: 16 },
  { pageScaleValue: 3/32, customScaleValue: 1, label: '3/32" = 1\'', imperialNumerator: 3, imperialDenominator: 32 },
  { pageScaleValue: 1/8, customScaleValue: 1, label: '1/8" = 1\'', imperialNumerator: 1, imperialDenominator: 8 },
  { pageScaleValue: 3/16, customScaleValue: 1, label: '3/16" = 1\'', imperialNumerator: 3, imperialDenominator: 16 },
  { pageScaleValue: 1/4, customScaleValue: 1, label: '1/4" = 1\'', imperialNumerator: 1, imperialDenominator: 4 },
  { pageScaleValue: 3/8, customScaleValue: 1, label: '3/8" = 1\'', imperialNumerator: 3, imperialDenominator: 8 },
  { pageScaleValue: 1/2, customScaleValue: 1, label: '1/2" = 1\'', imperialNumerator: 1, imperialDenominator: 2 },
  { pageScaleValue: 3/4, customScaleValue: 1, label: '3/4" = 1\'', imperialNumerator: 3, imperialDenominator: 4 },
  { pageScaleValue: 1, customScaleValue: 1, label: '1" = 1\'', imperialNumerator: 1, imperialDenominator: 1 },
  { pageScaleValue: 1.5, customScaleValue: 1, label: '1 1/2" = 1\'', imperialNumerator: 3, imperialDenominator: 2 },
  { pageScaleValue: 3, customScaleValue: 1, label: '3" = 1\'', imperialNumerator: 3, imperialDenominator: 1 },
  { pageScaleValue: 6, customScaleValue: 1, label: '6" = 1\'', imperialNumerator: 6, imperialDenominator: 1 },
  { pageScaleValue: 12, customScaleValue: 1, label: '1\' = 1\'', imperialNumerator: 12, imperialDenominator: 1 },
];

export const isMeasureOption = (obj: any): obj is MeasureOption => {
  return obj 
    && typeof obj === 'object'
    && 'value' in obj
    && 'label' in obj;
};

export const findMeasureOptionByValue = (options: MeasureOption[], value: string | number): MeasureOption | undefined => {
  return options.find(option => option.value === value);
};

export const filterMeasureOptions = (options: MeasureOption[], searchTerm: string): MeasureOption[] => {
  const term = searchTerm.toLowerCase();
  return options.filter(option => 
    option.label.toLowerCase().includes(term)
  );
}; 