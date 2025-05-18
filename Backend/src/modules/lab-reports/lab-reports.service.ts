import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabReport, LabReportStatus } from './entities/lab-report.entity';
import { CreateLabReportDto } from './dto/create-lab-report.dto';
import { UpdateLabReportDto } from './dto/update-lab-report.dto';
import { PatientsService } from '../patients/patients.service';
import { DoctorsService } from '../doctors/doctors.service';
import { NursesService } from '../nurses/nurses.service';
import { AppointmentsService } from '../appointments/appointments.service';

@Injectable()
export class LabReportsService {
  constructor(
    @InjectRepository(LabReport)
    private labReportsRepository: Repository<LabReport>,
    private patientsService: PatientsService,
    private doctorsService: DoctorsService,
    private nursesService: NursesService,
    private appointmentsService: AppointmentsService,
  ) {}

  async create(createLabReportDto: CreateLabReportDto): Promise<LabReport> {
    const { patientId, orderedById, uploadedById, appointmentId, testParameters, ...labReportData } = createLabReportDto;
    
    const patient = await this.patientsService.findOne(patientId);
    const doctor = await this.doctorsService.findOne(orderedById);
    
    let appointment = null;
    try {
      appointment = await this.appointmentsService.findOne(appointmentId);
    } catch (error) {
      throw new BadRequestException(`Appointment with ID ${appointmentId} not found`);
    }
    
    const labReport = this.labReportsRepository.create({
      ...labReportData,
      testParameters: testParameters || [],
      patient,
      orderedBy: doctor,
      appointment,
    });
    
    if (uploadedById) {
      const nurse = await this.nursesService.findOne(uploadedById);
      labReport.uploadedBy = nurse;
    }
    
    return this.labReportsRepository.save(labReport);
  }

  async findAll(): Promise<LabReport[]> {
    return this.labReportsRepository.find({
      relations: ['patient', 'orderedBy', 'uploadedBy', 'appointment', 'patient.user', 'orderedBy.user', 'uploadedBy.user'],
    });
  }

  async findOne(id: string): Promise<LabReport> {
    const labReport = await this.labReportsRepository.findOne({
      where: { id },
      relations: ['patient', 'orderedBy', 'uploadedBy', 'appointment', 'patient.user', 'orderedBy.user', 'uploadedBy.user'],
    });
    
    if (!labReport) {
      throw new NotFoundException(`Lab report with ID ${id} not found`);
    }
    
    return labReport;
  }

  async findByPatient(patientId: string): Promise<LabReport[]> {
    return this.labReportsRepository.find({
      where: { patient: { id: patientId } },
      relations: ['patient', 'orderedBy', 'uploadedBy', 'appointment', 'patient.user', 'orderedBy.user', 'uploadedBy.user'],
    });
  }

  async findByDoctor(doctorId: string): Promise<LabReport[]> {
    return this.labReportsRepository.find({
      where: { orderedBy: { id: doctorId } },
      relations: ['patient', 'orderedBy', 'uploadedBy', 'appointment', 'patient.user', 'orderedBy.user', 'uploadedBy.user'],
    });
  }

  async findByNurse(nurseId: string): Promise<LabReport[]> {
    return this.labReportsRepository.find({
      where: { uploadedBy: { id: nurseId } },
      relations: ['patient', 'orderedBy', 'uploadedBy', 'appointment', 'patient.user', 'orderedBy.user', 'uploadedBy.user'],
    });
  }

  async findByStatus(status: LabReportStatus): Promise<LabReport[]> {
    return this.labReportsRepository.find({
      where: { status },
      relations: ['patient', 'orderedBy', 'uploadedBy', 'appointment', 'patient.user', 'orderedBy.user', 'uploadedBy.user'],
    });
  }

  async update(id: string, updateLabReportDto: UpdateLabReportDto): Promise<LabReport> {
    const labReport = await this.findOne(id);
    
    if (updateLabReportDto.patientId) {
      const patient = await this.patientsService.findOne(updateLabReportDto.patientId);
      labReport.patient = patient;
    }
    
    if (updateLabReportDto.orderedById) {
      const doctor = await this.doctorsService.findOne(updateLabReportDto.orderedById);
      labReport.orderedBy = doctor;
    }
    
    if (updateLabReportDto.uploadedById) {
      const nurse = await this.nursesService.findOne(updateLabReportDto.uploadedById);
      labReport.uploadedBy = nurse;
    }
    
    if (updateLabReportDto.appointmentId) {
      try {
        const appointment = await this.appointmentsService.findOne(updateLabReportDto.appointmentId);
        labReport.appointment = appointment;
      } catch (error) {
        throw new BadRequestException(`Appointment with ID ${updateLabReportDto.appointmentId} not found`);
      }
    }

    if (
      updateLabReportDto.status === LabReportStatus.COMPLETED && 
      labReport.status !== LabReportStatus.COMPLETED
    ) {
      if (!labReport.resultsDate) {
        labReport.resultsDate = new Date();
      }
    }
    
    const fieldsToUpdate = [
      'testName', 'testType', 'status', 'testParameters', 
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
    
    if (labReport.status === LabReportStatus.COMPLETED) {
      throw new BadRequestException('Cannot delete a lab report that has already been completed');
    }
    
    await this.labReportsRepository.remove(labReport);
  }
}