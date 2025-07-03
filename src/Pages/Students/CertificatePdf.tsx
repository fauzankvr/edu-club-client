import React from "react";
import {
  Document,
  Page,
  Image,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

// Styles
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    color: "#000",
    padding: 0,
    margin: 0,
  },
  pageContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  background: {
    width: "100%",
    height: "100%",
  },
  contentOverlay: {
    position: "absolute",
    top: 80,
    left: 60,
    right: 60,
    textAlign: "center",
  },
  year: {
    fontSize: 20,
    marginTop: 45,
    color: "#FF6001",
    fontWeight: "bold",
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    color: "#1a365d",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    color: "#2d3748",
  },
  studentName: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 290,
    marginBottom: 30,
    color: "#1a365d",
  },
  courseText: {
    fontSize: 12,
    color: "#2d3748",
    lineHeight: 1.5,
  },
  bold: {
    fontWeight: "bold",
    color: "#1a365d",
  },
  footer: {
    position: "absolute",
    bottom: 120,
    left: 60,
    right: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 10,
  },
  signatureContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  signatureImage: {
    height: 40,
    marginBottom: 5,
  },
  instructorName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1a365d",
  },
  instructorTitle: {
    fontSize: 10,
    color: "#4a5568",
  },
  issuedInfo: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  issuedText: {
    fontSize: 10,
    color: "#4a5568",
    marginBottom: 2,
  },
});

interface CertificateTemplateProps {
  studentName: string;
  courseName: string;
  issuedDate: string;
  certificateId: string;
  signatureUrl: string;
  instructorName: string;
  backgroundImage: string;
}

const CertificatePDF: React.FC<CertificateTemplateProps> = ({
  studentName,
  courseName,
  issuedDate,
  certificateId,
  signatureUrl,
  instructorName,
  backgroundImage,
}) => {
  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        <View style={styles.pageContainer}>
          {/* Background (rendered first so it’s underneath) */}
          <Image src={backgroundImage} style={styles.background} />

          {/* Main Content */}
          <View style={styles.contentOverlay}>
            <Text style={styles.year}>{ issuedDate.split("-")[0]}</Text>
            <Text style={styles.studentName}>{studentName}</Text>
            <Text style={styles.courseText}>
              For successfully completing the course{" "}
              <Text style={styles.bold}>{courseName}</Text>.{"\n"}
              Demonstrating mastery of course outcomes and skills.
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            {/* Left: Signature */}
            <View style={styles.signatureContainer}>
              <Image src={signatureUrl} style={styles.signatureImage} />
              <Text style={styles.instructorName}>{instructorName}</Text>
              <Text style={styles.instructorTitle}>Instructor</Text>
            </View>

            {/* Right: Issued info */}
            <View style={styles.issuedInfo}>
              <Text style={styles.issuedText}>ISSUED DATE: {issuedDate}</Text>
              <Text style={styles.issuedText}>
                CERTIFICATE ID: {certificateId}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default CertificatePDF;
