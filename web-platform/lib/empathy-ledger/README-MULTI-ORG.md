# Multi-Organization Empathy Ledger
## Making the System Reusable for Any Organization

### 🌊 **What This Adds**

This schema extension transforms the Empathy Ledger from a Palm Island-specific system into a **universal platform** that any Indigenous organization, NGO, or community group can use while maintaining 100% backward compatibility with your existing Palm Island implementation.

---

## 🎯 **Core Concept**

### Before (Palm Island Only)
```
Profiles (storytellers) → Stories → Impact Tracking
```

### After (Any Organization)
```
Organizations → Members (profiles) → Stories → Annual Reports
     ↓
  Services (programs)
```

---

## ✅ **What You Get**

### **1. Multi-Organization Support**
- **Any organization** can now use Empathy Ledger
- Each organization has its own:
  - Branding (colors, logo, design)
  - Services/programs
  - Members (linked to existing profiles)
  - Cultural protocols
  - Annual reports

### **2. Automated Annual Report Generation**
- **Eliminate $30,000+ consultant costs** for every organization
- Stories automatically populate reports
- Multiple professional templates
- Automated story selection based on impact/relevance
- Elder approval workflows built-in
- PDF and web versions generated

### **3. Service-Level Impact Tracking**
- Track which stories relate to which services
- Measure service effectiveness through stories
- Pattern recognition across services
- Service-specific reporting

### **4. Backward Compatibility**
- All existing Palm Island profiles work unchanged
- All existing stories work unchanged
- Just add organization links to existing data

---

## 📊 **New Database Tables**

### Core Tables

#### `organizations`
Any organization using Empathy Ledger
```sql
- name, type, location, branding
- cultural protocols configuration
- empathy ledger settings
```

#### `organization_services`
Programs/departments within an organization
```sql
- PICC has 16 services pre-configured
- Other orgs can add their own
- Tracks story count per service
```

#### `organization_members`
Links profiles (storytellers) to organizations
```sql
- Roles: admin, manager, staff, elder, etc.
- Permissions: approve stories, manage reports, etc.
- Service assignments
```

#### `annual_reports`
Annual report management
```sql
- Year, period, status, template
- Story selections (manual + auto)
- Cultural approvals
- Generation & publication tracking
```

#### `annual_report_stories`
Links stories to reports
```sql
- Inclusion reason
- Section placement
- Custom titles/excerpts for report
- Media selections
```

#### `report_sections`
Custom content sections
```sql
- Section type, content, styling
- Story/media/data viz inclusions
- Markdown or HTML content
```

#### `report_templates`
Reusable design templates
```sql
- 3 default templates included
- Organizations can create custom
- Design config, sections, colors
```

#### `report_feedback`
Community feedback on reports
```sql
- Ratings, comments
- Improvement suggestions
- Response tracking
```

---

## 🔧 **How It Works**

### **For Palm Island (Existing)**

1. **Automatic Setup**: PICC is pre-configured with 16 services
2. **Link Existing Profiles**: Add `primary_organization_id` to profiles
3. **Link Stories**: Add `organization_id` and `service_id` to stories
4. **Start Creating Reports**: Use the automated system

### **For New Organizations**

1. **Create Organization Record**
```typescript
const org = await supabase.from('organizations').insert({
  name: 'Yarrabah Community',
  organization_type: 'aboriginal_community',
  primary_location: 'Yarrabah',
  traditional_country: 'Gunggandji Country',
  // ... other details
});
```

2. **Add Services/Programs**
```typescript
const service = await supabase.from('organization_services').insert({
  organization_id: org.id,
  service_name: 'Youth Program',
  service_slug: 'youth_program',
  service_category: 'youth',
  // ... other details
});
```

3. **Add Members**
```typescript
const membership = await supabase.from('organization_members').insert({
  organization_id: org.id,
  profile_id: user_profile_id,
  role: 'staff',
  service_id: service.id,
  can_approve_stories: true
});
```

4. **Staff Start Creating Stories**
Stories automatically link to organization and service.

5. **Generate Annual Report**
Use automated system to compile year's stories into professional report.

---

## 📝 **Annual Report Workflow**

### **Step 1: Planning (November)**
```typescript
const report = await supabase.from('annual_reports').insert({
  organization_id: picc_id,
  report_year: 2024,
  reporting_period_start: '2024-01-01',
  reporting_period_end: '2024-12-31',
  title: 'PICC Annual Report 2024',
  theme: 'Community Strength Through Cultural Connection',
  template_name: 'traditional',
  status: 'planning'
});
```

### **Step 2: Story Selection (November-December)**
```typescript
// Auto-select top stories
const stories = await supabase.rpc('get_stories_for_report', {
  org_uuid: picc_id,
  year_value: 2024,
  limit_count: 50
});

// Add to report
stories.forEach(async (story) => {
  await supabase.from('annual_report_stories').insert({
    report_id: report.id,
    story_id: story.story_id,
    inclusion_reason: 'auto_selected',
    section_placement: 'community_stories'
  });
});

// Manually feature key stories
await supabase.from('annual_report_stories')
  .update({ is_featured: true })
  .eq('story_id', elder_wisdom_story_id);
```

### **Step 3: Content Creation (December)**
```typescript
await supabase.from('annual_reports').update({
  executive_summary: '2024 was a year of...',
  leadership_message: 'Our community has...',
  year_highlights: [
    'Launched new Cultural Centre',
    '197 staff members contributing stories',
    'Youth program reached 300 participants'
  ],
  looking_forward: 'In 2025, we aim to...',
  statistics: {
    people_served: 3500,
    stories_collected: 142,
    services_delivered: 16,
    cultural_events: 24
  }
}).eq('id', report.id);
```

### **Step 4: Elder Approval (December)**
```typescript
// Submit for elder review
await supabase.from('annual_reports')
  .update({ status: 'review' })
  .eq('id', report.id);

// Elder approves
await supabase.from('annual_reports')
  .update({ 
    elder_approvals: [elder_profile_id],
    elder_approval_date: new Date().toISOString(),
    status: 'approved'
  })
  .eq('id', report.id);
```

### **Step 5: Generation (January)**
```typescript
// Generate PDF and web version
const result = await generateReport(report.id);

await supabase.from('annual_reports').update({
  status: 'published',
  published_date: new Date().toISOString(),
  pdf_url: result.pdf_url,
  web_version_url: result.web_url,
  auto_generated: true
}).eq('id', report.id);
```

### **Step 6: Distribution (January)**
```typescript
// Distribute to community
await distributeReport(report.id, {
  email_list: [...community_members],
  print_copies: 100,
  digital_version: true
});
```

---

## 🎨 **Report Templates**

### **3 Default Templates Included**

#### 1. **Traditional Indigenous Design**
- Earth tones (#8B4513, #D2691E, #CD853F)
- Traditional patterns and cultural elements
- Emphasis on storytelling
- Cultural acknowledgment section
- Elder wisdom sections
- **Perfect for**: Indigenous communities

#### 2. **Modern Professional**
- Contemporary design (#2C3E50, #3498DB, #E74C3C)
- Data visualization focus
- Clean layouts
- Executive summary emphasis
- **Perfect for**: NGOs, government services

#### 3. **Photo Story**
- Image-heavy design
- Large photo galleries
- Minimal text overlay
- Visual storytelling
- **Perfect for**: Youth programs, visual organizations

### **Organizations Can Create Custom Templates**
```typescript
const template = await supabase.from('report_templates').insert({
  template_name: 'picc_custom',
  display_name: 'PICC Branded Template',
  category: 'indigenous_focused',
  design_config: {
    colorScheme: 'custom',
    primaryColor: '#YOUR_BRAND_COLOR',
    // ... custom design
  },
  organization_id: picc_id, // Org-specific
  is_public: false
});
```

---

## 🔍 **Automated Story Selection**

The system includes an intelligent `get_stories_for_report()` function:

### **Selection Criteria**
1. **Relevance Score**:
   - Featured stories: 1.0
   - Verified stories: 0.9
   - Traditional knowledge: 0.8
   - Regular stories: 0.7

2. **Impact Score**:
   - Views + (Shares × 2) + Likes

3. **Category Balance**:
   - Ensures representation across all service areas
   - Health, youth, culture, family, etc.

4. **Time Period**:
   - Only stories from the report year

### **Manual Override**
- Staff can manually select/deselect stories
- Feature important stories
- Exclude sensitive content
- Customize titles/excerpts

---

## 📈 **Dashboard Integration**

### **Organization Dashboard**
```typescript
// Get org stats
const stats = await supabase.rpc('get_organization_stats', {
  org_uuid: picc_id
});

// Returns:
{
  total_members: 197,
  active_services: 16,
  total_stories: 342,
  stories_this_year: 142,
  total_reports: 5,
  published_reports: 4
}
```

### **Service Dashboard**
```typescript
// Get service-specific stories
const { data: stories } = await supabase
  .from('stories')
  .select('*')
  .eq('service_id', bwgcolman_healing_id)
  .eq('status', 'published');

// Service story count auto-updates via trigger
```

### **Annual Report Progress**
```typescript
// Track report completion
const report_stats = {
  stories_selected: 45,
  elder_approvals: 2,
  elder_approvals_needed: 3,
  sections_completed: 7,
  sections_total: 9,
  estimated_pages: 52
};
```

---

## 🔐 **Security & Permissions**

### **Row Level Security (RLS)**

#### Organizations
- Public orgs viewable by all
- Members see full details

#### Services
- Viewable by org members only

#### Annual Reports
- Published reports: authenticated users
- Drafts: org members only
- Management: users with `can_manage_reports` permission

#### Stories
- Respect existing story access levels
- Additional org-level filtering

---

## 🚀 **Deployment**

### **Step 1: Run Migration**
```bash
# Deploy the new schema (after existing tables created)
psql "postgresql://..." < lib/empathy-ledger/migrations/03_organizations_and_annual_reports.sql
```

### **Step 2: Verify**
```sql
-- Check tables created
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'organization%' OR tablename LIKE 'annual%';

-- Should see:
-- organizations
-- organization_services
-- organization_members
-- annual_reports
-- annual_report_stories
-- report_sections
-- report_templates
-- report_feedback
```

### **Step 3: Verify PICC Setup**
```sql
-- PICC organization created
SELECT * FROM organizations WHERE short_name = 'PICC';

-- 16 services created
SELECT COUNT(*) FROM organization_services 
WHERE organization_id = (SELECT id FROM organizations WHERE short_name = 'PICC');
-- Should return: 16

-- 3 templates created
SELECT template_name FROM report_templates;
-- Should return: traditional, modern_professional, photo_story
```

### **Step 4: Link Existing Data** *(Optional but Recommended)*
```sql
-- Get PICC org ID
DO $$
DECLARE
  picc_org_id UUID;
BEGIN
  SELECT id INTO picc_org_id FROM organizations WHERE short_name = 'PICC';
  
  -- Link existing profiles to PICC
  UPDATE profiles 
  SET primary_organization_id = picc_org_id 
  WHERE location = 'Palm Island';
  
  -- Link existing stories to PICC
  UPDATE stories 
  SET organization_id = picc_org_id 
  WHERE storyteller_id IN (
    SELECT id FROM profiles WHERE location = 'Palm Island'
  );
END $$;
```

---

## 💡 **Use Cases Beyond PICC**

### **Other Indigenous Communities**
```typescript
// Yarrabah Community
const yarrabah = await createOrganization({
  name: 'Yarrabah Aboriginal Shire Council',
  organization_type: 'aboriginal_community',
  traditional_country: 'Gunggandji Country'
});

// Cherbourg Community
const cherbourg = await createOrganization({
  name: 'Cherbourg Aboriginal Shire Council',
  organization_type: 'aboriginal_community',
  traditional_country: 'Wakka Wakka Country'
});
```

### **Indigenous NGOs**
```typescript
const ngo = await createOrganization({
  name: 'Indigenous Literacy Foundation',
  organization_type: 'indigenous_ngo',
  empathy_ledger_enabled: true
});
```

### **Government Services**
```typescript
const health = await createOrganization({
  name: 'Queensland Aboriginal and Islander Health Council',
  organization_type: 'healthcare',
  indigenous_controlled: true
});
```

---

## 🌟 **Key Benefits**

### **For Palm Island**
✅ Keep everything that works
✅ Add annual report automation
✅ Better service-level tracking
✅ Professional report templates
✅ Save $30,000+ annually on consultants

### **For Other Organizations**
✅ Ready-to-use storytelling platform
✅ Impact tracking out of the box
✅ Cultural protocols built-in
✅ Annual reports automated
✅ Indigenous data sovereignty

### **For the Sector**
✅ Shareable best practices
✅ Network effects (orgs can learn from each other)
✅ Standardized impact measurement
✅ Indigenous-controlled technology
✅ Community-driven innovation

---

## 📚 **Next Steps**

### **Immediate (Week 1)**
1. ✅ Deploy schema to Supabase
2. ✅ Verify PICC setup
3. ✅ Link existing profiles and stories
4. ✅ Test org stats functions

### **Short Term (Month 1)**
1. Build annual report UI
2. Test automated story selection
3. Create first 2024 report draft
4. Get elder approval workflow working

### **Medium Term (Quarter 1)**
1. Generate and publish PICC 2024 annual report
2. Document PICC's success
3. Approach 2-3 other communities
4. Refine based on feedback

### **Long Term (Year 1)**
1. 10+ organizations using system
2. Network of Indigenous storytelling
3. Sector-wide impact measurement
4. Policy influence through aggregated data

---

## 🎓 **Documentation Files**

- `schema.sql` - Original Empathy Ledger core (profiles, stories, impact)
- `03_organizations_and_annual_reports.sql` - This extension
- `types.ts` - Core Empathy Ledger TypeScript types
- `types-organizations.ts` - New organization & report types
- `client.ts` - Supabase client configuration
- `EMPATHY-LEDGER-INTEGRATION.md` - Original integration guide
- `README-MULTI-ORG.md` - This document

---

## 🔗 **Key Relationships**

```
organizations (1) ←→ (many) organization_services
organizations (1) ←→ (many) organization_members (many) ←→ (1) profiles
organizations (1) ←→ (many) annual_reports
annual_reports (1) ←→ (many) annual_report_stories (many) ←→ (1) stories
annual_reports (1) ←→ (many) report_sections
annual_reports (1) ←→ (1) report_templates
annual_reports (1) ←→ (many) report_feedback

profiles (1) ←→ (many) stories
organization_services (1) ←→ (many) stories
```

---

## ✨ **Success Metrics**

### **Technical Success**
- ✅ Schema deployed without errors
- ✅ All existing data still accessible
- ✅ All existing features still work
- ✅ New features available

### **Business Success**
- 📊 PICC generates 2024 annual report
- 💰 Save $30,000 consultant costs
- ⏱️ Reduce report creation time from 3 months to 2 weeks
- 🎯 100% community control over narrative

### **Sector Success**
- 🌐 3+ additional organizations adopt system
- 📈 Network effects begin
- 🏆 Sector recognition of innovation
- 💪 Indigenous data sovereignty leadership

---

**🌊 Your Empathy Ledger is now ready to serve any organization while maintaining complete backward compatibility with Palm Island's existing implementation!**

The schema extension is modular, non-breaking, and designed for growth. PICC can start using annual reports immediately, and the platform is ready for other organizations whenever you're ready to expand.
