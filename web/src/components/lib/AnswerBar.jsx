import { Box, Typography } from "@mui/material"
import PersonIcon from "@mui/icons-material/Person"

const AnswerBar = ({answer, isUserAnswer, percentage, color, hideAnswer=false, hidePercentage=false}) => {
    return (
        <Box sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '100%',
            width: '100%',
        }}>
            <>
            <Typography sx={{m: 0.7, zIndex: 1}}>
                <>
                {hideAnswer || answer}
                {isUserAnswer && <PersonIcon sx={{fontSize: '1em', verticalAlign: 'middle'}} />}
                </>
            </Typography>
            {hidePercentage || <Typography sx={{m: 0.7, zIndex: 1}}>
                {Math.round(percentage*100)}%
            </Typography>}
            <Box sx={{
                width: Math.max(percentage, 0.02),
                height: '100%',
                position: 'absolute',
                left: 0,
                top: 0,
                backgroundColor: color,
                zIndex: 0,
            }}/>
            </>
        </Box>
    )
}

export default AnswerBar
