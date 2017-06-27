import * as hash from "../Hash";
import * as IUser from "./Model/IUser";
import * as User from "./Model/User";

export default class UserService
{
    private CreateUser = (username: string, passwdHash: string): IUser.IUserModel =>
    {
        return new User({
            username: username,
            password: passwdHash,
        });
    }

    /**
     * Save user to db
     * @param string username
     * @param string password
     * @param callback (err, true)
     */
    public AddUser = (username: string, password: string, callback: (err: Error, valid: boolean) => any) =>
    {
        let passwdHash = hash.HashSync(password);
        let user = this.CreateUser(username, passwdHash);

        user.save(function (err: Error) {
            if (typeof callback === "function") {
                callback(err, true);
            }
        });
    };

    /**
     * Get user from database
     * @param string username
     * @return User
     */
    public FindUser = async (username: string): Promise<IUser.IUser> =>
    {
        let result = await User.find({ 'username': username }, 'username password').exec();
        return result[0];
    }

    /**
     * Remove user from database
     * @param string username
     * @param function callback
     */
    public RemoveUser = (username: string, callback: (err: Error, valid: boolean) => any) =>
    {
        User.remove({ username: username }, function (err) {
            if (typeof callback === "function") {
                callback(err, true);
            }
        });
    }

    /**
     * Validates is login information correct
     * @param string username
     * @param string password
     * @return boolean
     */
    public ValidateLogin = async (username: string, password: string): Promise<boolean> =>
    {
        if (!username || !password) {
            return false;
        }

        var user = await this.FindUser(username);

        if (user.username === username && hash.CompareSync(password, user.password)) {
            return true;
        }

        return false;
    }
}

