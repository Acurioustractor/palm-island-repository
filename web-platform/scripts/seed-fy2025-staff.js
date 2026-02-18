const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
  const { data: orgs } = await supabase.from("organizations").select("id").eq("short_name", "PICC");
  const org = orgs?.[0];
  if (org === null) { console.log("PICC not found"); return; }

  const { data: existing } = await supabase.from("staff_statistics").select("id").eq("fiscal_year", 2025).eq("organization_id", org.id);
  console.log("Existing FY2025 staff rows:", existing?.length);

  if (existing === null || existing.length === 0) {
    const { data, error } = await supabase.from("staff_statistics").insert({
      organization_id: org.id,
      fiscal_year: 2025,
      snapshot_date: "2025-06-30",
      total_staff: 210,
      indigenous_staff_count: 168,
      palm_island_resident_count: 147,
      notes: "FY2024-25: 210 total staff, ~80% Indigenous, ~70% Palm Island residents."
    }).select();
    if (error) console.log("Insert error:", error.message);
    else console.log("Inserted FY2025 staff:", data[0]?.total_staff, "staff");
  } else {
    console.log("FY2025 staff data already exists");
  }
}
seed();
