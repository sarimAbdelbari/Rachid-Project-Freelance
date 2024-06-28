import React, { useState, useEffect } from 'react';
import { db, storage } from '../../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import DriveFolderUploadOutlinedIcon from '@mui/icons-material/DriveFolderUploadOutlined';
import CloseIcon from '@mui/icons-material/Close';
import Select from "react-select";
import { sucess_toast, error_toast } from '../../../util/toastNotification';
import { useStateContext } from '../../../contexts/ContextProvider';
import LoadingPage from "../../../util/LoadingPage";
import { frWilayasAlgeria} from "../../../data/dummy.js";

const UpdateCustomer = (props) => {
  const { id, avatarRef } = props.parameter;

  const [newDisplayName, setNewDisplayName] = useState("");
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [selectedWilaya, setSelectedWilaya] = useState(null);
  const [newImgRef, setNewImgRef] = useState(null);

  const [newDownloadUrl, setNewDownloadUrl] = useState('');
  const [fileUpload, setFileUpload] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const { isLoading, setIsLoading , setShowUpdate } = useStateContext();


  const options = frWilayasAlgeria.map((item, index) => ({
    value: `${index + 1} - ${item.name}`,
    label: `${index + 1} - ${item.name}`,
  }));

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setFileUpload(selectedFile);

      const previewURL = URL.createObjectURL(selectedFile);
      setFilePreview(previewURL);
    }
  };

  const handleChange = (selectedOption) => {
    setSelectedWilaya(selectedOption.value);
  };


  const getCustomerListUpdate = async (id) => {
    try {

      const customerDocRef = doc(db, "clients", id);

      const docSnap = await getDoc(customerDocRef);

      if (docSnap.exists()) {
        const CustomerData = { ...docSnap.data(), id: docSnap.id };

      setNewDisplayName(CustomerData.displayName);

      setNewImgRef(CustomerData.avatarRef);

      setNewPhoneNumber(CustomerData.phoneNumber);

     setSelectedWilaya(CustomerData.city);

      setFileUpload(null);
      setFilePreview(null);

      const downloadURL1 = await getDownloadURL(ref(storage, CustomerData.avatarRef));

      setNewDownloadUrl(downloadURL1);

      } else {
        console.log(`Document with ID ${id} does not exist.`);
      }
    } catch (err) {
      console.error(err);
    } 
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCustomerListUpdate(id);
  }, [id]);

  const onUpdateCustomer = async () => {
    try {
      setIsLoading(true);
      
      const customerDoc = doc(db, "clients", id);

     
     let updatedData = {
      displayName: newDisplayName,
      phoneNumber: newPhoneNumber,
      city: selectedWilaya,
      avatarRef: newImgRef,
      updatedAt: new Date(),
    };
    
    if (fileUpload) {
      const filesFolderRef = ref(storage, avatarRef);
      await uploadBytes(filesFolderRef, fileUpload);
    
      let downloadURL = await getDownloadURL(filesFolderRef);
      updatedData = { ...updatedData, avatarRef: avatarRef };
    }
    

      await updateDoc(customerDoc, updatedData);

      sucess_toast('Customer has been updated successfully');
    } catch (err) {
      console.error(err);
      error_toast("An error occurred while updating the Customer");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };
  const closeModule = () => {
    setShowUpdate(false);
  };

  const selectedWilayaOption = {
    value: selectedWilaya,
    label: selectedWilaya,
  };

  return (
    <div>
      {isLoading && <LoadingPage />}
      <div className="fixed z-40 top-0 overflow-y-auto left-0 w-full h-full   bg-black bg-opacity-90">
      <div className="w-4/6 p-8 my-8  rounded-lg shadow-lg bg-white mx-auto">
      <div className=" bg-gray-200  rounded p-4 text-2xl font-semibold mb-4 rounded-t-lg text-center">
          Update Customer
          <button
              className="float-right text-gray-500 hover:text-gray-700"
              onClick={()=> closeModule()}
            >
              <CloseIcon />
            </button>
        </div>
        <div className="p-4 mt-8 rounded-lg shadow-lg">
          <div className="flex justify-center">
          <div className="w-1/2 text-center">
            {filePreview ? (
              <img
                src={filePreview}
                alt="Selected File"
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : newDownloadUrl ? (
              <img
                src={newDownloadUrl}
                alt="Selected File"
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <label htmlFor="file">
                <img
                  src="https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
                  alt=""
                  className="w-32 h-32 rounded-full object-cover"
                />
              </label>
            )}
          </div>
            <div className="w-1/2">
              <div className="flex flex-wrap gap-6 justify-around flex-col">
              <div className="w-40 formInput">
                  <label htmlFor="file" className="flex items-center gap-2">
                    Image :{' '}
                    <DriveFolderUploadOutlinedIcon className="icon cursor-pointer" />
                  </label>
                  <input
                    type="file"
                    id="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="formInput">
                  <label className="flex items-center gap-2">Full Name :</label>
                  <input
                    type="text"
                    placeholder="Snow"
                    className="w-full p-2 border border-gray-400 rounded-md focus:outline-none focus:border-blue-500"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                  />
                </div>
                <div className="formInput">
                  <label className="flex items-center gap-2">PhoneNumber :</label>
                  <input
                    type="text"
                    placeholder="0549020000"
                    className="w-full p-2 border border-gray-400 rounded-md focus:outline-none focus:border-blue-500"
                    value={newPhoneNumber}
                    onChange={(e) => setNewPhoneNumber(e.target.value)}
                  />
                </div>
                <div className="formInput">
                  <label className="flex items-center gap-2">Location:</label>
                  <Select
                    value={selectedWilayaOption}
                    onChange={handleChange}
                    options={options} 
                  />
                </div>
                <button
                  onClick={()=> onUpdateCustomer()}
                  className="w-40 rounded-md p-2 bg-blue-500 hover:bg-blue-700 text-white font-bold cursor-pointer mt-4 disabled:bg-opacity-40"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      </div>
    </div>
  );
};

export default UpdateCustomer;



