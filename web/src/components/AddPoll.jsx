import {useState, useEffect} from 'react'
import axios from 'axios'

const AddPoll = ({username, setActivePage}) => {

  // ADD POLL
  const [error, setError] = useState('')
  const [question, setQuestion] = useState('')
  const [answer1, setAnswer1] = useState('')
  const [answer2, setAnswer2] = useState('')
  const [answer3, setAnswer3] = useState('')
  const [answer4, setAnswer4] = useState('')
  const [activeQuestion, setActiveQuestion] = useState({})
  useEffect(() => {
    setActiveQuestion({
      username: username,
      question: '',
      answers: ['', '', '', ''],
    })
  }, [])
  const handleFieldChange = (event) => {
    const newQuestion = JSON.parse(JSON.stringify(activeQuestion))
    const field = event.target.id
    const value = event.target.value
    if (field === 'question') {
      newQuestion[field] = value
    } else if (field.startsWith('answer')) {
      const i_answer = field.slice(6)
      newQuestion.answers[i_answer] = value
    }
    setActiveQuestion(newQuestion)
  }

  const handleAddPoll = () => {
    axios.post('/add_poll', activeQuestion)
      .then((res) => {
        if (res.data.successful) {
          setActivePage('feed')
        } else {
          setError(res.data.error)
        }
      })
  }

  return (
    <div>
      <h3>Add Poll</h3>
      <table><tbody>
        <tr><td>Question <input type='text' value={activeQuestion.question} onChange={handleFieldChange} id='question' /></td></tr>
        {activeQuestion.answers && activeQuestion.answers.map((a, i) => {
          return <tr><td>Answer 1 <input type='text' value={a} onChange={handleFieldChange} id={`answer${i}`} /></td></tr>
        })}
      </tbody></table>
      <button onClick={handleAddPoll}>Add</button>
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  )
}

export default AddPoll
