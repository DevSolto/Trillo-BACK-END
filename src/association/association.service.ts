import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssociationDto } from './dto/create-association.dto';
import { UpdateAssociationDto } from './dto/update-association.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Association } from './entities/association.entity';
import { Like, Repository } from 'typeorm';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { QueryAssociationDto } from './dto/query-association.dto';

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

  async findAll(query: QueryAssociationDto = { page: 1, limit: 10 }) {
    const { page = 1, limit = 10, name, cnpj, status, sortBy = 'id', sortOrder = 'ASC' } = query ?? {}
    const take = Math.max(1, Math.min(limit ?? 10, 100))
    const skip = Math.max(0, ((page ?? 1) - 1) * take)

    const where: any = {}
    if (name) where.name = Like(`%${name}%`)
    if (cnpj) where.cnpj = Like(`%${cnpj}%`)
    if (typeof status !== 'undefined') where.status = status === 'true'

    const [items, total] = await this.repo.findAndCount({ skip, take, where, order: { [sortBy]: (String(sortOrder).toUpperCase() as 'ASC' | 'DESC') ?? 'ASC' } })
    const pageCount = Math.ceil(total / take) || 1

    return { items, total, page: page ?? 1, limit: take, pageCount }
  }

  async findOneById(id: string) {
    const association = await this.repo.findOneBy({ id })
    if (!association) throw new NotFoundException('Associação não encontrada')
    return association
  }

  async findOneByCnpj(cnpj: string) {
    const association = await this.repo.findOneBy({ cnpj })
    if (!association) throw new NotFoundException('Associação não encontrada')
    return association
  }

  update(id: string, updateAssociationDto: UpdateAssociationDto) {
    return this.repo.update({ id }, updateAssociationDto)
  }

  remove(id: string) {
    return this.repo.delete({ id })
  }
}
