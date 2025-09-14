import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Task } from "src/task/entities/task.entity";



@Entity("association")
export class Association {
    @PrimaryGeneratedColumn("uuid")
    id:string

    @Column({
        type:"varchar"
    })
    name:string

    @Column({
        type:"varchar"
    })
    cnpj:string

    @Column({
        type:"boolean",
        default:true
    })
    status:boolean

    @OneToMany(() => Task, (task) => task.association)
    tasks: Task[]
}
