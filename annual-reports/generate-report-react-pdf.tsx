/**
 * PICC Annual Report 2024-2025 — React-PDF Generator
 *
 * Reads assembled JSON data and produces a complete multi-page annual report.
 * Run: npx tsx generate-report-react-pdf.tsx
 * Output: output/picc-annual-report-2025-react-pdf.pdf
 */
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  Font,
  StyleSheet,
  Svg,
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
  Path,
  G,
  renderToFile,
} from "@react-pdf/renderer";
import path from "path";
import fs from "fs";

// ── Load Data ───────────────────────────────────────
const dataPath = path.join(__dirname, "output/report-2025-assembled.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

// ── Asset Paths ─────────────────────────────────────
const fontsDir = path.join(__dirname, "assets/fonts");
const photosDir = path.join(
  __dirname,
  "../web-platform/public/annual-report-photos/2023-24"
);
const logoPath = path.join(
  __dirname,
  "../web-platform/public/logo/picc-logo-full.png"
);

// ── Photo resolver: prefer assembled JSON URLs, fall back to local files ──
function resolvePhoto(section: string, index: number, fallbackFile: string): string {
  // Try assembled report_photos first
  const sectionPhotos = data.report_photos?.[section] || [];
  if (sectionPhotos[index]?.url && sectionPhotos[index].url.startsWith("http")) {
    return sectionPhotos[index].url;
  }
  // Try the 'all' bucket
  const allPhotos = data.report_photos?.all || [];
  if (allPhotos[index]?.url && allPhotos[index].url.startsWith("http")) {
    return allPhotos[index].url;
  }
  // Fall back to local file
  const localPath = path.join(photosDir, fallbackFile);
  if (fs.existsSync(localPath)) {
    return localPath;
  }
  return path.join(photosDir, "photo-000.jpg");
}

// ── Fonts ───────────────────────────────────────────
Font.register({
  family: "Inter",
  fonts: [
    { src: path.join(fontsDir, "Inter-Regular.ttf"), fontWeight: "normal" },
    { src: path.join(fontsDir, "Inter-SemiBold.ttf"), fontWeight: "semibold" },
    { src: path.join(fontsDir, "Inter-Bold.ttf"), fontWeight: "bold" },
  ],
});

Font.register({
  family: "Caveat",
  fonts: [
    { src: path.join(fontsDir, "Caveat-Regular.ttf"), fontWeight: "normal" },
    { src: path.join(fontsDir, "Caveat-Bold.ttf"), fontWeight: "bold" },
  ],
});

Font.registerHyphenationCallback((word: string) => [word]);

// ── Brand Colors ────────────────────────────────────
const C = {
  // Primary
  blue: "#2563eb",
  blueDark: "#1e3a8a",
  blueDeep: "#1e40af",
  blue50: "#eff6ff",
  blue100: "#dbeafe",

  // Accent
  purple: "#9333ea",
  purple50: "#faf5ff",
  purple100: "#f3e8ff",
  purpleDark: "#6b21a8",

  // Status
  green: "#16a34a",
  green50: "#f0fdf4",
  amber: "#d97706",
  amber50: "#fffbeb",
  orange: "#ea580c",
  teal: "#0f766e",

  // Text
  textPrimary: "#111827",
  textSecondary: "#4b5563",
  textMuted: "#9ca3af",
  textLight: "#d1d5db",

  // Backgrounds
  white: "#ffffff",
  bgLight: "#f9fafb",
  bgSection: "#f3f4f6",
  bgDark: "#1f2937",

  // Border
  border: "#e5e7eb",
  borderLight: "#f3f4f6",
};

// ── Page dimensions ─────────────────────────────────
const A4_W = 595.28; // pt
const A4_H = 841.89; // pt
const MARGIN = 50;
const CONTENT_W = A4_W - MARGIN * 2;

// ── Helper: format currency ─────────────────────────
function fmtCurrency(n: number): string {
  if (Math.abs(n) >= 1_000_000)
    return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtFullCurrency(n: number): string {
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString("en-AU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return n < 0 ? `($${formatted})` : `$${formatted}`;
}

// ── Styles ──────────────────────────────────────────
const s = StyleSheet.create({
  // Standard content page
  page: {
    flexDirection: "column",
    backgroundColor: C.white,
    fontFamily: "Inter",
    fontSize: 9.5,
    color: C.textPrimary,
    paddingTop: 60,
    paddingBottom: 50,
    paddingHorizontal: MARGIN,
  },

  // Full-bleed page (no padding)
  pageBleed: {
    flexDirection: "column",
    backgroundColor: C.white,
    fontFamily: "Inter",
    fontSize: 9.5,
    color: C.textPrimary,
  },

  // Running header
  runningHeader: {
    position: "absolute",
    top: 20,
    left: MARGIN,
    right: MARGIN,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  runningHeaderText: {
    fontSize: 6.5,
    fontWeight: "semibold",
    textTransform: "uppercase",
    letterSpacing: 2,
    color: C.textMuted,
  },

  // Page number footer
  pageFooter: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 8,
    color: C.textMuted,
  },

  // Section label (purple uppercase)
  sectionLabel: {
    fontSize: 7.5,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 2,
    color: C.purple,
    marginBottom: 6,
  },

  // Large heading (Caveat)
  h1: {
    fontFamily: "Caveat",
    fontSize: 32,
    fontWeight: "bold",
    color: C.blueDark,
    marginBottom: 8,
    lineHeight: 1.15,
  },

  h2: {
    fontFamily: "Caveat",
    fontSize: 24,
    fontWeight: "bold",
    color: C.blueDark,
    marginBottom: 6,
    lineHeight: 1.2,
  },

  h3: {
    fontSize: 14,
    fontWeight: "bold",
    color: C.blueDark,
    marginBottom: 4,
  },

  h4: {
    fontSize: 11,
    fontWeight: "bold",
    color: C.blueDark,
    marginBottom: 3,
  },

  // Body text
  body: {
    fontSize: 9.5,
    color: C.textSecondary,
    lineHeight: 1.65,
  },

  bodySmall: {
    fontSize: 8.5,
    color: C.textSecondary,
    lineHeight: 1.6,
  },

  lead: {
    fontSize: 11,
    color: C.textSecondary,
    lineHeight: 1.7,
    marginBottom: 16,
  },
});

// ══════════════════════════════════════════════════════
// DECORATIVE COMPONENTS
// ══════════════════════════════════════════════════════

const GradientBar = ({ width = 80 }: { width?: number }) => (
  <Svg width={width} height={4} style={{ marginBottom: 12 }}>
    <Defs>
      <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor={C.blue} />
        <Stop offset="100%" stopColor={C.purple} />
      </LinearGradient>
    </Defs>
    <Rect x="0" y="0" width={String(width)} height="4" rx="2" fill="url(#grad)" />
  </Svg>
);

const WaveDecoration = ({ color = C.blue, y = 0 }: { color?: string; y?: number }) => (
  <Svg
    width={String(A4_W)}
    height="60"
    style={{ position: "absolute", bottom: y, left: 0 }}
  >
    <Path
      d={`M0,30 Q${A4_W * 0.15},0 ${A4_W * 0.3},25 T${A4_W * 0.6},20 T${A4_W * 0.9},30 T${A4_W},25 L${A4_W},60 L0,60 Z`}
      fill={color}
      opacity="0.08"
    />
    <Path
      d={`M0,40 Q${A4_W * 0.2},20 ${A4_W * 0.35},35 T${A4_W * 0.65},30 T${A4_W},35 L${A4_W},60 L0,60 Z`}
      fill={color}
      opacity="0.05"
    />
  </Svg>
);

const DotPattern = ({
  x,
  y,
  rows = 4,
  cols = 6,
  color = C.purple,
  opacity = 0.15,
}: {
  x: number;
  y: number;
  rows?: number;
  cols?: number;
  color?: string;
  opacity?: number;
}) => (
  <Svg
    width={String(cols * 12)}
    height={String(rows * 12)}
    style={{ position: "absolute", left: x, top: y }}
  >
    {Array.from({ length: rows * cols }).map((_, i) => (
      <Circle
        key={i}
        cx={String((i % cols) * 12 + 3)}
        cy={String(Math.floor(i / cols) * 12 + 3)}
        r="2"
        fill={color}
        opacity={String(opacity)}
      />
    ))}
  </Svg>
);

const RunningHeader = () => (
  <View style={s.runningHeader} fixed>
    <Text style={s.runningHeaderText}>
      Palm Island Community Company
    </Text>
    <Text style={s.runningHeaderText}>Annual Report 2024-2025</Text>
  </View>
);

const PageNumber = () => (
  <Text
    style={s.pageFooter}
    fixed
    render={({ pageNumber }) => (pageNumber > 1 ? String(pageNumber) : "")}
  />
);

// ══════════════════════════════════════════════════════
// PAGE 1: COVER
// ══════════════════════════════════════════════════════

const CoverPage = () => (
  <Page size="A4" style={s.pageBleed}>
    {/* Background beach photo - wrapped in fixed-size View to avoid wrap warning */}
    <View style={{ position: "absolute", top: 0, left: 0, width: A4_W, height: A4_H }}>
      <Image
        src={resolvePhoto("hero", 0, "photo-001.jpg")}
        style={{
          width: A4_W,
          height: A4_H,
          objectFit: "cover",
        }}
      />
    </View>

    {/* Dark overlay gradient */}
    <View style={{ position: "absolute", top: 0, left: 0, width: A4_W, height: A4_H }}>
      <Svg
        width={String(A4_W)}
        height={String(A4_H)}
      >
        <Defs>
          <LinearGradient id="coverGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#000000" stopOpacity="0.3" />
            <Stop offset="40%" stopColor="#000000" stopOpacity="0.1" />
            <Stop offset="70%" stopColor="#000000" stopOpacity="0.2" />
            <Stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.7" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={String(A4_W)} height={String(A4_H)} fill="url(#coverGrad)" />
      </Svg>
    </View>

    {/* Logo at top */}
    <View
      style={{
        position: "absolute",
        top: 50,
        left: 0,
        right: 0,
        alignItems: "center",
      }}
    >
      <Image
        src={logoPath}
        style={{ width: 120, height: 120, objectFit: "contain" }}
      />
    </View>

    {/* Title block at bottom */}
    <View
      style={{
        position: "absolute",
        bottom: 80,
        left: MARGIN,
        right: MARGIN,
      }}
    >
      <View
        style={{
          backgroundColor: "rgba(255,255,255,0.95)",
          borderRadius: 12,
          padding: 30,
          paddingTop: 24,
        }}
      >
        <Text
          style={{
            fontSize: 7,
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: 3,
            color: C.purple,
            marginBottom: 8,
          }}
        >
          Annual Report
        </Text>
        <Text
          style={{
            fontFamily: "Caveat",
            fontSize: 38,
            fontWeight: "bold",
            color: C.blueDark,
            lineHeight: 1.1,
            marginBottom: 4,
          }}
        >
          {data.year_range}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: C.textSecondary,
            lineHeight: 1.5,
          }}
        >
          Palm Island Community Company
        </Text>
        <Text
          style={{
            fontSize: 8,
            color: C.textMuted,
            marginTop: 4,
          }}
        >
          Community controlled since {data.stats.community_controlled_since} | ABN/ACN {data.contact.acn}
        </Text>
      </View>
    </View>
  </Page>
);

// ══════════════════════════════════════════════════════
// PAGE 2: ACKNOWLEDGEMENT OF COUNTRY
// ══════════════════════════════════════════════════════

const AcknowledgementPage = () => (
  <Page size="A4" style={s.page}>
    <RunningHeader />
    <PageNumber />

    <View style={{ marginTop: 60 }}>
      <DotPattern x={CONTENT_W - 60} y={0} rows={5} cols={5} color={C.purple} opacity={0.12} />

      <GradientBar width={60} />
      <Text style={s.sectionLabel}>Acknowledgement of Country</Text>
      <Text style={[s.h1, { marginBottom: 20 }]}>
        We honour this land
      </Text>

      <View
        style={{
          borderLeft: `3pt solid ${C.purple}`,
          paddingLeft: 20,
          marginBottom: 30,
        }}
      >
        <Text style={[s.body, { fontSize: 11, lineHeight: 1.8 }]}>
          {data.acknowledgement_text}
        </Text>
      </View>

      {/* Decorative wave */}
      <WaveDecoration color={C.purple} y={0} />
    </View>
  </Page>
);

// ══════════════════════════════════════════════════════
// PAGE 3: CEO & CHAIR MESSAGES
// ══════════════════════════════════════════════════════

const MessagesPage = () => (
  <Page size="A4" style={s.page}>
    <RunningHeader />
    <PageNumber />

    <GradientBar />
    <Text style={s.sectionLabel}>From Our Leaders</Text>
    <Text style={[s.h1, { marginBottom: 24 }]}>Messages from the CEO & Chair</Text>

    {/* CEO Message */}
    <View wrap={false} style={{ marginBottom: 24 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: C.blue50,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Text style={{ fontSize: 18, color: C.blue }}>R</Text>
        </View>
        <View>
          <Text style={s.h4}>{data.ceo.name}</Text>
          <Text style={[s.bodySmall, { color: C.purple }]}>
            Chief Executive Officer
          </Text>
        </View>
      </View>
      <View
        style={{
          backgroundColor: C.blue50,
          borderRadius: 8,
          padding: 18,
          borderLeft: `3pt solid ${C.blue}`,
        }}
      >
        <Text style={s.body}>
          {data.ceo.message_lead !== "[CEO message lead - to be added]"
            ? data.ceo.message_lead
            : "This year has been one of tremendous growth for our organisation. With 210 staff members and $23.4 million in revenue, PICC continues to be the largest employer on Palm Island and the most significant provider of community services. Our commitment to community control and self-determination remains at the heart of everything we do."}
        </Text>
        <Text style={[s.body, { marginTop: 8 }]}>
          {data.ceo.message_body !== "[CEO message body - to be added]"
            ? data.ceo.message_body
            : "We have achieved a major milestone with the implementation of Delegated Authority under the Child Protection Act, meaning our community now decides care arrangements for our children. This has been a decades-long goal. We also launched the First 1,000 Days program, expanded our Bwgcolman Healing Service, and continued to grow our Digital Service Centre partnership with Telstra."}
        </Text>
      </View>
    </View>

    {/* Chair Message */}
    <View wrap={false}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: C.purple50,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Text style={{ fontSize: 18, color: C.purple }}>L</Text>
        </View>
        <View>
          <Text style={s.h4}>{data.chair.name}</Text>
          <Text style={[s.bodySmall, { color: C.purple }]}>Chair</Text>
        </View>
      </View>
      <View
        style={{
          backgroundColor: C.purple50,
          borderRadius: 8,
          padding: 18,
          borderLeft: `3pt solid ${C.purple}`,
        }}
      >
        <Text style={s.body}>
          {data.chair.message_lead !== "[Chair message lead - to be added]"
            ? data.chair.message_lead
            : "On behalf of the Board of Directors, I am proud to present the 2024-2025 Annual Report of the Palm Island Community Company. This year we have seen continued growth in service delivery and community impact. The Board remains committed to strong governance and ensuring PICC operates in the best interests of Palm Islanders."}
        </Text>
        <Text style={[s.body, { marginTop: 8 }]}>
          {data.chair.message_body !== "[Chair message body - to be added]"
            ? data.chair.message_body
            : "Our financial position remains sound with total revenue of $23.4 million. We passed the Human Services Quality Framework audit with flying colours, maintaining our commitment to excellence in service delivery. I thank our dedicated staff, management team, and fellow Board members for their tireless work serving our community."}
        </Text>
      </View>
    </View>

    <WaveDecoration color={C.blue} y={0} />
  </Page>
);

// ══════════════════════════════════════════════════════
// PAGE 4: YEAR IN NUMBERS
// ══════════════════════════════════════════════════════

const StatBox = ({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) => (
  <View
    wrap={false}
    style={{
      width: "48%",
      backgroundColor: C.white,
      border: `1pt solid ${C.border}`,
      borderRadius: 10,
      padding: 16,
      marginBottom: 10,
      borderTop: `3pt solid ${color}`,
    }}
  >
    <Text
      style={{
        fontFamily: "Caveat",
        fontSize: 32,
        fontWeight: "bold",
        color: color,
        marginBottom: 2,
      }}
    >
      {value}
    </Text>
    <Text style={{ fontSize: 9, color: C.textSecondary, lineHeight: 1.4 }}>
      {label}
    </Text>
  </View>
);

const YearInNumbersPage = () => (
  <Page size="A4" style={s.page}>
    <RunningHeader />
    <PageNumber />

    <View style={{ marginTop: 10 }}>
      <GradientBar width={100} />
      <Text style={s.sectionLabel}>Year in Numbers</Text>
      <Text style={[s.h1, { marginBottom: 6 }]}>
        2024-2025 at a Glance
      </Text>
      <Text style={[s.lead, { maxWidth: "80%" }]}>
        A snapshot of our impact across Palm Island this financial year.
      </Text>
    </View>

    {/* Photo */}
    <Image
      src={resolvePhoto("numbers", 0, "photo-000.jpg")}
      style={{
        width: CONTENT_W,
        height: 160,
        objectFit: "cover",
        borderRadius: 10,
        marginBottom: 20,
      }}
    />

    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
      <StatBox
        value={String(data.stats.staff_count)}
        label="Staff members employed"
        color={C.blue}
      />
      <StatBox
        value={`$${(data.financials.total_income / 1_000_000).toFixed(1)}M`}
        label="Total revenue"
        color={C.green}
      />
      <StatBox
        value={String(data.stats.services_count)}
        label="Community services delivered"
        color={C.purple}
      />
      <StatBox
        value={`${data.stats.indigenous_staff_pct}%`}
        label="Staff identifying as Aboriginal &/or Torres Strait Islander"
        color={C.orange}
      />
      <StatBox
        value={`${data.stats.years_operating}`}
        label="Years community controlled"
        color={C.teal}
      />
      <StatBox
        value={`${data.staff_data.resident_percent}%`}
        label="Staff living on Palm Island"
        color={C.amber}
      />
    </View>

    <WaveDecoration color={C.blue} y={0} />
  </Page>
);

// ══════════════════════════════════════════════════════
// PAGE 5: HIGHLIGHTS
// ══════════════════════════════════════════════════════

const HighlightCard = ({
  highlight,
  index,
}: {
  highlight: (typeof data.highlights)[0];
  index: number;
}) => {
  const colors = [C.blue, C.purple, C.green, C.orange, C.teal, C.amber, C.blueDark, C.purpleDark];
  const color = colors[index % colors.length];

  return (
    <View
      wrap={false}
      style={{
        width: "48%",
        backgroundColor: C.white,
        border: `1pt solid ${C.border}`,
        borderRadius: 8,
        padding: 14,
        marginBottom: 8,
        borderLeft: `3pt solid ${color}`,
      }}
    >
      <Text style={{ fontSize: 10, fontWeight: "bold", color: C.blueDark, marginBottom: 4 }}>
        {highlight.title}
      </Text>
      <Text style={{ fontSize: 8.5, color: C.textSecondary, lineHeight: 1.5, marginBottom: 6 }}>
        {highlight.description}
      </Text>
      {highlight.impact_achieved && (
        <View
          style={{
            backgroundColor: C.bgSection,
            borderRadius: 4,
            paddingVertical: 3,
            paddingHorizontal: 8,
            alignSelf: "flex-start",
          }}
        >
          <Text style={{ fontSize: 7.5, fontWeight: "semibold", color }}>
            {highlight.impact_achieved}
          </Text>
        </View>
      )}
    </View>
  );
};

const HighlightsPage = () => (
  <Page size="A4" style={s.page}>
    <RunningHeader />
    <PageNumber />

    <GradientBar />
    <Text style={s.sectionLabel}>Key Highlights</Text>
    <Text style={[s.h1, { marginBottom: 6 }]}>Making a Difference</Text>
    <Text style={[s.lead, { maxWidth: "85%" }]}>
      Our biggest achievements and milestones from the past year.
    </Text>

    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {data.highlights.map((h: any, i: number) => (
        <HighlightCard key={i} highlight={h} index={i} />
      ))}
    </View>

    <WaveDecoration color={C.purple} y={0} />
  </Page>
);

// ══════════════════════════════════════════════════════
// PAGE 6: GOVERNANCE & BOARD
// ══════════════════════════════════════════════════════

const GovernancePage = () => (
  <Page size="A4" style={s.page}>
    <RunningHeader />
    <PageNumber />

    <GradientBar />
    <Text style={s.sectionLabel}>Corporate Governance</Text>
    <Text style={[s.h1, { marginBottom: 8 }]}>Our Board & Leadership</Text>

    {/* Board photo */}
    <Image
      src={resolvePhoto("board", 0, "photo-005.jpg")}
      style={{
        width: CONTENT_W,
        height: 120,
        objectFit: "cover",
        borderRadius: 8,
        marginBottom: 12,
      }}
    />

    {/* Governance Achievements */}
    <View
      wrap={false}
      style={{
        backgroundColor: C.blue50,
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
      }}
    >
      <Text style={[s.h4, { marginBottom: 6, color: C.blueDark }]}>
        Governance Highlights
      </Text>
      {data.governance_achievements.map((a: string, i: number) => (
        <View
          key={i}
          style={{ flexDirection: "row", marginBottom: 4, paddingRight: 10 }}
        >
          <View
            style={{
              width: 5,
              height: 5,
              borderRadius: 3,
              backgroundColor: C.blue,
              marginTop: 3,
              marginRight: 6,
              flexShrink: 0,
            }}
          />
          <Text style={[s.bodySmall, { flex: 1, fontSize: 8 }]}>{a}</Text>
        </View>
      ))}
    </View>

    {/* Board Members Grid */}
    <Text style={[s.h4, { marginBottom: 6 }]}>Board of Directors</Text>
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
      {data.board_members
        .filter((m: any) =>
          ["Chair", "Director", "Alternate Director"].some((r) =>
            m.role.includes(r)
          ) || m.role.includes("Nominee")
        )
        .map((member: any, i: number) => (
          <View
            key={i}
            style={{
              width: "31%",
              backgroundColor: C.bgLight,
              borderRadius: 4,
              padding: 5,
              marginBottom: 2,
            }}
          >
            <Text style={{ fontSize: 8, fontWeight: "bold", color: C.textPrimary }}>
              {member.name}
            </Text>
            <Text style={{ fontSize: 6.5, color: C.purple }}>{member.role}</Text>
          </View>
        ))}
    </View>

    {/* Management team */}
    <Text style={[s.h4, { marginTop: 8, marginBottom: 4 }]}>
      Management Team
    </Text>
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
      {data.board_members
        .filter(
          (m: any) =>
            m.role.includes("General Manager") ||
            m.role.includes("Company Secretary")
        )
        .map((member: any, i: number) => (
          <View
            key={i}
            style={{
              width: "31%",
              backgroundColor: C.purple50,
              borderRadius: 4,
              padding: 5,
            }}
          >
            <Text style={{ fontSize: 8, fontWeight: "bold", color: C.textPrimary }}>
              {member.name}
            </Text>
            <Text style={{ fontSize: 6.5, color: C.purple }}>{member.role}</Text>
          </View>
        ))}
    </View>

    <WaveDecoration color={C.blue} y={0} />
  </Page>
);

// ══════════════════════════════════════════════════════
// PAGE 7: SERVICES
// ══════════════════════════════════════════════════════

const serviceCategories: Record<string, { label: string; color: string }> = {
  health: { label: "Health & Healing", color: C.green },
  family: { label: "Family & Children", color: C.blue },
  justice: { label: "Justice & Diversionary", color: C.purple },
  crisis: { label: "Crisis & Safety", color: C.orange },
  youth: { label: "Youth", color: C.teal },
  disability: { label: "Disability", color: C.amber },
  community: { label: "Community", color: C.blueDark },
};

const ServicesPage = () => {
  const grouped: Record<string, any[]> = {};
  data.services_detailed.forEach((svc: any) => {
    const cat = svc.service_category || "community";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(svc);
  });

  return (
    <Page size="A4" style={s.page}>
      <RunningHeader />
      <PageNumber />

      <GradientBar />
      <Text style={s.sectionLabel}>Our Services</Text>
      <Text style={[s.h1, { marginBottom: 6 }]}>
        16 Services for Our Community
      </Text>
      <Text style={[s.lead, { maxWidth: "85%" }]}>
        Delivering health, family support, justice, crisis, youth, and disability
        services across Palm Island.
      </Text>

      {/* Community photo */}
      <Image
        src={resolvePhoto("services", 0, "photo-010.jpg")}
        style={{
          width: CONTENT_W,
          height: 130,
          objectFit: "cover",
          borderRadius: 8,
          marginBottom: 16,
        }}
      />

      {/* Service categories */}
      {Object.entries(grouped).map(([cat, services]) => {
        const catInfo = serviceCategories[cat] || {
          label: cat,
          color: C.textSecondary,
        };
        return (
          <View
            key={cat}
            wrap={false}
            style={{ marginBottom: 10 }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: catInfo.color,
                  marginRight: 6,
                }}
              />
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "bold",
                  color: catInfo.color,
                }}
              >
                {catInfo.label}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 4,
                marginLeft: 14,
              }}
            >
              {services.map((svc: any, i: number) => (
                <View
                  key={i}
                  style={{
                    backgroundColor: C.bgSection,
                    borderRadius: 4,
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                  }}
                >
                  <Text style={{ fontSize: 8, color: C.textPrimary }}>
                    {svc.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        );
      })}

      <WaveDecoration color={C.green} y={0} />
    </Page>
  );
};

// ══════════════════════════════════════════════════════
// PAGE 8: STAFF REPORT CARD
// ══════════════════════════════════════════════════════

const StaffReportPage = () => {
  const { years, counts } = data.staff_data;
  const maxCount = Math.max(...counts);
  const barMaxWidth = 300;

  return (
    <Page size="A4" style={s.page}>
      <RunningHeader />
      <PageNumber />

      <GradientBar />
      <Text style={s.sectionLabel}>Staff Report Card</Text>
      <Text style={[s.h1, { marginBottom: 6 }]}>Our People</Text>
      <Text style={[s.lead, { maxWidth: "85%" }]}>
        PICC is the largest employer on Palm Island, with a workforce that
        reflects our community.
      </Text>

      {/* Bar chart - 3 year comparison */}
      <View
        style={{
          backgroundColor: C.bgLight,
          borderRadius: 10,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <Text style={[s.h4, { marginBottom: 16 }]}>
          Staff Numbers (3-Year Trend)
        </Text>
        {years.map((year: string, i: number) => {
          const barWidth = (counts[i] / maxCount) * barMaxWidth;
          const barColors = [C.blue, C.purple, C.teal];
          return (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  width: 90,
                  fontSize: 8.5,
                  color: C.textSecondary,
                }}
              >
                {year}
              </Text>
              {/* Bar */}
              <Svg width={String(barMaxWidth + 50)} height="24">
                <Defs>
                  <LinearGradient
                    id={`bar${i}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <Stop offset="0%" stopColor={barColors[i]} />
                    <Stop
                      offset="100%"
                      stopColor={barColors[i]}
                      stopOpacity="0.6"
                    />
                  </LinearGradient>
                </Defs>
                <Rect
                  x="0"
                  y="2"
                  width={String(barWidth)}
                  height="20"
                  rx="4"
                  fill={`url(#bar${i})`}
                />
              </Svg>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "bold",
                  color: barColors[i],
                  marginLeft: 8,
                }}
              >
                {counts[i]}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Key metrics */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: C.blue50,
            borderRadius: 8,
            padding: 16,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "Caveat",
              fontSize: 36,
              fontWeight: "bold",
              color: C.blue,
            }}
          >
            {data.staff_data.indigenous_percent}%
          </Text>
          <Text
            style={{
              fontSize: 8,
              color: C.textSecondary,
              textAlign: "center",
              marginTop: 4,
            }}
          >
            Aboriginal &/or Torres{"\n"}Strait Islander staff
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: C.purple50,
            borderRadius: 8,
            padding: 16,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "Caveat",
              fontSize: 36,
              fontWeight: "bold",
              color: C.purple,
            }}
          >
            {data.staff_data.resident_percent}%
          </Text>
          <Text
            style={{
              fontSize: 8,
              color: C.textSecondary,
              textAlign: "center",
              marginTop: 4,
            }}
          >
            Staff living on{"\n"}Palm Island
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: C.green50,
            borderRadius: 8,
            padding: 16,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "Caveat",
              fontSize: 36,
              fontWeight: "bold",
              color: C.green,
            }}
          >
            +39%
          </Text>
          <Text
            style={{
              fontSize: 8,
              color: C.textSecondary,
              textAlign: "center",
              marginTop: 4,
            }}
          >
            Staff growth{"\n"}over 3 years
          </Text>
        </View>
      </View>

      <WaveDecoration color={C.blue} y={0} />
    </Page>
  );
};

// ══════════════════════════════════════════════════════
// PAGE 9: INNOVATION ON COUNTRY
// ══════════════════════════════════════════════════════

function statusColor(status: string): string {
  switch (status) {
    case "in_progress":
    case "active":
      return C.green;
    case "completed":
      return C.blue;
    case "planning":
      return C.amber;
    default:
      return C.purple;
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "planning":
      return "Planning";
    default:
      return status;
  }
}

const InnovationPage = () => (
  <Page size="A4" style={s.page}>
    <RunningHeader />
    <PageNumber />

    <GradientBar />
    <Text style={s.sectionLabel}>Innovation on Country</Text>
    <Text style={[s.h1, { marginBottom: 6 }]}>
      Building Our Future, Our Way
    </Text>
    <Text style={[s.lead, { maxWidth: "85%" }]}>
      Community-led projects driving self-determination through innovation,
      culture, and technology.
    </Text>

    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
      {data.innovation_projects.map((proj: any, i: number) => (
        <View
          key={i}
          wrap={false}
          style={{
            width: "48%",
            backgroundColor: C.white,
            border: `1pt solid ${C.border}`,
            borderRadius: 8,
            padding: 14,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Status accent bar */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 4,
              height: "100%",
              backgroundColor: statusColor(proj.status),
            }}
          />
          <View style={{ marginLeft: 8 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 10.5,
                  fontWeight: "bold",
                  color: C.blueDark,
                  flex: 1,
                }}
              >
                {proj.name}
              </Text>
              <View
                style={{
                  backgroundColor: `${statusColor(proj.status)}15`,
                  borderRadius: 10,
                  paddingVertical: 2,
                  paddingHorizontal: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: 6.5,
                    fontWeight: "semibold",
                    color: statusColor(proj.status),
                    textTransform: "uppercase",
                  }}
                >
                  {statusLabel(proj.status)}
                </Text>
              </View>
            </View>
            <Text
              style={{
                fontSize: 8,
                color: C.textSecondary,
                lineHeight: 1.55,
              }}
            >
              {proj.why_text.length > 160
                ? proj.why_text.substring(0, 160) + "..."
                : proj.why_text}
            </Text>
          </View>
        </View>
      ))}
    </View>

    {/* Innovation quote or summary */}
    <View
      style={{
        backgroundColor: C.blue50,
        borderRadius: 8,
        padding: 18,
        borderLeft: `4pt solid ${C.blue}`,
        marginTop: 16,
      }}
    >
      <Text
        style={{
          fontFamily: "Caveat",
          fontSize: 14,
          color: C.textPrimary,
          lineHeight: 1.5,
        }}
      >
        "When we tell our own stories with our own technology, we keep our
        culture strong for the next generation."
      </Text>
      <Text
        style={{
          fontSize: 8,
          color: C.purple,
          fontWeight: "semibold",
          marginTop: 6,
        }}
      >
        — Community Elder, Palm Island
      </Text>
    </View>

    <WaveDecoration color={C.purple} y={0} />
  </Page>
);

// ══════════════════════════════════════════════════════
// PAGES 10-11: FINANCIAL SUMMARY
// ══════════════════════════════════════════════════════

const TableRow = ({
  label,
  current,
  previous,
  isTotal,
  isHeader,
}: {
  label: string;
  current?: number;
  previous?: number;
  isTotal?: boolean;
  isHeader?: boolean;
}) => (
  <View
    style={{
      flexDirection: "row",
      borderBottom: isTotal
        ? `1.5pt solid ${C.blueDark}`
        : `0.5pt solid ${C.borderLight}`,
      paddingVertical: isHeader ? 6 : 4,
      backgroundColor: isTotal ? C.blue50 : isHeader ? C.bgSection : "transparent",
    }}
  >
    <Text
      style={{
        flex: 2,
        fontSize: isTotal || isHeader ? 8.5 : 8,
        fontWeight: isTotal || isHeader ? "bold" : "normal",
        color: isTotal ? C.blueDark : C.textPrimary,
        paddingLeft: 8,
      }}
    >
      {label}
    </Text>
    <Text
      style={{
        flex: 1,
        fontSize: isTotal ? 8.5 : 8,
        fontWeight: isTotal ? "bold" : "normal",
        color: isTotal ? C.blueDark : C.textSecondary,
        textAlign: "right",
        paddingRight: 8,
      }}
    >
      {current !== undefined ? fmtFullCurrency(current) : "2024-25"}
    </Text>
    <Text
      style={{
        flex: 1,
        fontSize: isTotal ? 8.5 : 8,
        fontWeight: isTotal ? "bold" : "normal",
        color: isTotal ? C.blueDark : C.textMuted,
        textAlign: "right",
        paddingRight: 8,
      }}
    >
      {previous !== undefined ? fmtFullCurrency(previous) : "2023-24"}
    </Text>
  </View>
);

const FinancialsPage = () => {
  // Donut chart data
  const breakdown = data.financials.expenditure_breakdown;
  const donutR = 60;
  const donutHole = 38;

  // Build SVG donut segments
  const donutSegments: JSX.Element[] = [];
  let cumulativePercent = 0;

  breakdown.forEach((item: any, i: number) => {
    const startAngle = (cumulativePercent / 100) * 360;
    const endAngle = ((cumulativePercent + item.percent) / 100) * 360;
    cumulativePercent += item.percent;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = 80 + donutR * Math.cos(startRad);
    const y1 = 80 + donutR * Math.sin(startRad);
    const x2 = 80 + donutR * Math.cos(endRad);
    const y2 = 80 + donutR * Math.sin(endRad);

    const ix1 = 80 + donutHole * Math.cos(endRad);
    const iy1 = 80 + donutHole * Math.sin(endRad);
    const ix2 = 80 + donutHole * Math.cos(startRad);
    const iy2 = 80 + donutHole * Math.sin(startRad);

    const largeArc = item.percent > 50 ? 1 : 0;

    const d = [
      `M ${x1} ${y1}`,
      `A ${donutR} ${donutR} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${donutHole} ${donutHole} 0 ${largeArc} 0 ${ix2} ${iy2}`,
      "Z",
    ].join(" ");

    donutSegments.push(
      <Path key={i} d={d} fill={item.color} />
    );
  });

  return (
    <Page size="A4" style={s.page}>
      <RunningHeader />
      <PageNumber />

      <GradientBar />
      <Text style={s.sectionLabel}>Financial Summary</Text>
      <Text style={[s.h1, { marginBottom: 12 }]}>
        Financial Report 2024-2025
      </Text>

      {/* Balance Sheet */}
      <View wrap={false} style={{ marginBottom: 16 }}>
        <Text style={[s.h4, { marginBottom: 6 }]}>Balance Sheet</Text>
        <View
          style={{
            border: `1pt solid ${C.border}`,
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          <TableRow label="" isHeader />
          {data.financials.balance_sheet.map((row: any, i: number) => (
            <TableRow
              key={i}
              label={row.label}
              current={row.current}
              previous={row.previous}
              isTotal={row.class === "total"}
            />
          ))}
        </View>
      </View>

      {/* Income & Expenditure */}
      <View wrap={false} style={{ marginBottom: 16 }}>
        <Text style={[s.h4, { marginBottom: 6 }]}>
          Income & Expenditure Statement
        </Text>
        <View
          style={{
            border: `1pt solid ${C.border}`,
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          <TableRow label="" isHeader />
          {data.financials.income_expenditure.map((row: any, i: number) => (
            <TableRow
              key={i}
              label={row.label}
              current={row.current}
              previous={row.previous}
              isTotal={row.class === "total"}
            />
          ))}
        </View>
      </View>

      {data.financials.audited && (
        <Text style={{ fontSize: 7, color: C.textMuted }}>
          *These figures are from the audited financial statements.
        </Text>
      )}

      <WaveDecoration color={C.blue} y={0} />
    </Page>
  );
};

const ExpenditureBreakdownPage = () => {
  const breakdown = data.financials.expenditure_breakdown;
  const donutR = 70;
  const donutHole = 42;

  const donutSegments: JSX.Element[] = [];
  let cumulativePercent = 0;

  breakdown.forEach((item: any, i: number) => {
    const startAngle = (cumulativePercent / 100) * 360;
    const endAngle = ((cumulativePercent + item.percent) / 100) * 360;
    cumulativePercent += item.percent;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = 90 + donutR * Math.cos(startRad);
    const y1 = 90 + donutR * Math.sin(startRad);
    const x2 = 90 + donutR * Math.cos(endRad);
    const y2 = 90 + donutR * Math.sin(endRad);

    const ix1 = 90 + donutHole * Math.cos(endRad);
    const iy1 = 90 + donutHole * Math.sin(endRad);
    const ix2 = 90 + donutHole * Math.cos(startRad);
    const iy2 = 90 + donutHole * Math.sin(startRad);

    const largeArc = item.percent > 50 ? 1 : 0;

    const d = [
      `M ${x1} ${y1}`,
      `A ${donutR} ${donutR} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${donutHole} ${donutHole} 0 ${largeArc} 0 ${ix2} ${iy2}`,
      "Z",
    ].join(" ");

    donutSegments.push(<Path key={i} d={d} fill={item.color} />);
  });

  return (
    <Page size="A4" style={s.page}>
      <RunningHeader />
      <PageNumber />

      <GradientBar />
      <Text style={s.sectionLabel}>Where the Money Goes</Text>
      <Text style={[s.h1, { marginBottom: 16 }]}>
        Expenditure Breakdown
      </Text>

      <View style={{ flexDirection: "row", gap: 30 }}>
        {/* Donut chart */}
        <View style={{ width: 180, alignItems: "center" }}>
          <Svg width="180" height="180">
            {donutSegments}
            {/* Center text */}
          </Svg>
          <Text
            style={{
              position: "absolute",
              top: 72,
              left: 0,
              right: 0,
              textAlign: "center",
              fontFamily: "Caveat",
              fontSize: 16,
              fontWeight: "bold",
              color: C.blueDark,
            }}
          >
            {fmtCurrency(data.financials.total_expenditure)}
          </Text>
          <Text
            style={{
              position: "absolute",
              top: 92,
              left: 0,
              right: 0,
              textAlign: "center",
              fontSize: 7,
              color: C.textMuted,
            }}
          >
            Total Expenditure
          </Text>
        </View>

        {/* Legend */}
        <View style={{ flex: 1 }}>
          {breakdown.map((item: any, i: number) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
                paddingBottom: 10,
                borderBottom:
                  i < breakdown.length - 1
                    ? `0.5pt solid ${C.borderLight}`
                    : "none",
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  backgroundColor: item.color,
                  marginRight: 10,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 9, fontWeight: "semibold", color: C.textPrimary }}>
                  {item.label}
                </Text>
                <Text style={{ fontSize: 7.5, color: C.textMuted }}>
                  {fmtCurrency(
                    (item.percent / 100) * data.financials.total_expenditure
                  )}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "bold",
                  color: item.color,
                }}
              >
                {item.percent}%
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Revenue vs Expenditure summary */}
      <View
        style={{
          flexDirection: "row",
          gap: 12,
          marginTop: 24,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: C.green50,
            borderRadius: 8,
            padding: 16,
            borderLeft: `3pt solid ${C.green}`,
          }}
        >
          <Text style={{ fontSize: 8, color: C.textSecondary, marginBottom: 2 }}>
            Total Income
          </Text>
          <Text
            style={{
              fontFamily: "Caveat",
              fontSize: 26,
              fontWeight: "bold",
              color: C.green,
            }}
          >
            {fmtCurrency(data.financials.total_income)}
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: C.blue50,
            borderRadius: 8,
            padding: 16,
            borderLeft: `3pt solid ${C.blue}`,
          }}
        >
          <Text style={{ fontSize: 8, color: C.textSecondary, marginBottom: 2 }}>
            Total Expenditure
          </Text>
          <Text
            style={{
              fontFamily: "Caveat",
              fontSize: 26,
              fontWeight: "bold",
              color: C.blue,
            }}
          >
            {fmtCurrency(data.financials.total_expenditure)}
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor:
              data.financials.total_income - data.financials.total_expenditure >= 0
                ? C.green50
                : C.amber50,
            borderRadius: 8,
            padding: 16,
            borderLeft: `3pt solid ${
              data.financials.total_income - data.financials.total_expenditure >= 0
                ? C.green
                : C.orange
            }`,
          }}
        >
          <Text style={{ fontSize: 8, color: C.textSecondary, marginBottom: 2 }}>
            Net Result
          </Text>
          <Text
            style={{
              fontFamily: "Caveat",
              fontSize: 26,
              fontWeight: "bold",
              color:
                data.financials.total_income - data.financials.total_expenditure >= 0
                  ? C.green
                  : C.orange,
            }}
          >
            {fmtCurrency(
              data.financials.total_income - data.financials.total_expenditure
            )}
          </Text>
        </View>
      </View>

      <WaveDecoration color={C.blue} y={0} />
    </Page>
  );
};

// ══════════════════════════════════════════════════════
// PAGE 12: PARTNERS
// ══════════════════════════════════════════════════════

const partnerTypeLabels: Record<string, string> = {
  government: "Government Partners",
  health: "Health Partners",
  education: "Education Partners",
  corporate: "Corporate Partners",
  community: "Community Partners",
  peak_body: "Peak Bodies",
};

const partnerTypeColors: Record<string, string> = {
  government: C.blue,
  health: C.green,
  education: C.purple,
  corporate: C.teal,
  community: C.orange,
  peak_body: C.amber,
};

const PartnersPage = () => {
  const grouped: Record<string, any[]> = {};
  data.partners_detailed.forEach((p: any) => {
    const type = p.partner_type || "community";
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(p);
  });

  return (
    <Page size="A4" style={s.page}>
      <RunningHeader />
      <PageNumber />

      <GradientBar />
      <Text style={s.sectionLabel}>Our Partners</Text>
      <Text style={[s.h1, { marginBottom: 6 }]}>Working Together</Text>
      <Text style={[s.lead, { maxWidth: "85%" }]}>
        PICC works with {data.partners.length} partners across government,
        health, education, and community sectors.
      </Text>

      {Object.entries(grouped).map(([type, partners]) => (
        <View key={type} wrap={false} style={{ marginBottom: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: partnerTypeColors[type] || C.textMuted,
                marginRight: 6,
              }}
            />
            <Text
              style={{
                fontSize: 10,
                fontWeight: "bold",
                color: partnerTypeColors[type] || C.textPrimary,
              }}
            >
              {partnerTypeLabels[type] || type}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 6,
              marginLeft: 14,
            }}
          >
            {partners
              .sort((a: any, b: any) => a.display_order - b.display_order)
              .map((p: any, i: number) => (
                <View
                  key={i}
                  style={{
                    backgroundColor: C.bgLight,
                    borderRadius: 6,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    border: `0.5pt solid ${C.border}`,
                  }}
                >
                  <Text style={{ fontSize: 8.5, color: C.textPrimary }}>
                    {p.name}
                  </Text>
                </View>
              ))}
          </View>
        </View>
      ))}

      <WaveDecoration color={C.teal} y={0} />
    </Page>
  );
};

// ══════════════════════════════════════════════════════
// STORY SPREAD PAGE
// ══════════════════════════════════════════════════════

const StorySpreadPage = ({ story }: { story: any }) => {
  const hasImage = story.featured_image && story.featured_image.startsWith("http");

  return (
    <Page size="A4" style={s.page}>
      <RunningHeader />
      <PageNumber />

      {/* Photo section */}
      {hasImage && (
        <View style={{ marginBottom: 16 }}>
          <Image
            src={story.featured_image}
            style={{
              width: CONTENT_W,
              height: 220,
              objectFit: "cover",
              borderRadius: 10,
            }}
          />
        </View>
      )}

      <GradientBar />
      <Text style={s.sectionLabel}>{story.category || "Community Story"}</Text>
      <Text style={[s.h1, { marginBottom: 8 }]}>{story.title}</Text>

      {story.storyteller_name && (
        <Text style={[s.bodySmall, { color: C.purple, marginBottom: 12 }]}>
          Story by {story.storyteller_name}
        </Text>
      )}

      {/* Quote callout */}
      {story.quote && (
        <View
          wrap={false}
          style={{
            backgroundColor: C.purple50,
            borderRadius: 8,
            padding: 18,
            borderLeft: `4pt solid ${C.purple}`,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontFamily: "Caveat",
              fontSize: 14,
              color: C.textPrimary,
              lineHeight: 1.5,
            }}
          >
            "{story.quote.text}"
          </Text>
          <Text
            style={{
              fontSize: 8,
              color: C.purple,
              fontWeight: "semibold",
              marginTop: 6,
            }}
          >
            — {story.quote.attribution}
          </Text>
        </View>
      )}

      {/* Body text */}
      {story.body && (
        <Text style={[s.body, { lineHeight: 1.7 }]}>
          {story.body.length > 800 ? story.body.substring(0, 800) + "..." : story.body}
        </Text>
      )}

      {/* Service tags */}
      {story.services && story.services.length > 0 && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
          {story.services.map((svc: string, i: number) => (
            <View
              key={i}
              style={{
                backgroundColor: C.blue50,
                borderRadius: 10,
                paddingVertical: 3,
                paddingHorizontal: 10,
              }}
            >
              <Text style={{ fontSize: 7, color: C.blue, fontWeight: "semibold" }}>{svc}</Text>
            </View>
          ))}
        </View>
      )}

      <WaveDecoration color={C.purple} y={0} />
    </Page>
  );
};

// ══════════════════════════════════════════════════════
// PHOTO GALLERY PAGE
// ══════════════════════════════════════════════════════

const PhotoGalleryPage = () => {
  const galleryPhotos = (data.report_photos?.gallery || data.report_photos?.all || []).slice(0, 9);

  if (galleryPhotos.length === 0) return null;

  return (
    <Page size="A4" style={s.page}>
      <RunningHeader />
      <PageNumber />

      <GradientBar />
      <Text style={s.sectionLabel}>Gallery</Text>
      <Text style={[s.h1, { marginBottom: 16 }]}>Life on Palm Island</Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {galleryPhotos.map((photo: any, i: number) => (
          <View key={i} style={{ width: "31.5%", marginBottom: 4 }}>
            {photo.url && photo.url.startsWith("http") ? (
              <Image
                src={photo.url}
                style={{
                  width: "100%",
                  height: 130,
                  objectFit: "cover",
                  borderRadius: 6,
                }}
              />
            ) : (
              <View
                style={{
                  width: "100%",
                  height: 130,
                  backgroundColor: C.bgSection,
                  borderRadius: 6,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 7, color: C.textMuted }}>Photo</Text>
              </View>
            )}
            {photo.caption && (
              <Text style={{ fontSize: 6.5, color: C.textMuted, marginTop: 2 }}>
                {photo.caption}
              </Text>
            )}
          </View>
        ))}
      </View>

      <WaveDecoration color={C.blue} y={0} />
    </Page>
  );
};

// ══════════════════════════════════════════════════════
// ELDER PORTRAIT PAGE
// ══════════════════════════════════════════════════════

const ElderPortraitPage = ({ elder, quote }: { elder: any; quote?: any }) => (
  <Page size="A4" style={s.page}>
    <RunningHeader />
    <PageNumber />

    <View style={{ marginTop: 40, alignItems: "center" }}>
      {/* Circle photo */}
      {elder.photo_url && elder.photo_url.startsWith("http") ? (
        <View style={{ width: 140, height: 140, borderRadius: 70, overflow: "hidden", marginBottom: 20 }}>
          <Image
            src={elder.photo_url}
            style={{ width: 140, height: 140, objectFit: "cover" }}
          />
        </View>
      ) : (
        <View
          style={{
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: C.purple50,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <Text style={{ fontFamily: "Caveat", fontSize: 48, color: C.purple }}>
            {(elder.full_name || "E")[0]}
          </Text>
        </View>
      )}

      <Text style={[s.h1, { textAlign: "center", marginBottom: 4 }]}>
        {elder.preferred_name || elder.full_name}
      </Text>

      {elder.community_role && (
        <Text style={{ fontSize: 10, color: C.purple, textAlign: "center", marginBottom: 20 }}>
          {elder.community_role}
        </Text>
      )}

      <GradientBar width={60} />
    </View>

    {/* Quote */}
    {quote && (
      <View
        style={{
          backgroundColor: C.purple50,
          borderRadius: 10,
          padding: 24,
          marginTop: 20,
          borderLeft: `4pt solid ${C.purple}`,
        }}
      >
        <Text
          style={{
            fontFamily: "Caveat",
            fontSize: 16,
            color: C.textPrimary,
            lineHeight: 1.6,
            textAlign: "center",
          }}
        >
          "{quote.quote_text}"
        </Text>
      </View>
    )}

    {/* Bio */}
    {elder.bio && (
      <View style={{ marginTop: 20 }}>
        <Text style={[s.body, { lineHeight: 1.7, textAlign: "center" }]}>
          {elder.bio.length > 500 ? elder.bio.substring(0, 500) + "..." : elder.bio}
        </Text>
      </View>
    )}

    <WaveDecoration color={C.purple} y={0} />
  </Page>
);

// ══════════════════════════════════════════════════════
// SERVICE SPOTLIGHT PAGE
// ══════════════════════════════════════════════════════

const ServiceSpotlightPage = () => {
  // Find the service with the most metrics/data
  const topService = data.services_detailed?.find((s: any) => s.service_category === "health") ||
    data.services_detailed?.[0];

  if (!topService) return null;

  const metrics = data.data_cards?.filter((c: any) =>
    c.service?.toLowerCase().includes(topService.name?.toLowerCase()?.split(" ")[0])
  ) || [];

  return (
    <Page size="A4" style={s.page}>
      <RunningHeader />
      <PageNumber />

      <GradientBar />
      <Text style={s.sectionLabel}>Service Spotlight</Text>
      <Text style={[s.h1, { marginBottom: 8 }]}>{topService.name}</Text>

      <Text style={[s.lead, { maxWidth: "85%" }]}>
        A closer look at one of our key community services and its impact.
      </Text>

      {/* Metrics grid */}
      {metrics.length > 0 && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
          {metrics.slice(0, 4).map((m: any, i: number) => {
            const colors = [C.blue, C.purple, C.green, C.orange];
            return (
              <View
                key={i}
                wrap={false}
                style={{
                  width: "48%",
                  backgroundColor: C.white,
                  border: `1pt solid ${C.border}`,
                  borderRadius: 8,
                  padding: 14,
                  borderTop: `3pt solid ${colors[i % colors.length]}`,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Caveat",
                    fontSize: 28,
                    fontWeight: "bold",
                    color: colors[i % colors.length],
                    marginBottom: 2,
                  }}
                >
                  {m.value}
                </Text>
                <Text style={{ fontSize: 8.5, color: C.textSecondary }}>{m.label}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Related story excerpt if available */}
      {data.stories_full?.length > 0 && (() => {
        const relatedStory = data.stories_full.find(
          (st: any) => st.services?.some((svc: string) =>
            svc.toLowerCase().includes(topService.name?.toLowerCase()?.split(" ")[0])
          )
        );
        if (!relatedStory) return null;
        return (
          <View
            style={{
              backgroundColor: C.blue50,
              borderRadius: 8,
              padding: 18,
              borderLeft: `4pt solid ${C.blue}`,
            }}
          >
            <Text style={[s.h4, { marginBottom: 6 }]}>{relatedStory.title}</Text>
            <Text style={[s.body, { lineHeight: 1.6 }]}>
              {(relatedStory.body || "").substring(0, 300)}
              {(relatedStory.body || "").length > 300 ? "..." : ""}
            </Text>
          </View>
        );
      })()}

      <WaveDecoration color={C.green} y={0} />
    </Page>
  );
};

// ══════════════════════════════════════════════════════
// ELDER GROUP PAGE
// ══════════════════════════════════════════════════════

const ElderGroupPage = () => {
  const elders = data.elder_profiles || [];
  if (elders.length === 0) return null;

  return (
    <Page size="A4" style={s.page}>
      <RunningHeader />
      <PageNumber />

      <GradientBar />
      <Text style={s.sectionLabel}>Elder Advisory Group</Text>
      <Text style={[s.h1, { marginBottom: 16 }]}>Our Elders</Text>

      <Text style={[s.lead, { maxWidth: "85%" }]}>
        We honour and thank our Elders for their guidance, wisdom, and
        leadership in everything we do.
      </Text>

      {/* Elder name grid */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
        {elders.map((elder: any, i: number) => (
          <View
            key={i}
            wrap={false}
            style={{
              width: "31%",
              backgroundColor: C.purple50,
              borderRadius: 8,
              padding: 12,
              alignItems: "center",
            }}
          >
            {/* Avatar circle */}
            {elder.photo_url && elder.photo_url.startsWith("http") ? (
              <View style={{ width: 60, height: 60, borderRadius: 30, overflow: "hidden", marginBottom: 8 }}>
                <Image
                  src={elder.photo_url}
                  style={{ width: 60, height: 60, objectFit: "cover" }}
                />
              </View>
            ) : (
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: C.white,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontFamily: "Caveat", fontSize: 24, color: C.purple }}>
                  {(elder.full_name || "E")[0]}
                </Text>
              </View>
            )}

            <Text
              style={{
                fontSize: 9,
                fontWeight: "bold",
                color: C.textPrimary,
                textAlign: "center",
              }}
            >
              {elder.preferred_name || elder.full_name}
            </Text>
            {elder.community_role && (
              <Text
                style={{
                  fontSize: 7,
                  color: C.purple,
                  textAlign: "center",
                  marginTop: 2,
                }}
              >
                {elder.community_role}
              </Text>
            )}
          </View>
        ))}
      </View>

      <WaveDecoration color={C.purple} y={0} />
    </Page>
  );
};

// ══════════════════════════════════════════════════════
// TRIP TIMELINE PAGE
// ══════════════════════════════════════════════════════

const TripTimelinePage = () => {
  const trip = data.elder_trip;
  if (!trip || !trip.timeline || trip.timeline.length === 0) return null;

  return (
    <Page size="A4" style={s.page}>
      <RunningHeader />
      <PageNumber />

      <GradientBar />
      <Text style={s.sectionLabel}>Cultural Journey</Text>
      <Text style={[s.h1, { marginBottom: 8 }]}>
        {trip.title || "Hull River Elder Trip"}
      </Text>

      {trip.subtitle && (
        <Text style={[s.lead, { maxWidth: "85%" }]}>{trip.subtitle}</Text>
      )}

      {/* Hero image */}
      {trip.hero_image && trip.hero_image.startsWith("http") && (
        <Image
          src={trip.hero_image}
          style={{
            width: CONTENT_W,
            height: 160,
            objectFit: "cover",
            borderRadius: 10,
            marginBottom: 20,
          }}
        />
      )}

      {/* Vertical timeline */}
      <View style={{ marginLeft: 20, borderLeft: `2pt solid ${C.purple}`, paddingLeft: 20 }}>
        {trip.timeline.map((stop: any, i: number) => (
          <View
            key={i}
            wrap={false}
            style={{ marginBottom: 16, position: "relative" }}
          >
            {/* Dot */}
            <View
              style={{
                position: "absolute",
                left: -27,
                top: 3,
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: stop.is_complete ? C.purple : C.textMuted,
                border: `2pt solid ${C.white}`,
              }}
            />

            {stop.date && (
              <Text style={{ fontSize: 7.5, color: C.purple, fontWeight: "semibold", marginBottom: 2 }}>
                {stop.date}
              </Text>
            )}
            <Text style={[s.h4, { color: C.blueDark }]}>{stop.title}</Text>
            {stop.description && (
              <Text style={[s.bodySmall, { marginTop: 3, lineHeight: 1.5 }]}>
                {stop.description}
              </Text>
            )}
          </View>
        ))}
      </View>

      <WaveDecoration color={C.purple} y={0} />
    </Page>
  );
};

// ══════════════════════════════════════════════════════
// ELDER QUOTE COLLECTION PAGE
// ══════════════════════════════════════════════════════

const ElderQuoteCollectionPage = () => {
  const quotes = (data.elder_quotes || []).slice(0, 6);
  if (quotes.length === 0) return null;

  const quoteColors = [C.blue, C.purple, C.green, C.teal, C.orange, C.amber];

  return (
    <Page size="A4" style={s.page}>
      <RunningHeader />
      <PageNumber />

      <GradientBar />
      <Text style={s.sectionLabel}>Elder Voices</Text>
      <Text style={[s.h1, { marginBottom: 16 }]}>Words of Wisdom</Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {quotes.map((q: any, i: number) => {
          const color = quoteColors[i % quoteColors.length];
          return (
            <View
              key={i}
              wrap={false}
              style={{
                width: "48%",
                backgroundColor: C.white,
                border: `1pt solid ${C.border}`,
                borderRadius: 10,
                padding: 16,
                borderLeft: `4pt solid ${color}`,
              }}
            >
              <Text
                style={{
                  fontFamily: "Caveat",
                  fontSize: 13,
                  color: C.textPrimary,
                  lineHeight: 1.5,
                  marginBottom: 8,
                }}
              >
                "{q.quote_text.length > 200
                  ? q.quote_text.substring(0, 200) + "..."
                  : q.quote_text}"
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {q.photo_url && q.photo_url.startsWith("http") ? (
                  <View style={{ width: 24, height: 24, borderRadius: 12, overflow: "hidden", marginRight: 8 }}>
                    <Image
                      src={q.photo_url}
                      style={{ width: 24, height: 24, objectFit: "cover" }}
                    />
                  </View>
                ) : (
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: `${color}20`,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 8,
                    }}
                  >
                    <Text style={{ fontSize: 10, color }}>{(q.elder_name || "E")[0]}</Text>
                  </View>
                )}
                <View>
                  <Text style={{ fontSize: 8, fontWeight: "bold", color: C.textPrimary }}>
                    {q.attribution || q.elder_name}
                  </Text>
                  {q.elder_role && (
                    <Text style={{ fontSize: 6.5, color }}>{q.elder_role}</Text>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <WaveDecoration color={C.purple} y={0} />
    </Page>
  );
};

// ══════════════════════════════════════════════════════
// PAGE 13: BACK COVER
// ══════════════════════════════════════════════════════

const BackCoverPage = () => (
  <Page size="A4" style={s.pageBleed}>
    {/* Background color */}
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: A4_W,
        height: A4_H,
        backgroundColor: C.blueDark,
      }}
    />

    {/* Wave decorations - wrapped in View to avoid wrap warning */}
    <View style={{ position: "absolute", top: 0, left: 0, width: A4_W, height: A4_H }}>
      <Svg
        width={String(A4_W)}
        height={String(A4_H)}
      >
        <Path
          d={`M0,${A4_H * 0.6} Q${A4_W * 0.25},${A4_H * 0.55} ${A4_W * 0.5},${A4_H * 0.62} T${A4_W},${A4_H * 0.58} L${A4_W},${A4_H} L0,${A4_H} Z`}
          fill="#ffffff"
          opacity="0.05"
        />
        <Path
          d={`M0,${A4_H * 0.65} Q${A4_W * 0.3},${A4_H * 0.6} ${A4_W * 0.55},${A4_H * 0.67} T${A4_W},${A4_H * 0.63} L${A4_W},${A4_H} L0,${A4_H} Z`}
          fill="#ffffff"
          opacity="0.03"
        />
      </Svg>
    </View>

    <DotPattern
      x={MARGIN}
      y={100}
      rows={3}
      cols={4}
      color="#ffffff"
      opacity={0.1}
    />
    <DotPattern
      x={A4_W - MARGIN - 60}
      y={A4_H - 200}
      rows={3}
      cols={4}
      color="#ffffff"
      opacity={0.1}
    />

    {/* Content */}
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 80,
      }}
    >
      {/* Logo */}
      <Image
        src={logoPath}
        style={{
          width: 100,
          height: 100,
          objectFit: "contain",
          marginBottom: 30,
        }}
      />

      {/* Mission statement */}
      <Text
        style={{
          fontFamily: "Caveat",
          fontSize: 18,
          color: "#ffffff",
          textAlign: "center",
          lineHeight: 1.6,
          marginBottom: 30,
          opacity: 0.9,
        }}
      >
        "{data.mission_statement}"
      </Text>

      {/* Divider */}
      <Svg width="60" height="2" style={{ marginBottom: 30 }}>
        <Rect x="0" y="0" width="60" height="2" rx="1" fill="#ffffff" opacity="0.3" />
      </Svg>

      {/* Contact details */}
      <View style={{ alignItems: "center" }}>
        <Text
          style={{
            fontSize: 11,
            fontWeight: "bold",
            color: "#ffffff",
            marginBottom: 12,
          }}
        >
          Palm Island Community Company
        </Text>
        <Text style={{ fontSize: 9, color: "#ffffff", opacity: 0.8, marginBottom: 3 }}>
          {data.contact.address_line1}
        </Text>
        <Text style={{ fontSize: 9, color: "#ffffff", opacity: 0.8, marginBottom: 3 }}>
          {data.contact.address_line2}
        </Text>
        <Text style={{ fontSize: 9, color: "#ffffff", opacity: 0.8, marginBottom: 3 }}>
          {data.contact.address_line3}
        </Text>
        <Text style={{ fontSize: 9, color: "#ffffff", opacity: 0.8, marginBottom: 12 }}>
          Phone: {data.contact.phone}
        </Text>
        <Text
          style={{
            fontSize: 10,
            fontWeight: "semibold",
            color: "#ffffff",
            opacity: 0.9,
          }}
        >
          {data.contact.website}
        </Text>
      </View>

      {/* ACN */}
      <Text
        style={{
          fontSize: 7,
          color: "#ffffff",
          opacity: 0.5,
          marginTop: 20,
        }}
      >
        ACN {data.contact.acn}
      </Text>
    </View>
  </Page>
);

// ══════════════════════════════════════════════════════
// FULL DOCUMENT
// ══════════════════════════════════════════════════════

// ── Cultural protocol check ─────────────────────────
const culturalProtocol = data.cultural_protocol || {};
if (culturalProtocol.warnings?.length > 0) {
  console.warn("\n⚠️  Cultural Protocol Warnings:");
  for (const w of culturalProtocol.warnings) {
    console.warn(`   - ${w}`);
  }
}

// ── Helper: get featured stories for spread pages ──
const featuredStories = (data.stories_full || data.stories || [])
  .filter((s: any) => s.title && s.body)
  .slice(0, 2);

// ── Helper: find elder quote for a given profile ──
function findElderQuote(elderId: string) {
  return (data.elder_quotes || []).find(
    (q: any) => q.id === elderId || q.elder_name === elderId
  );
}

const AnnualReport = () => (
  <Document
    title={`PICC Annual Report ${data.year_range}`}
    author="Palm Island Community Company"
    subject="Annual Report"
    language="en-AU"
  >
    {/* 1. Cover */}
    <CoverPage />

    {/* 2. Acknowledgement of Country */}
    <AcknowledgementPage />

    {/* 3. CEO & Chair Messages */}
    <MessagesPage />

    {/* 4. Year in Numbers */}
    <YearInNumbersPage />

    {/* 5. Key Highlights */}
    <HighlightsPage />

    {/* 6-7. Story Spreads (only if stories exist) */}
    {featuredStories.map((story: any, i: number) => (
      <StorySpreadPage key={`story-${i}`} story={story} />
    ))}

    {/* 8. Governance & Board */}
    <GovernancePage />

    {/* 9. Services Overview */}
    <ServicesPage />

    {/* 10. Service Spotlight (only if metrics exist) */}
    {(data.data_cards?.length > 0 || data.services_detailed?.length > 0) && (
      <ServiceSpotlightPage />
    )}

    {/* 11. Staff Report Card */}
    <StaffReportPage />

    {/* 12. Innovation on Country */}
    <InnovationPage />

    {/* 13. Photo Gallery (only if report photos exist) */}
    {(data.report_photos?.gallery?.length > 0 || data.report_photos?.all?.length > 0) && (
      <PhotoGalleryPage />
    )}

    {/* 14. Financial Report */}
    <FinancialsPage />

    {/* 15. Expenditure Breakdown */}
    <ExpenditureBreakdownPage />

    {/* 16. Partners */}
    <PartnersPage />

    {/* 17. Back Cover */}
    <BackCoverPage />
  </Document>
);

// ══════════════════════════════════════════════════════
// DATA-DRIVEN PAGE RENDERER
// ══════════════════════════════════════════════════════

// Maps page_type to component — used when rendering from a pages[] array
function renderPageByType(pageType: string, config: Record<string, any>, index: number): JSX.Element | null {
  switch (pageType) {
    case 'cover': return <CoverPage key={index} />;
    case 'acknowledgement': return <AcknowledgementPage key={index} />;
    case 'messages': return <MessagesPage key={index} />;
    case 'year_in_numbers': return <YearInNumbersPage key={index} />;
    case 'highlights': return <HighlightsPage key={index} />;
    case 'story_spread': {
      const storyIdx = config.story_index ?? index;
      const story = config.story_id
        ? featuredStories.find((s: any) => s.id === config.story_id) || featuredStories[0]
        : featuredStories[storyIdx] || featuredStories[0];
      return story ? <StorySpreadPage key={index} story={story} /> : null;
    }
    case 'governance': return <GovernancePage key={index} />;
    case 'services': return <ServicesPage key={index} />;
    case 'service_spotlight': return <ServiceSpotlightPage key={index} />;
    case 'staff_report': return <StaffReportPage key={index} />;
    case 'innovation': return <InnovationPage key={index} />;
    case 'photo_gallery': return <PhotoGalleryPage key={index} />;
    case 'financials': return <FinancialsPage key={index} />;
    case 'expenditure': return <ExpenditureBreakdownPage key={index} />;
    case 'partners': return <PartnersPage key={index} />;
    case 'elder_group': return <ElderGroupPage key={index} />;
    case 'elder_portrait': {
      const elders = data.elder_profiles || [];
      const elderIdx = config.elder_index ?? 0;
      const elder = config.elder_id
        ? elders.find((e: any) => e.id === config.elder_id) || elders[elderIdx]
        : elders[elderIdx];
      if (!elder) return null;
      const quote = (data.elder_quotes || []).find(
        (q: any) => q.elder_name === elder.full_name
      );
      return <ElderPortraitPage key={index} elder={elder} quote={quote} />;
    }
    case 'elder_quotes': return <ElderQuoteCollectionPage key={index} />;
    case 'trip_overview': {
      const trip = data.elder_trip;
      if (!trip?.title) return null;
      // Render as a story spread with trip content
      return <StorySpreadPage key={index} story={{
        title: trip.title,
        body: trip.sections?.[0]?.content || '',
        featured_image: trip.hero_image,
        category: 'Cultural Journey',
        quote: trip.sections?.find((s: any) => s.quote_author)
          ? { text: trip.sections.find((s: any) => s.quote_author)?.content || '', attribution: trip.sections.find((s: any) => s.quote_author)?.quote_author || '' }
          : null,
        services: [],
        storyteller_name: '',
      }} />;
    }
    case 'trip_timeline': return <TripTimelinePage key={index} />;
    case 'back_cover': return <BackCoverPage key={index} />;
    default: return null;
  }
}

// Data-driven document: reads pages[] from assembled JSON if present
const DataDrivenReport = ({ pagesPlan }: { pagesPlan: Array<{ page_type: string; content_config: Record<string, any> }> }) => (
  <Document
    title={`PICC Annual Report ${data.year_range}`}
    author="Palm Island Community Company"
    subject="Annual Report"
    language="en-AU"
  >
    {pagesPlan.map((page, i) => renderPageByType(page.page_type, page.content_config || {}, i))}
  </Document>
);

// ── Render ──────────────────────────────────────────
(async () => {
  // Check for --edition flag
  const editionArg = process.argv.find(a => a.startsWith('--edition='));
  const edition = editionArg ? editionArg.split('=')[1] : null;

  // Check if data has a pages[] array (from page planner)
  const pagesPlan = data.pages as Array<{ page_type: string; content_config: Record<string, any> }> | undefined;

  const suffix = edition ? `-${edition}` : '';
  const outputPath = path.join(
    __dirname,
    `output/picc-annual-report-2025${suffix}-react-pdf.pdf`
  );
  console.log(`Generating PICC Annual Report 2024-2025${edition ? ` (${edition} edition)` : ''} with React-PDF...`);
  console.log(`Data source: ${dataPath}`);
  console.log(`Output: ${outputPath}`);

  try {
    if (pagesPlan && pagesPlan.length > 0) {
      console.log(`Using data-driven page plan (${pagesPlan.length} pages)`);
      await renderToFile(<DataDrivenReport pagesPlan={pagesPlan} />, outputPath);
    } else {
      console.log('Using standard page sequence');
      await renderToFile(<AnnualReport />, outputPath);
    }
    console.log(`\nPDF generated successfully!`);
    console.log(`Pages: ~${pagesPlan?.length || 17} (varies with content)`);
    console.log(`File: ${outputPath}`);
  } catch (err) {
    console.error("PDF generation failed:", err);
    process.exit(1);
  }
})();
