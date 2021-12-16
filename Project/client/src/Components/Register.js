//Structure for register page

const Register = () => {
    const onSubmit = (e) => {
        e.preventDefault()
        let username = document.getElementById("username").value;
        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;
        fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: '{"username": "'+username+'", "email": "'+email+'", "password": "'+password+'"}'
        }).then((response) => response.json())
        .then((data) => {
            if(data.message) {
                document.getElementById("message").innerHTML = data.message;
            }
        })
    }
    
    return (
        <div className='row'>
            <h1>Register</h1>
            <form onSubmit={onSubmit}>
                <input id="username" type="string" placeholder="username" className="col s8 l4 offset-l4 offset-s2"></input>
                <input id="email" type="email" placeholder="email" className="col s8 l4 offset-l4 offset-s2"></input>
                <input id="password" type="password" placeholder="password" className="col s8 l4 offset-l4 offset-s2"></input>
                <input id="submit" type="submit" value="Register" className="waves-effect waves-light btn col s2 l2 offset-l5 offset-s5"></input>
                <h5 id="message" className="col s8 l6 offset-s2 offset-l3"></h5>
            </form>
        </div>
    )
}

export default Register