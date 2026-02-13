import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";
import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";

// Initialize OpenAI with blueprint env vars
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Create Discharge Summary (Generate + Save)
  app.post(api.discharges.create.path, async (req, res) => {
    try {
      const input = api.discharges.create.input.parse(req.body);
      
      // 1. Generate Summary using OpenAI
      const prompt = `
        Create an official ESIC Medical College discharge summary for the following patient:
        
        PATIENT: ${input.patientName}, ${input.age}y/${input.gender}, IP: ${input.ipNumber}
        UNIT: ${input.unitOfAdmission}, Consultant: ${input.consultantName}
        ADMISSION: ${input.admissionDate}, DISCHARGE: ${input.dischargeDate}
        
        ADMITTING DX: ${input.admittingDiagnosis}
        DISCHARGE DX: ${input.dischargeDiagnosis}
        
        COURSE IN HOSPITAL: ${input.hospitalCourse}
        
        INVESTIGATIONS:
        Blood: ${input.bloodInvestigations || 'N/A'}
        Imaging: ${input.imagingInvestigations || 'N/A'}
        Other: ${input.otherInvestigations || 'N/A'}
        
        MEDICATIONS: ${input.dischargeMedications}
        FOLLOW UP: ${input.followUpPlan}
        INSTRUCTIONS: ${input.specialInstructions || 'N/A'}
        CONDITION: ${input.dischargeCondition}
        
        Format the output as a professional medical discharge summary. 
        Do not use markdown formatting (like ** or #). Just plain text with clear section headers.
        Start with "DISCHARGE SUMMARY" centered.
      `;

      const aiResponse = await openai.chat.completions.create({
        model: "gpt-5.1", // Using recommended model from blueprint
        messages: [
          { role: "system", content: "You are a senior pediatrician at ESIC Hospital. Write professional, concise discharge summaries." },
          { role: "user", content: prompt }
        ],
        max_completion_tokens: 1500,
      });

      const generatedText = aiResponse.choices[0].message.content || "Summary generation failed.";

      // 2. Save to DB
      const summary = await storage.createDischargeSummary({
        ...input,
        generatedSummary: generatedText,
      });

      res.status(201).json(summary);
    } catch (err) {
      console.error("Error creating discharge summary:", err);
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // Get All
  app.get(api.discharges.list.path, async (req, res) => {
    const summaries = await storage.getAllDischargeSummaries();
    res.json(summaries);
  });

  // Get One
  app.get(api.discharges.get.path, async (req, res) => {
    const summary = await storage.getDischargeSummary(Number(req.params.id));
    if (!summary) return res.status(404).json({ message: "Summary not found" });
    res.json(summary);
  });

  // PDF Download
  app.get(api.discharges.downloadPdf.path, async (req, res) => {
    const summary = await storage.getDischargeSummary(Number(req.params.id));
    if (!summary) return res.status(404).json({ message: "Summary not found" });

    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=discharge_${summary.ipNumber}.pdf`);
    
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('ESIC MEDICAL COLLEGE & HOSPITAL', { align: 'center' });
    doc.fontSize(14).text('DEPARTMENT OF PEDIATRICS', { align: 'center' });
    doc.fontSize(10).text('KK Nagar, Chennai - 600078', { align: 'center' });
    doc.moveDown();
    doc.lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Patient Info
    doc.fontSize(12).font('Helvetica-Bold').text('PATIENT DETAILS');
    doc.font('Helvetica').fontSize(10);
    doc.text(`Name: ${summary.patientName}    Age/Sex: ${summary.age}y / ${summary.gender}`);
    doc.text(`IP No: ${summary.ipNumber}    Unit: ${summary.unitOfAdmission}`);
    doc.text(`Consultant: ${summary.consultantName}`);
    doc.text(`DOA: ${summary.admissionDate}    DOD: ${summary.dischargeDate}`);
    doc.moveDown();

    // Diagnosis
    doc.fontSize(12).font('Helvetica-Bold').text('DIAGNOSIS');
    doc.font('Helvetica').text(`Admitting: ${summary.admittingDiagnosis}`);
    doc.text(`Discharge: ${summary.dischargeDiagnosis}`);
    doc.moveDown();

    // Generated Content
    doc.fontSize(12).font('Helvetica-Bold').text('SUMMARY OF COURSE & MANAGEMENT');
    doc.font('Helvetica').text(summary.generatedSummary || 'No summary generated.', {
      align: 'justify'
    });
    
    // Footer
    doc.moveDown(2);
    doc.fontSize(8).text('This is a computer-generated document.', { align: 'center' });
    
    doc.end();
  });

  // Docx Download
  app.get(api.discharges.downloadDocx.path, async (req, res) => {
    const summary = await storage.getDischargeSummary(Number(req.params.id));
    if (!summary) return res.status(404).json({ message: "Summary not found" });

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "ESIC MEDICAL COLLEGE & HOSPITAL",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "DEPARTMENT OF PEDIATRICS",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "KK Nagar, Chennai - 600078",
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }), // Spacing
          
          new Paragraph({
            children: [
              new TextRun({ text: "Name: ", bold: true }),
              new TextRun(`${summary.patientName}\t\t`),
              new TextRun({ text: "Age/Sex: ", bold: true }),
              new TextRun(`${summary.age}y / ${summary.gender}`),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "IP No: ", bold: true }),
              new TextRun(`${summary.ipNumber}\t\t`),
              new TextRun({ text: "DOA: ", bold: true }),
              new TextRun(`${summary.admissionDate}`),
            ]
          }),
           new Paragraph({ text: "" }),
           
           new Paragraph({
             text: "DISCHARGE SUMMARY",
             heading: HeadingLevel.HEADING_3,
             alignment: AlignmentType.CENTER,
           }),
           new Paragraph({
             text: summary.generatedSummary || "No summary generated.",
           }),
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=discharge_${summary.ipNumber}.docx`);
    res.send(buffer);
  });

  // Seed Data
  const existing = await storage.getAllDischargeSummaries();
  if (existing.length === 0) {
    console.log("Seeding database...");
    await storage.createDischargeSummary({
      patientName: "Baby of Priya",
      age: 2,
      gender: "Male",
      fatherName: "Ramesh",
      motherName: "Priya",
      ipNumber: "IP123456",
      bedNumber: "PICU-05",
      unitOfAdmission: "PICU",
      admissionDate: "2023-10-01",
      dischargeDate: "2023-10-05",
      consultantName: "Dr. S. Kumar",
      admittingDiagnosis: "Acute Bronchiolitis",
      dischargeDiagnosis: "Acute Bronchiolitis - Resolved",
      hospitalCourse: "Admitted with respiratory distress. Started on O2 support and nebulization. Gradually weaned off O2. Feeds established. Discharged in stable condition.",
      dischargeMedications: "Syp. Ascoril LS 2.5ml TDS x 5 days",
      followUpPlan: "Review in OPD after 1 week (12/10/2023)",
      dischargeCondition: "Stable",
      generatedSummary: "DISCHARGE SUMMARY\n\nPATIENT DETAILS\nName: Baby of Priya\nAge/Sex: 2y/Male\nIP No: IP123456\nUnit: PICU\nConsultant: Dr. S. Kumar\n\nDIAGNOSIS\nAdmitting: Acute Bronchiolitis\nDischarge: Acute Bronchiolitis - Resolved\n\nCOURSE IN HOSPITAL\nAdmitted with respiratory distress. Started on O2 support and nebulization. Gradually weaned off O2. Feeds established. Discharged in stable condition.\n\nADVICE ON DISCHARGE\nContinue medications as prescribed. Review in OPD after 1 week.",
    });
    console.log("Seeding complete.");
  }

  return httpServer;
}
