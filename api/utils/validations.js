const Validator = require('validatorjs');
const User = require('../models/User');

const setCustomValidationMessages = () => {
    let errorMessages = Validator.getMessages('en');

    errorMessages.required = 'Il campo :attribute è obbligatorio';
    errorMessages.min = 'Il campo :attribute deve contenere almeno :min caratteri';
    errorMessages.email = 'Il campo :attribute deve contenere una email valida';

    Validator.setMessages('en', errorMessages);
}

const checkIfUserAlreadyExists = async (email) => {
    try {
        const user = await User.findAll({
            where: {
                email
            }
        });
    
        if (user.length > 0) {
            return true;
        }
    
        return false;

    } catch(err) {
        console.log(err);
    }

}

module.exports = { setCustomValidationMessages, checkIfUserAlreadyExists };


