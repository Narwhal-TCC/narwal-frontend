import type { CampaignPoint, PrimaryClass } from '../api/campaigns'

export type ClassGroupKey = 'MILCO' | 'NOMBO' | 'NONE'

export const CLASS_GROUP_ORDER: ClassGroupKey[] = ['MILCO', 'NOMBO', 'NONE']

export function classGroupKey(primaryClass: PrimaryClass | null): ClassGroupKey {
  if (primaryClass === 'MILCO') {
    return 'MILCO'
  }
  if (primaryClass === 'NOMBO') {
    return 'NOMBO'
  }
  return 'NONE'
}

export function classGroupLabel(key: ClassGroupKey): string {
  if (key === 'MILCO') {
    return 'MILCO'
  }
  if (key === 'NOMBO') {
    return 'NOMBO'
  }
  return 'Sem classe'
}

export function groupCampaignPoints(
  points: CampaignPoint[],
): Array<{ key: ClassGroupKey; points: CampaignPoint[] }> {
  const buckets: Record<ClassGroupKey, CampaignPoint[]> = {
    MILCO: [],
    NOMBO: [],
    NONE: [],
  }
  for (const point of points) {
    buckets[classGroupKey(point.primary_class)].push(point)
  }
  return CLASS_GROUP_ORDER.filter((key) => buckets[key].length > 0).map(
    (key) => ({
      key,
      points: buckets[key],
    }),
  )
}

export function isCampaignPointVisible(
  point: CampaignPoint,
  hiddenClasses: ReadonlySet<ClassGroupKey>,
  hiddenAnalysisIds: ReadonlySet<string>,
): boolean {
  if (hiddenClasses.has(classGroupKey(point.primary_class))) {
    return false
  }
  return !hiddenAnalysisIds.has(point.analysis_id)
}

export function filterVisibleCampaignPoints(
  points: CampaignPoint[],
  hiddenClasses: ReadonlySet<ClassGroupKey>,
  hiddenAnalysisIds: ReadonlySet<string>,
): CampaignPoint[] {
  return points.filter((point) =>
    isCampaignPointVisible(point, hiddenClasses, hiddenAnalysisIds),
  )
}
