import { User } from "src/user/entities/user.entity";
import { Association } from "src/association/entities/association.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum TaskStatus {
    OPEN = "open",
    IN_PROGRESS = "inProgress",
    FINISHED = "finished",
    CANCELED = "canceled"
}

export enum TaskPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
}

@Entity("task")
export class Task {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({
        type: "varchar"
    })
    title: string

    @Column({
        type: "text"
    })
    description: string

    @Column({
        type: "enum",
        enum: TaskStatus,
        default: TaskStatus.OPEN
    })
    status: TaskStatus

    @Column({
        type: 'enum',
        enum: TaskPriority,
        default: TaskPriority.MEDIUM,
    })
    priority: TaskPriority

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date

    @Column({ type: 'timestamptz', nullable: true })
    dueDate: Date | null

    @ManyToOne(
        () => User,
        (user)=> user.createdTasks
    )
    creator: User

    @ManyToOne(() => Association, (association) => association.tasks, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'association_id' })
    association: Association

    @ManyToMany(() => User, (user) => user.participatingTasks)
    @JoinTable({
        name: "task_team_users",
        joinColumn: { name: "task_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "user_id", referencedColumnName: "id" }
    })
    team: User[]
}
