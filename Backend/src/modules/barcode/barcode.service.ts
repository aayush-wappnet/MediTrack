import { Injectable } from '@nestjs/common';
import { PatientsService } from '../patients/patients.service';
import * as JsBarcode from 'jsbarcode';
import { DOMImplementation, XMLSerializer } from 'xmldom';

@Injectable()
export class BarcodeService {
  constructor(
    private patientsService: PatientsService,
  ) {}

  /**
   * Generate a barcode ID for a patient
   */
  generateBarcodeId(): string {
    // Generate a random ID with prefix "P" + current timestamp + 6 random digits
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `P${timestamp}${random}`;
  }

  /**
   * Generate a barcode SVG for a patient
   */
  generateBarcodeSVG(barcodeId: string): string {
    // Create a DOM document to render the SVG
    const document = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null);
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    
    // Use JsBarcode to render the barcode
    JsBarcode(svgElement, barcodeId, {
      format: 'CODE128',
      width: 2,
      height: 100,
      displayValue: true,
      fontOptions: 'bold',
      fontSize: 20,
      margin: 10,
    });
    
    // Convert the SVG to a string
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svgElement);
  }

  /**
   * Assign a barcode to a patient
   */
  async assignBarcodeToPatient(patientId: string): Promise<string> {
    const barcodeId = this.generateBarcodeId();
    await this.patientsService.updateBarcodeId(patientId, barcodeId);
    return barcodeId;
  }

  /**
   * Get a patient's barcode SVG
   */
  async getPatientBarcodeSVG(patientId: string): Promise<string> {
    const patient = await this.patientsService.findOne(patientId);
    
    // Generate barcode ID if not exists
    if (!patient.barcodeId) {
      patient.barcodeId = await this.assignBarcodeToPatient(patientId);
    }
    
    return this.generateBarcodeSVG(patient.barcodeId);
  }
}