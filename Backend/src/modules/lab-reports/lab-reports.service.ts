import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabReport, LabReportStatus } from './entities/lab-report.entity';
import { CreateLabReportDto } from './dto/create-lab-report.dto';
import { UpdateLabReportDto } from './dto/update-lab-report.dto';
import { PatientsService } from '../patients/patients.service';
import { DoctorsService } from '../doctors/doctors.service';
import { NursesService } from '../nurses/nurses.service';
import { AppointmentsService } from '../appointments/appointments.service'; // Added import

@Injectable()
export class LabReportsService {
  constructor(
    @InjectRepository(LabReport)
    private labReportsRepository: Repository<LabReport>,
    private patientsService: PatientsService,
    private doctorsService: DoctorsService,
    private nursesService: NursesService,
    private appointmentsService: AppointmentsService, // Added injection
  ) {}

  async create(createLabReportDto: CreateLabReportDto): Promise<LabReport> {
    const { patientId, orderedById, uploadedById, appointmentId, ...labReportData } = createLabReportDto;
    
    // Get patient and doctor
    const patient = await this.patientsService.findOne(patientId);
    const doctor = await this.doctorsService.findOne(orderedById);

    // Find appointment (now required)
    let appointment = null;
    try {
      appointment = await this.appointmentsService.findOne(appointmentId);
    } catch (error) {
      throw new BadRequestException(`Appointment with ID ${appointmentId} not found`);
    }
    
    // Create lab report
    const labReport = this.labReportsRepository.create({
      ...labReportData,
      patient,
      orderedBy: doctor,
      appointment, // Assign appointment
    });
    
    // Add nurse if provided
    if (uploadedById) {
      const nurse = await this.nursesService.findOne(uploadedById);
      labReport.uploadedBy = nurse;
    }
    
    return this.labReportsRepository.save(labReport);
  }

  async findAll(): Promise<LabReport[]> {
    return this.labReportsRepository.find({
      relations: ['patient', 'orderedBy', 'uploadedBy', 'appointment', 'patient.user', 'orderedBy.user', 'uploadedBy.user'], // Added 'appointment' relation
    });
  }

  async findOne(id: string): Promise<LabReport> {
    const labReport = await this.labReportsRepository.findOne({
      where: { id },
      relations: ['patient', 'orderedBy', 'uploadedBy', 'appointment', 'patient.user', 'orderedBy.user', 'uploadedBy.user'], // Added 'appointment' relation
    });
    
    if (!labReport) {
      throw new NotFoundException(`Lab report with ID ${id} not found`);
    }
    
    return labReport;
  }

  async findByPatient(patientId: string): Promise<LabReport[]> {
    return this.labReportsRepository.find({
      where: { patient: { id: patientId } },
      relations: ['patient', 'orderedBy', 'uploadedBy', 'appointment', 'patient.user', 'orderedBy.user', 'uploadedBy.user'], // Added 'appointment' relation
    });
  }

  async findByDoctor(doctorId: string): Promise<LabReport[]> {
    return this.labReportsRepository.find({
      where: { orderedBy: { id: doctorId } },
      relations: ['patient', 'orderedBy', 'uploadedBy', 'appointment', 'patient.user', 'orderedBy.user', 'uploadedBy.user'], // Added 'appointment' relation
    });
  }

  async findByNurse(nurseId: string): Promise<LabReport[]> {
    return this.labReportsRepository.find({
      where: { uploadedBy: { id: nurseId } },
      relations: ['patient', 'orderedBy', 'uploadedBy', 'appointment', 'patient.user', 'orderedBy.user', 'uploadedBy.user'], // Added 'appointment' relation
    });
  }

  async findByStatus(status: LabReportStatus): Promise<LabReport[]> {
    return this.labReportsRepository.find({
      where: { status },
      relations: ['patient', 'orderedBy', 'uploadedBy', 'appointment', 'patient.user', 'orderedBy.user', 'uploadedBy.user'], // Added 'appointment' relation
    });
  }

  async update(id: string, updateLabReportDto: UpdateLabReportDto): Promise<LabReport> {
    const labReport = await this.findOne(id);
    
    // Handle patient change
    if (updateLabReportDto.patientId) {
      const patient = await this.patientsService.findOne(updateLabReportDto.patientId);
      labReport.patient = patient;
    }
    
    // Handle doctor change
    if (updateLabReportDto.orderedById) {
      const doctor = await this.doctorsService.findOne(updateLabReportDto.orderedById);
      labReport.orderedBy = doctor;
    }
    
    // Handle nurse change
    if (updateLabReportDto.uploadedById) {
      const nurse = await this.nursesService.findOne(updateLabReportDto.uploadedById);
      labReport.uploadedBy = nurse;
    }
    
    // Handle appointment change
    if (updateLabReportDto.appointmentId) { // Cannot be null anymore
      try {
        const appointment = await this.appointmentsService.findOne(updateLabReportDto.appointmentId);
        labReport.appointment = appointment;
      } catch (error) {
        throw new BadRequestException(`Appointment with ID ${updateLabReportDto.appointmentId} not found`);
      }
    }

    // Handle status change to completed
    if (
      updateLabReportDto.status === LabReportStatus.COMPLETED && 
      labReport.status !== LabReportStatus.COMPLETED
    ) {
      if (!labReport.resultsDate) {
        labReport.resultsDate = new Date();
      }
    }
    
    // Update other fields
    const fieldsToUpdate = [
      'testName', 'testType', 'status', 'results', 'normalRanges', 
      'comments', 'doctorNotes', 'testDate', 'resultsDate', 
      'isUrgent', 'isPrinted', 'fileUrl'
    ];
    
    fieldsToUpdate.forEach(field => {
      if (updateLabReportDto[field] !== undefined) {
        labReport[field] = updateLabReportDto[field];
      }
    });
    
    return this.labReportsRepository.save(labReport);
  }

  async remove(id: string): Promise<void> {
    const labReport = await this.findOne(id);
    
    // Check if lab report is already completed
    if (labReport.status === LabReportStatus.COMPLETED) {
      throw new BadRequestException('Cannot delete a lab report that has already been completed');
    }
    
    await this.labReportsRepository.remove(labReport);
  }
}