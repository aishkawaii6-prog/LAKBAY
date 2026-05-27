import database from "../configs/database.js";

const validators = {
    usernameExist: async (username) => {
        const query = "SELECT * FROM users WHERE username = ?";
        const [rows] = await database.execute(query, [username]);
        return rows;
    }
};

export default validators;