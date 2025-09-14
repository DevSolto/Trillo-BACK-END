import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { User } from 'src/user/entities/user.entity'
import { Task } from 'src/task/entities/task.entity'
import { Association } from 'src/association/entities/association.entity'
import { promises as fs } from 'fs'
import * as path from 'path'
import { ConfigService } from '@nestjs/config'

type SeedUser = { id: string; name: string; email: string; role: User['role'] }
type SeedAssociation = { id?: string; name: string; cnpj: string; status?: boolean }
type SeedTask = {
  id?: string
  title: string
  description: string
  status?: Task['status']
  priority?: Task['priority']
  dueDate?: string | null
  creatorId: string
  associationId: string
  teamIds: string[]
}

type SeedFile = {
  users?: SeedUser[]
  associations?: SeedAssociation[]
  tasks?: SeedTask[]
}

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name)

  constructor(
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Task) private readonly tasks: Repository<Task>,
    @InjectRepository(Association) private readonly associations: Repository<Association>,
  ) {}

  async onApplicationBootstrap() {
    const env = this.config.get<string>('NODE_ENV') ?? process.env.NODE_ENV ?? 'development'
    const flagRaw = this.config.get<string>('RESET_DB_ON_START')
    const shouldReset =
      typeof flagRaw !== 'undefined'
        ? ['1', 'true', 'yes'].includes(String(flagRaw).toLowerCase())
        : env !== 'production'

    if (!shouldReset) {
      this.logger.log('DB reset/seed on start is disabled')
      return
    }

    // Never run destructive reset in production unless explicitly enabled
    if (env === 'production' && !['1', 'true', 'yes'].includes(String(flagRaw).toLowerCase())) {
      this.logger.warn('Skipping DB reset/seed in production (RESET_DB_ON_START not true)')
      return
    }

    try {
      const seed = await this.loadSeed()
      await this.resetDatabase()
      await this.applySeed(seed)
      this.logger.log('Database reset and seed applied successfully')
    } catch (err) {
      this.logger.error('Failed to reset/apply seed', err as any)
    }
  }

  private async loadSeed(): Promise<SeedFile> {
    const cwd = process.cwd()
    const primary = path.join(cwd, 'db', 'seed.json')
    const fallback = path.join(cwd, 'db', 'seed.template.json')
    let file = primary
    try {
      await fs.access(primary)
    } catch {
      file = fallback
    }
    const raw = await fs.readFile(file, 'utf-8')
    const json = JSON.parse(raw) as SeedFile
    return json ?? { users: [], associations: [], tasks: [] }
  }

  private async resetDatabase() {
    // Truncate with CASCADE to clear FK dependencies; quote reserved table names
    const tables = ['task_team_users', 'task', 'user', 'association']
    const sql = `TRUNCATE TABLE ${tables.map((t) => '"' + t + '"').join(', ')} RESTART IDENTITY CASCADE;`
    await this.dataSource.query(sql)
  }

  private async applySeed(seed: SeedFile) {
    const assocMap = new Map<string, Association>()
    const userMap = new Map<string, User>()

    // Associations first (ids optional; DB generates if not provided)
    for (const a of seed.associations ?? []) {
      const entity = this.associations.create({
        ...(a.id ? { id: a.id } : {}),
        name: a.name,
        cnpj: a.cnpj,
        status: typeof a.status === 'boolean' ? a.status : true,
      })
      const saved = await this.associations.save(entity)
      assocMap.set(saved.id, saved)
    }

    // Users require explicit id per entity definition
    for (const u of seed.users ?? []) {
      if (!u.id) throw new Error('Seed user missing id')
      const entity = this.users.create({ id: u.id, name: u.name, email: u.email, role: u.role })
      const saved = await this.users.save(entity)
      userMap.set(saved.id, saved)
    }

    // Ensure users referenced by tasks exist (creatorId and teamIds)
    const referencedUserIds = new Set<string>()
    for (const t of seed.tasks ?? []) {
      if (t.creatorId) referencedUserIds.add(t.creatorId)
      for (const uid of t.teamIds ?? []) referencedUserIds.add(uid)
    }
    for (const uid of referencedUserIds) {
      if (userMap.has(uid)) continue
      const short = String(uid).slice(0, 8)
      const stub = this.users.create({
        id: uid,
        name: `Seed User ${short}`,
        email: `seed+${short}@example.com`,
        role: 'editor' as User['role'],
      })
      const saved = await this.users.save(stub)
      userMap.set(saved.id, saved)
    }

    // Tasks (require associationId and creatorId)
    for (const t of seed.tasks ?? []) {
      if (!t.creatorId) throw new Error('Seed task missing creatorId')
      if (!t.associationId) throw new Error('Seed task missing associationId')
      const task = this.tasks.create({
        title: t.title,
        description: t.description,
        ...(t.status ? { status: t.status } : {}),
        ...(t.priority ? { priority: t.priority } : {}),
        ...(typeof t.dueDate !== 'undefined' ? { dueDate: t.dueDate ? new Date(t.dueDate) : null } : {}),
        creator: { id: t.creatorId } as User,
        association: { id: t.associationId } as Association,
        team: (t.teamIds ?? []).map((id) => ({ id } as User)),
      })
      await this.tasks.save(task)
    }
  }
}
