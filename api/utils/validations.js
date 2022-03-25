const Validator = require('validatorjs');

const setCustomValidationMessages = () => {
    let errorMessages = Validator.getMessages('en');

    errorMessages.required = 'Il campo :attribute è obbligatorio';
    errorMessages.min = 'Il campo :attribute deve contenere almeno :min caratteri';
    errorMessages.email = 'Il campo :attribute deve contenere una email valida';

    Validator.setMessages('en', errorMessages);
}

module.exports = { setCustomValidationMessages };


