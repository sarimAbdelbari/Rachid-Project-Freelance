import React, { useState, useEffect } from "react";
import { db, storage } from "../../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { sucess_toast, error_toast } from "../../../util/toastNotification";
import { useStateContext } from "../../../contexts/ContextProvider";
import LoadingPage from "../../../util/LoadingPage";

const UpdateCategory = (props) => {
  const { id, imgreftitle } = props.parameter;
  const [newFrTitle, setNewFrTitle] = useState("");
  const [newEnTitle, setNewEnTitle] = useState("");
  const [newArTitle, setNewArTitle] = useState("");
  const [newDownloadUrl, setNewDownloadUrl] = useState("");
  const [fileUpload, setFileUpload] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const { isLoading, setIsLoading, setShowUpdate } = useStateContext();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setFileUpload(selectedFile);

      const previewURL = URL.createObjectURL(selectedFile);
      setFilePreview(previewURL);
    }
  };

  const addTag = () => {
    if (tagInput.trim() !== "") {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (index) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };

  const getCatigorieListUpdate = async (id) => {
    try {
      const catigorieDocRef = doc(db, "catigories", id);

      const docSnap = await getDoc(catigorieDocRef);

      if (docSnap.exists()) {
        const catigorieData = { ...docSnap.data(), id: docSnap.id };

        setNewFrTitle(catigorieData.frtitle);
        setNewEnTitle(catigorieData.entitle);
        setNewArTitle(catigorieData.artitle);
        setTags(catigorieData.tags);
        const downloadURL1 = await getDownloadURL(
          ref(storage, catigorieData.imgreftitle)
        );
        setNewDownloadUrl(downloadURL1);
      } else {
        console.log(`Document with ID ${id} does not exist.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getCatigorieListUpdate(id);
  }, [id]);

  const onUpdatecatigorie = async () => {
    try {
      setIsLoading(true);

      const catigoriesDoc = doc(db, "catigories", id);

      let updatedData = {
        frtitle: newFrTitle,
        entitle: newEnTitle,
        artitle: newArTitle,
        tags: tags,
        updatedAt: new Date(),
      };

      if (fileUpload) {
        const filesFolderRef = ref(storage, imgreftitle);
        await uploadBytes(filesFolderRef, fileUpload);

        const downloadURL = await getDownloadURL(filesFolderRef);
        updatedData = { ...updatedData, imgreftitle: imgreftitle };
      }

      await updateDoc(catigoriesDoc, updatedData);

      sucess_toast("Category has been updated successfully");
    } catch (err) {
      console.error(err);
      error_toast("An error occurred while updating the category");
    } finally {
      setIsLoading(false);
    }
  };
  const closeModule = () => {
    setShowUpdate(false);
  };

  return (
    <div>
      {isLoading && <LoadingPage />}
      <div className="fixed z-40 top-0 overflow-y-auto left-0 w-full h-full   bg-black bg-opacity-90">
        <div className="w-4/6 p-8 my-8  rounded-lg shadow-lg bg-white mx-auto">
          <div className=" bg-gray-200  rounded p-4 text-2xl font-semibold mb-4 rounded-t-lg text-center">
            Update Category
            <button
              className="float-right text-gray-500 hover:text-gray-700"
              onClick={() => closeModule()}
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
                        if (e.key === "Enter") {
                          addTag();
                        }
                      }}
                    />
                    <div className="flex flex-wrap mt-2">
                      {tags.map((tag, index) => (
                        <div
                          key={index}
                          style={{ background: "#0095F9" }}
                          className="px-3 py-2 m-2  hover:bg-blue-700 font-medium text-white   rounded-2xl relative"
                        >
                          <p className="m-2">{tag}</p>
                          <button
                            className="tagRemoveButton absolute top-1 right-1"
                            onClick={() => removeTag(index)}
                          >
                            <CloseIcon
                              style={{
                                color: "black",
                                fontSize: "18px",
                                fontWeight: "bold",
                              }}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={onUpdatecatigorie}
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

export default UpdateCategory;
