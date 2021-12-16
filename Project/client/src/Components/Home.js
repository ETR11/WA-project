//Structure for home page

import {Link} from "react-router-dom"
import React, { useState, useEffect } from 'react';

const Home = () => {
    const [posts, setPosts] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage, setPostsPerPage] = useState(10);

    useEffect(() => {
        fetch("/api/getSnippets")
        .then((response) => response.json())
        .then((data) => {
            data.forEach(element => {
                setPosts(prevState => [...prevState, element]);
            })
        })
    }, [])

    /*
        Home page displays 10 posts at the time so posts array from database
        is sliced to parts based on current page
    */
    const lastPostOfPage = currentPage * postsPerPage;
    const firstPostOfPage = lastPostOfPage - postsPerPage;
    const currentPosts = posts.slice(firstPostOfPage, lastPostOfPage);
    const postList = currentPosts.map((item) => 
        <Link to={"/snippets/"+item._id} className="postLink">{unescape(item.title)}<p></p></Link>
    )

    const authToken = localStorage.getItem("auth_token")

    /*
        Submits a new code snippet post
    */
    const submit = () => {
        let description = document.getElementById("description").value;
        let title = document.getElementById("title").value;
        let code = document.getElementById("code").value;
        let obj = '{"description": "'+escape(description)+'", "title": "'+escape(title)+'", "code": "'+escape(code)+'"}'
         fetch("/api/createSnippet", {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                "authorization": "Bearer " + authToken
            },
            body: obj
        }).then((response) => response.json())
        .then((data) => {
            if(data.message == "ok") {
                window.location.reload(false);
            }
        })
    }

    /*
        Next functions calculate page numbers from the posts got from database
        and create links to pages used in page navigation bar
    */

    const pageNumbers = [];
    for(let i = 1; i <= Math.ceil(posts.length/postsPerPage); i++) {
        pageNumbers.push(i);
    }

    const pager = (pageNumber) => {
        setCurrentPage(pageNumber);
    }
    const pageNavigation = pageNumbers.map((number) => 
        <li key={number}>
            <a onClick={() => pager(number)}>{number}</a>
        </li>
    )

    /*
        If user is logged in section for posting snippet is also rendered
    */

    if(authToken) {
        return (
            <div className="row">
                <h1>Home</h1>
                <form>{postList}</form>
                {posts.length > 10 &&
                    <nav className="#4db6ac teal lighten-2 col s4 l2 offset-s4 offset-l5">
                        <ul>{pageNavigation}</ul>
                    </nav>
                }
                <h4 className="col s8 l6 offset-s2 offset-l3">Post a new code snippet!</h4>
                <h5 className="col s2 l4 offset-s5 offset-l4">Title</h5>
                <textarea id="title" className="col s6 l4 offset-s3 offset-l4"/>
                <h5 className="col s2 l8 offset-l2  offset-s5">Description</h5>
                <textarea id="description" className="col s8 l6 offset-s2 offset-l3"/>
                <h5 className="col s2 l8 offset-l2 offset-s5">Code</h5>
                <textarea id="code" className="col s8 l6 offset-s2 offset-l3"/>
                <button onClick={submit} className="#4db6ac teal lighten-2 btn col s2 l2 offset-l5 offset-s5">
                    Submit
                </button>
            </div>
    )
    } else {
        return (
            <div className="row">
                <h1>Home</h1>
                <form>{postList}</form>
                {posts.length > 10 &&
                    <nav className="#4db6ac teal lighten-2 col s4 l2 offset-s4 offset-l5">
                        <ul>{pageNavigation}</ul>
                    </nav>
                }
                <h3 className="col s6 l4 offset-s3 offset-l4">User is not logged in!</h3>
            </div>
        )
    }
}

export default Home

//{}