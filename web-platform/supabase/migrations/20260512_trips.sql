-- Trip planning: continue planning with Elders + Rachel between visits.
--
-- One row per trip (Atherton Tablelands, future Hull River return, etc).
-- The plan itself (milestones · budget · ideas · attendee names · notes)
-- lives in jsonb so the schema doesn't need to change every time
-- editors invent a new section.
--
-- Origin meeting links back to the meeting_notes row that started the trip
-- (so cultural protocol context carries through).

CREATE TABLE IF NOT EXISTS trips (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              text UNIQUE NOT NULL,
  name              text NOT NULL,
  description       text,
  location          text,
  target_start      date,
  target_end        date,
  status            text NOT NULL DEFAULT 'planning'
                    CHECK (status IN ('planning','confirmed','in_progress','completed','cancelled')),
  origin_meeting_id uuid REFERENCES meeting_notes(id) ON DELETE SET NULL,
  data              jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS trips_status_idx ON trips(status);
CREATE INDEX IF NOT EXISTS trips_target_start_idx ON trips(target_start);

CREATE OR REPLACE FUNCTION trips_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trips_updated_at ON trips;
CREATE TRIGGER trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION trips_set_updated_at();

COMMENT ON TABLE trips IS
  'Trip planning surface keyed by slug. data jsonb holds milestones, budget rows, ideas, attendee_names, notes.';

-- Seed the Atherton Tablelands trip from the 16 Feb 2026 Elders meeting.
-- Idempotent — safe to re-run.
INSERT INTO trips (slug, name, description, location, target_start, target_end, status, data)
VALUES (
  'atherton-tablelands-2026',
  'Atherton Tablelands Cultural Trip',
  'Cultural connection trip with the Elders Group — visiting sites, ranger programs, and bush food gardens across the Atherton Tablelands region. Possibly extending to Adnapa Homestead near Alice Springs.',
  'Atherton · Mareeba · Ravenshoe (and potentially Adnapa Homestead, Alice Springs)',
  '2026-10-01',
  '2026-10-14',
  'planning',
  jsonb_build_object(
    'milestones', jsonb_build_array(
      jsonb_build_object('id','m1','text','Submit Indigenous Language and Arts grant application',                   'date','2026-05-30','status','in_progress'),
      jsonb_build_object('id','m2','text','Confirm October dates with all attending Elders',                          'date','2026-06-15','status','open'),
      jsonb_build_object('id','m3','text','Research cultural sites and ranger connections in the Tablelands',         'date','2026-07-01','status','open'),
      jsonb_build_object('id','m4','text','Confirm accommodation across the region',                                  'date','2026-08-01','status','open'),
      jsonb_build_object('id','m5','text','Lock final itinerary and brief the group',                                 'date','2026-09-15','status','open'),
      jsonb_build_object('id','m6','text','Trip begins',                                                              'date','2026-10-01','status','open')
    ),
    'budget', jsonb_build_array(
      jsonb_build_object('id','b1','item','Indigenous Language and Arts grant','source','Commonwealth','amount_min',20000,'amount_max',200000,'status','requested','notes','Using Hull River trip film + Snake presentation as supporting material'),
      jsonb_build_object('id','b2','item','Accommodation (1-2 weeks across region)','source','TBD','amount_min',0,'amount_max',0,'status','estimating','notes',''),
      jsonb_build_object('id','b3','item','Vehicle / fuel',                       'source','TBD','amount_min',0,'amount_max',0,'status','estimating','notes',''),
      jsonb_build_object('id','b4','item','Cultural site entry / ranger fees',    'source','TBD','amount_min',0,'amount_max',0,'status','estimating','notes','')
    ),
    'ideas', jsonb_build_array(
      jsonb_build_object('id','i1','text','Visit cultural sites in Atherton, Mareeba and Ravenshoe area'),
      jsonb_build_object('id','i2','text','Connect with regional Indigenous rangers'),
      jsonb_build_object('id','i3','text','See bush food gardens'),
      jsonb_build_object('id','i4','text','Possibly extend trip to Adnapa Homestead near Alice Springs'),
      jsonb_build_object('id','i5','text','Use Hull River trip film + Snake presentation as supporting material for grant'),
      jsonb_build_object('id','i6','text','Document the trip with photos + video for next annual report')
    ),
    'attendee_names', jsonb_build_array(
      'Aunty Iris May Whitey',
      'Uncle Frank Daniel Anderson',
      'Benjamin Knight'
    ),
    'notes', 'Origin: Elders Group Meeting — Room Naming, Grant Opportunity & Tablelands Trip Planning (16 Feb 2026). The trip is the practical realisation of three threads: (1) cultural connection across country, (2) supporting the grant story with a documented expedition, (3) connecting with other Indigenous communities (rangers, Adnapa Homestead).'
  )
)
ON CONFLICT (slug) DO NOTHING;
