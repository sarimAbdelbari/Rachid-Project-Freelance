import React, { useEffect, useState } from "react";
import { sucess_toast } from "../../util/toastNotification";
import {
  getDocs,
  collection,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { FaEdit, FaTrash } from 'react-icons/fa';
import { db, storage } from "../../firebase";
import { ref, getDownloadURL, deleteObject } from "firebase/storage";
import { useStateContext } from '../../contexts/ContextProvider';
import { DataGrid } from "@mui/x-data-grid";
import NewBanner from "./CRUD/NewBanner";
import UpdateBanner from "./CRUD/UpdateBanner";

const Banner = () => {
  const [bannerList, setBannerList] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const bannerCollectionRef = collection(db, 'banner');
  const [isLoading, setIsLoading] = useState(false);
  const { showNew, setShowNew ,tableControl, setTableControl ,showUpdate, setShowUpdate } = useStateContext();


  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await getDocs(bannerCollectionRef);
      let i = 0;
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        ID: i = i + 1,
      }));

      const imageUrlPromises = filteredData.map(async (banner) => {
        if (banner.imgreftitle) {
          try {
            const url = await getDownloadURL(ref(storage, banner.imgreftitle));
            return { id: banner.id, url };
          } catch (error) {
            console.error(`Error fetching image URL for banner ID ${banner.id}:`, error);
            return { id: banner.id, url: null };
          }
        }
        return { id: banner.id, url: null };
      });

      const imageUrls = await Promise.all(imageUrlPromises);
      const imageUrlMap = imageUrls.reduce((acc, { id, url }) => {
        acc[id] = url;
        return acc;
      }, {});

      setBannerList(filteredData);
      setImageUrls(imageUrlMap);

      console.log("This Is The Bannnnnnneeer");
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


  const columns = [
    { field: "ID", headerName: "ID", width: 50 },
    {
      field: 'imgreftitle',
      headerName: 'Image',
      width: 150,
      height: 300,
      renderCell: (params) => (
        <div style={{ display: 'flex', alignItems: 'center', width: '300px', height: '300px', minHeight: '300px' }}>
          {imageUrls[params.id] ? (
            <img
              src={imageUrls[params.id]}
              alt=""
              style={{ width: '150px', height: '75px', margin: '3px', objectFit: 'fit', borderRadius: '5%' }}
            />
          ) : (
            'Image Loading...'
          )}
        </div>
      ),
    },
    { field: "categoryName", headerName: "Category Name", width: 150, height: 150 },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      height: 150,
      editable: true,
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <select
            value={params.row.status}
            onChange={(event) => handleStatusChange(event, params.id)}
            style={{
              width: 125,
              padding: "8px",
              borderRadius: "1px",
              color: "white",
              backgroundColor: getStatusBackgroundColor(params.row.status),
            }}
          >
            <option value="InActive">InActive</option>
            <option value="Active">Active</option>
          </select>
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
            onClick={() => handleUpdateBanner(params.id, params.row.imgreftitle)}
            className="text-blue-500 hover:text-blue-700 cursor-pointer mx-2"
            size={24}
          />
          <FaTrash
            onClick={() => deleteBanner(params.id, params.row.imgreftitle)}
            className="text-red-500 hover:text-red-700 cursor-pointer mx-2"
            size={24}
          />
        </div>
      ),
    },
  ];

  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case "InActive":
        return "#036494";
      case "Active":
        return "#47cd19";
      default:
        return "#036494";
    }
  };

  const handleStatusChange = async (event, id) => {
    const selectedValue = event.target.value;
    try {
      setIsLoading(true);

      const bannerDoc = doc(db, "banner", id);

      await updateDoc(bannerDoc, {
        status: selectedValue,
      });

      setBannerList((prevState) => {
        const updatedBanners = prevState.map((banner) => {
          if (banner.id === id) {
            return { ...banner, status: selectedValue };
          }
          return banner;
        });
        return updatedBanners;
      });

      sucess_toast("Status has been Updated successfully");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBanner = async (id, imgreftitle) => {
    try {
      const bannerDoc = doc(db, "banner", id);
      await deleteDoc(bannerDoc);
      if (imgreftitle) {
        const imageRef = ref(storage, imgreftitle);
        await deleteObject(imageRef);
      }
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewBanner = () => {
    setShowNew(!showNew);
  };

  const handleUpdateBanner = (id, imgreftitle) => {
    setShowUpdate({ id, imgreftitle });
  };

  return (
    <div>
      {showNew && <NewBanner />}
      {showUpdate && <UpdateBanner parameter={showUpdate} />}

      <div className='flex flex-col'>
        <div>
          <button onClick={handleNewBanner} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Add A Banner
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
            rows={bannerList}
            columns={columns}
            rowHeight={80}
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

export default Banner;
