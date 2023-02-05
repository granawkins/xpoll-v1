import {Box, Typography, IconButton} from '@mui/material'
import {useTheme} from '@mui/material/styles'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom'


const PageHeader = ({pageName}) => {

  const theme = useTheme()
  const navigate = useNavigate()

  return (
    <Box display='flex' alignItems='center' marginBottom='2em'>
        <IconButton onClick={() => navigate('/')}>
            <ArrowBackIcon/>
        </IconButton>
        <Typography style={{fontWeight: 600, fontSize: '1.4em', color: theme.offset}}>
            {pageName}
        </Typography>
    </Box>
  )
}

export default PageHeader
