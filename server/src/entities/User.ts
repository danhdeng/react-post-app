import { Field, ID, ObjectType } from 'type-graphql';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity, OneToMany, PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { Post } from "./Post";
import { Upvote } from "./Upvote";

//db table
@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field(_type => ID)
    @PrimaryGeneratedColumn()
    id!: number

    @Column({unique: true})
    username!: string

    @Column({unique: true})
    email!: string

    @Column()
    password!: string

    @OneToMany(_to=>Post, post=>post.user)
    posts: Post[]

    @OneToMany(_to=>Upvote, upvote=>upvote.user)
    upvotes: Upvote[]


    @CreateDateColumn()
    createAt: Date

    @UpdateDateColumn()
    updateAt: Date

}