/**
 * Basic UI Calculator
 * A soft-design calculator with standard layout - operations on right column.
 */

// Calculator State Object
const calculator = {
    displayValue: '0',
    firstOperand: null,
    operator: null,
    waitingForSecondOperand: false,
    hasError: false
};

// DOM Elements
let displayElement;

/**
 * Update the calculator display with current value
 */
function updateDisplay() {
    displayElement.textContent = calculator.displayValue;
}

/**
 * Reset calculator to initial state
 */
function resetCalculator() {
    calculator.displayValue = '0';
    calculator.firstOperand = null;
    calculator.operator = null;
    calculator.waitingForSecondOperand = false;
    calculator.hasError = false;
    clearActiveOperator();
    updateDisplay();
}

/**
 * Input a digit (0-9)
 * @param {string} digit - The digit to input
 */
function inputDigit(digit) {
    if (calculator.hasError) {
        resetCalculator();
    }

    if (!/^[0-9]$/.test(digit)) {
        return;
    }

    if (calculator.displayValue.replace(/[^0-9]/g, '').length >= 12 &&
        !calculator.waitingForSecondOperand) {
        return;
    }

    if (calculator.waitingForSecondOperand) {
        calculator.displayValue = digit;
        calculator.waitingForSecondOperand = false;
        clearActiveOperator();
    } else {
        calculator.displayValue = calculator.displayValue === '0'
            ? digit
            : calculator.displayValue + digit;
    }

    updateDisplay();
}

/**
 * Input decimal point
 */
function inputDecimal() {
    if (calculator.hasError) {
        resetCalculator();
    }

    if (calculator.waitingForSecondOperand) {
        calculator.displayValue = '0.';
        calculator.waitingForSecondOperand = false;
        clearActiveOperator();
        updateDisplay();
        return;
    }

    if (!calculator.displayValue.includes('.')) {
        calculator.displayValue += '.';
        updateDisplay();
    }
}

/**
 * Toggle sign of current number (±)
 */
function toggleSign() {
    if (calculator.hasError) {
        return;
    }

    if (calculator.displayValue === '0') {
        return;
    }

    if (calculator.displayValue.startsWith('-')) {
        calculator.displayValue = calculator.displayValue.substring(1);
    } else {
        calculator.displayValue = '-' + calculator.displayValue;
    }

    updateDisplay();
}

/**
 * Calculate percentage of current number
 */
function handlePercent() {
    if (calculator.hasError) {
        return;
    }

    const currentValue = parseFloat(calculator.displayValue);
    const result = currentValue / 100;

    calculator.displayValue = formatResult(result);
    updateDisplay();
}

/**
 * Clear active state from all operator buttons
 */
function clearActiveOperator() {
    const operators = document.querySelectorAll('.btn-operator');
    operators.forEach(op => op.classList.remove('active'));
}

/**
 * Set active state on operator button
 * @param {string} operator - The operator value
 */
function setActiveOperator(operator) {
    clearActiveOperator();
    const operatorBtn = document.querySelector(`.btn-operator[data-value="${operator}"]`);
    if (operatorBtn) {
        operatorBtn.classList.add('active');
    }
}

/**
 * Handle operator button press
 * @param {string} nextOperator - The operator (+, -, *, /)
 */
function handleOperator(nextOperator) {
    if (calculator.hasError) {
        resetCalculator();
        return;
    }

    const inputValue = parseFloat(calculator.displayValue);

    if (calculator.operator && !calculator.waitingForSecondOperand) {
        const result = calculate(calculator.firstOperand, inputValue, calculator.operator);

        if (typeof result === 'string') {
            calculator.displayValue = result;
            calculator.hasError = true;
            calculator.firstOperand = null;
            calculator.operator = null;
            calculator.waitingForSecondOperand = false;
            clearActiveOperator();
            updateDisplay();
            return;
        }

        calculator.displayValue = formatResult(result);
        calculator.firstOperand = result;
    } else {
        calculator.firstOperand = inputValue;
    }

    calculator.operator = nextOperator;
    calculator.waitingForSecondOperand = true;
    setActiveOperator(nextOperator);
    updateDisplay();
}

/**
 * Perform calculation
 * @param {number} first - First operand
 * @param {number} second - Second operand
 * @param {string} operator - The operator
 * @returns {number|string} - Result or error message
 */
function calculate(first, second, operator) {
    switch (operator) {
        case '+':
            return first + second;
        case '-':
            return first - second;
        case '*':
            return first * second;
        case '/':
            if (second === 0) {
                return 'Error';
            }
            return first / second;
        default:
            return second;
    }
}

/**
 * Format result for display
 * @param {number} result - The calculation result
 * @returns {string} - Formatted result string
 */
function formatResult(result) {
    if (!isFinite(result)) {
        return 'Error';
    }

    let resultString = String(result);

    if (resultString.length > 12) {
        if (Math.abs(result) >= 1e12 || (Math.abs(result) < 1e-6 && result !== 0)) {
            resultString = result.toExponential(6);
        } else {
            const decimalIndex = resultString.indexOf('.');
            if (decimalIndex !== -1) {
                const maxDecimals = 12 - decimalIndex - 1;
                resultString = result.toFixed(Math.max(0, maxDecimals));
                resultString = parseFloat(resultString).toString();
            }
        }
    }

    return resultString;
}

/**
 * Handle equals button - execute calculation
 */
function handleEquals() {
    if (calculator.hasError) {
        return;
    }

    if (calculator.operator === null) {
        return;
    }

    const inputValue = parseFloat(calculator.displayValue);
    const result = calculate(calculator.firstOperand, inputValue, calculator.operator);

    if (typeof result === 'string') {
        calculator.displayValue = result;
        calculator.hasError = true;
        calculator.firstOperand = null;
        calculator.operator = null;
        calculator.waitingForSecondOperand = false;
        clearActiveOperator();
        updateDisplay();
        return;
    }

    calculator.displayValue = formatResult(result);
    calculator.firstOperand = result;
    calculator.operator = null;
    calculator.waitingForSecondOperand = false;
    clearActiveOperator();
    updateDisplay();
}

/**
 * Handle button click events
 * @param {Event} event - Click event
 */
function handleButtonClick(event) {
    const button = event.target;

    if (!button.matches('button')) {
        return;
    }

    const action = button.dataset.action;
    const value = button.dataset.value;

    switch (action) {
        case 'number':
            inputDigit(value);
            break;
        case 'decimal':
            inputDecimal();
            break;
        case 'operator':
            handleOperator(value);
            break;
        case 'equals':
            handleEquals();
            break;
        case 'clear':
            resetCalculator();
            break;
        case 'sign':
            toggleSign();
            break;
        case 'percent':
            handlePercent();
            break;
    }
}

/**
 * Handle keyboard input
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeyboard(event) {
    const key = event.key;

    if (/^[0-9]$/.test(key)) {
        inputDigit(key);
    } else if (key === '.') {
        inputDecimal();
    } else if (['+', '-', '*', '/'].includes(key)) {
        handleOperator(key);
    } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        handleEquals();
    } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        resetCalculator();
    } else if (key === '%') {
        handlePercent();
    }
}

/**
 * Initialize the calculator
 */
function init() {
    displayElement = document.getElementById('display');

    const buttonsContainer = document.querySelector('.buttons');
    buttonsContainer.addEventListener('click', handleButtonClick);

    document.addEventListener('keydown', handleKeyboard);

    updateDisplay();
}

// Get calculator state (for testing)
function getState() {
    return { ...calculator };
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
