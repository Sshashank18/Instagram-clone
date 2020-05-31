import React,{useState, useContext} from 'react';
import {Link, useHistory} from 'react-router-dom';
import M from 'materialize-css';
import {UserContext} from '../../App';

const Signin = () => {
    const {state, dispatch} = useContext(UserContext);
    const history = useHistory();
    const [password,setPassword] = useState("");
    const [email,setEmail] = useState("");

    const PostData = () => {
        fetch("/signin",{
            method:"post",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                email,
                password
            })
        }).then(res => res.json())
        .then(data => {
            if(data.error){
                M.toast({html: data.error,classes:"#c62828 red darken-3"});
            }
            else{
                localStorage.setItem("jwt",data.token);
                localStorage.setItem("user",JSON.stringify(data.user));
                dispatch({type:"USER",payload:data.user});
                M.toast({html: "Signed in Successfully",classes:"#388e3c green darken-1"});
                history.push('/')
            }
        })
    }

    return(
        <div className="myCard">
            <div className="card auth-card input-field">
                <h2>Instagram</h2>
                <input
                    type="text"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e)=>{setEmail(e.target.value)}}/>
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e)=>{setPassword(e.target.value)}}/>
                <button className="btn waves-effect waves-light #64b5f6 blue darken-1"
                    onClick={()=>PostData()}>
                    Login
                </button>
                <h5>
                    <Link to="/signup">Don't Have an Account ?</Link>
                </h5>
            </div>
        </div>
    );
}

export default Signin;