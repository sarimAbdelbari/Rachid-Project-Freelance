import React, { useState } from 'react';
import { db, storage } from '../../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import DriveFolderUploadOutlinedIcon from '@mui/icons-material/DriveFolderUploadOutlined';
import CloseIcon from '@mui/icons-material/Close';
import {sucess_toast,error_toast} from '../../../util/toastNotification';
import { useStateContext } from '../../../contexts/ContextProvider';
import LoadingPage from "../../../util/LoadingPage";
import {v4} from "uuid";

const NewCategory = () => {
  const [newFrTitle, setNewFrTitle] = useState('');
  const [newEnTitle, setNewEnTitle] = useState('');
  const [newArTitle, setNewArTitle] = useState('');
  const [fileUpload, setFileUpload] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const { isLoading, setIsLoading ,setShowNew,setTableControl} = useStateContext();


  const catigoriesCollectionRef = collection(db, 'catigories');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setFileUpload(selectedFile);

      const previewURL = URL.createObjectURL(selectedFile);
      setFilePreview(previewURL);
    }
  };
  
  const addTag = () => {
    if (tagInput.trim() !== '') {
      setTags([...tags, tagInput.trim()]);
      setTagInput(''); // Clear the input field
    }
  };

  const removeTag = (index) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  }; 

  
  const onSubmitcatigorie = async () => {
    try {
      setIsLoading(true); // Start loading

      let downloadURL = '';
    
      // ! Unique id
      const imgId = v4();
      
      if (fileUpload) {
        const filesFolderRef = ref(storage, `categories_imgs/${imgId}`);
        // const filesFolderRef = ref(storage, `projectFiles/${fileUpload.name}`);
        await uploadBytes(filesFolderRef, fileUpload);

        downloadURL = await getDownloadURL(filesFolderRef);
        // !
      }

      await addDoc(catigoriesCollectionRef, {
        frtitle: newFrTitle, 
        entitle: newEnTitle,
        artitle: newArTitle,
        imgreftitle: `categories_imgs/${imgId}`,
        tags: tags,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      // ! upload the image 

      sucess_toast('Categories have been added successfully');

     
      setNewFrTitle('');
      setNewEnTitle('');
      setNewArTitle('');
      setFileUpload(null);
      setFilePreview(null);
      setTags([]);
      setTableControl(false);
    } catch (err) {
      console.error(err);
      error_toast("An error occurred while adding categories");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };
  const closeModule = () => {
    setShowNew(false);
  };
  return (
    <div>
    {isLoading  && <LoadingPage />}
    <div className='fixed z-40 top-0 overflow-y-auto left-0 w-full h-full   bg-black bg-opacity-90'>
    <div className="w-4/6 p-8  my-8  rounded-lg shadow-lg bg-white mx-auto">
    <div className=" bg-gray-200  rounded p-4 text-2xl font-semibold mb-4 rounded-t-lg text-center">
          New Category
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
                <label className="flex items-center gap-2">TitleFr :</label>
                <input
                  type="text"
                  placeholder="plombier"
                  className="w-full p-2 border border-gray-400 rounded-md focus:outline-none focus:border-blue-500"
                  value={newFrTitle}
                  onChange={(e) => setNewFrTitle(e.target.value)}
                />
              </div>
              <div className="formInput">
                <label className="flex items-center gap-2">TitleEn :</label>
                <input
                  type="text"
                  placeholder="plumber"
                  className="w-full p-2 border border-gray-400 rounded-md focus:outline-none focus:border-blue-500"
                  value={newEnTitle}
                  onChange={(e) => setNewEnTitle(e.target.value)}
                />
              </div>
              <div className="formInput">
                <label className="flex items-center gap-2">TitleAr :</label>
                <input
                  type="text"
                  placeholder="سباك"
                  className="w-full p-2 border border-gray-400 rounded-md focus:outline-none focus:border-blue-500"
                  value={newArTitle}
                  onChange={(e) => setNewArTitle(e.target.value)}
                />
              </div>
              <div className="formInput">
        <label className="flex items-center gap-2">Tags:</label>
        <input
          type="text"
          placeholder="Enter tags,(press Enter To Add The Tag)"
          className="w-full p-2 border border-gray-400 rounded-md focus:outline-none focus:border-blue-500"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              addTag();
            }
          }}
          />
        <div className="flex flex-wrap mt-2">
          {tags.map((tag, index) => (
            <div key={index} style={{background:'#0095F9'}} className="px-3 py-2 m-2  hover:bg-blue-700 font-medium text-white   rounded-2xl relative">
              <p className='m-2'>{tag}</p>
              <button
                className="tagRemoveButton absolute top-1 right-1"
                onClick={() => removeTag(index)}
              >
                <CloseIcon style={{ color: 'black' ,fontSize: '18px' , fontWeight:'bold'}} />
              </button>
            </div>
          ))}
        </div>
      </div>
              <button
                onClick={onSubmitcatigorie}
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

export default NewCategory;


