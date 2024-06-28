import React, { useState, useEffect } from 'react';
import { db, storage } from '../../../firebase';
import { doc, getDoc, updateDoc,collection ,getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import DriveFolderUploadOutlinedIcon from '@mui/icons-material/DriveFolderUploadOutlined';
import CloseIcon from '@mui/icons-material/Close';
import Select from "react-select";
import { sucess_toast, error_toast } from '../../../util/toastNotification';
import { useStateContext } from '../../../contexts/ContextProvider';
import LoadingPage from "../../../util/LoadingPage";
import { frWilayasAlgeria} from "../../../data/dummy.js";

const UpdateEmployee = (props) => {
  const { id, avatarRef } = props.parameter;

  const [newDisplayName, setNewDisplayName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [selectedOcupation, setSelectedOcupation] = useState(null);
  const [newAvatarRef, setNewAvatarRef] = useState(null);

  const [newDownloadUrl, setNewDownloadUrl] = useState('');
  const [fileUpload, setFileUpload] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const { isLoading, setIsLoading ,setShowUpdate} = useStateContext();

  const catigoriesCollectionRef = collection(db, "catigories");
  const [catigorieList, setCatigorieList] = useState([]);

  const optionsOcupation = catigorieList.map((category) => ({
      value: category,
      label: category, // Assuming category is a string
  }));

  const getCatigorieList = async () => {
    try {
      setIsLoading(false);
      const data = await getDocs(catigoriesCollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      const frTitles = filteredData.map((category) => category.frtitle); // Extract 'frtitle' property
      setCatigorieList(frTitles);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    getCatigorieList();
  },[]);

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

  const handleChangeWilaya = (selectedOption) => {
    setSelectedWilaya(selectedOption.value);
  };

  const handleChangeOcupation = (selectedOption) => {
    setSelectedOcupation(selectedOption.value);
  };


  const getEmployeeListUpdate = async (id) => {
    try {

      const employeeDocRef = doc(db, "employee", id);

      const docSnap = await getDoc(employeeDocRef);

      if (docSnap.exists()) {
        const EmployeeData = { ...docSnap.data(), id: docSnap.id };

      setNewDisplayName(EmployeeData.displayName);
      setNewEmail(EmployeeData.email);
      setNewAvatarRef(EmployeeData.avatarRef);
      setNewPhoneNumber(EmployeeData.phoneNumber);
      setSelectedWilaya(EmployeeData.city);
      setSelectedOcupation(EmployeeData.ocupation);

      setFileUpload(null);
      setFilePreview(null);

      const downloadURL1 = await getDownloadURL(ref(storage, EmployeeData.avatarRef));
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
    getEmployeeListUpdate(id);
  }, [id]);

  const onUpdateEmployee = async () => {
    try {
      setIsLoading(true);
      
      const employeeDoc = doc(db, "employee", id);

     
     let updatedData = {
      displayName: newDisplayName,
      email: newEmail,
      phoneNumber: newPhoneNumber,
      city: selectedWilaya,
      ocupation: selectedOcupation,
      avatarRef: newAvatarRef,
      updatedAt: new Date(),
    };
    
    if (fileUpload) {
      const filesFolderRef = ref(storage, avatarRef);
      await uploadBytes(filesFolderRef, fileUpload);
    
      let downloadURL = await getDownloadURL(filesFolderRef);
      updatedData = { ...updatedData, avatarRef: avatarRef };
    }
    


      await updateDoc(employeeDoc, updatedData);

      sucess_toast('Employee has been updated successfully');
    } catch (err) {
      console.error(err);
      error_toast("An error occurred while updating the Employee");
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

  const selectedOcupationOption = {
    value: selectedOcupation,
    label: selectedOcupation,
  };

  return (
    <div>
      {isLoading && <LoadingPage />}
      <div className="fixed z-40 top-0 overflow-y-auto left-0 w-full h-full   bg-black bg-opacity-90">
      <div className="w-4/6 p-8 my-8  rounded-lg shadow-lg bg-white mx-auto">
      <div className=" bg-gray-200  rounded p-4 text-2xl font-semibold mb-4 rounded-t-lg text-center">
          Update Employee
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
                    placeholder="John"
                    className="w-full p-2 border border-gray-400 rounded-md focus:outline-none focus:border-blue-500"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                  />
                </div>

                <div className="formInput">
                  <label className="flex items-center gap-2">Email :</label>
                  <input
                    type="email"
                    placeholder="johnSnow@gmail.com"
                    className="w-full p-2 border border-gray-400 rounded-md focus:outline-none focus:border-blue-500"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
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
                    onChange={handleChangeWilaya}
                    options={options} 
                  />
                </div>
                <div className="formInput">
                  <label className="flex items-center gap-2">Ocupation:</label>
                  <Select
                    value={selectedOcupationOption}
                    onChange={handleChangeOcupation}
                    options={optionsOcupation} 
                  />
                </div>
                <button
                  onClick={()=> onUpdateEmployee()}
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

export default UpdateEmployee;



