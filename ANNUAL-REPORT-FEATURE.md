# Annual Report Generator - User Guide

## Overview

The Annual Report Generator is a powerful new feature that creates comprehensive, professional annual reports for the Palm Island Community Company (PICC). It analyzes all stories, storytellers, and community impact data to generate detailed insights and statistics.

---

## How to Access

### From the Dashboard:
1. Navigate to `http://localhost:3000/dashboard`
2. Click the **"Annual Report"** button in the top header (purple button)

### Direct URL:
- Navigate directly to: `http://localhost:3000/reports/annual`

---

## Features

### 📊 Comprehensive Statistics

The annual report includes:

1. **Executive Summary**
   - Total stories collected
   - Active storytellers count
   - People affected by stories
   - Year-over-year growth rate

2. **Story Breakdown**
   - Stories by category (health, youth, culture, family, etc.)
   - Stories by type (community story, elder wisdom, service success, etc.)
   - Visual percentage breakdowns with progress bars

3. **Monthly Timeline**
   - Story collection by month
   - Peak activity month highlighted
   - Visual trend analysis

4. **Cultural Impact**
   - Traditional knowledge stories count
   - Elder wisdom stories count
   - Elder contributors count
   - Cultural sensitivity distribution

5. **Community Engagement**
   - New storytellers this year
   - Average stories per storyteller
   - Total story views
   - Top 10 most active storytellers leaderboard

6. **Service Impact** (if applicable)
   - Stories by service area
   - People affected per service
   - Service effectiveness metrics

7. **Top Stories**
   - 10 most viewed stories
   - Story titles, authors, categories
   - View counts

8. **Key Insights**
   - Growth trend analysis
   - Most common story theme
   - Peak activity month
   - Average impact per story

---

## How to Use

### Selecting a Year

1. Use the **year dropdown** in the top header
2. Available years: 2020 to current year
3. Report automatically regenerates when you change the year

### Printing the Report

1. Click the **"Print"** button in the top header
2. Your browser's print dialog will open
3. Configure print settings:
   - Select your printer OR
   - Choose "Save as PDF" for digital copy
4. Click Print/Save

### Saving as PDF

**Method 1: PDF Button**
1. Click the **"PDF"** button in the top header
2. A dialog will explain how to save as PDF
3. Click OK to open print dialog
4. Select "Save as PDF" as the destination
5. Choose location and filename
6. Click Save

**Method 2: Print Dialog**
1. Click the **"Print"** button
2. In the print dialog, select "Save as PDF"
3. Save the file

### Print Optimization

The report is automatically optimized for printing:
- A4 portrait layout
- Professional margins
- Page breaks avoid splitting sections
- Colors preserved for visual impact
- Shadows removed for cleaner print
- Navigation and interactive elements hidden

---

## Report Content Details

### Summary Statistics Box

Four key metrics displayed prominently:
- **Stories Collected**: Total for the year
- **Active Storytellers**: Unique contributors
- **People Affected**: Community members impacted
- **Growth Rate**: Percentage change from previous year

### Stories by Category

Visual breakdown showing:
- Category name (Health, Youth, Culture, etc.)
- Number of stories in each category
- Percentage of total stories
- Color-coded progress bars

### Monthly Timeline

Month-by-month breakdown showing:
- Story count per month
- Visual bars for comparison
- Peak month highlighted in green

### Cultural Impact Section

Tracks cultural preservation:
- **Traditional Knowledge Stories**: Stories containing Indigenous knowledge
- **Elder Wisdom Stories**: Stories specifically from elders
- **Elder Contributors**: Number of elders who shared stories
- **Cultural Sensitivity Breakdown**: Distribution across sensitivity levels (low, medium, high, restricted)

### Community Engagement

Shows community participation:
- **New Storytellers**: First-time contributors this year
- **Average Stories per Storyteller**: Engagement metric
- **Total Views**: How many times stories were viewed
- **Top 10 Storytellers**: Leaderboard of most active contributors

### Service Impact

Demonstrates service effectiveness:
- Service name
- Number of stories per service
- People affected by each service
- Sorted by story count (most to least)

### Top Stories

Highlights most popular content:
- Ranking (1-10)
- Story title
- Author/storyteller name
- Category tag
- View count

### Key Insights

AI-generated insights including:
- **Growth Trend**: Whether storytelling increased or decreased
- **Most Common Theme**: Which category dominates
- **Peak Activity**: When storytelling was most active
- **Average Impact**: People affected per story on average

---

## Use Cases

### For PICC Leadership:
- Demonstrate community engagement to board
- Track storytelling trends over time
- Identify peak engagement periods
- Recognize active community members

### For Funders & Stakeholders:
- Professional reports for grant applications
- Evidence of community impact
- Cultural preservation metrics
- Service effectiveness documentation

### For Community:
- Celebrate storytelling achievements
- Recognize top contributors
- Track cultural knowledge preservation
- Understand community priorities

### For Planning:
- Identify which categories need more stories
- See which services are most documented
- Understand seasonal patterns
- Set goals for next year

---

## Technical Details

### API Endpoint

**URL**: `/api/annual-report?year=2024`

**Method**: GET

**Query Parameters**:
- `year` (optional): Year to generate report for (2020-current)
- Default: Current year if not specified

**Response**:
```json
{
  "success": true,
  "data": {
    "year": 2024,
    "summary": { ... },
    "storiesByCategory": { ... },
    "storiesByMonth": [ ... ],
    "culturalMetrics": { ... },
    "engagement": { ... },
    "impact": { ... },
    "featured": { ... },
    "insights": { ... }
  }
}
```

### Files Created

1. **`lib/annual-report/generator.ts`**
   - Core data generation logic
   - Queries Supabase for story data
   - Calculates all statistics and metrics
   - Exports `generateAnnualReport()` function

2. **`app/api/annual-report/route.ts`**
   - REST API endpoint
   - Validates year parameter
   - Returns JSON report data

3. **`app/reports/annual/page.tsx`**
   - React component for report UI
   - Year selector
   - Print/PDF export buttons
   - All visualizations and charts

4. **`app/reports/annual/print-styles.css`**
   - CSS for print optimization
   - A4 layout rules
   - Color preservation
   - Page break controls

### Data Sources

The report queries the following tables:
- **stories**: All story records
- **profiles**: Storyteller information

Filters applied:
- Organization ID: PICC only (`3c2011b9-f80d-4289-b300-0cd383cff479`)
- Date range: January 1 to December 31 of selected year

### Performance

- Report generation takes 2-5 seconds for typical year
- Caches storyteller data to avoid duplicate queries
- Optimized queries with proper indexing
- Client-side rendering for interactivity

---

## Troubleshooting

### Report Shows Zero Stories

**Possible Causes**:
1. No stories exist for that year in database
2. Stories not properly associated with PICC organization
3. Date filters excluding data

**Solutions**:
- Try a different year
- Check database has stories with correct `organization_id`
- Verify `created_at` dates are correct

### PDF Export Not Working

**Solutions**:
- Use Print button instead
- Update browser to latest version
- Try different browser (Chrome, Firefox, Safari)
- Check browser print dialog settings

### Storyteller Names Missing

**Possible Causes**:
- Stories not linked to storyteller profiles
- Storyteller data incomplete

**Solutions**:
- Verify `storyteller_id` field populated
- Check profiles table has complete data

### Slow Loading

**Possible Causes**:
- Large dataset (1000+ stories)
- Network latency
- Database query performance

**Solutions**:
- Wait for initial load (may take 5-10 seconds for large datasets)
- Refresh page if stuck
- Check network connection

---

## Future Enhancements

Potential additions for future versions:

1. **Multi-Year Comparison**
   - Compare 2-3 years side-by-side
   - Trend charts over time

2. **Custom Date Ranges**
   - Generate reports for any date range
   - Quarterly reports
   - Custom fiscal year support

3. **Filtering Options**
   - Filter by category
   - Filter by service
   - Filter by storyteller type (elders, youth)

4. **Export Formats**
   - Word document export
   - Excel data export
   - CSV download of raw data

5. **Visualizations**
   - Interactive charts and graphs
   - Heat maps for activity
   - Geographic distribution maps

6. **Sharing**
   - Email report functionality
   - Public share links
   - Embed in websites

7. **Automated Generation**
   - Schedule automatic report generation
   - Email reports to stakeholders
   - Archive historical reports

---

## Support

For issues or questions about the Annual Report feature:

1. Check this documentation first
2. Verify data exists for selected year
3. Test with different year to isolate issue
4. Check browser console for error messages

---

## Example Workflow

### Generating 2024 Annual Report for Board Meeting:

1. Navigate to Dashboard
2. Click "Annual Report" button
3. Confirm 2024 is selected in year dropdown
4. Wait for report to load (2-5 seconds)
5. Review all sections for accuracy
6. Click "PDF" button
7. Select "Save as PDF" in print dialog
8. Save as: `PICC_Annual_Report_2024.pdf`
9. Attach to board meeting agenda
10. Print physical copies if needed

### Comparing Year-Over-Year Growth:

1. Generate report for 2024 (note key metrics)
2. Change year dropdown to 2023
3. Compare:
   - Total stories (growth rate shown)
   - New storytellers
   - Category distribution changes
   - Engagement trends
4. Document insights for planning

---

## Benefits Summary

✅ **Time Saving**: Generate professional reports in seconds (vs. hours of manual work)

✅ **Data Accuracy**: Pulls directly from database, no manual calculations

✅ **Professional Quality**: Beautiful, print-ready formatting

✅ **Comprehensive**: All metrics in one place

✅ **Flexible**: Any year, instant PDF export

✅ **Insightful**: Automated trend analysis and key insights

✅ **Community-Focused**: Celebrates contributors and impact

✅ **Culturally Appropriate**: Tracks traditional knowledge and elder wisdom

---

**Generated**: November 2025
**Feature Version**: 1.0
**Platform**: Palm Island Community Repository
