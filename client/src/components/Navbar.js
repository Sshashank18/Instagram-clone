import React, { useContext, useRef, useEffect, useState } from 'react';
import {Link ,useHistory} from 'react-router-dom';
import { UserContext } from '../App';
import M from 'materialize-css';

const Navbar = () => {
    const searchModal = useRef(null);
    const history = useHistory();
    const [search, setSearch] = useState('');
    const [userDetails, setUserDetails] = useState([]);

    const {state, dispatch} = useContext(UserContext);

    useEffect(()=>{
        M.Modal.init(searchModal.current);
    },[]);

    useEffect(() => {
        if(search === ''){
            fetchUsers('');
        }
    },[search]);

    const fetchUsers = (query) => {
        setSearch(query);
        fetch('/search-users',{
            method:"post",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                query
            })
        }).then(res => res.json())
        .then(results => {
            setUserDetails(results.user);
        })
    };

    const renderList = () => {
        if(state){
            return [
                <li key="5"><i data-target="modal1" className = "large material-icons modal-trigger" style={{color:"black"}}>search</i></li>,
                <li key="1"><Link to="/profile">Profile</Link></li>,
                <li key="2"><Link to="/createPost">Create Post</Link></li>,
                <li key="3"><Link to="/myfollowingPosts">My Following Post</Link></li>,
                <li key="4">
                    <button className="btn waves-effect waves-light #c62828 red darken-3"
                    onClick={()=>{
                        localStorage.clear();
                        dispatch({type:"CLEAR"});
                        history.push('/signin');
                    }}>
                    Logout
                    </button>
                </li>
            ]   
        }else{
            return [
                    <li key="1"><Link to="/signin">Sign In</Link></li>,
                    <li key="2"><Link to="/signup">Sign Up</Link></li>
            ]
        }
    }

    return(
        <nav>
            <div className="nav-wrapper white">
                <Link to={state?"/":"/signin"} className="brand-logo left">Instagram</Link>
                <ul id="nav-mobile" className="right">
                    {renderList()}
                </ul>
            </div>
            <div id="modal1" className="modal" ref={searchModal} style={{color: "black"}}>
                <div className="modal-content">
                    <input
                        type="text"
                        placeholder="Search....."
                        value={search}
                        onChange={(e)=>{fetchUsers(e.target.value)}}/>
                </div>
                <ul className="collection">
                    {state ? userDetails.map(item => {
                        return <Link key={item._id} to={item._id === state._id ? '/profile' : "/profile/" + item._id} onClick={() => {
                            M.Modal.getInstance(searchModal.current).close();
                            setSearch('');
                        }}><li className="collection-item"><img src={item.pic} style={{width:"25px",margin:"10px",float:"left",borderRadius:"80px"}} />
                            <h6>{item.name}</h6></li></Link>;
                    }): null}
                </ul>
                <div className="modal-footer">
                    <button href="#!" className="modal-close waves-effect waves-green btn-flat" onClick={() => {setSearch('')}}>Close</button>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;