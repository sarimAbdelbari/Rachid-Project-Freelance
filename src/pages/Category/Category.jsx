import React, { useEffect, useState } from "react";
import { info_toast } from "../../util/toastNotification";
import {
  getDocs,
  collection,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, storage } from "../../firebase";
import { ref, getDownloadURL, deleteObject } from "firebase/storage";
import { useStateContext } from '../../contexts/ContextProvider';
import { DataGrid } from "@mui/x-data-grid";
import NewCategory from "./CRUD/NewCategory";
import UpdateCategory from "./CRUD/UpdateCategory";
import { FaEdit, FaTrash } from 'react-icons/fa';

const Category = () => {
  const [catigorieList, setCatigorieList] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const catigoriesCollectionRef = collection(db, 'catigories');
  const [isLoading, setIsLoading] = useState(false);
  const { showNew, setShowNew,tableControl, setTableControl , showUpdate, setShowUpdate  } = useStateContext();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await getDocs(catigoriesCollectionRef);
      let i = 0;
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        ID: i = i + 1,
      }));

      const imageUrlPromises = filteredData.map(async (category) => {
        if (category.imgreftitle) {
          try {
            const url = await getDownloadURL(ref(storage, category.imgreftitle));
            return { id: category.id, url };
          } catch (error) {
            console.error(`Error fetching image URL for category ID ${category.id}:`, error);
            return { id: category.id, url: null };
          }
        }
        return { id: category.id, url: null };
      });

      const imageUrls = await Promise.all(imageUrlPromises);
      const imageUrlMap = imageUrls.reduce((acc, { id, url }) => {
        acc[id] = url;
        return acc;
      }, {});

      setCatigorieList(filteredData);
      setImageUrls(imageUrlMap);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tableControl) {
      fetchData();
      setTableControl(false);
    }
    else {
      fetchData();
    }
  }, [tableControl, setTableControl]);

  const deleteCatigorie = async (id, imgreftitle) => {
    try {
      const catigorieDoc = doc(db, "catigories", id);
      await deleteDoc(catigorieDoc);
      if (imgreftitle) {
        const imageRef = ref(storage, imgreftitle);
        await deleteObject(imageRef);
      }
      info_toast("Category Has Been Deleted");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewCategory = () => {
    setShowNew(!showNew);
  };

  const handleUpdateCategory = (id, imgreftitle) => {
    setShowUpdate({ id, imgreftitle });
  };

  const columns = [
    { field: "ID", headerName: "ID", width: 50 },
    {
      field: 'imgreftitle',
      headerName: 'Image',
      width: 100,
      renderCell: (params) => (
        <div style={{ display: 'flex', alignItems: 'center', width: '300px', height: '300px', minHeight: '300px' }}>
          {imageUrls[params.id] ? (
            <img
              src={imageUrls[params.id]}
              alt=""
              style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%' }}
            />
          ) : (
            'Image Loading...'
          )}
        </div>
      ),
    },
    { field: "frtitle", headerName: "Fr Title", width: 120 },
    { field: "entitle", headerName: "En Title", width: 120 },
    { field: "artitle", headerName: "Ar Title", width: 120 },
    {
      field: "tags",
      headerName: "Tags",
      width: 250,
      renderCell: (params) => (
        <div style={{ width: '250px', overflowX: 'auto', padding: '0 5px' }}>
          {params.value.map((tag, index) => (
            <React.Fragment key={index}>
              "{tag}" ;
              {index < params.value.length - 1 && " "} {/* Add space if not the last item */}
            </React.Fragment>
          ))}
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <div className="flex">
          <FaEdit
            onClick={() => handleUpdateCategory(params.id, params.row.imgreftitle)}
            className="text-blue-500 hover:text-blue-700 cursor-pointer mx-2"
            style={{ fontSize: '24px' }}
          />
          <FaTrash
            onClick={() => deleteCatigorie(params.id, params.row.imgreftitle)}
            className="text-red-500 hover:text-red-700 cursor-pointer mx-2"
            style={{ fontSize: '24px' }}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      {showNew && <NewCategory />}
      {showUpdate && <UpdateCategory parameter={showUpdate} />}

      <div className='flex flex-col'>
        <div>
          <button onClick={handleNewCategory} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Add A Category
          </button>
        </div>
        <div style={{
          height: 500,
          width: "100%",
          boxShadow: "0px 0px 10px 0px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          backgroundColor: "#f8f7ff",
        }} className="mt-7">
          <DataGrid
            rows={catigorieList}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            checkboxSelection={false}
            loading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};  

export default Category;
