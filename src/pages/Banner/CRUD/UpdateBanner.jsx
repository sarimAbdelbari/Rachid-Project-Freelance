import React, { useState, useEffect } from 'react';
import { db, storage } from '../../../firebase';
import {
    getDocs,
    collection,
    doc,
    getDoc,
    updateDoc,
  } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import DriveFolderUploadOutlinedIcon from '@mui/icons-material/DriveFolderUploadOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { sucess_toast, error_toast } from '../../../util/toastNotification';
import { useStateContext } from '../../../contexts/ContextProvider';
import LoadingPage from "../../../util/LoadingPage";
import Select from "react-select";

const UpdateBanner = (props) => {
    const { id, imgreftitle } = props.parameter;
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [newDownloadUrl, setNewDownloadUrl] = useState('');
    const [fileUpload, setFileUpload] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [newImgRef, setNewImgRef] = useState("");
    const { isLoading, setIsLoading,setShowUpdate ,setTableControl } = useStateContext();
  
    const catigoriesCollectionRef = collection(db, "catigories");

    const [catigorieList, setCatigorieList] = useState([]);

    const CategoryOptions = catigorieList.map((category) => ({
        value: category,
        label: category, 
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
        setIsLoading(false);
      }
    };
  
    useEffect(() => {
      getCatigorieList();
    },[]);
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
    
        if (selectedFile) {
          setFileUpload(selectedFile);
    
          const previewURL = URL.createObjectURL(selectedFile);
          setFilePreview(previewURL);
        }
      };

      const getBannerListUpdate = async (id) => {
        try {
    
          const bannerDocRef = doc(db, "banner", id);
    
          const docSnap = await getDoc(bannerDocRef);
    
          if (docSnap.exists()) {
            const bannerData = { ...docSnap.data(), id: docSnap.id };
    
            setSelectedCategory(bannerData.categoryName);
            setNewImgRef(bannerData.imgreftitle);

            const downloadURL1 = await getDownloadURL(ref(storage, bannerData.imgreftitle));
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
        getBannerListUpdate(id);
      }, [id]);

  const onUpdateBanner = async () => {
    try {
      setIsLoading(true);

      const bannerDoc = doc(db, "banner", id);

      let updatedData = {
        categoryName: selectedCategory, 
        imgreftitle: newImgRef,
        updatedAt: new Date(),
      };
    
    
      // ! upload the image 


     
      if (fileUpload) {
        const filesFolderRef = ref(storage, imgreftitle);
        await uploadBytes(filesFolderRef, fileUpload);

        const downloadURL = await getDownloadURL(filesFolderRef);
        updatedData = { ...updatedData, imgreftitle: imgreftitle };
      }

      await updateDoc(bannerDoc, updatedData);

      sucess_toast('Banner has been updated successfully');
      setTableControl(true);

    } catch (err) {
      console.error(err);
      error_toast("An error occurred while updating the Banner");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCategoryOption = {
    value: selectedCategory,
    label: selectedCategory,
  };

  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption.value);
  };
  const closeModule = () => {
    setShowUpdate(false);
  };

  return (
    <div>
      {isLoading && <LoadingPage />}
      <div className='fixed z-40 top-0 overflow-y-auto left-0 w-full h-full   bg-black bg-opacity-90'>
    <div className="w-4/6 p-8  my-8  rounded-lg shadow-lg bg-white mx-auto">
    <div className=" bg-gray-200  rounded p-4 text-2xl font-semibold mb-4 rounded-t-lg text-center">
          Update Banner
          <button
              className="float-right text-gray-500 hover:text-gray-700"
              onClick={()=> closeModule()}
            >
              <CloseIcon />
            </button>
        </div>
        <div className="flex justify-center flex-col items-center">
          <div className="mx-7 p-4 flex  flex-col justify-center items-center">
            {filePreview ? (
              <img
                src={filePreview}
                alt="Selected File"
                className="w-64 h-40 rounded-2xl object-fit"
              />
            ) : newDownloadUrl ? (
              <img
                src={newDownloadUrl}
                alt="Selected File"
                className="w-64 h-40 rounded-2xl object-fit"
              />
            ) : (
              <label htmlFor="file">
                <img
                  src="https://www.freeiconspng.com/uploads/no-image-icon-6.png"
                  alt=""
                  className="w-64 h-40 rounded-2xl object-contain"
                />
              </label>
            )}
          </div>
          <div className="w-1/2">
            <div className="flex flex-wrap gap-6 justify-around flex-col">
              <div className="mx-7 p-4 flex  flex-col justify-center items-center">
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
              <div className="mx-7 p-4 flex  flex-col justify-center items-center">
              <label className="flex items-center gap-2 mb-5 text-lg font-medium ">
                Category Type:
              </label>
              <Select
              className="w-1/2  border-gray-400 rounded-md focus:outline-none focus:border-blue-500"
                value={selectedCategoryOption}
                onChange={handleCategoryChange}
                options={CategoryOptions}
              />
            </div>
              </div>
              <div className='flex justify-center items-center'>

              <button
                onClick={onUpdateBanner}
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
  )
}

export default UpdateBanner
