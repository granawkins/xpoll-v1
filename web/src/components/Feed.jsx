import {useState, useEffect} from 'react'
import axios from 'axios'
import FeedCard from './FeedCard'
import { Container, Box, Typography, Button } from '@mui/material'

const Feed = ({username, theme}) => {

  // GET Feed
  const [feed, setFeed] = useState(null)
  const [sortBy, setSortBy] = useState('top')
  const refreshFeed = () => {
    axios.post('/feed', {username: username, sort_by: sortBy})
    .then((res) => {
      setFeed(res.data.data)
    })
  }
  useEffect(() => {
    if (username !== null) {
      refreshFeed()
    }
  }, [username, sortBy])

  return (
    <Container maxWidth='xs'>
      <Box alignItems='center' display='flex' justifyContent='center' fullWidth>
        <Button onClick={() => setSortBy('top')} >Top</Button>
        <Button onClick={() => setSortBy('new')}>New</Button>
      </Box>
      {feed && feed.map(p => <FeedCard
        poll={p}
        username={username}
        theme={theme}
        key={`feed-card-${p.poll_id}`}
      />)}
    </Container>
  )
}

export default Feed
