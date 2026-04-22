import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { resolve } from 'path';

const fontsDir = resolve(process.cwd(), 'public/fonts');

Font.register({
  family: 'Carlito',
  fonts: [
    { src: `${fontsDir}/carlito-regular.ttf`, fontWeight: 'normal', fontStyle: 'normal' },
    { src: `${fontsDir}/carlito-bold.ttf`, fontWeight: 'bold', fontStyle: 'normal' },
    { src: `${fontsDir}/carlito-italic.ttf`, fontWeight: 'normal', fontStyle: 'italic' },
    { src: `${fontsDir}/carlito-bold-italic.ttf`, fontWeight: 'bold', fontStyle: 'italic' },
  ],
});

// Blue used for section headers, company names, and dates in the reference resume
const BLUE = '#1155CC';

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 48,
    fontFamily: 'Carlito',
    fontSize: 10,
    color: '#222',
  },

  // ── Header ──────────────────────────────────────────────────────────────
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 4,
  },
  contactLine: {
    fontSize: 9,
    textAlign: 'center',
    color: '#444',
    marginBottom: 10,
  },

  // ── Section header ───────────────────────────────────────────────────────
  sectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#222',
    borderBottom: '1px solid #aaa',
    paddingBottom: 1,
    marginBottom: 5,
    marginTop: 12,
  },

  // ── Summary ──────────────────────────────────────────────────────────────
  summary: {
    fontSize: 10,
    lineHeight: 1.45,
  },

  // ── Skills ───────────────────────────────────────────────────────────────
  skillRow: {
    fontSize: 10,
    marginBottom: 2,
    lineHeight: 1.35,
  },

  // ── Education ────────────────────────────────────────────────────────────
  educationRow: {
    fontSize: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
  },
  educationInstitution: {
    fontSize: 10,
    fontWeight: 'bold',
    color: BLUE,
  },
  educationDash: {
    fontSize: 10,
    color: '#222',
  },
  educationDetail: {
    fontSize: 10,
    color: '#222',
  },

  // ── Experience ───────────────────────────────────────────────────────────
  jobHeaderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    marginBottom: 1,
  },
  jobCompany: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: BLUE,
  },
  jobSeparator: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: BLUE,
  },
  jobPosition: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: BLUE,
  },
  jobDates: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: BLUE,
  },
  jobDescription: {
    fontSize: 9.5,
    fontStyle: 'italic',
    color: '#555',
    marginBottom: 3,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 2,
    marginLeft: 10,
  },
  bulletSymbol: {
    fontSize: 10,
    width: 10,
    flexShrink: 0,
    lineHeight: 1.4,
  },
  bulletTextWrap: {
    flex: 1,
  },
  bulletText: {
    fontSize: 10,
    lineHeight: 1.4,
  },

  // ── Activities ───────────────────────────────────────────────────────────
  activitiesRow: {
    flexDirection: 'row',
    marginBottom: 2,
    marginLeft: 10,
  },
});

export function ResumePDF({ resume }: { resume: any }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>

        {/* ── Header ── */}
        <Text style={styles.name}>{resume.basics.name}</Text>
        <Text style={styles.label}>{resume.basics.label}</Text>
        <Text style={styles.contactLine}>
          {resume.basics.location} | {resume.basics.phone} | {resume.basics.email} | linkedin.com/in/nathanpickard | github.com/NathanPickard
        </Text>

        {/* ── Career Summary ── */}
        <Text style={styles.sectionHeader}>Career Summary</Text>
        <Text style={styles.summary}>{resume.basics.summary}</Text>

        {/* ── Skills ── */}
        <Text style={styles.sectionHeader}>Skills</Text>
        {resume.skills.map((skill: any, i: number) => (
          <Text key={i} style={styles.skillRow}>
            <Text style={{ fontWeight: 'bold' }}>{skill.name}: </Text>
            <Text>{skill.keywords.join(', ')}</Text>
          </Text>
        ))}

        {/* ── Education ── */}
        {resume.education && (
          <>
            <Text style={styles.sectionHeader}>Education</Text>
            {resume.education.map((edu: any, i: number) => (
              <View key={i} style={styles.educationRow}>
                <Text style={styles.educationInstitution}>{edu.institution}</Text>
                <Text style={styles.educationDash}> – </Text>
                <Text style={styles.educationDetail}>
                  {edu.studyType} {edu.area}{edu.status ? `, ${edu.status}` : ''}
                </Text>
              </View>
            ))}
          </>
        )}

        {/* ── Experience ── */}
        <Text style={styles.sectionHeader}>Experience</Text>
        {resume.work.map((job: any, i: number) => (
          <View key={i} style={{ marginBottom: 9 }}>
            {/* Company | Position | Dates — all blue bold */}
            <View style={styles.jobHeaderRow}>
              <Text style={styles.jobCompany}>{job.company}</Text>
              <Text style={styles.jobSeparator}> | </Text>
              <Text style={styles.jobPosition}>{job.position}</Text>
              <Text style={styles.jobSeparator}> | </Text>
              <Text style={styles.jobDates}>{job.startDate} – {job.endDate}</Text>
            </View>
            {/* Italic description line */}
            {job.description && (
              <Text style={styles.jobDescription}>{job.description}</Text>
            )}
            {/* Bullet points */}
            {job.highlights.map((h: string, j: number) => (
              <View key={j} style={styles.bulletRow} wrap={false}>
                <Text style={styles.bulletSymbol}>•</Text>
                <View style={styles.bulletTextWrap}>
                  <Text style={styles.bulletText}>{h}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}

        {/* ── Activities & Community ── */}
        {resume.activities && (
          <View wrap={false}>
            <Text style={styles.sectionHeader}>Activities & Community</Text>
            {resume.activities.map((activity: string, i: number) => (
              <View key={i} style={styles.activitiesRow}>
                <Text style={styles.bulletSymbol}>•</Text>
                <View style={styles.bulletTextWrap}>
                  <Text style={styles.bulletText}>{activity}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

      </Page>
    </Document>
  );
}
