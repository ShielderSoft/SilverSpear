import React from 'react';
import { Document, Page, Image, StyleSheet, PDFViewer, pdf } from '@react-pdf/renderer';
import html2canvas from 'html2canvas';

const styles = StyleSheet.create({
  page: {
    padding: 0,
    position: 'relative',
    backgroundColor: 'white',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  }
});

// Component to render the PDF
const PhishingReport = ({ images }) => (
  <Document>
    {images.map((img, index) => (
      <Page 
        key={index} 
        size="A4" 
        style={styles.page}
      >
        <Image src={img} style={styles.image} />
      </Page>
    ))}
  </Document>
);

// Component to preview the PDF
const PDFPreview = ({ images }) => {
  if (images.length === 0) return null;
  
  return (
    <PDFViewer width="100%" height="800px">
      <PhishingReport images={images} />
    </PDFViewer>
  );
};

export { PhishingReport, PDFPreview };

// Function to generate and download the PDF
export const generatePDF = async (slidesRef, reportTitle = "Phishing_Campaign_Report") => {
  const images = [];
  const slides = slidesRef.current.filter(slide => slide); // Filter out any null refs
  
  // Show loading indicator
  console.log('Generating PDF...');
  
  try {
    // Convert each slide to an image
    for (let slide of slides) {
      const canvas = await html2canvas(slide, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        windowWidth: slide.scrollWidth,
        windowHeight: slide.scrollHeight,
      });
      
      const imgData = canvas.toDataURL('image/png');
      images.push(imgData);
    }
    
    // Generate the PDF document
    const pdfBlob = await pdf(<PhishingReport images={images} />).toBlob();
    
    // Create download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportTitle}.pdf`;
    link.click();
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    return { success: true };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error };
  }
};