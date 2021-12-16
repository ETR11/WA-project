//Structure for displaying a posted comment

import React, { useState } from 'react';
import moment from 'moment'

const Comment = (props) => {
    const [votes, setVotes] = useState(props.comment.votes);

    const authToken = localStorage.getItem("auth_token")

    //JWT is decoded to get username and admin status from it
    const jwt = require("jsonwebtoken");
    let decoded;
    if(authToken) {
        decoded = jwt.verify(authToken, 'SDFW¤"#342sDFs#¤"#sf2"');
    }

    /*
        If user wants to edit comment then textarea and submit button are created
        and current comment is inserted to the textarea
    */
    const editComment = () => {
        //Since one page can have multiple comments div housing editSection
        //has id of comment (created bt mongo) attached to its own id 
        //to seperate it from the rest edit sections
        let editSection = document.getElementById("edit"+props.comment._id);
        let newComment = document.createElement("textarea");
        newComment.id = "editComment";
        newComment.className = "col s6 l4 offset-s3 offset-l4"
        newComment.value = unescape(props.comment.comment);
        let button = document.createElement("button");
        button.className = "waves-effect waves-light btn col s2 l1 offset-s5"
        button.innerHTML = "Submit changes";
        button.onclick = submitChanges;
        editSection.appendChild(newComment);
        editSection.appendChild(button);
    }

    const submitChanges = () => {
        let commentId = props.comment._id;
        let newComment = document.getElementById("editComment").value;
        fetch("/api/updateComment", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: '{"id": "'+commentId+'", "comment": "'+escape(newComment)+'"}'
        }).then((response) => response.json())
        .then((data) => {
            if(data.message == "Comment updated") {
                window.location.reload(false);
            }
        })
    }

    const deleteComment = () => {
        fetch("/api/removeComment", {
            method: "DELETE",
            headers: {
                "Content-type": "application/json"
            },
            body: '{"id": "'+props.comment._id+'"}'
        }).then((response) => response.json())
        .then((data) => {
            if(data.message == "Post removed") {
                window.location.reload(false);
            }
        })
    }

    /*
        Vote parameter can be either 1 or -1
    */
    const voteComment = (vote) => {
        fetch("/api/voteComment", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: '{"id": "'+props.comment._id+'", "username": "'+decoded.username+'", "votes": "'+(votes + vote)+'"}'
        }).then((response) => response.json())
        .then((data) => {
            if(data.message == "Voted") {
                setVotes(votes + vote)
            }
        })
    }

    /*
        Some objects only appear if user is logged in or if user posted the comment
        or if user is an admin
    */

    return (
        <div>
            <div className='row'>
                <div className='col s3 l2 offset-s1 offset-l2'>
                    {authToken && 
                        <button onClick={() => voteComment(1)}>Vote up</button>
                    }
                    <p>Votes: {votes}. {props.comment.voters.length} votes in total.</p>
                    {authToken && 
                        <button onClick={() => voteComment(-1)}>Vote down</button>
                    }
                </div>
                <div className='col s5 l4'>
                    <p>
                        {unescape(props.comment.comment)}
                    </p>
                </div>
                <div className='col s12 l2'>
                    {authToken && (decoded.username == props.comment.username || decoded.admin) && 
                        <button onClick={editComment}>Edit comment</button>
                    }
                    {authToken && decoded.admin &&
                        <button onClick={deleteComment}>Delete</button>
                    }

                </div>
                <p className='col s4 l6 offset-s4 offset-l3 red-text'>
                    (Last edited: {moment(props.comment.date).format("HH:mm DD.MM.YYYY")})
                </p>
            </div>
            <div id={"edit"+props.comment._id} className='row'></div>
        </div>
    )
}

export default Comment