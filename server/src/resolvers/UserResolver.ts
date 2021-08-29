import argon2 from 'argon2';
import { COOKIE_NAME } from 'src/constants';
import { User } from 'src/entities/User';
import { TokenModel } from 'src/models/Token';
import { ChangePasswordInput } from 'src/type/ChangePasswordInput';
import { LoginInput } from 'src/type/CreatePostInput';
import { ForgotPasswordInput } from 'src/type/ForgotPassword';
import { RegisterInput } from 'src/type/RegisterInput';
import { sendEmail } from 'src/utils/sendEmail';
import { validateRegisterInput } from 'src/utils/validateRegisterInput';
import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql';
import { v4 as uuidv4 } from 'uuid';
import { Context } from '../type/Context';
import { UserMutationResponse } from './../type/UserMutationResponse';

@Resolver(_of=>User)
export class UserResolver {
  @FieldResolver(_return =>String)
  //need to decorate the method's parameters with @Root to inject the user object.
  email(@Root() user: User, @Ctx() { req } : Context){
    return req.session.userId===user.id ? user.email : ''
  }

  @Query( _return =>User, {nullable: true})
  async me(@Ctx() {req}: Context): Promise<User |undefined |null> {
    if(!req.session.userId) return null
    const user=await User.findOne(req.session.userId)
    return user
  }

  @Mutation( _return =>UserMutationResponse)
  async register(
    @Arg('registerInput') registerInput: RegisterInput,
    @Ctx() {req}: Context
  ): Promise<UserMutationResponse>{
    const valiateRegisterInputErrors=validateRegisterInput(registerInput)
    if(valiateRegisterInputErrors !==null){
      return {
        code: 400,
        success: false,
        ...valiateRegisterInputErrors
      }
    }
    try{
      const {username, email, password} =registerInput
      const existingUser = await User.findOne({email})
      if(existingUser)
        return {
          code: 400,
          success: false,
          message:'Duplicate username or email',
          error:[
            {field: existingUser.username===username ? 'username' :'email',
            message: `${existingUser.username===username ? 'username' :'email'}already taken`,
          }]
        }

      const hashedPassword=await argon2.hash(password)

      const newUser=User.create({
        username,
        password:hashedPassword, 
        email
      })

      await newUser.save()

      return {
        code:200,
        success: true,
        message:'User registration successful',
        user: newUser
      }

    }catch(error){
      console.log(error)
      return {
        code:500,
        success: false,
        message:`Internal server errror ${error.message}`
      }
    }
  }

  @Mutation(_return => UserMutationResponse)
  async login(
    @Arg('loginInput') { usernameOrEmail, password}: LoginInput,
    @Ctx() {req}: Context
  ): Promise<UserMutationResponse>{
    try{
        const existingUser = await User.findOne(
            usernameOrEmail.includes('@') 
            ? {email: usernameOrEmail}
            : {username: usernameOrEmail}
        )
        if(!existingUser){
            return {
              code: 400,
            success: false,
            message:'User not found',
            error:[
              {field: 'usernameOrEmail',
              message: 'Username or email incorrect',
            }]
          }
        }
        const passwordValid =await argon2.verify(existingUser.password, password)
        if(!passwordValid){
            return {
              code: 400,
            success: false,
            message:'Wrong password',
            error:[
              {field: 'password',
              message: 'Wrong password'
            }]
          }
        }  

        req.session.userId=existingUser.id
        return {
          code:200,
          success: true,
          message:'logged in successful',
          user: existingUser
        }

        
    }catch(error){
        console.log(error)
        return {
          code:500,
          success: false,
          message:`Internal server errror ${error.message}`
        }
      } 
    }

    @Mutation(_return =>Boolean)
    logout(@Ctx() {req, res}: Context): Promise<boolean>{
      return new Promise((resolve, reject)=>{
        res.clearCookie(COOKIE_NAME)
        req.session.destroy(error=>{
          if(error){
            console.log('DESTORYING SESSION ERROR', error)
            reject(false)
          }
          resolve(true)
        })   
      })
    }

    @Mutation(_return =>Boolean)
    async forgotPassword(
      @Arg('forgotPasswordInput') forgotPasswordInput: ForgotPasswordInput
      ): Promise<boolean>{
        const user=await User.findOne({email:forgotPasswordInput.email})
        if(!user) return true
        await TokenModel.findOneAndDelete({userId:`${user.id}`})
        const resetToken=uuidv4()
        const hashedResetToken=await argon2.hash(resetToken)
        await new TokenModel({
          userId:`${user.id}`,
          token: hashedResetToken
        }).save()

        await sendEmail(
          forgotPasswordInput.email,
          `< href="http://${process.env.HOST}:${process.env.PORT}/change-password?token=${resetToken}&user_id=${user.id}">Click here to reset your password</a>`
        )
        return true;
      }
    
    @Mutation(_return =>UserMutationResponse)
    async changePassword(
      @Arg('toekn') token: string,
      @Arg('userId') userId: string,
      @Arg('changePasswordInput') changePasswordInput: ChangePasswordInput,
      @Ctx() {req} : Context
    ): Promise<UserMutationResponse>{
        if(changePasswordInput.newPassword.length<=2){
          return {
            code: 400,
            success: false,
            message:'Invalid password',
            error:[
              {field: 'newPassword',
              message: 'Password lenght must be greater than 2'
            }]
          }
        }
        try{
          const resetPasswordTokenRecord=await TokenModel.findOne({userId})
          if(!resetPasswordTokenRecord){
              return {
                code: 400,
                success: false,
                message:'Invalid or expired password reset token',
                error:[
                  {field: 'token',
                  message: 'Invalid or expired password reset token'
                }]
            }
          }
          const resetpasswordTokenValid=await argon2.verify(resetPasswordTokenRecord.token, token)
          if(!resetpasswordTokenValid){
            return {
              code: 400,
              success: false,
              message:'Invalid or expired password reset token',
              error:[
                {field: 'token',
                message: 'Invalid or expired password reset token'
              }]
          }
        }

          const userIdNum=parseInt(userId)
          const user=await User.findOne(userIdNum)
          if(!user){
            return {
              code: 400,
              success: false,
              message:'User no longer exists',
              error:[
                {field: 'token',
                message: 'User no longer exists'
              }]
            }
          }

          const updatedPassword=await argon2.hash(changePasswordInput.newPassword)
          await User.update({id: userIdNum}, {password: updatedPassword})
          await resetPasswordTokenRecord.deleteOne()
          req.session.userId=user.id
          return {
            code:200,
            success: true,
            message:'User password reset successfully',
            user
          }
  
          
        }catch(error){
          console.log(error)
          return {
            code:500,
            success: false,
            message:`Internal server errror ${error.message}`
          }
        }
    }
}
