import {useState, useEffect} from 'react'
import {Box, Button, FormControl, InputLabel, Select, MenuItem} from '@mui/material'
import {useTheme} from '@mui/material/styles'
import CancelIcon from '@mui/icons-material/Cancel'
import axios from 'axios'

const AddFilter = ({pollData, filterData, activeFilters, handleAddFilter}) => {

  const theme = useTheme()

  const [suggestedFilters, setSuggestedFilters] = useState(null)
  const getSuggestedFilters = () => {
    try {
      const postRequest = {
        poll_id: pollData.poll_id,
        ignore: filterData.map(f => f.poll_id),
        filters: activeFilters,
      }
      axios.post('/api/get_related_polls', postRequest)
        .then((res) => {
          setSuggestedFilters(res.data.data)
        })
    } catch (e) {
      console.log(e)
    }
  }

  const handleSelect = (e) => {
    handleAddFilter(e.target.value)
  }

  return (
    <Box sx={{marginTop: '1em'}}>
      {suggestedFilters
        ? <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <FormControl fullWidth size="small">
            <InputLabel>Select Filter</InputLabel>
            <Select
              label="Select Filter"
              value=''
              onChange={handleSelect}
            >
              {suggestedFilters.map((f, i) => {
                return <MenuItem
                  value={f.poll_id}
                  key={`add-filter-${pollData.poll_id}-option-${i}`}
                >{f.question} ({f.votes})</MenuItem>
              })}
            </Select>
          </FormControl>
          <CancelIcon onClick={() => setSuggestedFilters(null)} sx={{marginLeft: '0.5em', cursor: 'pointer'}} />
        </Box>
        : <Button onClick={getSuggestedFilters} variant='outlined' sx={{
          width: '100%',
          outline: '2px solid #FF5C46',
          textTransform: 'none',
          borderRadius: 15,
          variant: "outlined",
          color: theme.accent,
        }}
        >Filter results by another poll</Button>
      }
    </Box>
  )
}

export default AddFilter
