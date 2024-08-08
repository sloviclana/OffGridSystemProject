export default class UserModel {
    constructor(data) {
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.email = data.email;
        this.password = data.password;
        this.userType = data.userType;
        this.isBlocked = data.isBlocked;
    }
}