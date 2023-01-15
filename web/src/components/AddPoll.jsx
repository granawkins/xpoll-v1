import {useState, useEffect} from 'react'
import {Container, Box, Typography, TextField, Button, IconButton} from '@mui/material'
import {useTheme} from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom'
import axios from 'axios'


const AddPoll = ({username}) => {

  const theme = useTheme()
  const navigate = useNavigate()

  const [question, setQuestion] = useState('')
  const handleSetQuestion = (q) => {
    if (error) {
      setError(false)
    }
    setQuestion(q.target.value)
  }
  const [answers, setAnswers] = useState(['', ''])
  const handleSetAnswer = (i, event) => {
    if (error) {setError(false)}
    const newAnswers = answers.map((ans, j) => j === i ? event.target.value : ans)
    if (newAnswers[newAnswers.length-1] !== '' && newAnswers.length < 7) {
      newAnswers.push('')
    }
    setAnswers(newAnswers)
  }
  const handleRemove = (i) => {
    const newAnswers = answers.filter((a, j) => j !== i)
    console.log("removing answer", i)
    console.log(newAnswers)

    setAnswers(newAnswers)
  }

  const [error, setError] = useState(false)
  const handleAddPoll = () => {
    if (question === '') {
      setError('Question must not be empty. ')
      return
    }
    const validAnswers = answers.filter(a => a !== '')
    if (validAnswers.length < 2) {
      setError('Must give at least 2 answers. ')
      return
    }
    const newPoll = {username, question, answers: validAnswers}
    try {
      axios.post('/add_poll', newPoll)
        .then((res) => {
          if (res.data.successful) {
            navigate('/')
          } else {
            setError(res.data.error)
          }
        })
    } catch(e) {
      setError(e)
    }
  }

  return (
    <Container sx={{padding: '2em', maxWidth: '450px'}}>
      <Box display='flex' alignItems='center' marginBottom='2em'>
        <IconButton onClick={() => navigate('/')}>
          <ArrowBackIcon/>
        </IconButton>
        <Typography style={{fontWeight: 600, fontSize: '1.4em', color: theme.offset}}>New Poll</Typography>
      </Box>
      <TextField
        size='small'
        placeholder='Question'
        sx={{width: '100%'}}
        onChange={handleSetQuestion}
        multiline
      />
      <hr style={{margin: '1em'}}/>
      {answers.map((a, i) => {
        return (
          <div key={`answer-${i}`} style={{marginBottom: '1em', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <TextField size='small'
              value={answers[i]}
              placeholder={`Answer ${i+1}`}
              sx={{width: '100%'}}
              onChange={e => handleSetAnswer(i, e)}
              multiline
            />
            {answers.length > 2 &&
              <IconButton onClick={() => handleRemove(i)}>
                <CloseIcon/>
              </IconButton>
            }
          </div>
        )
      })}
      <Button
        onClick={handleAddPoll}
        sx={{backgroundColor: theme.accent, width: '100%'}}
        variant='contained'
      >Publish</Button>
      {error &&
        <p style={{color: 'red'}}>{error}</p>
      }
    </Container>
  )
}

export default AddPoll
