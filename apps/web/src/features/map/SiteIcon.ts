import styles from './SiteIcon.module.css';

const treatments: Record<string, string | undefined> = {
  'Thin record': styles.dotted,
  'Growing record': styles.dashed,
  'Well documented': styles.solid,
  'Richly documented': styles.double,
};

export function siteIconClass(integrityLabel: string) {
  return [styles.icon, treatments[integrityLabel] ?? styles.solid]
    .filter(Boolean)
    .join(' ');
}
