/**
 * Extract Historical Data from Annual Report PDFs
 * 
 * Extracts staff numbers, financials, board members, and achievements
 * from 2009-2019 annual reports to fill data gaps
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Fiscal years to extract (missing from staff_statistics)
const TARGET_YEARS = [
  '2009-10', '2010-11', '2011-12', '2012-13', '2013-14',
  '2014-15', '2015-16', '2016-17', '2017-18', '2018-19'
];

interface ExtractedYearData {
  fiscal_year: string;
  staff_count?: number;
  indigenous_staff_count?: number;
  indigenous_percentage?: number;
  total_income?: number;
  total_expenditure?: number;
  board_members: string[];
  key_achievements: string[];
  services_mentioned: string[];
  confidence_score: number;
  extraction_notes: string[];
}

// Regex patterns for data extraction
const PATTERNS = {
  staff: [
    /(\d+)\s+(?:full[-\s]?time|FTE|total)\s+staff/i,
    /staff\s+(?:numbers?|count|total)[\s:]*(\d+)/i,
    /employs?\s+(\d+)\s+(?:staff|people|workers|employees)/i,
    /(?:workforce|employees)[\s:]*(\d+)/i,
    /(\d+)\s+(?:staff|employees)\s+(?:work|employed)/i
  ],
  indigenous: [
    /(\d+)%?\s+(?:Aboriginal|Indigenous|Torres Strait|TSI)/i,
    /(?:Aboriginal|Indigenous)\s+(?:staff|employment)[\s:]*(\d+)%?/i,
    /(\d+)%?\s+of\s+staff\s+(?:are|identify\s+as)/i,
    /(\d+)\s+(?:Aboriginal|Indigenous)\s+staff/i
  ],
  income: [
    /Total\s+(?:Income|Revenue)[\s:$]*([\d,\.]+)/i,
    /(?:Income|Revenue)[\s:$]*([\d,\.]+)\s+(?:million|m)/i,
    /\$([\d,\.]+)\s+(?:income|revenue)/i
  ],
  expenditure: [
    /Total\s+Expenditure[\s:$]*([\d,\.]+)/i,
    /Expenditure[\s:$]*([\d,\.]+)\s+(?:million|m)/i,
    /Expenses[\s:$]*([\d,\.]+)/i,
    /\$([\d,\.]+)\s+(?:expenditure|expenses)/i
  ],
  board: [
    /Board\s+of\s+Directors[\s\S]*?(?=\n\n|Management|Staff)/i,
    /Directors[\s\S]{0,800}(?=\n\n|Management)/i,
    /Governance[\s\S]{0,500}Board/i
  ],
  achievements: [
    /(?:Key\s+)?Achievements?[\s\S]*?(?=\n\n|Financial|Service)/i,
    /Highlights[\s\S]*?(?=\n\n|Financial)/i,
    /Milestones?[\s\S]*?(?=\n\n|Financial)/i
  ]
};

async function extractTextFromKnowledgeBase(fiscalYear: string): Promise<string | null> {
  // Try to get extracted text from knowledge_entries
  const { data, error } = await supabase
    .from('knowledge_entries')
    .select('content, summary')
    .eq('slug', `picc-annual-report-${fiscalYear}-full-pdf`)
    .single();
  
  if (error || !data) {
    console.log(`  No knowledge entry found for ${fiscalYear}`);
    return null;
  }
  
  return data.content || data.summary || null;
}

function extractWithPatterns(text: string, patterns: RegExp[]): { value: string | null; pattern: string } {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return { value: match[1].trim(), pattern: pattern.toString() };
    }
  }
  return { value: null, pattern: '' };
}

function cleanNumber(value: string): number | undefined {
  if (!value) return undefined;
  // Remove commas, spaces, and extract number
  const cleaned = value.replace(/[\s,]/g, '').replace(/[^\d.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
}

function extractNames(text: string): string[] {
  if (!text) return [];
  
  // Look for name patterns (Title Case words)
  const namePattern = /\b[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
  const matches = text.match(namePattern) || [];
  
  // Filter out common non-name words
  const excludeWords = ['Board', 'Directors', 'Management', 'Staff', 'Financial', 
    'Report', 'Annual', 'Palm', 'Island', 'Community', 'Company'];
  
  return matches.filter(name => 
    !excludeWords.some(ex => name.includes(ex)) &&
    name.split(' ').length >= 2
  ).slice(0, 10); // Limit to top 10
}

function extractBulletPoints(text: string): string[] {
  if (!text) return [];
  
  // Look for bullet points or numbered lists
  const bulletPattern = /(?:^|\n)[•\-\*\d\.]+\s*([^\n]+)/g;
  const matches = [];
  let match;
  
  while ((match = bulletPattern.exec(text)) !== null) {
    if (match[1] && match[1].trim().length > 10) {
      matches.push(match[1].trim());
    }
  }
  
  return matches.slice(0, 8); // Top 8 achievements
}

async function extractYearData(fiscalYear: string): Promise<ExtractedYearData> {
  console.log(`\n📄 Extracting data for ${fiscalYear}...`);
  
  const text = await extractTextFromKnowledgeBase(fiscalYear);
  
  if (!text) {
    return {
      fiscal_year: fiscalYear,
      board_members: [],
      key_achievements: [],
      services_mentioned: [],
      confidence_score: 0,
      extraction_notes: ['No text available in knowledge base']
    };
  }
  
  const notes: string[] = [];
  
  // Extract staff count
  const staffResult = extractWithPatterns(text, PATTERNS.staff);
  const staff_count = cleanNumber(staffResult.value || '');
  if (staff_count) notes.push(`Staff found using pattern: ${staffResult.pattern.substring(0, 50)}...`);
  
  // Extract indigenous count/percentage
  const indigenousResult = extractWithPatterns(text, PATTERNS.indigenous);
  let indigenous_staff_count: number | undefined;
  let indigenous_percentage: number | undefined;
  
  if (indigenousResult.value) {
    const val = cleanNumber(indigenousResult.value);
    if (val) {
      if (val <= 100) {
        indigenous_percentage = val;
        if (staff_count) {
          indigenous_staff_count = Math.round(staff_count * (val / 100));
        }
        notes.push(`Indigenous percentage: ${val}%`);
      } else {
        indigenous_staff_count = val;
        if (staff_count) {
          indigenous_percentage = Math.round((val / staff_count) * 100);
        }
        notes.push(`Indigenous staff count: ${val}`);
      }
    }
  }
  
  // Extract financials
  const incomeResult = extractWithPatterns(text, PATTERNS.income);
  const total_income = cleanNumber(incomeResult.value || '');
  if (total_income) notes.push(`Income: $${total_income.toLocaleString()}`);
  
  const expResult = extractWithPatterns(text, PATTERNS.expenditure);
  const total_expenditure = cleanNumber(expResult.value || '');
  if (total_expenditure) notes.push(`Expenditure: $${total_expenditure.toLocaleString()}`);
  
  // Extract board members
  const boardResult = extractWithPatterns(text, PATTERNS.board);
  const board_text = boardResult.value || '';
  const board_members = extractNames(board_text);
  if (board_members.length > 0) notes.push(`Found ${board_members.length} potential board members`);
  
  // Extract achievements
  const achievementResult = extractWithPatterns(text, PATTERNS.achievements);
  const achievement_text = achievementResult.value || '';
  const key_achievements = extractBulletPoints(achievement_text);
  if (key_achievements.length > 0) notes.push(`Found ${key_achievements.length} achievements`);
  
  // Calculate confidence score
  let confidence_score = 0;
  if (staff_count) confidence_score += 25;
  if (indigenous_percentage || indigenous_staff_count) confidence_score += 25;
  if (total_income) confidence_score += 20;
  if (board_members.length > 0) confidence_score += 15;
  if (key_achievements.length > 0) confidence_score += 15;
  
  return {
    fiscal_year: fiscalYear,
    staff_count,
    indigenous_staff_count,
    indigenous_percentage,
    total_income,
    total_expenditure,
    board_members,
    key_achievements,
    services_mentioned: [], // Would need more specific extraction
    confidence_score,
    extraction_notes: notes
  };
}

async function saveToDatabase(data: ExtractedYearData) {
  const year = parseInt(data.fiscal_year.split('-')[0]);
  
  // Check if record already exists
  const { data: existing } = await supabase
    .from('staff_statistics')
    .select('*')
    .eq('year', year)
    .single();
  
  if (existing) {
    console.log(`  Record for ${year} already exists, skipping...`);
    return;
  }
  
  // Save to staff_statistics
  if (data.staff_count) {
    const { error } = await supabase.from('staff_statistics').insert({
      year,
      total_staff: data.staff_count,
      indigenous_staff: data.indigenous_staff_count,
      palm_island_residents: undefined, // Not extracted yet
      source: 'pdf-extraction',
      extraction_confidence: data.confidence_score,
      extracted_at: new Date().toISOString()
    });
    
    if (error) {
      console.error(`  Error saving staff data for ${year}:`, error);
    } else {
      console.log(`  ✓ Saved staff data for ${year}`);
    }
  }
  
  // Save to annual_financials if we have data
  if (data.total_income || data.total_expenditure) {
    const { error } = await supabase.from('annual_financials').insert({
      fiscal_year: data.fiscal_year,
      year_start: `${year}-07-01`,
      year_end: `${year + 1}-06-30`,
      total_income: data.total_income,
      total_expenditure: data.total_expenditure,
      source: 'pdf-extraction',
      extraction_confidence: data.confidence_score,
      extracted_at: new Date().toISOString()
    });
    
    if (error) {
      console.error(`  Error saving financial data for ${data.fiscal_year}:`, error);
    } else {
      console.log(`  ✓ Saved financial data for ${data.fiscal_year}`);
    }
  }
  
  // Save extraction log
  await supabase.from('data_extraction_log').insert({
    fiscal_year: data.fiscal_year,
    table_affected: 'staff_statistics, annual_financials',
    records_extracted: (data.staff_count ? 1 : 0) + (data.total_income ? 1 : 0),
    confidence_score: data.confidence_score,
    extraction_notes: data.extraction_notes.join('\n'),
    extracted_at: new Date().toISOString()
  });
}

async function main() {
  console.log('='.repeat(60));
  console.log('📊 HISTORICAL DATA EXTRACTION');
  console.log('Extracting 2009-2019 data from annual reports');
  console.log('='.repeat(60));
  
  const results: ExtractedYearData[] = [];
  
  for (const year of TARGET_YEARS) {
    const data = await extractYearData(year);
    results.push(data);
    
    // Display summary
    console.log(`  Staff: ${data.staff_count || 'N/A'}`);
    console.log(`  Indigenous: ${data.indigenous_percentage || data.indigenous_staff_count || 'N/A'}${data.indigenous_percentage ? '%' : ''}`);
    console.log(`  Income: ${data.total_income ? '$' + data.total_income.toLocaleString() : 'N/A'}`);
    console.log(`  Board: ${data.board_members.length} members detected`);
    console.log(`  Achievements: ${data.key_achievements.length} found`);
    console.log(`  Confidence: ${data.confidence_score}%`);
    
    // Save to database if confidence is reasonable
    if (data.confidence_score >= 30) {
      await saveToDatabase(data);
    } else {
      console.log(`  ⚠ Low confidence (${data.confidence_score}%), manual review needed`);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📈 EXTRACTION SUMMARY');
  console.log('='.repeat(60));
  
  const withStaff = results.filter(r => r.staff_count).length;
  const withIndigenous = results.filter(r => r.indigenous_staff_count || r.indigenous_percentage).length;
  const withFinancial = results.filter(r => r.total_income).length;
  const avgConfidence = results.reduce((sum, r) => sum + r.confidence_score, 0) / results.length;
  
  console.log(`\nYears processed: ${results.length}`);
  console.log(`With staff data: ${withStaff}`);
  console.log(`With indigenous data: ${withIndigenous}`);
  console.log(`With financial data: ${withFinancial}`);
  console.log(`Average confidence: ${avgConfidence.toFixed(1)}%`);
  
  console.log('\n✅ Extraction complete!');
  console.log('Review data_extraction_log table for details.');
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
