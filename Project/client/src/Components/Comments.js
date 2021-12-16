//Structure for listing all comments on snippet page

import { useState, useEffect } from 'react';
import Comment from './Comment';

const Comments = (props) => {
    const [comments, setComments] = useState([])

    const authToken = localStorage.getItem("auth_token")

    useEffect(() => {
        fetch("/api/getComments/"+props.id)
        .then((response) => response.json())
        .then((data) => {
            data.forEach(element => {
                setComments(prevState => [...prevState, element]);
            })
        })
    }, [])

    //Lists all comments found from database related to the snippet
    const commentList = comments.map((item) =>
        <li key={item._id}><Comment comment={item}/></li>
    )

    /*
        Submits a new comment
    */
    const submit = () => {
        let comment = document.getElementById("comment").value;
        fetch("/api/createComment", {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                "authorization": "Bearer " + authToken
            },
            body: '{"comment": "'+escape(comment)+'", "snippetId": "'+props.id+'"}'
        }).then((response) => response.json())
        .then((data) => {
            if(data.message == "ok") {
                window.location.reload(false);
            }
        })
    }

    /*
        If user is logged in section for posting comment is also rendered
    */

    if(authToken) {
        return (
            <div className='row'>
                <h4>Comments</h4>
                <ul>{commentList}</ul>
                <h4>Comment the post</h4>
                <textarea id="comment" className='col s8 l6 offset-s2 offset-l3'/>
                <button onClick={submit} className='waves-effect waves-light btn col s2 l1 offset-s5'>Submit</button>
            </div>
        )
    } else {
        return (
            <div>
                <h5>Comments</h5>
                <ul>{commentList}</ul>
            </div>
        )
    }
}

export default Comments