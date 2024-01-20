const reset_password = (name, email, token) => {
    return `<div>
                <main>
                    <div>
                        <p>Hello,${name}, your e-mail id ${email}</p>
                        <h3>follow this link to reset your password</h3>
                        <p>
                            <strong>
                                <a class="btn" target="_blank" href="http://localhost:3000/password/reset?id=${token}">
                                Reset Password
                                </a>
                            <strong>
                        </p>
                        <p>If you didn't ask to reset your password, ignore this link</p>

                        <p>Thanks and Regards</p>
                        <h3>Team API</h3>
                    </div>
                </main>
            </div>`

}

module.exports = reset_password