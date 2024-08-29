import React, { useState } from 'react';
import { Button, Container, Grid, Paper, Typography, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';
import { backend } from 'declarations/backend';

const CalculatorContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(4),
  maxWidth: '300px',
  width: '100%',
}))

const Display = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  textAlign: 'right',
  fontSize: '1.5rem',
  minHeight: '50px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
}))

const CalcButton = styled(Button)(({ theme }) => ({
  fontSize: '1.25rem',
  padding: theme.spacing(2),
}))

const App: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay('0.');
      setWaitingForSecondOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  const performOperation = async (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      setLoading(true);
      const result = await calculateResult(firstOperand, inputValue, operator);
      setLoading(false);
      setDisplay(String(result));
      setFirstOperand(result);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };

  const calculateResult = async (firstOperand: number, secondOperand: number, operator: string): Promise<number> => {
    switch (operator) {
      case '+':
        return await backend.add(firstOperand, secondOperand);
      case '-':
        return await backend.subtract(firstOperand, secondOperand);
      case '*':
        return await backend.multiply(firstOperand, secondOperand);
      case '/':
        const result = await backend.divide(firstOperand, secondOperand);
        return result ? result : NaN;
      default:
        return secondOperand;
    }
  };

  return (
    <Container>
      <CalculatorContainer elevation={3}>
        <Display>
          {loading ? <CircularProgress size={24} /> : display}
        </Display>
        <Grid container spacing={1}>
          {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'].map((btn) => (
            <Grid item xs={3} key={btn}>
              <CalcButton
                fullWidth
                variant="contained"
                color={['/', '*', '-', '+', '='].includes(btn) ? 'secondary' : 'primary'}
                onClick={() => {
                  if (btn === '=') {
                    performOperation('=');
                  } else if (['+', '-', '*', '/'].includes(btn)) {
                    performOperation(btn);
                  } else if (btn === '.') {
                    inputDecimal();
                  } else {
                    inputDigit(btn);
                  }
                }}
              >
                {btn}
              </CalcButton>
            </Grid>
          ))}
          <Grid item xs={12}>
            <CalcButton fullWidth variant="outlined" onClick={clear}>
              Clear
            </CalcButton>
          </Grid>
        </Grid>
      </CalculatorContainer>
    </Container>
  );
};

export default App;