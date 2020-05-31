import React, { useContext } from 'react';
import {Link ,useHistory} from 'react-router-dom';
import { UserContext } from '../App';

const Navbar = () => {
    const history = useHistory();
    const {state, dispatch} = useContext(UserContext);
    const renderList = () => {
        if(state){
            return [
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
        </nav>
    )
}

export default Navbar;