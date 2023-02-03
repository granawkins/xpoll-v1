import {useState, useEffect} from 'react'
import axios from 'axios'
import { Paper, Typography, Box, Link } from '@mui/material'

import Filter from './Filter'
import BaseChart from './BaseChart'
import AddFilter from './AddFilter'

const FeedCard = ({poll, username, theme}) => {

  const [error, setError] = useState(null)
  const [pollData, setPollData] = useState(null)
  useEffect(() => {
    if (poll !== null) {
      setPollData(poll)
    }
  }, [poll])

  const handleVote = async (poll_id, answer_id) => {
    try {
      const res = await axios.post('/api/vote', {username, poll_id, answer_id})
      if (res.data.successful) {
        const resData = res.data.data
        if (resData.poll_id == pollData.poll_id) {
          setPollData(resData)  // If vote is for base poll
        } else {
          return true // Filter votes handled by Filter component
        }
      } else {
        return false
      }
    } catch (e) {
      setError(e)
      return false
    }
  }

  const [filterData, setFilterData] = useState([])
  const handleAddFilter = (poll_id) => {
    try {
      axios.post('/api/get_poll', {username, poll_id, filters: activeFilters})
        .then((res) => {
          if (res.data.successful) {
            setFilterData(fd => [...fd, {...res.data.data, selected: null}])
          }
        })
    } catch (e) {
      console.log(e)
    }
  }

  const [colored, setColored] = useState(false)
  const [showAddFilter, setShowAddFilter] = useState(false)
  const [activeFilters, setActiveFilters] = useState({})
  useEffect(() => {
    // Show/hide the 'Add Filter' button
    if (!pollData ||  // still loading
        !('results' in pollData) ||  // not voted in base poll
        (filterData.length > 0 && filterData[filterData.length-1].selected === null)) {  // not voted in last filter
      setShowAddFilter(false)
    } else {
      setShowAddFilter(true)
    }
    // Toggle colors
    setColored(filterData.length > 0)
    // Update base data
    const filters = filterData
      .filter(f => f.selected !== null)
      .reduce((a, b) => ({...a, [b.poll_id]: b.selected}), {})
    if (JSON.stringify(filters) !== JSON.stringify(activeFilters)) {
      try {
        // Fetch with axios; need to update PG func
        axios.post('/api/get_poll', {username, poll_id: pollData.poll_id, filters})
          .then((res) => {
            setPollData(res.data.data)
            setActiveFilters(filters)
          })
      } catch (e) {
        console.log(e)
      }
    }
  }, [pollData, filterData])

  if (!pollData) {
    return null
  } else {
    return (
      <Paper elevation={2} sx={{m: 2, p: 2}}>
        {/* Question */}
        <Typography fontWeight='bold'>{pollData.question}</Typography>
        <Typography sx={{marginBottom: '1em'}}>
          by <Link>{pollData.author}</Link>
        </Typography>
        {/* Answers: buttons or bars */}
        {error && <Typography color='red'>Error: {error}</Typography>}
        <BaseChart
          pollData={pollData}
          handleVote={handleVote}
          colored={colored}
        />
        {/* Filters */}
        {filterData && filterData.map((f, i) => <Filter
          username={username}
          source_id={pollData.poll_id}
          cross_id={f.poll_id}
          filterIndex={i}
          filterData={filterData}
          activeFilters={activeFilters}
          setFilterData={setFilterData}
          handleVote={handleVote}
          key={`poll-${pollData.poll_id}-filter-${i}`}
        />)}
        {/* Add Filter */}
        {showAddFilter && <AddFilter
          pollData={pollData}
          filterData={filterData}
          activeFilters={activeFilters}
          handleAddFilter={handleAddFilter}
        />}
        {/* (Footer: votes & filter button) OR (Search bar) */}
        <Box sx={{marginTop: 1, height: '1.5em', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center'}}>
          <Typography sx={{color: 'lightgray'}}>
            {pollData.votes} Votes
          </Typography>
        </Box>
      </Paper>
    )
  }
}

export default FeedCard
