#!/usr/bin/env node
/**
 * Run Style Dictionary v4 against tokens/style-dictionary.config.mjs.
 * Outputs:
 *   - lib/design-tokens/tailwind-tokens.js
 *   - lib/design-tokens/pdf-tokens.ts
 *   - app/design-tokens.css
 */
import StyleDictionary from 'style-dictionary'
import config from '../tokens/style-dictionary.config.mjs'

const sd = new StyleDictionary(config)
await sd.buildAllPlatforms()
console.log('✓ tokens built')
