/**
 * Style Dictionary v4 config — emits Tailwind, PDF, and CSS from
 * `tokens/picc.tokens.json` (DTCG format, generated from Pencil variables).
 *
 * Three platforms:
 *   - tailwind → lib/design-tokens/tailwind-tokens.js (CommonJS module)
 *   - pdf      → lib/design-tokens/pdf-tokens.ts      (TS module)
 *   - css      → app/design-tokens.css                 (CSS custom properties)
 *
 * Token kebab-case at the leaf level becomes camelCase / dot-paths in TS, and
 * `--token-section-health` etc. in CSS. The DTCG values carry their unit, so
 * `dimension` tokens emit as `<n>px` for CSS, raw number for JS.
 */
import StyleDictionary from 'style-dictionary'

// ─── Custom transforms ────────────────────────────────────────────────────────

// Treat `dimension` tokens (spacing, fontSize) as pixel values where needed.
StyleDictionary.registerTransform({
  name: 'size/px',
  type: 'value',
  filter: (token) => token.$type === 'dimension' && typeof token.$value === 'number',
  transform: (token) => `${token.$value}px`,
})

// Tailwind: nested colors {brand:{ocean…}, section:{health…}, neutral:{pageBg…}},
// flat spacing/fontSize, flat fontFamily. Keys camelCased so `bg-brand-starGold`
// behaves identically to existing `picc-*` naming convention in the codebase.
StyleDictionary.registerFormat({
  name: 'tailwind/cjs',
  format: ({ dictionary }) => {
    const out = { colors: {}, spacing: {}, fontSize: {}, fontFamily: {} }
    for (const t of dictionary.allTokens) {
      const path = t.path
      if (path[0] === 'color') {
        const group = path[1]                                  // brand | section | neutral
        const leaf = path[2].replace(/[_-](\w)/g, (_, c) => c.toUpperCase())
        out.colors[group] = out.colors[group] ?? {}
        out.colors[group][leaf] = t.$value
      } else if (path[0] === 'spacing') {
        out.spacing[path[1]] = `${t.$value}px`
      } else if (path[0] === 'typography' && path[1] === 'fontSize') {
        out.fontSize[path[2]] = `${t.$value}px`
      } else if (path[0] === 'typography' && path[1] === 'fontFamily') {
        out.fontFamily[path[2]] = t.$value
      }
    }
    return [
      '/** Auto-generated from tokens/picc.tokens.json. Do not edit. */',
      `module.exports = ${JSON.stringify(out, null, 2)};`,
      '',
    ].join('\n')
  },
})

// PDF theme: typed TS module exporting structured token tree.
StyleDictionary.registerFormat({
  name: 'pdf/ts',
  format: ({ dictionary }) => {
    const tree = {}
    const set = (path, value) => {
      let cursor = tree
      for (let i = 0; i < path.length - 1; i++) {
        cursor[path[i]] = cursor[path[i]] ?? {}
        cursor = cursor[path[i]]
      }
      cursor[path[path.length - 1]] = value
    }
    for (const t of dictionary.allTokens) {
      const v = t.$type === 'dimension' && typeof t.$value === 'number' ? t.$value : t.$value
      set(t.path, v)
    }
    return [
      '/** Auto-generated from tokens/picc.tokens.json. Do not edit. */',
      'export const tokens = ' + JSON.stringify(tree, null, 2) + ' as const;',
      '',
      'export type Tokens = typeof tokens;',
      '',
    ].join('\n')
  },
})

export default {
  source: ['tokens/picc.tokens.json'],
  log: { warnings: 'disabled' },
  platforms: {
    tailwind: {
      buildPath: 'lib/design-tokens/',
      files: [
        { destination: 'tailwind-tokens.js', format: 'tailwind/cjs' },
      ],
    },
    pdf: {
      buildPath: 'lib/design-tokens/',
      files: [
        { destination: 'pdf-tokens.ts', format: 'pdf/ts' },
      ],
    },
    css: {
      // Skip the default 'css' transformGroup because it includes size/rem.
      // Use just attribute/cti + name/kebab + our size/px override.
      transforms: ['attribute/cti', 'name/kebab', 'color/css', 'size/px'],
      buildPath: 'app/',
      files: [
        {
          destination: 'design-tokens.css',
          format: 'css/variables',
          options: { selector: ':root', outputReferences: false },
        },
      ],
    },
  },
}
