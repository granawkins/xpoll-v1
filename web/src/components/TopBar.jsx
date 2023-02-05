import {useState, useEffect} from 'react'
import {AppBar, Toolbar, Typography, IconButton, Button} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import { useLocation, Link } from 'react-router-dom'
import { useAuth0 } from "@auth0/auth0-react";

const TopBar = () => {

  const theme = useTheme()

  const location = useLocation()

  const { loginWithRedirect, isAuthenticated } = useAuth0();

  const showNew = location.pathname !== '/new' && isAuthenticated

  return (
    <AppBar sx={{backgroundColor: 'white'}}>
      <Toolbar>
        <Link to='/' style={{textDecoration: 'none'}}>
          <Button style={{textTransform: 'none'}}>
              <Typography sx={{color: theme.accent, fontSize: '2em', fontWeight: '800'}}>x</Typography>
              <Typography color='black' sx={{fontSize: '2em', fontWeight: '800'}}>poll</Typography>
          </Button>
        </Link>

        <div style={{flexGrow: 1}} />
        {showNew &&
          <Link to='/new' style={{textDecoration: 'none'}}>
            <Button variant='contained' size="small" sx={{backgroundColor: theme.accent}}>
              New Poll
            </Button>
          </Link>
        }
        <div style={{width: '1em'}} />
        {isAuthenticated
          ? <Link to='/account' style={{textDecoration: 'none'}}>
            <IconButton style={{color: theme.offset}}>
              <AccountCircleIcon />
            </IconButton>
          </Link>
          : <Button
            onClick={() => loginWithRedirect()}
            variant='contained'
            size="small"
            sx={{backgroundColor: theme.accent}}>
            Login
            </Button>
        }

      </Toolbar>
    </AppBar>
  )
}

export default TopBar
