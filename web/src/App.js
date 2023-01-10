import {useState, useEffect} from 'react'
import {TopBar, Feed, AddPoll} from './components'
import {BrowserRouter, Routes, Route, Link} from 'react-router-dom'

const App = () => {

  const [activePage, setActivePage] = useState('feed')
  const [username, setUsername] = useState(null)
  const [theme, setTheme] = useState({
    accent: 'FF5C46', // Red
    chartBase: '9FD6FB', // Light blue
    chartColors: [
      'EBC58D', // Brown
      'FAFA66', // Yellow
      '9BEBB4', // Green
      '9FD6FB', // Light blue
      'E6A8D7', // Pink
      '00B8D4', // Turquoise
      'F7B733', // Orange
    ]
  })

  return (
    <BrowserRouter>
      <TopBar
        username={username}
        theme={theme}
        setActivePage={setActivePage}
        setActiveUser={setUsername}
      />
      <div style={{height: '64px'}} />
      <Routes>
        <Route
          path='/add'
          element={<AddPoll
            username={username}
            theme={theme}
            setActivePage={setActivePage}
          />}
        />
        <Route
          path='/'
          element={
            <Feed
              username={username}
              theme={theme}
            />}
          />
      </Routes>
    </BrowserRouter>
  )
}

export default App
