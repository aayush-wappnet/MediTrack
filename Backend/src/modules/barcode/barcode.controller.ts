import { Controller, Get, Param, Post, UseGuards, Request, ParseUUIDPipe, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { BarcodeService } from './barcode.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { PatientsService } from '../patients/patients.service';

@ApiTags('barcode')
@Controller('barcode')
export class BarcodeController {
  constructor(
    private readonly barcodeService: BarcodeService,
    private readonly patientsService: PatientsService,
  ) {}

  @Post('generate/:patientId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Generate a barcode for a patient' })
  @ApiResponse({ status: 200, description: 'Barcode generated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async generateBarcode(@Param('patientId', ParseUUIDPipe) patientId: string) {
    const barcodeId = await this.barcodeService.assignBarcodeToPatient(patientId);
    return { barcodeId };
  }

  @Get('svg/:patientId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get SVG barcode for a patient' })
  @ApiResponse({ status: 200, description: 'Return SVG barcode' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getBarcodeSVG(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Res() res: Response
  ) {
    const svg = await this.barcodeService.getPatientBarcodeSVG(patientId);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  }

  @Get('my-barcode')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PATIENT)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get current patient\'s barcode' })
  @ApiResponse({ status: 200, description: 'Return patient\'s barcode' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getMyBarcode(@Request() req, @Res() res: Response) {
    const patient = await this.patientsService.findByUserId(req.user.id);
    const svg = await this.barcodeService.getPatientBarcodeSVG(patient.id);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  }

  @Get('find/:barcodeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Find patient by barcode ID' })
  @ApiResponse({ status: 200, description: 'Return patient' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async findPatientByBarcode(@Param('barcodeId') barcodeId: string) {
    return this.patientsService.findByBarcodeId(barcodeId);
  }
}