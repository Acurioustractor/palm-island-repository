/**
 * React-PDF Innovation Section — Side-by-side comparison with WeasyPrint version
 *
 * Run: npx tsx compare-innovation-react-pdf.tsx
 * Output: output/innovation-react-pdf.pdf
 */
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Font,
  StyleSheet,
  Svg,
  Defs,
  LinearGradient,
  Stop,
  Rect,
  renderToFile,
} from "@react-pdf/renderer";
import path from "path";

// ── Fonts (local TTF only) ──────────────────────────
const fontsDir = path.join(__dirname, "assets/fonts");

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
const colors = {
  blue: "#2563eb",
  blueDark: "#1e3a8a",
  blue50: "#eff6ff",
  purple: "#9333ea",
  purple50: "#faf5ff",
  green: "#16a34a",
  amber: "#d97706",
  textPrimary: "#111827",
  textSecondary: "#4b5563",
  textMuted: "#9ca3af",
  bgWhite: "#ffffff",
  bgLight: "#f9fafb",
  bgSection: "#f3f4f6",
  border: "#e5e7eb",
};

// ── Sample Data (same as what WeasyPrint would get) ──
const innovationProjects = [
  {
    name: "Photo Studio Journey",
    status: "active",
    why_text:
      "Community-controlled visual storytelling that puts cameras in the hands of Palm Islanders to document their own stories, culture, and daily life.",
    milestones: [
      { year: "2023", title: "Studio established" },
      { year: "2024", title: "Youth program launched" },
      { year: "2025", title: "Exhibition tour" },
    ],
  },
  {
    name: "Elders Knowledge Trip",
    status: "completed",
    why_text:
      "Connecting Elders with communities across Queensland to share knowledge, strengthen cultural ties, and document oral histories for future generations.",
    milestones: [
      { year: "2024", title: "Planning & consultation" },
      { year: "2025", title: "Trip completed" },
    ],
  },
  {
    name: "Local Server Initiative",
    status: "active",
    why_text:
      "Building digital sovereignty through community-owned infrastructure that keeps data on Country and provides reliable connectivity.",
    milestones: [
      { year: "2024", title: "Hardware deployed" },
      { year: "2025", title: "Community training" },
    ],
  },
  {
    name: "Storm Recovery Documentation",
    status: "completed",
    why_text:
      "Documenting community resilience and recovery efforts after severe weather events, creating a living archive of strength and adaptation.",
    milestones: [
      { year: "2024", title: "Documentation began" },
      { year: "2025", title: "Archive published" },
    ],
  },
  {
    name: "Digital Service Centre",
    status: "planning",
    why_text:
      "Expanding digital literacy and access for all Palm Islanders through a dedicated technology hub with training programs and support services.",
    milestones: [
      { year: "2025", title: "Feasibility study" },
      { year: "2026", title: "Construction planned" },
    ],
  },
];

const innovationQuote = {
  text: "When we tell our own stories with our own technology, we keep our culture strong for the next generation.",
  attribution: "Community Elder, Palm Island",
};

// ── Styles ──────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: colors.bgWhite,
    padding: "18mm",
    paddingBottom: "14mm",
    fontFamily: "Inter",
    fontSize: 10,
    color: colors.textPrimary,
  },

  // Section label
  sectionLabel: {
    fontSize: 7.5,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: colors.purple,
    marginBottom: 6,
  },

  // Handwritten heading
  heading: {
    fontFamily: "Caveat",
    fontSize: 26,
    fontWeight: "semibold",
    color: colors.blueDark,
    marginBottom: 4,
    lineHeight: 1.2,
  },

  lead: {
    fontSize: 10,
    color: colors.textSecondary,
    lineHeight: 1.6,
    marginBottom: 20,
    maxWidth: "75%",
  },

  // Card grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },

  card: {
    width: "48%",
    backgroundColor: colors.bgWhite,
    border: `1pt solid ${colors.border}`,
    borderRadius: 8,
    padding: 14,
    position: "relative",
    overflow: "hidden",
  },

  cardAccentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 4,
    height: "100%",
  },

  cardTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.blueDark,
    marginBottom: 4,
    marginLeft: 8,
  },

  cardBody: {
    fontSize: 8.5,
    color: colors.textSecondary,
    lineHeight: 1.6,
    marginBottom: 8,
    marginLeft: 8,
  },

  milestonesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginLeft: 8,
  },

  milestone: {
    backgroundColor: colors.bgSection,
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 8,
    fontSize: 7,
    fontWeight: "semibold",
    color: colors.textSecondary,
  },

  // Quote block
  quoteBlock: {
    backgroundColor: colors.blue50,
    borderRadius: 8,
    padding: 18,
    borderLeft: `4pt solid ${colors.blue}`,
    marginTop: 4,
  },

  quoteText: {
    fontSize: 11,
    fontFamily: "Caveat",
    color: colors.textPrimary,
    lineHeight: 1.6,
    marginBottom: 6,
  },

  quoteCite: {
    fontSize: 8.5,
    color: colors.purple,
    fontWeight: "semibold",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 10,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: colors.textMuted,
  },
});

// ── Status color helper ─────────────────────────────
function statusColor(status: string): string {
  switch (status) {
    case "active":
      return colors.green;
    case "completed":
      return colors.blue;
    case "planning":
      return colors.amber;
    default:
      return colors.purple;
  }
}

// ── Components ──────────────────────────────────────

const GradientBar = () => (
  <Svg width="60" height="4" style={{ marginBottom: 12 }}>
    <Defs>
      <LinearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor={colors.blue} />
        <Stop offset="100%" stopColor={colors.purple} />
      </LinearGradient>
    </Defs>
    <Rect x="0" y="0" width="60" height="4" rx="2" fill="url(#accentGrad)" />
  </Svg>
);

const InnovationCard = ({
  project,
}: {
  project: (typeof innovationProjects)[0];
}) => (
  <View wrap={false} style={s.card}>
    {/* Status accent bar */}
    <View
      style={[s.cardAccentBar, { backgroundColor: statusColor(project.status) }]}
    />
    <Text style={s.cardTitle}>{project.name}</Text>
    <Text style={s.cardBody}>{project.why_text}</Text>
    {project.milestones.length > 0 && (
      <View style={s.milestonesRow}>
        {project.milestones.slice(0, 3).map((m, i) => (
          <Text key={i} style={s.milestone}>
            {m.year}: {m.title}
          </Text>
        ))}
      </View>
    )}
  </View>
);

// ── Document ────────────────────────────────────────
const InnovationReport = () => (
  <Document
    title="PICC Innovation Section — React-PDF Comparison"
    author="PICC"
    subject="Annual Report Innovation Section"
  >
    <Page size="A4" style={s.page}>
      <GradientBar />
      <Text style={s.sectionLabel}>Innovation on Country</Text>
      <Text style={s.heading}>Building Our Future, Our Way</Text>
      <Text style={s.lead}>
        Community-led projects driving self-determination through innovation,
        culture, and technology.
      </Text>

      <View style={s.grid}>
        {innovationProjects.map((proj, i) => (
          <InnovationCard key={i} project={proj} />
        ))}
      </View>

      {/* Pull quote */}
      <View style={s.quoteBlock}>
        <Text style={s.quoteText}>"{innovationQuote.text}"</Text>
        <Text style={s.quoteCite}>— {innovationQuote.attribution}</Text>
      </View>

      {/* Page footer */}
      <View style={s.footer} fixed>
        <Text>Palm Island Community Company</Text>
        <Text
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
        />
      </View>
    </Page>
  </Document>
);

// ── Render ──────────────────────────────────────────
(async () => {
  const outputPath = path.join(__dirname, "output/innovation-react-pdf.pdf");
  console.log("Generating Innovation section with react-pdf...");
  await renderToFile(<InnovationReport />, outputPath);
  console.log(`PDF saved to: ${outputPath}`);
})();
