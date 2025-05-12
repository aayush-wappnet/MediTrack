import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NursesService } from './nurses.service';
import { CreateNurseDto } from './dto/create-nurse.dto';
import { UpdateNurseDto } from './dto/update-nurse.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('nurses')
@Controller('nurses')
export class NursesController {
  constructor(private readonly nursesService: NursesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN , Role.NURSE)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create a new nurse profile' })
  @ApiResponse({ status: 201, description: 'Nurse profile created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() createNurseDto: CreateNurseDto) {
    return this.nursesService.create(createNurseDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get all nurses' })
  @ApiResponse({ status: 200, description: 'Return all nurses' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll() {
    return this.nursesService.findAll();
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.NURSE)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get current nurse profile' })
  @ApiResponse({ status: 200, description: 'Return nurse profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Nurse profile not found' })
  getProfile(@Request() req) {
    return this.nursesService.findByUserId(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get nurse by id' })
  @ApiResponse({ status: 200, description: 'Return nurse' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Nurse not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.nursesService.findOne(id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.NURSE)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update current nurse profile' })
  @ApiResponse({ status: 200, description: 'Nurse profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Nurse profile not found' })
  async updateProfile(@Request() req, @Body() updateNurseDto: UpdateNurseDto) {
    const nurse = await this.nursesService.findByUserId(req.user.id);
    return this.nursesService.update(nurse.id, updateNurseDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update nurse by id' })
  @ApiResponse({ status: 200, description: 'Nurse updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Nurse not found' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateNurseDto: UpdateNurseDto) {
    return this.nursesService.update(id, updateNurseDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete nurse by id' })
  @ApiResponse({ status: 200, description: 'Nurse deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Nurse not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.nursesService.remove(id);
  }
}