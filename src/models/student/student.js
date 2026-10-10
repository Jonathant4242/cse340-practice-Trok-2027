const student = {
        name: 'John Doe Smith JR',
        id: '123456789',
        email: 'John.Doe.Smith.JR@byui.edu',
        address: '123 College Way, Provo, UT 84604'
    };

export const getStudent = () => ({ ...student });
