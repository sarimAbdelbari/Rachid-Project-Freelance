import React, { useEffect, useState } from "react";
import { info_toast } from "../../util/toastNotification";
import { getDocs, collection, deleteDoc, doc } from "firebase/firestore";
import { DataGrid } from "@mui/x-data-grid";
import { db, storage } from "../../firebase";
import { ref, getDownloadURL, deleteObject } from "firebase/storage";
import { useStateContext } from "../../contexts/ContextProvider";
import { FaEdit, FaTrash } from 'react-icons/fa';

import NewCustomer from "./CRUD/NewCustomer";
import UpdateCustomer from "./CRUD/UpdateCustomer";

const Customer = () => {
  const [customerList, setCustomerList] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const customerCollectionRef = collection(db, "clients");
  const { showNew, setShowNew, showUpdate, setShowUpdate ,tableControl, setTableControl} = useStateContext();

  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await getDocs(customerCollectionRef);
      let i = 0;
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        ID: (i = i + 1),
      }));

      const imageUrlPromises = filteredData.map(async (customer) => {
        if (customer.avatarRef) {
          try {
            const url = await getDownloadURL(
              ref(storage, customer.avatarRef)
            );
            return { id: customer.id, url };
          } catch (error) {
            console.error(
              `Error fetching image URL for customer ID ${customer.id}:`,
              error
            );
            return { id: customer.id, url: null };
          }
        }
        return { id: customer.id, url: null };
      });

      const imageUrls = await Promise.all(imageUrlPromises);
      const imageUrlMap = imageUrls.reduce((acc, { id, url }) => {
        acc[id] = url;
        return acc;
      }, {});

      setCustomerList(filteredData);
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

  const deleteCustomer = async (id, avatarRef) => {
    try {
      const customerDoc = doc(db, "clients", id);
      await deleteDoc(customerDoc);

      if (avatarRef) {
        const imageRef = ref(storage, avatarRef);
        await deleteObject(imageRef);
      }

      info_toast("Customer Has Been Deleted");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewCustomer = () => {
    setShowNew(!showNew);
  };

  const handleUpdateCustomer = (id, avatarRef) => {
    setShowUpdate({ id, avatarRef });
  };

  const columns = [
    { field: "ID", headerName: "ID", width: 70 },
    {
      field: "avatarRef",
      headerName: "Image",
      width: 100,
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          {imageUrls[params.id] ? (
            <img
              src={imageUrls[params.id]}
              alt=""
              style={{
                width: "50px",
                height: "50px",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
            ) : (
              <img
                src={`https://campaign.rand.org/wp-content/uploads/2020/04/placeholder-headshot.jpg`}
                alt=""
                style={{
                  width: "50px",
                  height: "50px",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
          )}
        </div>
      ),
    },
    { field: "fullName", headerName: "Full Name", width: 130 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "phoneNumber", headerName: "Phone Number", width: 150 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <div className="flex">
          <FaEdit
            onClick={() => handleUpdateCustomer(params.id, params.row.avatarRef)}
            className="text-blue-500 hover:text-blue-700 cursor-pointer mx-2"
            size={24}
          />
          <FaTrash
            onClick={() => deleteCustomer(params.id, params.row.avatarRef)}
            className="text-red-500 hover:text-red-700 cursor-pointer mx-2"
            size={24}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      {showNew && <NewCustomer />}
      {showUpdate && <UpdateCustomer parameter={showUpdate} />}

      <div className="flex flex-col">
        <div>
          <button
            onClick={handleNewCustomer}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add A Customer
          </button>
        </div>
        <div
          style={{
            height: 500,
            width: "100%",
            boxShadow: "0px 0px 10px 0px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            backgroundColor: "#f8f7ff",
          }}
          className="mt-7"
        >
          <DataGrid
            rows={customerList}
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

export default Customer;
