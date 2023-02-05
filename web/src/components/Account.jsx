import {useState, useEffect} from 'react'
import PageHeader from './PageHeader'

import { Container, Box, Typography, Button, CircularProgress } from '@mui/material'
import { useAuth0 } from '@auth0/auth0-react'

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';


const Account = ({username, setUsername, theme}) => {

  const { logout, user, isLoading } = useAuth0();

  const updated = user ? new Date(user.updated_at).toLocaleString() : null

  return (
    <Container maxWidth='xs' sx={{padding: '2em', maxWidth: '450px', textAlign: 'center'}}>
      <PageHeader pageName="My Account" />
      {isLoading && <CircularProgress />}
      {!isLoading && !user && <div>Login</div>}
      {!isLoading && user && <>
        <img src={user.picture} alt={user.name} />
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell align="right">{user.nickname}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell align="right">{user.email}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Last Updated</TableCell>
                <TableCell align="right">{updated}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Button
          onClick={() => logout()}
          variant='contained'
          size="small"
          sx={{margin: '2em'}}
        >Logout</Button>
      </>}
    </Container>
  )
}

export default Account
