import { Task } from "src/task/entities/task.entity";
import { Column, Entity, ManyToMany, OneToMany, PrimaryColumn } from "typeorm";

export enum UserRole {
    ADMIN = "admin",
    EDITOR = "editor",
}

@Entity("user")
export class User {
    @PrimaryColumn("uuid")
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
