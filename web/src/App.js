import {useState, useEffect} from 'react'
import {TopBar, Feed, AddPoll} from './components'

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
    <div className="App">
      <TopBar
        username={username}
        theme={theme}
        setActivePage={setActivePage}
        setActiveUser={setUsername}
      />
      {activePage === 'feed' &&
        <Feed
          username={username}
          theme={theme}
        />
      }
      {activePage === 'addpoll' &&
        <AddPoll
          username={username}
          theme={theme}
          setActivePage={setActivePage}
        />
      }
    </div>
  )
}

export default App
