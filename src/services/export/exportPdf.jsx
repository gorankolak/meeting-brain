import React from "react";
import { Document, Font, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import { formatDateTime } from "../../lib/locale";
import liberationSansRegular from "pdfjs-dist/standard_fonts/LiberationSans-Regular.ttf";
import liberationSansBold from "pdfjs-dist/standard_fonts/LiberationSans-Bold.ttf";

Font.register({
  family: "Liberation Sans",
  fonts: [
    { src: liberationSansRegular, fontWeight: 400 },
    { src: liberationSansBold, fontWeight: 700 }
  ]
});

function toPdfUppercase(text, language) {
  return String(text || "").toLocaleUpperCase(language === "en" ? "en" : "hr");
}

const DEFAULT_SECTION_MIN_PRESENCE_AHEAD = 104;
const LIST_SECTION_MIN_PRESENCE_AHEAD = 140;

const COLORS = {
  page: "#ffffff",
  text: "#172033",
  muted: "#667085",
  border: "#d9e2ec",
  divider: "#e6ebf0",
  summarySurface: "#f8fafc",
  decision: "#4f6fa5",
  decisionSurface: "#f5f8ff",
  risk: "#c97a2b",
  riskSurface: "#fff7ed",
  question: "#64748b",
  questionSurface: "#f8fafc",
  actionSurface: "#ffffff",
  statSurface: "#f8fafc",
  highPriority: "#c65d2d",
  highPrioritySurface: "#fff1eb",
  mediumPriority: "#b7791f",
  mediumPrioritySurface: "#fff7e8",
  lowPriority: "#667085",
  lowPrioritySurface: "#f3f4f6",
  highConfidence: "#365b97",
  highConfidenceSurface: "#edf4ff"
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.page,
    color: COLORS.text,
    fontFamily: "Liberation Sans",
    fontSize: 10.8,
    lineHeight: 1.5,
    paddingTop: 34,
    paddingBottom: 62,
    paddingHorizontal: 34
  },
  header: {
    marginBottom: 22
  },
  brandLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1.8,
    marginBottom: 8
  },
  reportTitle: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: 700,
    lineHeight: 1.22,
    marginBottom: 8
  },
  generatedLine: {
    color: COLORS.muted,
    fontSize: 9.5
  },
  headerDivider: {
    borderBottomColor: COLORS.divider,
    borderBottomWidth: 1,
    marginTop: 14,
    marginBottom: 14
  },
  statStrip: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  statPill: {
    backgroundColor: COLORS.statSurface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 8,
    paddingVertical: 7,
    paddingHorizontal: 10
  },
  statValue: {
    color: COLORS.text,
    fontSize: 11.5,
    fontWeight: 700,
    marginRight: 6
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 9.5
  },
  sectionShell: {
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    padding: 16
  },
  sectionHeader: {
    alignItems: "flex-start",
    borderBottomColor: COLORS.divider,
    borderBottomWidth: 1,
    marginBottom: 14,
    paddingBottom: 10
  },
  sectionLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1.2
  },
  summaryShell: {
    backgroundColor: COLORS.summarySurface
  },
  summaryText: {
    color: COLORS.text,
    fontSize: 11,
    lineHeight: 1.65
  },
  cardBase: {
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 6,
    padding: 13
  },
  decisionCard: {
    backgroundColor: COLORS.decisionSurface,
    borderLeftColor: COLORS.decision,
    borderLeftWidth: 3
  },
  actionCard: {
    backgroundColor: COLORS.actionSurface
  },
  riskCard: {
    backgroundColor: COLORS.riskSurface,
    borderLeftColor: COLORS.risk,
    borderLeftWidth: 3
  },
  questionCard: {
    backgroundColor: COLORS.questionSurface,
    borderLeftColor: COLORS.question,
    borderLeftWidth: 3
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1.35
  },
  cardBody: {
    color: COLORS.text,
    fontSize: 10.6,
    lineHeight: 1.55,
    marginTop: 7
  },
  mutedBody: {
    color: COLORS.muted
  },
  bodyLabel: {
    color: COLORS.muted,
    fontSize: 9.4,
    fontWeight: 700,
    letterSpacing: 0.4,
    marginTop: 10,
    marginBottom: 4
  },
  metaRow: {
    borderTopColor: COLORS.divider,
    borderTopWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 9
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    marginBottom: 4
  },
  metaLabel: {
    color: COLORS.muted,
    fontSize: 9.2,
    fontWeight: 700
  },
  metaValue: {
    color: COLORS.text,
    fontSize: 9.4
  },
  badge: {
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 8
  },
  badgeText: {
    fontSize: 8.8,
    fontWeight: 700
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 10.4,
    lineHeight: 1.5
  },
  nextStepsList: {
    marginTop: -1
  },
  nextStepRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    marginTop: 9
  },
  nextStepMarker: {
    color: COLORS.decision,
    fontSize: 11,
    fontWeight: 700,
    marginRight: 8,
    marginTop: 0.5
  },
  nextStepText: {
    color: COLORS.text,
    flexGrow: 1,
    flexShrink: 1,
    fontSize: 10.8,
    lineHeight: 1.5
  },
  footer: {
    borderTopColor: COLORS.divider,
    borderTopWidth: 1,
    bottom: 20,
    color: COLORS.muted,
    flexDirection: "row",
    fontSize: 9,
    justifyContent: "space-between",
    left: 34,
    paddingTop: 8,
    position: "absolute",
    right: 34
  },
  footerLeft: {
    width: "28%"
  },
  footerCenter: {
    textAlign: "center",
    width: "44%"
  },
  footerRight: {
    textAlign: "right",
    width: "28%"
  },
  stackedItem: {
    marginTop: 10
  }
});

function getPriorityBadgeTokens(priority) {
  switch (priority) {
    case "high":
      return {
        backgroundColor: COLORS.highPrioritySurface,
        color: COLORS.highPriority
      };
    case "medium":
      return {
        backgroundColor: COLORS.mediumPrioritySurface,
        color: COLORS.mediumPriority
      };
    default:
      return {
        backgroundColor: COLORS.lowPrioritySurface,
        color: COLORS.lowPriority
      };
  }
}

function getConfidenceBadgeTokens(confidence) {
  switch (confidence) {
    case "high":
      return {
        backgroundColor: COLORS.highConfidenceSurface,
        color: COLORS.highConfidence
      };
    case "medium":
      return {
        backgroundColor: COLORS.mediumPrioritySurface,
        color: COLORS.mediumPriority
      };
    default:
      return {
        backgroundColor: COLORS.lowPrioritySurface,
        color: COLORS.lowPriority
      };
  }
}

function buildCountItems(report, t) {
  return [
    { label: t("report:sections.decisions"), value: report.decisions.length },
    { label: t("report:sections.actionItems"), value: report.action_items.length },
    { label: t("report:sections.risks"), value: report.risks.length },
    { label: t("report:sections.openQuestions"), value: report.open_questions.length }
  ];
}

function formatDeadlineValue(value, language) {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(language === "en" ? "en" : "hr", {
    dateStyle: "medium"
  }).format(parsed);
}

function Badge({ children, tone }) {
  return (
    <View style={[styles.badge, { backgroundColor: tone.backgroundColor }]}>
      <Text style={[styles.badgeText, { color: tone.color }]}>{children}</Text>
    </View>
  );
}

function MetaRow({ children }) {
  return <View style={styles.metaRow}>{children}</View>;
}

function MetaItem({ label, value }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}:</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function ReportHeader({ report, t, language }) {
  const countItems = buildCountItems(report, t);

  return (
    <View style={styles.header} wrap={false}>
      <Text style={styles.brandLabel}>Meeting Brain</Text>
      <Text style={styles.reportTitle}>{report.meeting_title}</Text>
      <Text style={styles.generatedLine}>
        {t("report:fields.generated")}: {formatDateTime(report.generated_at, language)}
      </Text>
      <View style={styles.headerDivider} />
      <MetaStatStrip items={countItems} />
    </View>
  );
}

function MetaStatStrip({ items }) {
  return (
    <View style={styles.statStrip}>
      {items.map((item) => (
        <View key={item.label} style={styles.statPill}>
          <Text style={styles.statValue}>{item.value}</Text>
          <Text style={styles.statLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

function SectionShell({
  title,
  children,
  minPresenceAhead = DEFAULT_SECTION_MIN_PRESENCE_AHEAD,
  variant,
  wrap = true
}) {
  return (
    <View
      minPresenceAhead={minPresenceAhead}
      style={[styles.sectionShell, variant === "summary" ? styles.summaryShell : null]}
      wrap={wrap}
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function SummaryBlock({ summary }) {
  return <Text style={styles.summaryText}>{summary}</Text>;
}

function DecisionCard({ item, t }) {
  return (
    <View style={[styles.cardBase, styles.decisionCard]} wrap={false}>
      <Text style={styles.cardTitle}>{item.decision}</Text>
      <Text style={styles.cardBody}>{item.reasoning}</Text>
      <MetaRow>
        <MetaItem label={t("report:fields.owner")} value={item.owner} />
        <Badge tone={getConfidenceBadgeTokens(item.confidence)}>
          {t("report:fields.confidence")}: {t(`report:enums.confidence.${item.confidence}`)}
        </Badge>
      </MetaRow>
    </View>
  );
}

function ActionItemCard({ item, t, language }) {
  const priorityTone = getPriorityBadgeTokens(item.priority);
  const deadline = item.deadline || t("report:empty.deadline");

  return (
    <View style={[styles.cardBase, styles.actionCard]} wrap={false}>
      <Text style={styles.cardTitle}>{item.task}</Text>
      <Text style={[styles.cardBody, item.notes ? null : styles.mutedBody]}>
        {item.notes || t("report:empty.notes")}
      </Text>
      <MetaRow>
        <MetaItem label={t("report:fields.owner")} value={item.owner} />
        <MetaItem label={t("report:fields.deadline")} value={formatDeadlineValue(deadline, language)} />
        <Badge tone={priorityTone}>
          {t("report:fields.priority")}: {t(`report:enums.priority.${item.priority}`)}
        </Badge>
      </MetaRow>
    </View>
  );
}

function RiskCallout({ item, t }) {
  return (
    <View style={[styles.cardBase, styles.riskCard]} wrap={false}>
      <Text style={styles.cardTitle}>{item.risk}</Text>
      <Text style={styles.cardBody}>{item.impact}</Text>
      <Text style={styles.bodyLabel}>{t("report:fields.mitigation")}</Text>
      <Text style={styles.cardBody}>{item.mitigation}</Text>
      <MetaRow>
        <MetaItem label={t("report:fields.owner")} value={item.owner} />
      </MetaRow>
    </View>
  );
}

function QuestionCallout({ item, t }) {
  return (
    <View style={[styles.cardBase, styles.questionCard]} wrap={false}>
      <Text style={styles.cardTitle}>{item.question}</Text>
      <Text style={[styles.cardBody, item.notes ? null : styles.mutedBody]}>
        {item.notes || t("report:empty.questionNotes")}
      </Text>
      <MetaRow>
        <MetaItem label={t("report:fields.owner")} value={item.owner} />
      </MetaRow>
    </View>
  );
}

function NextStepsList({ steps, emptyText }) {
  if (!steps.length) {
    return <Text style={styles.emptyText}>{emptyText}</Text>;
  }

  return (
    <View style={styles.nextStepsList}>
      {steps.map((step) => (
        <View key={step} style={styles.nextStepRow}>
          <Text style={styles.nextStepMarker}>•</Text>
          <Text style={styles.nextStepText}>{step}</Text>
        </View>
      ))}
    </View>
  );
}

function ReportFooter({ t }) {
  return (
    <View fixed style={styles.footer}>
      <Text style={styles.footerLeft}>Meeting Brain</Text>
      <Text style={styles.footerCenter}>{t("report:generatedReport")}</Text>
      <Text
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
        style={styles.footerRight}
      />
    </View>
  );
}

function EmptyState({ text }) {
  return <Text style={styles.emptyText}>{text}</Text>;
}

function StackedCards({ children }) {
  return React.Children.toArray(children).map((child, index) => (
    <View key={child?.key || `stacked-${index}`} style={index === 0 ? null : styles.stackedItem}>
      {child}
    </View>
  ));
}

function ReportPdfDocument({ report, t, language }) {
  return (
    <Document author="Meeting Brain" title={report.meeting_title}>
      <Page size="A4" style={styles.page}>
        <ReportHeader language={language} report={report} t={t} />

        <SectionShell title={toPdfUppercase(t("report:sections.summary"), language)} variant="summary">
          <SummaryBlock summary={report.summary} />
        </SectionShell>

        <SectionShell title={toPdfUppercase(t("report:sections.decisions"), language)}>
          {report.decisions.length ? (
            <StackedCards>
              {report.decisions.map((item) => (
                <DecisionCard item={item} key={item.id} t={t} />
              ))}
            </StackedCards>
          ) : (
            <EmptyState text={t("report:empty.decisions")} />
          )}
        </SectionShell>

        <SectionShell title={toPdfUppercase(t("report:sections.actionItems"), language)}>
          {report.action_items.length ? (
            <StackedCards>
              {report.action_items.map((item) => (
                <ActionItemCard item={item} key={item.id} language={language} t={t} />
              ))}
            </StackedCards>
          ) : (
            <EmptyState text={t("report:empty.actionItems")} />
          )}
        </SectionShell>

        <SectionShell title={toPdfUppercase(t("report:sections.risks"), language)}>
          {report.risks.length ? (
            <StackedCards>
              {report.risks.map((item) => (
                <RiskCallout item={item} key={item.id} t={t} />
              ))}
            </StackedCards>
          ) : (
            <EmptyState text={t("report:empty.risks")} />
          )}
        </SectionShell>

        <SectionShell title={toPdfUppercase(t("report:sections.openQuestions"), language)}>
          {report.open_questions.length ? (
            <StackedCards>
              {report.open_questions.map((item) => (
                <QuestionCallout item={item} key={item.id} t={t} />
              ))}
            </StackedCards>
          ) : (
            <EmptyState text={t("report:empty.openQuestions")} />
          )}
        </SectionShell>

        <SectionShell
          minPresenceAhead={LIST_SECTION_MIN_PRESENCE_AHEAD}
          title={toPdfUppercase(t("report:sections.nextSteps"), language)}
        >
          <NextStepsList emptyText={t("report:empty.nextSteps")} steps={report.next_steps} />
        </SectionShell>

        <ReportFooter t={t} />
      </Page>
    </Document>
  );
}

export async function exportPdf(report, options) {
  return pdf(<ReportPdfDocument language={options.language} report={report} t={options.t} />).toBlob();
}
