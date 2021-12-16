var express = require('express');
var router = express.Router();
const {body, validationResult } = require("express-validator");
const User = require("../models/User");
const Snippet = require("../models/Snippet");
const Comment = require("../models/Comment");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({storage});
const validateToken = require("../auth/validatetoken.js");

//A function for registeration
router.post('/register', 
    body("email").isEmail(),
    (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        /*
            Given username is compared to ones in database and if there is no match
            application continues registeration and proceeds to hash the password
        */
        User.findOne({username: req.body.username}, (err, user) => {
            if(err) throw err;
            if(user) return res.status(403).json({message: "Username already in use."});
            else {
                bcrypt.genSalt(10, (err, salt) => {
                    if(err) throw err;
                    bcrypt.hash(req.body.password, salt, (err, hash) => {
                        if(err) throw err;
                        /*
                            First and only the first registered user becomes an admin
                            so application checks from database if there's an admin or not
                        */
                        User.findOne({admin: true}, (err, admin) => {
                            if(err) throw err;
                            if(!admin) {
                                User.create(
                                    {
                                        username: req.body.username,
                                        email: req.body.email,
                                        password: hash,
                                        admin: true
                                    },
                                    (err, ok) =>{
                                        if(err) throw err;
                                        return res.json({message: "Registeration successful, please continue to login."})
                                    }
                                );
                            } else {
                                User.create(
                                    {
                                        username: req.body.username,
                                        email: req.body.email,
                                        password: hash,
                                        admin: false
                                    },
                                    (err, ok) =>{
                                        if(err) throw err;
                                        return res.json({message: "Registeration successful, please continue to login."});
                                    }
                                );
                            }
                        })
                    })
                })
            }
        })
    }
);

//A fuction for login
router.post("/login", upload.none(), (req, res, next) => {
    User.findOne({username: req.body.username}, (err, user) => {
        if(err) throw err;
        if(!user) {
            res.status(403).json({message: "Login failed!"})
        } else {
            /* 
                If there is a match with given username and one in database
                the given password is compared to the encrypted password and if they match
                web token (JWT) is created.
            */
            bcrypt.compare(req.body.password, user.password, (err, match) => {
                if(err) throw err;
                if(match) {
                    const jwtPayload = {
                        id: user._id,
                        username: user.username,
                        admin: user.admin
                    }
                    jwt.sign(
                        jwtPayload,
                        process.env.SECRET,
                        (err, token) => {
                            res.json({message: "Login successful!", token})
                        }
                    );
                } else {
                    res.json({message: "Invalid credentials!"})
                }
            })
        }
    })
})

/*
    Following two functions are for creting snippets and comments.
    Function validationToken is used to get username from JWT
*/

router.post("/createSnippet", validateToken, (req, res, next) => {
    Snippet.create(
        {
            username: req.user.username,
            title: req.body.title,
            description: req.body.description,
            code: req.body.code,
            votes: 0,
            voters: [],
            date: Date.now()
        },
        (err, ok) => {
            if(err) throw err;
            return res.json({message: "ok"});
        }
    )
})

router.post("/createComment", validateToken, (req, res, next) => {
    Comment.create(
        {
            username: req.user.username,
            snippetId: req.body.snippetId,
            comment: req.body.comment,
            votes: 0,
            voters: [],
            date: Date.now()
        },
        (err, ok) => {
            if(err) throw err;
            return res.json({message: "ok"});
        }
    )
})

/*
    First getSnippets is used to get all snippets from database to home page
    and second one is for getting specified snippet for its own page
*/

router.get("/getSnippets", (req, res, next) => {
    Snippet.find({}, (err, snippets) => {
        if(err) throw err;
        res.json(snippets)
    })
})

router.get("/getSnippets/:id", (req, res, next) => {
    Snippet.findById({_id: res.req.params.id}, (err, snippet) => {
        if(err) throw err;
        res.json(snippet)
    })
})

/*
    getComments finds correct comments for snippet based on its id 
    (the one automatically created by mongo)
*/

router.get("/getComments/:snippetId", (req, res, next) => {
    Comment.find({snippetId: res.req.params.snippetId}, (err, comments) => {
        if(err) throw err;
        res.json(comments)
    })
})

/*
    Following two functions are for editing snippets and comments
*/

router.post("/updateSnippet", (req, res, next) => {
    Snippet.updateOne({_id: req.body.id}, {
        title: req.body.title,
        description: req.body.description,
        code: req.body.code,
        date: Date.now()
    }, (err, ok) => {
        if(err) throw err;
        return res.json({message: "Snippet updated"});
    })
})

router.post("/updateComment", (req, res, next) => {
    Comment.updateOne({_id: req.body.id}, {
        comment: req.body.comment,
        date: Date.now()
    }, (err, ok) => {
        if(err) throw err;
        return res.json({message: "Comment updated"});
    })
})

/*
    Following two functions are for deleting snippets and comments.
    Deleting snippet also deletes all comments related to it.
*/

router.delete("/removeSnippet", (req, res, next) => {
    Snippet.remove({_id: req.body.id}, (err, removed) => {
        if(err) throw err;
        Comment.remove({snippetId: req.body.id}, (err, removed) => {
            if(err) throw err;
            return res.json({message: "Post removed"});
        })
    })
})

router.delete("/removeComment", (req, res, next) => {
    Comment.remove({_id: req.body.id}, (err, removed) => {
        if(err) throw err;
        return res.json({message: "Post removed"});
    })
})

/*
    Following two functions are for calculating votes for snippets and comments
*/

router.post("/voteSnippet", (req, res, next) => {
    /*
        Snippet that user votes is fetched from database to compare user's name
        to those who have already voted
    */
    Snippet.findById({_id: req.body.id}, (err, snippet) => {
        if(err) throw err;
        let currentVoters = snippet.voters;
        /*
            If user hasen't voted snippet in question before its vote count is increased
            or decreased and user's name is added to the voters list
        */
        if(!snippet.voters.find(element => element == req.body.username)) {
            currentVoters.push(req.body.username);
            Snippet.updateOne({_id: req.body.id}, {
                votes: req.body.votes,
                voters: currentVoters
            }, (err, ok) => {
                if(err) throw err;
                return res.json({message: "Voted"});
            })
        } else {
            return res.json({message: "You can vote snippet only once"});
        }
    })
})

router.post("/voteComment", (req, res, next) => {
    /*
        Comment that user votes is fetched from database to compare user's name
        to those who have already voted
    */
    Comment.findById({_id: req.body.id}, (err, comment) => {
        if(err) throw err;
        let currentVoters = comment.voters;
        /*
            If user hasen't voted comment in question before its vote count is increased
            or decreased and user's name is added to the voters list
        */
        if(!comment.voters.find(element => element == req.body.username)) {
            currentVoters.push(req.body.username);
            Comment.updateOne({_id: req.body.id}, {
                votes: req.body.votes,
                voters: currentVoters
            }, (err, ok) => {
                if(err) throw err;
                return res.json({message: "Voted"});
            })
        } else {
            return res.json({message: "You can vote comment only once"});
        }
    })
})

module.exports = router;

//{}