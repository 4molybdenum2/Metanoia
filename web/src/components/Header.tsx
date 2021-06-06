import React, { useContext} from 'react'
import { UserContext} from '../context/UserContext';
import { IUser } from '../types/User';
import { Button } from '@material-ui/core';
import { css } from 'emotion';
export const Header : React.FC =() => {

    const user = useContext(UserContext) as IUser;
    
    const _handleSignInClick = () => {
        // Authenticate using via passport api in the backend
        // Open Twitter login page
        // Upon successful login, a cookie session will be stored in the client
        window.open("http://localhost:4000/auth/google", "_self");
      };
    
        const _handleLogoutClick = () => {
            // Logout using Twitter passport api
            // Set authenticated state to false in the HomePage
            window.open("http://localhost:4000/auth/logout", "_self");
        };
      
    return (

        <div className="container navbar">
            { user ? 
                (
                <>
                        <h3>{user.userName}</h3> 
                        <Button variant="contained" color="primary" onClick={_handleLogoutClick}>Log Out</Button>
                </>)
                :
                <div>
                        <h2> Metanoia </h2>
                        <Button variant="contained" color="secondary" onClick={_handleSignInClick}> Log in With Google </Button>
                </div>
                
            }
        </div>
    )
};