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

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#f5f8fb",
    color: "#172033",
    fontFamily: "Liberation Sans",
    fontSize: 11,
    lineHeight: 1.5,
    paddingTop: 32,
    paddingBottom: 36,
    paddingHorizontal: 32
  },
  headerCard: {
    backgroundColor: "#ffffff",
    border: "1 solid #d9e4ec",
    borderRadius: 16,
    marginBottom: 18,
    padding: 20
  },
  eyebrow: {
    color: "#f0a338",
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1.6,
    marginBottom: 8
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 8
  },
  meta: {
    color: "#667085",
    fontSize: 10
  },
  section: {
    backgroundColor: "#ffffff",
    border: "1 solid #d9e4ec",
    borderRadius: 16,
    marginBottom: 14,
    padding: 18
  },
  sectionTitle: {
    color: "#667085",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1.2,
    marginBottom: 10
  },
  itemCard: {
    backgroundColor: "#f4f8fb",
    borderRadius: 12,
    marginTop: 8,
    padding: 12
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: 700
  },
  itemMeta: {
    color: "#667085",
    fontSize: 10,
    marginTop: 6
  },
  itemBody: {
    marginTop: 6
  },
  listItem: {
    marginTop: 8
  },
  empty: {
    color: "#667085"
  }
});

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Card({ title, body, meta }) {
  return (
    <View style={styles.itemCard}>
      <Text style={styles.itemTitle}>{title}</Text>
      {body ? <Text style={styles.itemBody}>{body}</Text> : null}
      {meta ? <Text style={styles.itemMeta}>{meta}</Text> : null}
    </View>
  );
}

function ReportPdfDocument({ report, t, language }) {
  return (
    <Document author="Meeting Brain" title={report.meeting_title}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerCard}>
          <Text style={styles.eyebrow}>{toPdfUppercase(t("report:generatedReport"), language)}</Text>
          <Text style={styles.title}>{report.meeting_title}</Text>
          <Text style={styles.meta}>
            {t("report:fields.generated")}: {formatDateTime(report.generated_at, language)}
          </Text>
        </View>

        <Section title={toPdfUppercase(t("report:sections.summary"), language)}>
          <Text>{report.summary}</Text>
        </Section>

        <Section title={toPdfUppercase(t("report:sections.decisions"), language)}>
          {report.decisions.length ? (
            report.decisions.map((item) => (
              <Card
                body={item.reasoning}
                key={item.id}
                meta={`${t("report:fields.owner")}: ${item.owner} • ${t("report:fields.confidence")}: ${t(`report:enums.confidence.${item.confidence}`)}`}
                title={item.decision}
              />
            ))
          ) : (
            <Text style={styles.empty}>{t("report:empty.decisions")}</Text>
          )}
        </Section>

        <Section title={toPdfUppercase(t("report:sections.actionItems"), language)}>
          {report.action_items.length ? (
            report.action_items.map((item) => (
              <Card
                body={item.notes || t("report:empty.notes")}
                key={item.id}
                meta={`${t("report:fields.owner")}: ${item.owner} • ${t("report:fields.deadline")}: ${item.deadline || t("report:empty.deadline")} • ${t("report:fields.priority")}: ${t(`report:enums.priority.${item.priority}`)}`}
                title={item.task}
              />
            ))
          ) : (
            <Text style={styles.empty}>{t("report:empty.actionItems")}</Text>
          )}
        </Section>

        <Section title={toPdfUppercase(t("report:sections.risks"), language)}>
          {report.risks.length ? (
            report.risks.map((item) => (
              <Card
                body={`${item.impact}\n${t("report:fields.mitigation")}: ${item.mitigation}`}
                key={item.id}
                meta={`${t("report:fields.owner")}: ${item.owner}`}
                title={item.risk}
              />
            ))
          ) : (
            <Text style={styles.empty}>{t("report:empty.risks")}</Text>
          )}
        </Section>

        <Section title={toPdfUppercase(t("report:sections.openQuestions"), language)}>
          {report.open_questions.length ? (
            report.open_questions.map((item) => (
              <Card
                body={item.notes || t("report:empty.questionNotes")}
                key={item.id}
                meta={`${t("report:fields.owner")}: ${item.owner}`}
                title={item.question}
              />
            ))
          ) : (
            <Text style={styles.empty}>{t("report:empty.openQuestions")}</Text>
          )}
        </Section>

        <Section title={toPdfUppercase(t("report:sections.nextSteps"), language)}>
          {report.next_steps.length ? (
            report.next_steps.map((step) => (
              <Text key={step} style={styles.listItem}>
                • {step}
              </Text>
            ))
          ) : (
            <Text style={styles.empty}>{t("report:empty.nextSteps")}</Text>
          )}
        </Section>
      </Page>
    </Document>
  );
}

export async function exportPdf(report, options) {
  return pdf(<ReportPdfDocument language={options.language} report={report} t={options.t} />).toBlob();
}
