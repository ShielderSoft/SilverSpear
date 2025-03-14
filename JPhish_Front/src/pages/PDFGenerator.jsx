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
      // Create a clone of the slide to modify without affecting the original
      const clonedSlide = slide.cloneNode(true);
      document.body.appendChild(clonedSlide);
      clonedSlide.style.position = 'absolute';
      clonedSlide.style.top = '-9999px';
      
      // Replace problematic CSS colors
      const elementsWithStyle = clonedSlide.querySelectorAll('*');
      elementsWithStyle.forEach(el => {
        const computedStyle = window.getComputedStyle(el);
        const backgroundColor = computedStyle.backgroundColor;
        const color = computedStyle.color;
        
        // Apply computed styles instead of oklch functions
        if (el.style) {
          el.style.backgroundColor = backgroundColor;
          el.style.color = color;
        }
      });
      
      // Generate canvas from the modified clone
      const canvas = await html2canvas(clonedSlide, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: clonedSlide.scrollWidth,
        windowHeight: clonedSlide.scrollHeight,
        // Force using RGB colors
        backgroundColor: '#ffffff',
      });
      
      // Remove the cloned element
      document.body.removeChild(clonedSlide);
      
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