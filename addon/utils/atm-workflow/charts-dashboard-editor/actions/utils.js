import { ElementType } from '../common';

export function getCollectionFieldName(childElementType) {
  switch (childElementType) {
    case ElementType.Section:
      return 'sections';
    case ElementType.Chart:
      return 'charts';
    case ElementType.Axis:
      return 'axes';
    case ElementType.SeriesGroup:
      return 'seriesGroups';
    case ElementType.Series:
      return 'series';
  }
}
