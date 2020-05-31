import React, { useState, useEffect, useContext } from 'react';
import {UserContext} from '../../App';
import {Link} from 'react-router-dom';

const SubUserPost = () => {

    const [data, setData] = useState([]);

    const {state, dispatch} = useContext(UserContext);

    useEffect(() => {
        fetch("/mysubposts",{
            headers:{
                "Authorization":"Bearer " + localStorage.getItem("jwt")
            }
        })
        .then(res => res.json())
        .then(result => {
            setData(result.posts);
        })

    },[]);

    const likePost = (id) => {
        fetch('/like',{
            method:"put",
            headers:{
                "Authorization": "Bearer " + localStorage.getItem('jwt'),
                "Content-Type": "application/json"
            },
            body:JSON.stringify({
                postId: id,
            })
        }).then(res => res.json())
        .then(result => {
            const newData = data.map(item => {
                if(item._id === result._id){
                    return result;
                }else{
                    return item;
                }
            })
            setData(newData);
        }).catch(err => {
            console.log(err);
        });
    };

    const unlikePost = (id) => {
        fetch('/unlike',{
            method:"put",
            headers:{
                "Authorization": "Bearer " + localStorage.getItem('jwt'),
                "Content-Type": "application/json"
            },
            body:JSON.stringify({
                postId: id,
            })
        }).then(res => res.json())
        .then(result => {
            const newData = data.map(item => {
                if(item._id === result._id){
                    return result;
                }else{
                    return item;
                }
            })
            setData(newData);
        }).catch(err => {
            console.log(err);
        });
    };

    const makeComment = (text, postId) => {
        fetch('/comment',{
            method: "put",
            headers:{
                "Authorization": "Bearer "+ localStorage.getItem("jwt"),
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                postId,
                text
            })
        }).then(res => res.json())
        .then(result => {
            const newData = data.map(item => {
                if(item._id === result._id){
                    return result;
                }else{
                    return item;
                }
            })
            setData(newData);
        })
        .catch(err => {
            console.log(err);
        });
    };

    const deletePost = (postId) => {
        fetch(`/deletepost/${postId}`,{
            method: "delete",
            headers:{
                "Authorization": "Bearer "+ localStorage.getItem("jwt"),
            }
        }).then(res => res.json())
        .then(result => {
            const newData = data.filter(item => {
                return item._id !== result._id;
            });
            setData(newData);
        })
        .catch(err => {
            console.log(err);
        });
    };

    const deleteComment = (commentId, postId) => {
        fetch(`/deletecomment/?commentId=${commentId}&postId=${postId}`,{
            method: "delete",
            headers:{
                "Authorization": "Bearer "+ localStorage.getItem("jwt"),
            }
        }).then(res => res.json())
        .then(result => {
            const newData = data.map(item => {
                if(item._id === result._id){
                    return result;
                }else{
                    return item;
                }
            })
            setData(newData);
        })
        .catch(err => {
            console.log(err);
        });
    };

    return(
        <div className="home">
        {
            data.map(item => {
                return(
                    <div className="card home-card" key={item._id}>
                        <div className="heading">
                            <img style={{width:"25px",margin:"10px",float:"left",borderRadius:"80px"}} src = {item.postedBy.pic} />
                            <h5 style={{padding:"5px"}}><Link to={item.postedBy._id !== state._id ? `/profile/`+ item.postedBy._id:"/profile"}>{item.postedBy.name} </Link>
                                {item.postedBy._id === state._id && 
                                <i style={{float: "right"}} className="material-icons" onClick={() => deletePost(item._id)}>delete</i>}</h5>
                        </div>
                        
                        <div className="card-image">
                            <img alt={item.title} src={item.photo}/>
                        </div>
                        <div className="card-content">
                            {item.likes.includes(state._id)
                            ?<i className="material-icons" style={{color:"red"}} onClick={()=>unlikePost(item._id)}>favorite</i>:
                            <i className="material-icons" onClick={()=>likePost(item._id)}>favorite_border</i>}
                            {item.likes.length} likes
                            <h5>{item.title}</h5>
                            <p>{item.body}</p>
                            {
                                item.comments.map(record => {
                                    if(record){
                                        return(
                                        <h6 key={record._id}>
                                            <span style={{fontWeight:"500"}}>{record.postedBy.name}</span> &nbsp;{record.text}
                                            {record.postedBy._id === state._id && 
                                                <i style={{float: "right"}} className="material-icons" onClick={() => deleteComment(record._id, item._id)}>delete</i>}
                                            </h6>
                                        );
                                    }else{
                                        return null;
                                    }
                                })
                            }
                            <form onSubmit={e => {
                                e.preventDefault();    //preventDefault stops the default reloading of page on form submitting
                                makeComment(e.target[0].value, item._id)
                                }}>      
                                <input type="text" placeholder="Add a comment"/>
                            </form>
                        </div>
                    </div>
                );
            })
        }
           
        </div>
    );
}

export default SubUserPost;