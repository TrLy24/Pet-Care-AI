/**
 * PawCare AI — Lightweight Markdown Renderer
 *
 * Renders a subset of Markdown into native React Native Text components.
 * Supported syntax:
 *   - **bold**
 *   - *italic*
 *   - # H1 / ## H2 / ### H3 (heading lines)
 *   - 1. numbered list / - bullet list
 *   - --- horizontal divider
 *   - Blank lines become spacing
 *
 * No external packages needed — works in Expo Go.
 */
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useAppTheme } from '@/presentation/theme';
import { FontFamily } from '@/presentation/theme/typography';

interface Props {
  content: string;
  textColor?: string;
  /** Scale factor for base font size (default 1) */
  scale?: number;
}

type InlineSegment =
  | { type: 'text'; value: string }
  | { type: 'bold'; value: string }
  | { type: 'italic'; value: string }
  | { type: 'bold-italic'; value: string };

/** Parse a single line string into inline segments: bold, italic, bold-italic, plain */
function parseInline(raw: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  // Pattern: bold-italic (***), bold (**), italic (*)
  const pattern = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(raw)) !== null) {
    if (match.index > last) {
      segments.push({ type: 'text', value: raw.slice(last, match.index) });
    }
    if (match[2] !== undefined) {
      segments.push({ type: 'bold-italic', value: match[2] });
    } else if (match[3] !== undefined) {
      segments.push({ type: 'bold', value: match[3] });
    } else if (match[4] !== undefined) {
      segments.push({ type: 'italic', value: match[4] });
    }
    last = match.index + match[0].length;
  }

  if (last < raw.length) {
    segments.push({ type: 'text', value: raw.slice(last) });
  }

  return segments;
}

export function MarkdownText({ content, textColor, scale = 1 }: Props) {
  const { colors, typography: typo } = useAppTheme();
  const baseColor = textColor || colors.text;
  const baseFontSize = 15 * scale;
  const baseLineHeight = 23 * scale;

  const lines = content.split('\n');

  const renderInline = (line: string, key: string | number, extraStyle?: object) => {
    const segments = parseInline(line);
    return (
      <Text key={key} style={[{ color: baseColor, fontSize: baseFontSize, lineHeight: baseLineHeight, fontFamily: FontFamily.body }, extraStyle]}>
        {segments.map((seg, i) => {
          switch (seg.type) {
            case 'bold':
              return (
                <Text key={i} style={{ fontFamily: FontFamily.bodyBold, fontWeight: '700', color: baseColor }}>
                  {seg.value}
                </Text>
              );
            case 'italic':
              return (
                <Text key={i} style={{ fontStyle: 'italic', color: baseColor }}>
                  {seg.value}
                </Text>
              );
            case 'bold-italic':
              return (
                <Text key={i} style={{ fontFamily: FontFamily.bodyBold, fontWeight: '700', fontStyle: 'italic', color: baseColor }}>
                  {seg.value}
                </Text>
              );
            default:
              return <Text key={i} style={{ fontFamily: FontFamily.body }}>{seg.value}</Text>;
          }
        })}
      </Text>
    );
  };

  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const trimmed = raw.trim();

    // Blank line → small spacer
    if (trimmed === '') {
      nodes.push(<View key={`space-${i}`} style={{ height: 6 }} />);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(trimmed)) {
      nodes.push(
        <View
          key={`hr-${i}`}
          style={[styles.hr, { backgroundColor: colors.border }]}
        />
      );
      i++;
      continue;
    }

    // Headings
    const h3 = trimmed.match(/^###\s+(.+)/);
    const h2 = trimmed.match(/^##\s+(.+)/);
    const h1 = trimmed.match(/^#\s+(.+)/);

    if (h1) {
      nodes.push(
        renderInline(h1[1], `h1-${i}`, {
          fontSize: 18 * scale,
          fontFamily: FontFamily.heading,
          fontWeight: '700',
          lineHeight: 26 * scale,
          marginTop: 8,
          marginBottom: 2,
          color: baseColor,
        })
      );
      i++;
      continue;
    }
    if (h2) {
      nodes.push(
        renderInline(h2[1], `h2-${i}`, {
          fontSize: 16 * scale,
          fontFamily: FontFamily.headingSemiBold,
          fontWeight: '600',
          lineHeight: 24 * scale,
          marginTop: 6,
          marginBottom: 2,
          color: baseColor,
        })
      );
      i++;
      continue;
    }
    if (h3) {
      nodes.push(
        renderInline(h3[1], `h3-${i}`, {
          fontSize: 14.5 * scale,
          fontFamily: FontFamily.headingSemiBold,
          fontWeight: '600',
          lineHeight: 22 * scale,
          marginTop: 4,
          marginBottom: 1,
          color: baseColor,
        })
      );
      i++;
      continue;
    }

    // Numbered list item:  1. text  or  1) text
    const numMatch = trimmed.match(/^(\d+)[.)]\s+(.+)/);
    if (numMatch) {
      nodes.push(
        <View key={`num-${i}`} style={styles.listRow}>
          <Text style={[styles.listBullet, { color: baseColor, fontSize: baseFontSize }]}>
            {numMatch[1]}.
          </Text>
          <View style={styles.listContent}>
            {renderInline(numMatch[2], `num-content-${i}`, {
              color: baseColor,
              fontSize: baseFontSize,
              lineHeight: baseLineHeight,
            })}
          </View>
        </View>
      );
      i++;
      continue;
    }

    // Bullet list item:  - text  or  * text  or  • text
    const bulletMatch = trimmed.match(/^[-*•]\s+(.+)/);
    if (bulletMatch) {
      nodes.push(
        <View key={`bullet-${i}`} style={styles.listRow}>
          <Text style={[styles.listBullet, { color: colors.primary, fontSize: baseFontSize }]}>
            •
          </Text>
          <View style={styles.listContent}>
            {renderInline(bulletMatch[1], `bullet-content-${i}`, {
              color: baseColor,
              fontSize: baseFontSize,
              lineHeight: baseLineHeight,
            })}
          </View>
        </View>
      );
      i++;
      continue;
    }

    // Indented sub-bullet (starts with spaces/tabs then * or -)
    const subBulletMatch = raw.match(/^(\s{2,}|\t)[-*]\s+(.+)/);
    if (subBulletMatch) {
      nodes.push(
        <View key={`sub-${i}`} style={[styles.listRow, { paddingLeft: 20 }]}>
          <Text style={[styles.listBullet, { color: colors.textSecondary, fontSize: (baseFontSize - 1) }]}>
            ◦
          </Text>
          <View style={styles.listContent}>
            {renderInline(subBulletMatch[2], `sub-content-${i}`, {
              color: baseColor,
              fontSize: (baseFontSize - 1),
              lineHeight: baseLineHeight,
            })}
          </View>
        </View>
      );
      i++;
      continue;
    }

    // Regular paragraph line
    nodes.push(renderInline(trimmed, `p-${i}`));
    i++;
  }

  return <View style={styles.container}>{nodes}</View>;
}

const styles = StyleSheet.create({
  container: {
    flexShrink: 1,
  },
  hr: {
    height: 1,
    marginVertical: 8,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 1,
  },
  listBullet: {
    width: 22,
    flexShrink: 0,
    fontWeight: '700',
  },
  listContent: {
    flex: 1,
  },
});

