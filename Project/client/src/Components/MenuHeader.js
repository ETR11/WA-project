//Structure of menu header

import { Link } from "react-router-dom"

const MenuHeader = () => {
    const logout = (e) => {
        e.preventDefault();
        localStorage.removeItem("auth_token")
        if(!localStorage.getItem("auth_token")) {
            window.location.reload(false);
        }
    }

    return (
        <form>
            <Link to="/">Home  </Link>
            <Link to="/register">  Register  </Link>
            {!localStorage.getItem("auth_token") &&
                <Link to="/login">  Login</Link>
            }
            {localStorage.getItem("auth_token") &&
                <button onClick={logout}>Logout</button>
            }
            <h3 id="logout"></h3>
        </form>
    )
}

export default MenuHeader