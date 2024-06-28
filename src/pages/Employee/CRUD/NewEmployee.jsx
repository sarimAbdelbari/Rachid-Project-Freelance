import React, { useState , useEffect} from "react";
import { db, storage } from "../../../firebase";
import { collection, addDoc ,getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import Select from "react-select";
import {
  sucess_toast,
  error_toast,
  warn_toast,
} from "../../../util/toastNotification";
import { useStateContext } from "../../../contexts/ContextProvider";
import LoadingPage from "../../../util/LoadingPage";
import { v4 } from "uuid";
import { frWilayasAlgeria} from "../../../data/dummy.js";

const NewEmployee = () => {
  // ? Start Functions For Employee

  // ** Parameters
  const { isLoading, setIsLoading , setTableControl, setShowNew} = useStateContext();

  const [newName, setNewName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [selectedWilaya, setSelectedWilaya] = useState(null);
  const [newWilaya, setNewWilaya] = useState(null);
  const [newOcupation, setNewOcupation] = useState(null);

  const [selectedOcupation, setSelectedOcupation] = useState(null);

  const [fileUpload, setFileUpload] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const employeeCollectionRef = collection(db, "employee");

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

  // ** Functions
  const optionsWilaya = frWilayasAlgeria.map((item, index) => ({
    value: `${index + 1} - ${item.name}`,
    label: `${index + 1} - ${item.name}`,
  }));

  const handleChangeWilaya = (selectedOption) => {
    setSelectedWilaya(selectedOption);
    setNewWilaya(selectedOption.label);
  };



  const handleChangeOcupation = (selectedOption) => {
    setSelectedOcupation(selectedOption);
    setNewOcupation(selectedOption.value);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setFileUpload(selectedFile);

      const previewURL = URL.createObjectURL(selectedFile);
      setFilePreview(previewURL);
    }
  };

  const onSubmitEmployee = async () => {
    const verifyAllInput =
      newName &&
      newLastName &&
      newEmail &&
      newPhoneNumber &&
      selectedWilaya &&
      selectedOcupation;
 
    if (!verifyAllInput) {
      warn_toast("All Input Must be filled");
      return; // Exit early if any input is missing
    }

    try {
      setIsLoading(true); 

      const imgId = v4();

      if (fileUpload) {
        const filesFolderRef = ref(storage, `employees_avatars/${imgId}`);
        await uploadBytes(filesFolderRef, fileUpload);
        let downloadURL = await getDownloadURL(filesFolderRef);
      }

      await addDoc(employeeCollectionRef, {
        // uid: user.uid, // Firebase user UID
        displayName:  newName + " " + newLastName,
        email: newEmail,
        phoneNumber: newPhoneNumber,
        city: newWilaya,
        ocupation: newOcupation,
        avatarRef: `employees_avatars/${imgId}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        isVerifed : false,
      });

      
      setNewName("");
      setNewLastName("");
      setNewEmail("");
      setNewPhoneNumber("");
      setSelectedWilaya(null);
      setSelectedOcupation(null);
      setFileUpload(null);
      setFilePreview(null);
      setTableControl(true);

      sucess_toast("Employee have been added successfully");
    } catch (err) {
      console.error(err);
      error_toast("An error occurred while adding Employee");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };
  const closeModule = () => {
    setShowNew(false);
  };
  // ? End Functions For Employee

  return (
    <div>
      {isLoading && <LoadingPage />}
      <div className="fixed z-40 top-0 overflow-y-auto left-0 w-full h-full   bg-black bg-opacity-90">
        <div className="w-4/6 p-8 my-8  rounded-lg shadow-lg bg-white mx-auto">
        <div className=" bg-gray-200  rounded p-4 text-2xl font-semibold mb-4 rounded-t-lg text-center">
          New Employee
          <button
              className="float-right text-gray-500 hover:text-gray-700"
              onClick={()=> closeModule()}
            >
              <CloseIcon />
            </button>
        </div>
          <div className="flex justify-center">
            <div className="w-1/2 text-center">
              {filePreview ? (
                <img
                  src={filePreview}
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
                    Image :{" "}
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
                  <label className="flex items-center gap-2">Nom :</label>
                  <input
                    type="text"
                    placeholder="Nom"
                    className="w-full p-2 border border-gray-400 rounded-md focus:outline-none focus:border-blue-500"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="formInput">
                  <label className="flex items-center gap-2">Prenom :</label>
                  <input
                    type="text"
                    placeholder="Prénom"
                    className="w-full p-2 border border-gray-400 rounded-md focus:outline-none focus:border-blue-500"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                  />
                </div>
                <div className="formInput">
                  <label className="flex items-center gap-2">Email :</label>
                  <input
                    type="email"
                    placeholder="Email@gmail.com"
                    className="w-full p-2 border border-gray-400 rounded-md focus:outline-none focus:border-blue-500"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
                <div className="formInput">
                  <label className="flex items-center gap-2">
                    Phone Number :
                  </label>
                  <input
                    type="number"
                    placeholder="+213 05 00 00 00 00"
                    className="w-full p-2 border border-gray-400 rounded-md focus:outline-none focus:border-blue-500"
                    value={newPhoneNumber}
                    onChange={(e) => setNewPhoneNumber(e.target.value)}
                  />
                </div>
                <div className="">
                  <label className="flex items-center gap-2">Location:</label>
                  <Select
                    value={selectedWilaya}
                    onChange={handleChangeWilaya}
                    options={optionsWilaya} 
                  />
                </div>
                <div className="">
                  <label className="flex items-center gap-2">Ocupation:</label>
                  <Select
                    value={selectedOcupation}
                    onChange={handleChangeOcupation}
                    options={optionsOcupation} 
                  />
                </div>

                <button
                  onClick={onSubmitEmployee}
                  className="w-40 rounded-md p-2 bg-blue-500 hover:bg-blue-700 text-white font-bold cursor-pointer mt-4 disabled:bg-opacity-40"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewEmployee;
