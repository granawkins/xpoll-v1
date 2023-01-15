import {useState, useEffect} from 'react'
import {Box} from '@mui/material'
import {useTheme} from '@mui/material/styles'
import AnswerButton from './lib/AnswerButton'
import AnswerBar from './lib/AnswerBar'

const BaseChart = ({pollData, colored, handleVote}) => {

    const theme = useTheme()

    const [percentages, setPercentages] = useState(null)
    useEffect(() => {
      if ('results' in pollData) {
        const sum = pollData.results.reduce((a, b) => a + b)
        const perc = pollData.results.map(v => v === 0 ? 0 : v/sum)
        setPercentages(perc)
      }
    }, [pollData])

    return (
      pollData.answers.map((answer, i) => {
        // Answer Line
        return <Box
            sx={{width: '100%', height: '1.8em', p: '0.2em'}}
            key={`base-chart-${pollData.poll_id}-box-${i}`}
        >
          {('user_answer' in pollData && percentages)
            // Answer Bar (if voted)
            ? <AnswerBar
              answer={answer}
              isUserAnswer={pollData.user_answer === i}
              percentage={percentages[i]}
              color={colored ? theme.chartColors[i] : theme.chartBase}
            />
            // Vote Button (if not yet voted)
            : <AnswerButton onClick={() => handleVote(pollData.poll_id, i)}>{answer}</AnswerButton>
          }
        </Box>
      })
    )
}

export default BaseChart
