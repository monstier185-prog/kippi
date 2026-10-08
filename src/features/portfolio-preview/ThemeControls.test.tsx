import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import type {
  PortfolioSection,
  TemplateId,
  ThemeConfig,
} from '../../models';
import { ThemeControls } from './ThemeControls';
import { DEFAULT_THEME, resetThemeConfig } from './theme';
import { makeTheme } from './testFixtures';

const SECTIONS: PortfolioSection[] = [
  {
    id: 'sec-profile',
    position: 0,
    isVisible: true,
    type: 'profile',
    content: { fullName: 'Dewi' },
  },
  {
    id: 'sec-about',
    position: 1,
    isVisible: true,
    type: 'about',
    content: { body: 'Halo' },
  },
];

/** A small stateful host so the controlled controls behave like in the editor. */
function Harness({
  initialTheme,
  initialTemplate = 'editorial',
}: {
  initialTheme: ThemeConfig;
  initialTemplate?: TemplateId;
}) {
  const [theme, setTheme] = useState<ThemeConfig>(initialTheme);
  const [templateId, setTemplateId] = useState<string>(initialTemplate);
  const [sections, setSections] = useState<PortfolioSection[]>(SECTIONS);

  return (
    <>
      <ThemeControls
        templateId={templateId}
        theme={theme}
        sections={sections}
        onTemplateChange={(t) => {
          setTemplateId(t);
          setTheme((prev) => ({ ...prev, templateId: t }));
        }}
        onThemeChange={setTheme}
        onToggleSection={(id) =>
          setSections((prev) =>
            prev.map((s) =>
              s.id === id ? { ...s, isVisible: !s.isVisible } : s,
            ),
          )
        }
        onReset={() => setTheme((prev) => resetThemeConfig(prev))}
      />
      {/* Probes for assertions. */}
      <output data-testid="accent">{theme.accent}</output>
      <output data-testid="typography">{theme.typography}</output>
      <output data-testid="spacing">{theme.spacingDensity}</output>
      <output data-testid="template">{templateId}</output>
      <output data-testid="about-visible">
        {String(sections.find((s) => s.id === 'sec-about')?.isVisible)}
      </output>
    </>
  );
}

describe('ThemeControls', () => {
  it('changing accent updates the theme and keeps other theme data', async () => {
    const user = userEvent.setup();
    render(<Harness initialTheme={makeTheme({ typography: 'humanist' })} />);

    await user.click(screen.getByRole('radio', { name: 'Teal' }));

    expect(screen.getByTestId('accent')).toHaveTextContent('teal');
    // The unrelated typography choice is preserved (no data dropped).
    expect(screen.getByTestId('typography')).toHaveTextContent('humanist');
  });

  it('changing the template preserves theme fields', async () => {
    const user = userEvent.setup();
    render(<Harness initialTheme={makeTheme({ accent: 'plum' })} />);

    await user.click(screen.getByRole('radio', { name: /Structured/ }));

    expect(screen.getByTestId('template')).toHaveTextContent('structured');
    // Accent (and the rest of the theme) survives the template switch.
    expect(screen.getByTestId('accent')).toHaveTextContent('plum');
  });

  it('reset-to-default restores the sensible defaults', async () => {
    const user = userEvent.setup();
    render(
      <Harness
        initialTheme={makeTheme({
          accent: 'plum',
          typography: 'mono-accent',
          spacingDensity: 'spacious',
        })}
      />,
    );

    expect(screen.getByTestId('accent')).toHaveTextContent('plum');
    await user.click(screen.getByRole('button', { name: 'Reset ke bawaan' }));

    expect(screen.getByTestId('accent')).toHaveTextContent(DEFAULT_THEME.accent);
    expect(screen.getByTestId('typography')).toHaveTextContent(
      DEFAULT_THEME.typography,
    );
    expect(screen.getByTestId('spacing')).toHaveTextContent(
      DEFAULT_THEME.spacingDensity,
    );
  });

  it('toggles section visibility (a layout option)', async () => {
    const user = userEvent.setup();
    render(<Harness initialTheme={makeTheme()} />);

    expect(screen.getByTestId('about-visible')).toHaveTextContent('true');
    await user.click(screen.getByRole('switch', { name: 'Tentang' }));
    expect(screen.getByTestId('about-visible')).toHaveTextContent('false');
  });
});
