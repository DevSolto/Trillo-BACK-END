import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";



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
}
