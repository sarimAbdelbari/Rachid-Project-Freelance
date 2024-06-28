import React, {  useState } from 'react';
import { getAuth, signInWithEmailAndPassword} from 'firebase/auth';
import { SiShopware } from 'react-icons/si';
import {  error_toast, warn_toast } from '../../util/toastNotification';

const Landing = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const auth = getAuth();

  
  const addData = async () => {
    try {

      await signInWithEmailAndPassword(auth, email, password);
  
    } catch (error) {
      if (error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
        warn_toast("Wrong account credentials");
      } else if (error.code === "auth/invalid-email") {
        warn_toast("Invalid email address");
      } else {
        error_toast("Error logging in");
        console.error("Error logging in:", error.message);
      }
    }
  };
  

  return (
    <div className="h-screen flex flex-row-reverse">
      <div className="w-3/5 flex justify-center m-4">
        <div className="flex flex-col justify-center p-8 rounded-xl">
          <div className="rounded p-4 text-2xl font-semibold mb-4 rounded-t-lg text-center">
            <h2 className="text-3xl font-semibold my-5">Welcome To Jar Bricola Dashboard</h2>
          </div>
          <div className="flex flex-col justify-center space-y-4 bg-gray-100 hover:bg-gray-300 p-5 rounded-md shadow-xl" style={{ transition: '0.3s' }}>
            <h2 className="text-xl font-medium my-5 text-center">Login</h2>
            <input
              placeholder="Email"
              name="email"
              type="email"
              className="p-2 border border-gray-400 rounded-md focus:outline-none focus:border-blue-500"
              onChange={(event) => setEmail(event.target.value)}
            />
            <input
              placeholder="Password"
              name="password"
              type="password"
              className="p-2 border border-gray-400 rounded-md focus:outline-none focus:border-blue-500"
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              onClick={addData}
              className="w-28 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
      <div className="w-2/5 bg-blue-600 flex flex-col justify-center items-center">
        <div className="items-center flex flex-col text-4xl font-extrabold tracking-tight cursor-pointer text-white">
          <SiShopware /> <span className="my-2">Jar Bricola</span>
        </div>
      </div>
    </div>
  );
};

export default Landing;
