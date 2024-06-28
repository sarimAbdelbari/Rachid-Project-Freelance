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
import { FaEdit, FaTrash } from 'react-icons/fa';
import NewEmployee from "./CRUD/NewEmployee";
import UpdateEmployee from "./CRUD/UpdateEmployee";

const Employee = () => {
  const [imageUrls, setImageUrls] = useState({});
  const [employeeList, setEmployeeList] = useState([]);
  const employeeCollectionRef = collection(db, 'employee');
  const [isLoading, setIsLoading] = useState(false);
  const { showNew, setShowNew, showUpdate, setShowUpdate, tableControl, setTableControl } = useStateContext();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await getDocs(employeeCollectionRef);
      let i = 0;
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        ID: i = i + 1,
      }));

      const imageUrlPromises = filteredData.map(async (employee) => {
        if (employee.avatarRef) {
          try {
            const url = await getDownloadURL(ref(storage, employee.avatarRef));
            return { id: employee.id, url };
          } catch (error) {
            console.error(`Error fetching image URL for employee ID ${employee.id}:`, error);
            return { id: employee.id, url: null };
          }
        }
        return { id: employee.id, url: null };
      });

      const imageUrls = await Promise.all(imageUrlPromises);
      const imageUrlMap = imageUrls.reduce((acc, { id, url }) => {
        acc[id] = url;
        return acc;
      }, {});

      setEmployeeList(filteredData);
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

  const columns = [
    { field: "ID", headerName: "ID", width: 70 },
    {
      field: 'avatarRef',
      headerName: 'Image',
      width: 100,
      renderCell: (params) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {imageUrls[params.id] ? (
            <img
              src={imageUrls[params.id]}
              alt=""
              style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%' }}
            />
          ) : (
            'Image Loading...' // You can show a loading indicator here
          )}
        </div>
      ),
    },
    { field: "displayName", headerName: "Full Name", width: 200 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "phoneNumber", headerName: "Phone Number", width: 150 },
    { field: "city", headerName: "City", width: 150 },
    { field: "ocupation", headerName: "Occupation", width: 150 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <div className="flex">
          <FaEdit
            onClick={() => handleUpdateEmployee(params.id, params.row.avatarRef)}
            className="text-blue-500 hover:text-blue-700 cursor-pointer mx-2 "
            size={24}
            />
          <FaTrash
            onClick={() => deleteEmployee(params.id, params.row.avatarRef)}
            className="text-red-500 hover:text-red-700 cursor-pointer mx-2"
            size={24}
          />
        </div>
      ),
    },
  ];

  const deleteEmployee = async (id, avatarRef) => {
    try {
      const employeeDoc = doc(db, "employee", id);
      await deleteDoc(employeeDoc);
      if (avatarRef) {
        const imageRef = ref(storage, avatarRef);
        await deleteObject(imageRef);
      }
      info_toast("Employee Has Been Deleted");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewEmployee = () => {
    setShowNew(!showNew);
  };

  const handleUpdateEmployee = (id, avatarRef) => {
    setShowUpdate({ id, avatarRef });
  };

  return (
    <div>
      {showNew && <NewEmployee />}
      {showUpdate && <UpdateEmployee parameter={showUpdate} />}

      <div className='flex flex-col'>
        <div>
          <button onClick={handleNewEmployee} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Add An Employee
          </button>
        </div>
        <div
          style={{
            height: 500,
            width: "100%",
            overflowX: "auto", // Add overflow style
            boxShadow: "0px 0px 10px 0px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            backgroundColor: "#f8f7ff",
          }}
          className="mt-7"
        >
          <DataGrid
            rows={employeeList}
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

export default Employee;
