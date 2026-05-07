/**
 * SpecimenPDF — the Saltwater Almanac specimen exhibition.
 *
 * v2: Now showcases all twelve elements as a continuous walk so we can see
 * whether the grammar holds across the full vocabulary, not just the four
 * elements of the original Children & Families room.
 *
 * Visitor walk:
 *   p.1  Cartouche (i)         — Children & Families
 *   p.2  Reliquary + MarginNote — "1st in Queensland" (Bwgcolman Way)
 *   p.3  Hearth + VitrineTriptych — Hailey's voice + 3 facts
 *   p.4  Lantern                — Aunty Ethel (sacred, refuses section colour)
 *   p.5  Cartouche (ii)         — Health & Wellbeing (with hero photo)
 *   p.6  Specimen               — Bwgcolman Healing rename, before/after
 *   p.7  KulingField            — NDIS tripling constellation
 *   p.8  Songline               — Hull River journey (full-bleed band)
 *   p.9  Fold + Fold            — two photo plates
 *   p.10 Atlas                  — services around the island
 *   p.11 Horizon × 3            — three forward commitments
 *   p.12 Bookend                — Reliquary + Hearth, contemplative close
 *
 * If this 12-page specimen reads as one curated experience, the grammar
 * holds and we scale to the full 24-page report.
 *
 * Renders via /api/pdf/specimen
 */
import { Document, View } from '@react-pdf/renderer'
import { AmbientPage } from '../components/AmbientPage'
import {
  Cartouche,
  Reliquary,
  Songline,
  Lantern,
  Hearth,
  Horizon,
  Atlas,
  Specimen,
  KulingField,
  VitrineTriptych,
  Fold,
  FoldPair,
  MarginNote,
} from '../components/elements'

interface SpecimenPDFProps {
  seed?: number
}

export default function SpecimenPDF({ seed = 28 }: SpecimenPDFProps) {
  return (
    <Document
      title="PICC FY24-25 — Saltwater Almanac Specimen"
      author="Palm Island Community Company"
      subject="The 12-element grammar, on the page"
    >
      {/* PAGE 1 — Cartouche (Children & Families) */}
      <Cartouche
        section="childrenFamilies"
        numeral="i"
        subline="Where every story begins."
        promise="Decisions about Palm Island children, made by Palm Island people. Early learning, kinship care, and the wraparound that holds families together — across seven services, on Country."
      />

      {/* PAGE 2 — Reliquary: 1st in Queensland */}
      <AmbientPage section="childrenFamilies" pageNumber={5} constellationSeed={seed}>
        <Reliquary
          numeral="1st"
          unit="in Queensland"
          annotation="Decisions about our children, made by us."
          section="childrenFamilies"
          substrate="rings"
          caption="Bwgcolman Way · Delegated Authority · Child Protection Act 1999, Part 2A"
        />

        <MarginNote
          text="Without DA: child to mainland residential care. With DA: child stays with grandmother on Palm."
          color="ochre"
          align="left"
          connector
        />
      </AmbientPage>

      {/* PAGE 3 — Hearth + VitrineTriptych */}
      <AmbientPage section="childrenFamilies" pageNumber={6} constellationSeed={seed + 1}>
        <Hearth
          quote="It was really hard, because we flooded out, we lost all of our equipment. We came together as a team — but as a community as well."
          name="Hailey Jane Wetzel"
          role="CFC Manager · Children and Family Centre"
          section="childrenFamilies"
          date="2024"
          consent="Recorded with consent · Empathy Ledger · validated"
        />

        <VitrineTriptych
          section="childrenFamilies"
          vitrines={[
            {
              value: "24",
              label: "active services",
              caption: "across 8 categories",
            },
            {
              value: "17,488",
              label: "episodes of care",
              caption: "Bwgcolman Healing Service",
            },
            {
              value: "6,698",
              label: "placement nights",
              caption: "kept with kin, on Country",
            },
          ]}
        />

        <MarginNote
          text="Most of every PICC dollar pays a Palm Islander to deliver a service to another Palm Islander."
          color="earth"
          align="right"
        />
      </AmbientPage>

      {/* PAGE 4 — Lantern (Aunty Ethel — Elder voice, sacred) */}
      <AmbientPage
        section="childrenFamilies"
        pageNumber={11}
        constellationSeed={seed + 2}
        hideConstellation
      >
        <Lantern
          quote="Our mother was one of the stolen generation. You can just imagine the hardship that we had to go through. We carry her, and we carry the next ones."
          name="Aunty Ethel Robertson"
          role="Bwgcolman Elder · Stolen Generations descendant"
          side="left"
          date="Nov 2024"
          portraitUrl="/picc-photos/voices/aunty-ethel-robertson.jpg"
          consent="Recorded with consent · Cultural review complete · Empathy Ledger"
        />

        <MarginNote
          text="The Lantern refuses section colour by design — Elder voice does not flex to the room."
          color="earth"
          align="right"
        />
      </AmbientPage>

      {/* PAGE 5 — Cartouche (Health & Wellbeing — with hero photo) */}
      <Cartouche
        section="healthWellbeing"
        numeral="ii"
        subline="Healing in our way."
        promise="Bwgcolman Healing Service, Women's Healing, Ferdy's Haven, the First 1,000 Days. Five services holding the body, mind, and spirit of our community."
        heroPhotoUrl="/hero-assets/stills/group-dinner.jpg"
        photoOpacity={0.92}
      />

      {/* PAGE 6 — Specimen (before/after) */}
      <AmbientPage section="healthWellbeing" pageNumber={15} constellationSeed={seed + 3}>
        <Specimen
          section="healthWellbeing"
          variant="cultural"
          title="The name our Elders chose"
          before={{
            label: "Before · 2023",
            value: "Primary Health Centre",
            detail: "Government-named. Government-shaped.",
          }}
          after={{
            label: "After · January 2024",
            value: "Bwgcolman Healing Service",
            detail: "Renamed after community consultation with the Elders' Advisory Group.",
          }}
          annotation="A name is not cosmetic. The name our Elders chose changed how the clinic is felt."
        />

        <Hearth
          quote="As a local returning to work on Palm Island, I am proud to be part of the PICC team that is helping to close the gap for Indigenous Australians."
          name="Dr Raymond Blackman"
          role="PICC Health Doctor · Bwgcolman Healing Service"
          section="healthWellbeing"
        />
      </AmbientPage>

      {/* PAGE 7 — Kuling Field (constellation of stats) */}
      <AmbientPage section="healthWellbeing" pageNumber={12} constellationSeed={seed + 4}>
        <KulingField
          title="Health in numbers"
          subtitle="Bwgcolman Healing Service · FY24-25"
          stars={[
            { value: '17,488', label: 'episodes of care', magnitude: 5, top: 25, left: 25 },
            { value: '2,283', label: 'clients served', magnitude: 4, top: 60, left: 18 },
            { value: '1,935', label: 'First Nations clients', magnitude: 3, top: 78, left: 38 },
            { value: '779', label: '715 health checks', magnitude: 3, top: 30, left: 60 },
            { value: '293', label: 'GP plans', magnitude: 2, top: 55, left: 70 },
            { value: '128', label: 'child checks', magnitude: 2, top: 80, left: 75 },
          ]}
          connectors={[
            [0, 1],
            [1, 2],
            [0, 3],
            [3, 4],
            [4, 5],
          ]}
        />

        <MarginNote
          text="Star size maps to magnitude. The brightest stars are the year's headline numbers."
          color="ochre"
          align="left"
        />
      </AmbientPage>

      {/* PAGE 8 — Songline (Hull River, full band) */}
      <AmbientPage
        section="educationCommunity"
        pageNumber={8}
        constellationSeed={seed + 5}
        hideConstellation
      >
        <Songline
          title="Walking Country Together"
          subtitle="Elders return to Hull River — since the year ended"
          variant="hullRiver"
          waypoints={[
            { date: '1918', place: 'Forced removal', note: 'Mission Beach to Palm' },
            { date: '2025·Sep', place: 'Palm departs', note: 'Elders, Rangers, the studio' },
            { date: '2025·Oct', place: 'Mission Beach', note: 'On Country, recording' },
            { date: '2025·Oct', place: 'Hull River', note: 'Place names returning' },
            { date: '2025·Nov', place: 'Return', note: 'Stories now archived' },
          ]}
        />

        <MarginNote
          text="Songlines stay rare or they stop singing. Two in the report, this is one."
          color="earth"
          align="right"
        />
      </AmbientPage>

      {/* PAGE 9 — FoldPair (two photo plates) */}
      <AmbientPage section="youth" pageNumber={9} constellationSeed={seed + 6}>
        <FoldPair
          left={{
            photoUrl: '/hero-assets/stills/daycare-graduation.jpg',
            caption: 'The CFC daycare reopens, six months after the floods.',
            section: 'childrenFamilies',
            shape: 'landscape',
            name: 'Children & Family Centre · 2024',
            date: 'Sep 2024',
            consent: 'Photo consent · validated',
          }}
          right={{
            photoUrl: '/hero-assets/stills/youth-team-photo.jpg',
            caption: 'The under-15s — many playing organised footy for the first time.',
            section: 'youth',
            shape: 'landscape',
            name: 'Youth Services · Christmas Cup 2024',
            date: 'Dec 2024',
            consent: 'Photo consent · validated',
          }}
        />

        <Fold
          photoUrl="/hero-assets/stills/mountain-valley.jpg"
          caption="The country that holds it all."
          section="educationCommunity"
          shape="country"
          place="Bwgcolman · Great Palm Island"
          consent="Country photographs do not name people."
        />
      </AmbientPage>

      {/* PAGE 10 — Atlas (services around the island) */}
      <AmbientPage section="educationCommunity" pageNumber={2} constellationSeed={seed + 7}>
        <Atlas
          title="Orientation"
          subtitle="24 services around one island."
          variant="orientation"
          caption="Bwgcolman · Great Palm Island · 2024-25"
          nodes={[
            { name: 'Bwgcolman Way', section: 'childrenFamilies', top: 30, left: 30, magnitude: 3, note: 'anchor' },
            { name: 'CFC', section: 'childrenFamilies', top: 50, left: 25 },
            { name: 'Family Wellbeing', section: 'childrenFamilies', top: 70, left: 30 },
            { name: 'Safe House', section: 'childrenFamilies', top: 85, left: 50 },
            { name: 'Bwgcolman Healing', section: 'healthWellbeing', top: 30, left: 70, magnitude: 3 },
            { name: "First 1,000 Days", section: 'healthWellbeing', top: 50, left: 75 },
            { name: "Women's Healing", section: 'healthWellbeing', top: 70, left: 78 },
            { name: "Ferdy's Haven", section: 'healthWellbeing', top: 85, left: 70 },
            { name: 'Justice Group', section: 'justiceSafety', top: 20, left: 50 },
            { name: 'Diversionary', section: 'justiceSafety', top: 20, left: 35 },
            { name: 'Youth Services', section: 'youth', top: 60, left: 50 },
            { name: 'Digital Service', section: 'economic', top: 50, left: 50, magnitude: 3 },
          ]}
          connectors={[
            [0, 1],
            [1, 2],
            [4, 5],
            [5, 6],
            [10, 11],
          ]}
        />
      </AmbientPage>

      {/* PAGE 11 — Three Horizons */}
      <AmbientPage
        section="educationCommunity"
        pageNumber={20}
        constellationSeed={seed + 8}
        hideConstellation
      >
        <Horizon
          year="2028"
          title="Aged Care on Palm Island"
          statement="Our Elders never have to leave Country to be cared for."
          detail="A dedicated facility on Palm. The forward commitment that anchors the next twenty years."
          section="childrenFamilies"
        />

        <Horizon
          year="2030"
          title="Bwgcolman Way Expanded"
          statement="Delegated Authority extended into health and justice."
          detail="The first Indigenous-led delegated authority across three domains in Australia."
          section="healthWellbeing"
        />
      </AmbientPage>

      {/* PAGE 12 — Bookend Reliquary + Hearth */}
      <AmbientPage section="childrenFamilies" pageNumber={24} constellationSeed={seed + 9}>
        <Reliquary
          numeral="439"
          unit="children supported"
          annotation="The work of one year, held by one community."
          section="childrenFamilies"
          substrate="horizon"
          caption="Children & Families · FY24-25"
          compact
        />

        <Hearth
          quote="Every child has a right to feel safe. Every child has a right to access early childhood services. Every family has a right to have a sense of belonging and ownership of their future."
          name="Rachel Atkinson"
          role="CEO · Palm Island Community Company"
          section="childrenFamilies"
          date="Aug 2024"
          consent="Recorded with consent · CEO Legacy interview"
        />

        <MarginNote
          text="They are our ancestors of tomorrow."
          color="ochre"
          align="centre"
        />
      </AmbientPage>
    </Document>
  )
}
