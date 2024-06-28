import React, { useEffect, useState } from "react";
import {
  error_toast,
  sucess_toast,
} from "../../../util/toastNotification";
import CloseIcon from "@mui/icons-material/Close";
import {
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../../../firebase";
import { useStateContext } from "../../../contexts/ContextProvider";
import LoadingPage from "../../../util/LoadingPage";

const UpdateApointment = (props) => {
  const { id } = props.parameter;

  const { isLoading, setIsLoading, setShowUpdate , setTableControl} = useStateContext();

  const [price, setPrice] = useState("");


  const getApointmentListUpdate = async (id) => {
    try {
      setIsLoading(true);

      const apointmentDocRef = doc(db, "bookings", id);
      const docSnap = await getDoc(apointmentDocRef);

      if (docSnap.exists()) {
        const apointmentData = { ...docSnap.data(), id: docSnap.id };

        setPrice(apointmentData.totalPrice);  
      } else {
        console.log(`Document with ID ${id} does not exist.`);
      }
    } catch (err) {
      console.log("getApointmentListUpdate");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getApointmentListUpdate(id);
  }, [id]);

  const handleUpdateAponintment = async () => {
    try {
      setIsLoading(true);


      const appointmentDocRef = doc(db, "bookings", id); // Use the id prop here

      await updateDoc(appointmentDocRef, {
        totalPrice: price,
        updatedAt: new Date(),
      });

      sucess_toast("Bookings has been updated successfully");

      setPrice("");


      setTableControl(true);
    } catch (err) {
      console.error(err);
      error_toast("An error occurred while updating the appointment");
    } finally {
      setIsLoading(false);
    }
  };

  // ?
 



  const closeModule = () => {
    setShowUpdate(false);
  };

  return (
    <div>
      {isLoading && <LoadingPage />}

      <div className="fixed z-40 top-0 overflow-y-auto left-0 w-full h-full   bg-black bg-opacity-90">
        <div className="w-1/2 p-8 my-8  rounded-lg shadow-lg bg-white mx-auto">
          <div className=" bg-gray-200  rounded p-4 text-2xl font-semibold mb-4 rounded-t-lg text-center">
            Add Price
            <button
              className="float-right text-gray-500 hover:text-gray-700"
              onClick={() => closeModule()}
            >
              <CloseIcon />
            </button>
          </div>
          <div className="flex justify-center flex-col">
            <div className="text-center">
              <div className="mx-7 p-4 flex gap-2  justify-center items-center">
                <label className="flex items-center   text-lg font-medium ">
                  Price:
                </label>
                  <input
                    type="text"
                    placeholder="1000$"
                    className="w-1/2 p-2 border border-gray-400 rounded-md focus:outline-none focus:border-blue-500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
              </div>
            </div>
          <div className="flex justify-center items-center">
            <button
              onClick={() => handleUpdateAponintment()}
              className="rounded-md p-2 bg-blue-500 hover:bg-blue-700 text-white font-bold cursor-pointer mt-4 disabled:bg-opacity-40 "
            >
              Update A Apointment
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateApointment;
