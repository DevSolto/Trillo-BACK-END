import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum TaskStatus {
    OPEN = "open",
    IN_PROGRESS = "inProgress",
    FINISHED = "finished",
    CANCELED = "canceled"
}

export enum TaskType {
    GENERAL = "general",
    BUG = "bug",
    FEATURE = "feature",
    IMPROVEMENT = "improvement",
    MEETING = "meeting",
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
        type: "enum",
        enum: TaskType,
        default: TaskType.GENERAL
    })
    type: TaskType

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date

    @Column({ type: 'timestamptz', nullable: true })
    dueDate: Date | null

    @ManyToOne(
        () => User,
        (user)=> user.createdTasks
    )
    creator: User

    @ManyToMany(() => User, (user) => user.participatingTasks)
    @JoinTable({
        name: "task_team_users",
        joinColumn: { name: "task_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "user_id", referencedColumnName: "id" }
    })
    team: User[]
}
