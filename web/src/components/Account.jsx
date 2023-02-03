import {useState, useEffect} from 'react'
import axios from 'axios'
import FeedCard from './FeedCard'
import { Container, Box, Typography, Button } from '@mui/material'

const Account = ({username, setUsername, theme}) => {


    // GET USERS
    const [users, setUsers] = useState([])
    useEffect(() => {
      getUsers()
    }, [])
    const getUsers = () => {
      axios.get('/api/get_users')
        .then((res) => {
          setUsers(res.data.data.slice(0, 100))
        })
    }

    // ADD USER
    const [newUsername, setNewUsername] = useState('')
    const [newUsernameError, setNewUsernameError] = useState(null)
    const handleNewUsername = (event) => {
      setNewUsernameError(null)
      setNewUsername(event.target.value)
    }
    const handleAddUser = () => {
      axios.post('/api/add_user', {username: newUsername})
      .then((res) => {
        if (res.data.successful) {
          setNewUsernameError(null)
          getUsers()
        } else {
          setNewUsernameError(res.data.error)
        }
      })
    }

    // SET ACTIVE USER
    const handleSetUsername = (event) => {
      setUsername(event.target.value)
    }
    useEffect(() => {
      if (!username && users.length > 0) {
        setUsername(users[0])
      }
    }, [users])


  return (
    <Container maxWidth='xs'>
      <input type='text' value={newUsername} onChange={handleNewUsername}/>
      <button onClick={handleAddUser}>Add New User</button>
      {newUsernameError && <p style={{color: 'red'}}>{newUsernameError}</p>}

      <select selected={username} onChange={handleSetUsername}>
      {users.map(u => <option key={`active_user_${u}`}>{u}</option>)}
      </select>

    </Container>
  )
}

export default Account
