# Annual Report System - Test Walkthrough

## Prerequisites

Before testing, ensure you have:

1. **Run the RLS Policies SQL** - Execute `FIX_RLS_POLICIES.sql` in your Supabase SQL Editor
2. **Start the development server** - Run `npm run dev` in the web-platform directory
3. **Have data in the database** - Run `/api/debug-data` to verify you have data

---

## Quick Verification Checklist

Visit these URLs to quickly verify the system is working:

| URL | Expected Result |
|-----|----------------|
| `http://localhost:3000/api/debug-data` | Shows counts for organizations, profiles, stories, reports |
| `http://localhost:3000/api/stories?status=published` | Returns list of published stories with storyteller names |
| `http://localhost:3000/api/annual-reports` | Returns list of annual reports |
| `http://localhost:3000/api/impact-stats` | Returns impact statistics |

---

## Test Walkthrough

### Step 1: Verify API Endpoints

Open your browser and test:

1. **Debug Data API**
   - URL: `http://localhost:3000/api/debug-data`
   - Should show:
     - Organizations count (should be 2+)
     - Profiles count (should be 90+)
     - Stories count (should be 30+)
     - Annual reports count (should be 2+)

2. **Stories API**
   - URL: `http://localhost:3000/api/stories?status=published`
   - Should return stories with:
     - `storyteller_name` (actual names, not "Community Member")
     - `is_elder` boolean
     - `quality_score` values
     - `category` information

---

### Step 2: Test Annual Reports Dashboard

1. Navigate to: `http://localhost:3000/picc/annual-reports`

2. **Verify Page Loads**:
   - [ ] Page loads without errors
   - [ ] Quick stats cards show correct counts
   - [ ] "All Reports" tab shows existing reports (2+)
   - [ ] "Report-Ready Stories" tab shows published stories

3. **Test Reports Tab**:
   - [ ] Reports display with title, year, status badge
   - [ ] Hover over report to see action buttons appear
   - [ ] Click View to see report details
   - [ ] Status badges show correct colors (Draft=yellow, Published=purple)

4. **Test Stories Tab**:
   - [ ] Stories display with storyteller names (not "Community Member")
   - [ ] Elder stories show "Elder Story" badge in yellow
   - [ ] Quality scores display with color coding
   - [ ] If elder stories exist, summary banner shows count

5. **Test Refresh**:
   - [ ] Click Refresh button
   - [ ] Spinner appears while loading
   - [ ] Data reloads successfully

---

### Step 3: Test Reports List Page

1. Navigate to: `http://localhost:3000/picc/reports`

2. **Verify Page Loads**:
   - [ ] Header shows with "Reports" title
   - [ ] "Annual Reports" tab is active by default
   - [ ] Reports count badge shows in tab
   - [ ] Filter dropdown works

3. **Test Filtering**:
   - [ ] Select "Drafts" - only draft reports show
   - [ ] Select "Published" - only published reports show
   - [ ] Select "All Reports" - all reports show

4. **Test Report Cards**:
   - [ ] Each report shows title, status, year
   - [ ] Theme badge appears if set
   - [ ] Statistics (stories count, storytellers count) display
   - [ ] Dates formatted correctly (en-AU format)
   - [ ] Action buttons: View, Edit, Delete

5. **Test Quick Exports Tab**:
   - [ ] Switch to Quick Exports tab
   - [ ] Report type selection works
   - [ ] Date range pickers work
   - [ ] Quick select buttons (Last Month, Last Quarter, This Year) set dates
   - [ ] Format dropdown appears after selecting report type
   - [ ] Generate button enabled when all fields filled

---

### Step 4: Test Report Generator

1. Navigate to: `http://localhost:3000/picc/report-generator`

2. **Verify Page Loads**:
   - [ ] Page loads without "loading forever" issue
   - [ ] Stories load in the left panel
   - [ ] Configuration panel on right is visible

3. **Test Story Loading**:
   - [ ] Stories display with titles
   - [ ] Storyteller names show (not "Community Member")
   - [ ] Elder stories marked with yellow badge
   - [ ] Auto-Include stories have purple background
   - [ ] Report-Worthy stories have amber background

4. **Test Filtering**:
   - [ ] Date range filter works
   - [ ] Category dropdown shows categories
   - [ ] Filtering updates story list
   - [ ] "Clear Filters" button resets all filters

5. **Test Story Selection**:
   - [ ] Click on a story to select it
   - [ ] Selected stories have check mark
   - [ ] Selection count updates
   - [ ] "Selection Summary" shows algorithm stats

6. **Test Report Configuration**:
   - [ ] Enter report title
   - [ ] Select fiscal year
   - [ ] Choose a theme
   - [ ] Select template (Traditional, Modern, Interactive)
   - [ ] Write executive summary

7. **Test Report Creation**:
   - [ ] Click "Generate Report"
   - [ ] Success message appears
   - [ ] Report appears in reports list

---

### Step 5: Test Impact Dashboard

1. Navigate to: `http://localhost:3000/picc/insights/impact`

2. **Verify Page Loads**:
   - [ ] Page loads without stuck loading spinner
   - [ ] Stats cards show numbers (not zeros)
   - [ ] Charts/graphs render if implemented

---

### Step 6: Delete Test

1. Navigate to: `http://localhost:3000/picc/reports`

2. **Test Report Deletion**:
   - [ ] Click delete button on a test report
   - [ ] Confirmation dialog appears
   - [ ] Report is removed from list after confirmation
   - [ ] No errors in console

---

## Troubleshooting

### If pages show "Loading..." forever:

1. Check browser console for errors
2. Verify API endpoints return data:
   - `http://localhost:3000/api/debug-data`
   - `http://localhost:3000/api/stories`
   - `http://localhost:3000/api/annual-reports`

### If APIs return empty data:

1. Run `FIX_RLS_POLICIES.sql` in Supabase SQL Editor
2. Verify environment variables are set in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   SUPABASE_SERVICE_ROLE_KEY=your_key
   ```

### If storyteller names show "Community Member":

The Stories API join with profiles may not be working. Check:
1. Profiles table has data
2. Stories have valid `storyteller_id` values
3. The `/api/stories/route.ts` is using correct join

---

## Summary of Fixed Issues

1. **RLS Blocking**: All pages now use API routes that bypass RLS using service role key
2. **Storyteller Names**: API now joins with profiles to get actual names
3. **Elder Stories**: API returns `is_elder` flag from profiles
4. **Quality Scores**: API returns actual `quality_score` values
5. **UI Improvements**: All pages updated with world-class UI patterns

---

## Files Modified

- `/api/stories/route.ts` - New API for stories
- `/api/annual-reports/route.ts` - New API for reports CRUD
- `/api/impact-stats/route.ts` - API for dashboard stats
- `/api/debug-data/route.ts` - Debug endpoint
- `/picc/report-generator/page.tsx` - Complete rewrite
- `/picc/reports/page.tsx` - Updated to use API
- `/picc/annual-reports/page.tsx` - Updated to use API
- `FIX_RLS_POLICIES.sql` - Comprehensive RLS fix
