import { RegisterInput } from "src/type/RegisterInput";

export const validateRegisterInput=(registerInput: RegisterInput)=>{
    if(!registerInput.email.includes('@')){
        return {
            message:'Invalid email address',
            errors:[{
                field: 'email',
                message: 'email must include @ symbol',
            }]
        }
    }
    if(registerInput.username.length<2){
        return {
            message:'Invalid username',
            errors:[{
                field: 'username',
                message: 'username must be at least 2 characters'
            }]
        }
    }
    if(registerInput.username.includes('@')){
        return {
            message:'Invalid username',
            errors:[{
                field: 'username',
                message: 'Username cannot include @ symbol'
            }]
        }
    }
    if(registerInput.password.length<2){
        return {
            message:'Invalid Password',
            errors:[{
                field: 'password',
                message: 'password length must be greater than 2'
            }]
        }
    }
    if(registerInput.password !==registerInput.confirmedPassword){
        return {
            message:'password does not match',
            errors:[{
                field: 'confirmedPassword',
                message: 'password and comfirmed password do not match'
            }]
        }
    }
    return null
}