import { Injectable } from '@nestjs/common';
import { CreateAssociationDto } from './dto/create-association.dto';
import { UpdateAssociationDto } from './dto/update-association.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Association } from './entities/association.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AssociationService {
  constructor(
    @InjectRepository(Association)
    private readonly repo: Repository<Association>
  ) { }

  create(createAssociationDto: CreateAssociationDto) {
    const association = this.repo.create(createAssociationDto)
    return this.repo.save(association)
  }

  findAll() {
    return this.repo.find()
  }

  findOneById(id: string) {
    return this.repo.findOneBy({
      id
    })
  }

  findOneByCnpj(cnpj: string) {
    return this.repo.findOneBy({
      cnpj
    })
  }

  update(id: string, updateAssociationDto: UpdateAssociationDto) {
    return this.repo.update({ id }, updateAssociationDto)
  }

  remove(id: string) {
    return this.repo.delete({ id })
  }
}
