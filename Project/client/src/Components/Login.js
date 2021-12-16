//Structure for login page

const Login = () => {
    const onSubmit = (e) => {
        e.preventDefault()
        let username = document.getElementById("username").value;
        let password = document.getElementById("password").value;
        fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: '{"username": "'+username+'", "password": "'+password+'"}'
        }).then((response) => response.json())
        .then((data) => {
            if(data.token) {
                localStorage.setItem("auth_token", data.token);
                window.location.href = "http://localhost:3000";
            } else if(data.message) {
                document.getElementById("message").innerHTML = data.message;
            }
        })
    }

    return (
        <div className="row">
            <h1>Login</h1>
            <form onSubmit={onSubmit}>
                <input id="username" type="string" placeholder="username" className="col s8 l4 offset-l4 offset-s2"></input>
                <input id="password" type="password" placeholder="password" className="col s8 l4 offset-l4 offset-s2"></input>
                <input id="submit" type="submit" value="Login" className="waves-effect waves-light btn col s2 l2 offset-l5 offset-s5"></input>
                <h5 id="message" className="col s8 l6 offset-s2 offset-l3"></h5>
            </form>
        </div>
    )
}

export default Login