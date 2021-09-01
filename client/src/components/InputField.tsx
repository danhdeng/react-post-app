import {
    FormControl,
    FormErrorMessage,
    FormLabel, TextArea
} from '@chakra-ui/react'
import { useField } from 'formik'
import React from 'react'


interface InputFieldProps {
    name: string
    label: string
    placeholder: string
    type: string
    textarea?: boolean
}

export const InputField = ({textarea,...props}:InputFieldProps) => {
    const [field, {error}] =useField(props)
    console.log('field from props',field)
    return (
        <FormControl isvalid={!!error}>
            <FormLabel htmlFor={field.name}>{field.label}</FormLabel>
            {textarea ? (
                <TextArea {...field} id={field.name} {...props} />
                ) : (<InputText {...field} id={field.name} {...props} />) 
            }
            {error && <FormErrorMessage>{error}</FormErrorMessage>}  
        </FormControl>
    )
}
