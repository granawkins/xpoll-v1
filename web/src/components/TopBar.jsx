import {useState, useEffect} from 'react'
import axios from 'axios'

const TopBar = ({activeUser, setActiveUser, setActivePage}) => {

    // GET USERS
  const [users, setUsers] = useState([])
  useEffect(() => {
    getUsers()
  }, [])
  const getUsers = () => {
    axios.get('/get_users')
      .then((res) => {
        setUsers(res.data)
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
    axios.post('/add_user', {username: newUsername})
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
  const handleSetActiveUser = (event) => {
    setActiveUser(event.target.value)
  }
  useEffect(() => {
    if (!activeUser && users.length > 0) {
      setActiveUser(users[0])
    }
  }, [users])

  return (
    <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottom: '1px solid black',
    }}>
        <h3>xPoll</h3>
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            alightContent: 'center',
        }}>
            <button onClick={() => setActivePage('addpoll')}>Add New Poll</button>
            <input type='text' value={newUsername} onChange={handleNewUsername}/>
            <button onClick={handleAddUser}>Add New User</button>
            {newUsernameError && <p style={{color: 'red'}}>{newUsernameError}</p>}

            <select selected={activeUser} onChange={handleSetActiveUser}>
              {users.map(u => <option key={`active_user_${u}`}>{u}</option>)}
            </select>
        </div>
    </div>
  )
}

export default TopBar
