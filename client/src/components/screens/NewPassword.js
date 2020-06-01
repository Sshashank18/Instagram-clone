import React,{useState} from 'react';
import {Link, useHistory, useParams} from 'react-router-dom';
import M from 'materialize-css';

const Signin = () => {
    const history = useHistory();
    const [password,setPassword] = useState("");

    const {token} = useParams()

    const PostData = () => {

        fetch("/new-password",{
            method:"post",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                password,
                token
            })
        }).then(res => res.json())
        .then(data => {
            if(data.error){
                M.toast({html: data.error,classes:"#c62828 red darken-3"});
            }
            else{

                M.toast({html: data.message,classes:"#388e3c green darken-1"});
                history.push('/signin')
            }
        })
    }

    return(
        <div className="myCard">
            <div className="card auth-card input-field">
                <h2>Instagram</h2>

                <input
                    type="password"
                    placeholder="Enter New Password"
                    value={password}
                    onChange={(e)=>{setPassword(e.target.value)}}/>
                <button className="btn waves-effect waves-light #64b5f6 blue darken-1"
                    onClick={()=>PostData()}>
                    Update Password
                </button>

            </div>
        </div>
    );
}

export default Signin;