import { ReactNode } from 'react'
import { Navbar } from './Navbar'
import { Wrapper } from './Wrapper'

interface ILayoutProps {
    children: ReactNode
}
export const Layout = ({ children }: ILayoutProps) => {
    return (
        <>
            <Navbar></Navbar>
            <Wrapper>{children}</Wrapper>
        </>
    )
}
