import {useState, useEffect} from 'react'
import axios from 'axios'
import { Typography, Box, Collapse, CircularProgress } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { ExpandLess, ExpandMore } from '@mui/icons-material'
import CancelIcon from '@mui/icons-material/Cancel';

import AnswerButton from './lib/AnswerButton';
import AnswerBar from './lib/AnswerBar';

const Filter = ({username, source_id, cross_id, filterIndex, filterData, activeFilters, setFilterData, handleVote}) => {

  const theme = useTheme()

  const [open, setOpen] = useState(true)
  const [crossedData, setCrossedData] = useState(false)
  const refreshCrossedData = () => {
    const filters = filterIndex === 0 ? null : filterData
      .filter((f, i) => i < filterIndex)
      .reduce((a, b) => ({...a, [b.poll_id]: b.selected}), {})
    try {
      axios.post('/api/get_crossed_poll', {source_id, cross_id, username, filters})
        .then((res) => {
          setCrossedData(res.data.data)
          setFilterPercentages([])
          setCrossedPercentages(null)
        })
    } catch (e) {
      console.log(e)
    }
  }
  const [localActiveFilters, setLocalActiveFilters] = useState(null)
  useEffect(() => {
    if (JSON.stringify(activeFilters) !== JSON.stringify(localActiveFilters)) {
      refreshCrossedData()
      setLocalActiveFilters(activeFilters)
    }
  }, [activeFilters])

  const localHandleVote = async (answer_id) => {
    const response = await handleVote(cross_id, answer_id)
    if (response) {
      refreshCrossedData()
    }
  }

  const [filterPercentages, setFilterPercentages] = useState([])
  const [crossedPercentages, setCrossedPercentages] = useState(null)
  const [crossedHeight, setCrossedHeight] = useState(null)
  useEffect(() => {
    if (!crossedData) {
      return
    } else if ('results' in crossedData) {
      const filterAnswers = crossedData.results.map(r => r.reduce((a, b) => a + b))
      const filterSum = filterAnswers.reduce((a, b) => a + b)
      setFilterPercentages(filterAnswers.map(a => a/filterSum))
      setCrossedPercentages(crossedData.results.map(ans => {
        const answerSum = ans.reduce((a, b) => a + b)
        return ans.map(a => a / answerSum)
      }))
      setCrossedHeight(2.2 / crossedData.results[0].length)
    }
  }, [crossedData])
  const handleRemoveFilter = () => {
    setFilterData(fd => fd.filter((f, i) => i !== filterIndex))
  }

  const [selected, setSelected] = useState(null)
  const handleSelect = (i) => {
    const newFilterData = JSON.parse(JSON.stringify(filterData))
    newFilterData[filterIndex].selected = i
    setFilterData(newFilterData)
    if (selected === null) {
      setOpen(false)
    }
    setSelected(i)
  }

  if (!crossedData) {
    return <CircularProgress />
  }

  return (
    <Box sx={{marginTop: '1em'}}>
      {/* Header Bar */}
      <Box
        sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', minHeight: '2em'}}
        onClick={() => setOpen(!open)}
      >
        {open ? <ExpandLess /> : <ExpandMore />}
        <div style={{margin: '0 0.5em'}}>
          <Typography fontWeight='bold'>{crossedData.question}</Typography>
          <Typography>{crossedData.answers[selected]}</Typography>
        </div>
        <div style={{flexGrow: 1}} />
        <CancelIcon onClick={() => handleRemoveFilter(filterIndex)} />
      </Box>
      {/* Body (Collapsible) */}
      <Collapse in={open} sx={{marginTop: '0.5em'}}>
        {crossedData.answers.map((a, i) => {
          return <Box key={`poll-${source_id}-filter-${filterIndex}-answer-${i}`}>
            {('user_answer' in crossedData)
              // Results
              ? <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'row',
                  marginBottom: '0.5em',
                  cursor: 'pointer',
                  backgroundColor: selected == i ? 'whiteSmoke' : null
                }}
                onClick={() => handleSelect(i)}
              >
                {/* Filter Answer (selected question) */}
                <Box style={{height: 'auto', width: '60%'}}>
                  <AnswerBar
                    answer={a}
                    isUserAnswer={filterData.user_answer === i}
                    percentage={filterPercentages[i]}
                    color={'lightgray'}
                    hidePercentage={true}
                  />
                </Box>
                {/* Crossed Answer (base question) */}
                <Box style={{width: '40%', height: 'auto'}}>
                  {crossedPercentages && crossedPercentages[i].map((c, j) => {
                    return <Box
                      sx={{height: `${Math.max(crossedHeight, 0.4)}em`}}
                      key={`poll-${source_id}-filter-${filterIndex}-crossed-answer-${j}`}
                    ><AnswerBar
                        percentage={c}
                        color={theme.chartColors[j]}
                        hidePercentage={true}
                        hideAnswer={true}
                    /></Box>
                  })}
                </Box>
              </Box>
              // Vote Button
              : <Box
                sx={{width: '100%', height: '1.8em', p: '0.2em'}}
                key={`poll-${source_id}-filter-${filterIndex}-answer-${i}`}
              >
                <AnswerButton onClick={() => localHandleVote(i)}>{a}</AnswerButton>
              </Box>
            }
            </Box>
        })}
      </Collapse>
    </Box>
  )
}

export default Filter
