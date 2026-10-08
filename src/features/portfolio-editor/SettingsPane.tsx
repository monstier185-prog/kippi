/**
 * The "Settings" pane: edit the document title and the privacy/publication
 * status. Private is the default for every portfolio (private by default);
 * this pane only exposes the choice honestly and never implies hosting that
 * does not exist (local-first).
 */
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import type {
  PortfolioSection,
  PublicationStatus,
  TemplateId,
  ThemeConfig,
} from '../../models';
import { ThemeControls } from '../portfolio-preview/ThemeControls';
import styles from './SettingsPane.module.css';

export interface SettingsPaneProps {
  title: string;
  onTitleChange: (title: string) => void;
  status: PublicationStatus;
  onStatusChange: (status: PublicationStatus) => void;
  titleError?: string;
  templateId: string;
  themeConfig: ThemeConfig;
  sections: PortfolioSection[];
  onTemplateChange: (templateId: TemplateId) => void;
  onThemeChange: (theme: ThemeConfig) => void;
  onToggleSection: (sectionId: string) => void;
  onResetTheme: () => void;
}

const STATUS_OPTIONS = [
  { value: 'private', label: 'Private — hanya kamu yang bisa melihat' },
  { value: 'draft', label: 'Draft — sedang dikerjakan' },
  { value: 'published', label: 'Published — siap dibagikan' },
];

export function SettingsPane({
  title,
  onTitleChange,
  status,
  onStatusChange,
  titleError,
  templateId,
  themeConfig,
  sections,
  onTemplateChange,
  onThemeChange,
  onToggleSection,
  onResetTheme,
}: SettingsPaneProps) {
  return (
    <div className={styles.pane}>
      <Input
        label="Nama dokumen"
        required
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Contoh: Portfolio Dewi Lestari"
        error={titleError}
      />
      <Select
        label="Privasi"
        hint="Portfolio bersifat privat secara bawaan dan tersimpan di browser ini."
        options={STATUS_OPTIONS}
        value={status}
        onChange={(e) => onStatusChange(e.target.value as PublicationStatus)}
      />
      <ThemeControls
        templateId={templateId}
        theme={themeConfig}
        sections={sections}
        onTemplateChange={onTemplateChange}
        onThemeChange={onThemeChange}
        onToggleSection={onToggleSection}
        onReset={onResetTheme}
      />
    </div>
  );
}

export default SettingsPane;
