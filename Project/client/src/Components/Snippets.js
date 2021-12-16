//Structure for snippet's own page

import React, { useState, useEffect } from 'react';
import Comments from './Comments';
import Highlight from "react-highlight.js"
import moment from 'moment'

const Snippets = () => {
    const [snippets, setSnippets] = useState([])
    const [votes, setVotes] = useState(0);

    const authToken = localStorage.getItem("auth_token")

    //JWT is decoded to get username and admin status from it
    const jwt = require("jsonwebtoken");
    let decoded;
    if(authToken) {
        decoded = jwt.verify(authToken, 'SDFW¤"#342sDFs#¤"#sf2"');
    }

    /*
        Snippet's id is copied from page url to find correct snippet
        for page from database
    */
    const snippetId = window.location.pathname.split("/")[2];

    useEffect(() => {
        fetch("/api/getSnippets/"+snippetId)
        .then((response) => response.json())
        .then((data) => {
            setSnippets([...snippets, data]);
            setVotes(data.votes);
        })
    }, [])

    /*
        If user wants to edit snippet then textareas and submit button are created
        and current information of snippet is inserted to these textareas
    */
    const editSnippet = () => {
        let editSection = document.getElementById(snippets[0]._id);
        let header = document.createElement("h3");
        header.innerHTML = "Edit here";
        let title = document.createElement("textarea");
        title.className = "col s6 l4 offset-s3 offset-l4";
        title.id = "editTitle";
        title.value = unescape(snippets[0].title);
        let description = document.createElement("textarea");
        description.className = "col s8 l6 offset-s2 offset-l3";
        description.id = "editDescription";     
        description.value = unescape(snippets[0].description);
        let code = document.createElement("textarea");
        code.className = "col s8 l6 offset-s2 offset-l3";
        code.id = "editCode";
        code.value = unescape(snippets[0].code);
        let button = document.createElement("button");
        button.className = "waves-effect waves-light btn col s2 l2 offset-l5 offset-s5";
        button.innerHTML = "Submit changes";
        button.onclick = submitChanges;
        editSection.appendChild(header);
        editSection.appendChild(title);
        editSection.appendChild(description);
        editSection.appendChild(code);
        editSection.appendChild(button);
    }

    const submitChanges = () => {
        let id = snippets[0]._id;
        let desciption = document.getElementById("editDescription").value;
        let title = document.getElementById("editTitle").value;
        let code = document.getElementById("editCode").value;
        fetch("/api/updateSnippet", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: '{"id": "'+id+'", "description": "'+escape(desciption)+'", "title": "'+escape(title)+'", "code": "'+escape(code)+'"}'
        }).then((response) => response.json())
        .then((data) => {
            if(data.message == "Snippet updated") {
                window.location.reload(false);
            }
        })
    }

    const deleteSnippet = () => {
        fetch("/api/removeSnippet", {
            method: "DELETE",
            headers: {
                "Content-type": "application/json"
            },
            body: '{"id": "'+snippets[0]._id+'"}'
        }).then((response) => response.json())
        .then((data) => {
            if(data.message == "Post removed") {
                window.location.href = "http://localhost:3000"
            }
        })
    }

    const voteSnippet = (vote) => {
        fetch("/api/voteSnippet", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: '{"id": "'+snippets[0]._id+'", "username": "'+decoded.username+'", "votes": "'+(votes + vote)+'"}'
        }).then((response) => response.json())
        .then((data) => {
            if(data.message == "Voted") {
                setVotes(votes + vote)
            }
        })
    }

    /*
        Some objects are created based on if user is logged in or if user
        posted snippet or if user is an admin
    */
    const codeSnippets = snippets.map((item) => 
        <div key={item._id}>
            <h3>{unescape(item.title)}</h3>
            <p>{unescape(item.description)}</p>
            <div className='row'>
                <div className='col s3 l2'>
                    {authToken && 
                        <button onClick={() => voteSnippet(1)}>Vote up</button>
                    }
                    <p>Votes: {votes}. {item.voters.length} votes in total.</p>
                    {authToken && 
                        <button onClick={() => voteSnippet(-1)}>Vote down</button>
                    }
                </div>
                <div className='col s8 l8' align="left">
                    <Highlight language={"C"}>
                        {unescape(item.code)}
                    </Highlight>
                </div>
                <div className='col s12 l2'>
                    {authToken && (decoded.username == snippets[0].username || decoded.admin) && 
                        <button onClick={editSnippet}>Edit post</button>
                    }
                    {authToken && decoded.admin &&
                        <button onClick={deleteSnippet}>Delete</button>
                    }
                </div>
                <p className='col s4 l6 offset-s4 offset-l3 red-text'>
                    (Last edited: {moment(item.date).format("HH:mm DD.MM.YYYY")})
                </p>
            </div>
            <div id={item._id} className='row'></div>
            <Comments id={item._id}/>
        </div>
    )

    return (
        <div>
            <ul>{codeSnippets}</ul>
        </div>
    )
}

export default Snippets