import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar, Sidebar } from "./components";
import {useEffect} from "react";
import {
  Main,
  Employee,
  Customer,
  Category,
  Bookings,
  Banner,
  Landing,
} from "./pages"; 

import { sucess_toast, } from './util/toastNotification';

import {CategoryPieChart ,EmployeeGrowthChart ,CustomersGrowthChart} from "./components/Charts";
import { useStateContext } from "./contexts/ContextProvider";
import { ToastContainer } from "react-toastify";

import { signOut, getAuth, onAuthStateChanged } from 'firebase/auth';


import "react-toastify/dist/ReactToastify.css";
import "./App.css";


function  App() {

   const { activeMenu ,isLoggedIn,setIsLoggedIn } = useStateContext();
   

   const auth = getAuth();

  useEffect(() => {
   onAuthStateChanged(auth, (user) => {

  if (user && user.email === 'admin@gmail.com') {

    setIsLoggedIn(true);
    sucess_toast('Admin Login successfully');
 
    return 1;
  }  else {
    setIsLoggedIn(false);
    signOut(auth);
    return 1;
  }
}
)
  }, [auth]);


  return (
    <div>
      <div>        
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />

        <BrowserRouter>
        {/* ? Special Page */}
         
         {isLoggedIn ? (<>
          <div className="flex relative  h-screen overflow-hidden">
            {activeMenu ? (
              <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white">
                <Sidebar />
              </div>
            ) : (
              <div className="w-0 dark:bg-secondary-dark-bg">
                <Sidebar />
              </div>
            )}
            <div
              className={
                activeMenu
                  ? "bg-main-bg min-h-screen md:ml-72 w-full overflow-y-auto"
                  : "bg-main-bg  w-full min-h-screen flex-2 overflow-y-auto"
              }
            >
              <div className="fixed md:static bg-main-bg  navbar w-full ">
                <Navbar />
              </div>

              <div className="ml-10 RoutesWrapper h-full overflow-y-auto mr-4">
                <Routes>
                  {/* ? Pages */}
                  <Route path="/" element={<Main />} />
                  <Route path="/Activity" element={<Main />} />
                  <Route path="/Employee" element={<Employee />} />
                  <Route path="/Customer" element={<Customer />} />
                  <Route path="/Category" element={<Category />} />
                  <Route path="/Bookings" element={<Bookings />} />
                  <Route path="/Banner" element={<Banner />} />
                  <Route path="/Catigories_Charts" element={<CategoryPieChart />} />
                  <Route path="/Employees_Charts" element={<EmployeeGrowthChart />} />
                  <Route path="/Customers_Charts" element={<CustomersGrowthChart />} />
                </Routes>
              </div>
            </div>
          </div> 
         </>) : (<>
          <Routes>
            <Route path="/" element={<Landing />} />
         </Routes>
         </>)}
          
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;


