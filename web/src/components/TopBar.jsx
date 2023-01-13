import {useState, useEffect} from 'react'
import {AppBar, Toolbar, Typography, IconButton, Button} from '@mui/material'
import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import { useLocation, Link } from 'react-router-dom'

import axios from 'axios'

const TopBar = ({theme}) => {

  const location = useLocation()

  return (
    <AppBar sx={{backgroundColor: 'white'}}>
      <Toolbar>
        <Link to='/' style={{textDecoration: 'none'}}>
          <Button style={{textTransform: 'none'}}>
              <Typography sx={{color: `#${theme.accent}`, fontSize: '2em', fontWeight: '800'}}>x</Typography>
              <Typography color='black' sx={{fontSize: '2em', fontWeight: '800'}}>poll</Typography>
          </Button>
        </Link>

        <div style={{flexGrow: 1}} />
        {location.pathname !== '/new' &&
          <Link to='/new' style={{textDecoration: 'none'}}>
            <Button variant='contained' size="small" sx={{backgroundColor: `#${theme.accent}`}}>
              New Poll
            </Button>
          </Link>
        }
        <div style={{width: '1em'}} />
        <Link to='/account' style={{textDecoration: 'none'}}>
          <IconButton onClick={() => console.log('go to profile page')}  style={{color: `#${theme.offset}`}}>
            <AccountCircleIcon />
          </IconButton>
        </Link>
      </Toolbar>
    </AppBar>
  )
}

export default TopBar
