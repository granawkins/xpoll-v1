import {useState, useEffect} from 'react'
import {TopBar, Feed, AddPoll, Account} from './components'
import {BrowserRouter, Routes, Route, Link} from 'react-router-dom'
import axios from 'axios'
import { createTheme, ThemeProvider } from '@mui/material/styles'

const theme = createTheme({
  accent: '#FF5C46', // Red
  offset: '#626262', // Dark Gray
  chartBase: '#9FD6FB', // Light blue
  chartColors: [
    '#EBC58D', // Brown
    '#FAFA66', // Yellow
    '#9BEBB4', // Green
    '#9FD6FB', // Light blue
    '#E6A8D7', // Pink
    '#00B8D4', // Turquoise
    '#F7B733', // Orange
  ]
})

const App = () => {

  const [username, setUsername] = useState(null)
  useEffect(() => {
    if (!username) {
      try {
        axios.get('/api/get_users')
          .then((res) => {
            if (res.data.successful) {
              setUsername(res.data.data[0])
            } else {
              console.log('Error', res)
            }
          })
      } catch (e) {
        console.log('Error', e)
      }
    }
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <TopBar />
        <div style={{height: '64px'}} />
        {username
          ? <Routes>
            <Route
              path='/new'
              element={<AddPoll
                username={username}
              />}
            />
            <Route
              path='/account'
              element={
                <Account
                username={username}
                setUsername={setUsername}
                />}
              />
            <Route
              path='/'
              element={
                <Feed
                  username={username}
                />}
              />
          </Routes>
          : <p>Loading</p>
        }
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
