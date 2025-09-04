import { Task } from "src/task/entities/task.entity";
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export enum UserRole {
    ADMIN = "admin",
    EDITOR = "editor",
}

@Entity("user")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({
        type: "varchar"
    })
    name: string

    @Column({
        type: "varchar",
        unique: true
    })
    email: string

    @Column({
        type: "varchar",
        select: false
    })
    password: string

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.EDITOR,
    })
    role: UserRole

    @OneToMany(
        () => Task,
        (task) => task.creator
    )
    createdTasks: Task[]

    @ManyToMany(
        () => Task, 
        (task) => task.team
    )
    participatingTasks: Task[]
}
