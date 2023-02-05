import {useState, useEffect} from 'react'
import {TopBar, Feed, AddPoll, Account} from './components'
import {BrowserRouter, Routes, Route, Link} from 'react-router-dom'
import axios from 'axios'
import { ThemeProvider } from '@mui/material/styles'
import { Auth0Provider } from '@auth0/auth0-react'
import theme from './theme'

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
      <Auth0Provider
        domain={'dev-w5pbuiws.us.auth0.com'}
        clientId={'i5n0cyEIV86slJEAv47xfmIb4nlA6E9Y'}
      >
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
      </Auth0Provider>
    </ThemeProvider>
  )
}

export default App
