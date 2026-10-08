/**
 * The profile header, shared by all templates. Photo is OPTIONAL: it only
 * renders when the user both provided an avatar URL and left the image visible
 * in theme settings. Nothing is fabricated when there is no photo.
 */
import type { ProfileContent } from '../../../models';
import { safeImageUrl } from '../../../lib/sanitize';
import type { ResolvedTheme } from '../theme';
import styles from './ProfileHeader.module.css';

export interface ProfileHeaderProps {
  profile: ProfileContent;
  theme: ResolvedTheme;
  /** Visual emphasis: `lede` centers large (Quiet Studio), `inline` is compact. */
  variant?: 'lede' | 'stacked' | 'inline';
}

export function ProfileHeader({
  profile,
  theme,
  variant = 'stacked',
}: ProfileHeaderProps) {
  const avatarSrc = safeImageUrl(profile.avatarUrl);
  const showPhoto = theme.profileImage.show && Boolean(avatarSrc);
  return (
    <header className={`${styles.header} ${styles[variant]}`}>
      {showPhoto ? (
        <img
          className={styles.avatar}
          src={avatarSrc}
          alt={`Foto ${profile.fullName || 'profil'}`}
          loading="lazy"
        />
      ) : null}
      <div className={styles.text}>
        {profile.fullName ? (
          <h1 className={styles.name}>{profile.fullName}</h1>
        ) : null}
        {profile.headline ? (
          <p className={styles.headline}>{profile.headline}</p>
        ) : null}
        {profile.location ? (
          <p className={styles.location}>{profile.location}</p>
        ) : null}
        {profile.summary ? (
          <p className={styles.summary}>{profile.summary}</p>
        ) : null}
      </div>
    </header>
  );
}

export default ProfileHeader;
