import 'dotenv/config'
import { getExpandedContext } from '../lib/ai/context-builder'

async function main() {
  const queries = [
    'What do the elders say about country and connection?',
    'Tell me about Rachel and community control',
    'What does PICC do for young people?',
  ]

  for (const q of queries) {
    console.log('\n' + '═'.repeat(80))
    console.log('QUERY:', q)
    console.log('═'.repeat(80))
    const result = await getExpandedContext(q, { limit: 8, maxContextTokens: 15000 })

    const hasELSection = result.context.includes('Empathy Ledger Voices')
    console.log('Has EL section:', hasELSection)
    console.log('Total context length:', result.context.length, 'chars')
    console.log('Sources count:', result.sources.length)

    if (hasELSection) {
      const elStart = result.context.indexOf('## Empathy Ledger Voices')
      const elEnd = result.context.indexOf('\n##', elStart + 5)
      const elSection = result.context.substring(elStart, elEnd > 0 ? elEnd : elStart + 2000)
      console.log('\n--- EMPATHY LEDGER SECTION ---')
      console.log(elSection.substring(0, 1800))
    }

    console.log('\n--- TOP SOURCE TITLES ---')
    result.sources.slice(0, 8).forEach((s, i) => {
      console.log(`  ${i+1}. [${s.type}] ${s.title.substring(0, 100)}`)
    })
  }
}

main().catch(e => { console.error(e); process.exit(1) })
