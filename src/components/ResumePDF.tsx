import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 11 },
  name: { fontSize: 22, fontWeight: 'bold' },
  label: { color: '#555', marginBottom: 16 },
  sectionHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    borderBottom: '1px solid #ccc',
    paddingBottom: 2,
    marginBottom: 8,
    marginTop: 16,
  },
  jobTitle: { fontWeight: 'bold' },
  jobMeta: { color: '#555', fontSize: 10, marginBottom: 4 },
  bullet: { marginLeft: 12, marginBottom: 2 },
});

export function ResumePDF({ resume }: { resume: any }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.name}>{resume.basics.name}</Text>
        <Text style={styles.label}>
          {resume.basics.label} · {resume.basics.location} ·{' '}
          {resume.basics.email}
        </Text>

        <Text style={styles.sectionHeader}>Experience</Text>
        {resume.work.map((job: any, i: number) => (
          <View key={i} style={{ marginBottom: 10 }}>
            <Text style={styles.jobTitle}>
              {job.position} — {job.company}
            </Text>
            <Text style={styles.jobMeta}>
              {job.startDate} – {job.endDate}
            </Text>
            {job.highlights.map((h: string, j: number) => (
              <Text key={j} style={styles.bullet}>
                • {h}
              </Text>
            ))}
          </View>
        ))}

        <Text style={styles.sectionHeader}>Skills</Text>
        {resume.skills.map((skill: any, i: number) => (
          <Text key={i}>
            <Text style={{ fontWeight: 'bold' }}>{skill.name}: </Text>
            {skill.keywords.join(', ')}
          </Text>
        ))}
      </Page>
    </Document>
  );
}
