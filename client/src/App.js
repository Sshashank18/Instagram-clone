import React,{useEffect, createContext, useReducer, useContext} from 'react';
import Navbar from './components/Navbar';
import {Route, Switch, useHistory, BrowserRouter} from 'react-router-dom';
import "./App.css";

import Home from './components/screens/home';
import Signin from './components/screens/signin';
import Signup from './components/screens/signup';
import Profile from './components/screens/profile';
import CreatePost from './components/screens/createPost';
import UserProfile from './components/screens/UserProfile';
import SubscribedUserPost from './components/screens/subscribedUserPosts';

import {reducer, initialState} from './reducers/userReducer';

export const UserContext = createContext();

const Routing = () => {
  const history = useHistory();
  const {state, dispatch} = useContext(UserContext);
  useEffect(()=>{
    const user = JSON.parse(localStorage.getItem("user"));
    if(user){
      dispatch({type:"USER",payload:user});
    }else{
      history.push('/signin');
    }
  },[]);

  return(
    <Switch>
      <Route path="/" exact component={Home}/>
      <Route path="/signin" component={Signin}/>
      <Route path="/signup" component={Signup}/>
      <Route path="/profile" exact component={Profile}/>
      <Route path="/createPost" component={CreatePost}/>
      <Route path="/profile/:userid" component={UserProfile}/>
      <Route path="/myfollowingPosts" component={SubscribedUserPost}/>
    </Switch>
  );
}

function App() {
  const [state,dispatch] = useReducer(reducer, initialState);
  return (  
    <UserContext.Provider value = {{state, dispatch}}>
      <BrowserRouter>
        <Navbar/>
        <Routing/>
      </BrowserRouter>
    </UserContext.Provider>
 );
}

export default App;
