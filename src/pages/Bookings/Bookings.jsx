import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  getDocs,
  getDoc,
  doc,
  collection,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import {
  info_toast,
  error_toast,
  sucess_toast,
} from "../../util/toastNotification";
import { useStateContext } from "../../contexts/ContextProvider";
import LoadingPage from "../../util/LoadingPage";
import UpdateApointment from "./CRUD/UpdateApointment";
import Facture from "./CRUD/Facture";
import SearchEmployee from "../../components/SearchEmployee";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { FaTrash, FaEye } from 'react-icons/fa';
import { MdOutlinePriceChange } from "react-icons/md";
const Bookings = () => {

  const [apointmentList, setApointmentList] = useState([]);
  const [editRowsModel, setEditRowsModel] = useState({});
  const { showUpdate, setShowUpdate, tableControl, setTableControl, showFacture, setShowFacture } = useStateContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  
  const apointmentCollectionRef = collection(db, "bookings");
  
  const fetchData = async () => {
    setIsLoadingTable(true);
    
    
    try {

      const querySnapshot = await getDocs(apointmentCollectionRef);

      const appointments = await Promise.all(
        querySnapshot.docs.map(async (apointmentDoc , index) => {
          const apointmentData = apointmentDoc.data(); 
          const customerDoc = await getDoc(doc(db, "clients", apointmentData.clientId));
          const customerData = customerDoc.exists() ? customerDoc.data() : {};

          // ? Start From Here Category Fetch
          const categoryDoc = await getDoc(doc(db, "catigories", apointmentData.category));
          const categoryData = categoryDoc.exists() ? categoryDoc.data() : {};

          const employeeData = apointmentData.employeeId ? (await getDoc(doc(db, "employee", apointmentData.employeeId))).data() || {} : {};
          

          return {

            id: apointmentDoc.id,
            Id:  index + 1,
            customerName: customerData.fullName || "",
            customerPhoneNumber: customerData.phoneNumber || "",
            customerImage: customerData.avatarRef || "",
            category: categoryData.frtitle || "",
            date: apointmentData.dueDate?.toDate() || "",
            moreInfo: apointmentData.moreInfo || "",
            status: apointmentData.status || "",
            employeeName: employeeData.displayName || "",
            employeePhoneNumber: employeeData.phoneNumber || "",
            totalPrice : apointmentData.totalPrice || "",
            
          };
        })
      );
  
      setApointmentList(appointments);
      
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingTable(false);
    }
  };
  

  const handleStatusChange = async (event, id) => {
    const selectedValue = event.target.value;
    try {
      setIsLoadingTable(true);
      const apointmentDoc = doc(db, "bookings", id);
      await updateDoc(apointmentDoc, {
        status: selectedValue,
        updatedAt: new Date(),
      });
      setApointmentList((prevState) => prevState.map((apointment) => apointment.id === id ? { ...apointment, status: selectedValue } : apointment));
      sucess_toast("Status has been Updated successfully");
    } catch (err) {
      console.error(err);
      error_toast("An error occurred while updating the status");
    } finally {
      setIsLoadingTable(false);
    }
  };

  const handleSelectChange = async (selectedEmployee, id) => {
    try {
      const { id: employeeId } = selectedEmployee;
      const apointmentDoc = doc(db, "bookings", id);
      await updateDoc(apointmentDoc, {
        employeeId: employeeId,
        updatedAt: new Date(),
      });
      fetchData();
      sucess_toast("Employee ID and name have been added to the appointment successfully");
    } catch (err) {
      console.error(err);
      error_toast("An error occurred while adding the appointment");
    } finally {
      setIsLoading(false);
    }
  };

  const options = [
    { value: "pending", label: "Pending" },
    { value: "inProgress", label: "In-Progress" },
    { value: "success", label: "Success" },
    { value: "canceled", label: "Canceled" },
  ];

  const getBgColor = (value) => {
    switch (value) {
      case "pending":
        return "#1CA1E3";
      case "inProgress":
        return "#ff7900";
      case "success":
        return "#62D715";
      case "canceled":
        return  "#FF1616";
      default:
        return "#000000";
    }
  };


  const renderInfoCell = (params) => (
    <div style={{ width: '200px', overflowX: 'auto', padding: '5px' }}>
      <p>{params.row.moreInfo}</p>
    </div>
  );

  const renderDateCell = (params) => (
    <div style={{ width: '250px', overflowX: 'auto', padding: '5px' }}>
      <p>{params.row.date ? params.row.date.toString() : ''}</p>
    </div>
  );

  const renderStatusCell = (params) => (
    <Select
      value={params.row.status}
      onChange={(event) => handleStatusChange(event, params.id)}
      style={{
        width: "100%",
        height: "80%",
        margin: "2px",
        paddingRight: "0px",
        borderRadius: "15px",
        backgroundColor: getBgColor(params.row.status),
        color: "white",
      }}
      label="Status"
    >
      {options.map((option) => (
        <MenuItem
          key={option.value}
          value={option.value}
          style={{ backgroundColor: getBgColor(option.value), borderRadius: "2px", color: "white", margin: "5px" }}
        >
          {option.label}
        </MenuItem>
      ))}
    </Select>
  );

  const renderSelectAgentCell = (params) => (

    <SearchEmployee
      selectedValue={params.row.employeePhoneNumber ? params.row.employeePhoneNumber : "Select Agent"}
      parameter={params.id}
      category={params.row.category}
      onChange={(value) => handleSelectChange(value, params.id)}
      hasPhoneNumber={params.row.employeePhoneNumber}
      />
  );

  const renderActionsCell = (params) => (
    <div className="flex">
      <FaEye
        onClick={() => factureApear(params.id)}
        className="text-gray-700 hover:text-gray-800 cursor-pointer mx-2"
        size={24}
      />
    <MdOutlinePriceChange
      onClick={() => handleUpdateApointment(params.id)}
      className="text-blue-500 hover:text-blue-700 cursor-pointer mx-2 "
      size={24}
      />
    <FaTrash
      onClick={() => deleteApointment(params.id)}
      className="text-red-500 hover:text-red-700 cursor-pointer mx-2"
      size={24}
    />
  </div>
  );

  const columns = [
    { field: "Id", headerName: "ID", width: 50 },
    { field: "customerName", headerName: "Customer Name", width: 150 },
    { field: "customerPhoneNumber", headerName: "Customer Phone Number", width: 200 },
    { field: "category", headerName: "Category", width: 150 },
    { field: "date", headerName: "Date And Time", width: 250 , renderCell: renderDateCell },
    { field: "moreInfo", headerName: "Info", width: 200, renderCell: renderInfoCell },
    { field: "status", headerName: "Status", width: 160, height: 150, editable: true, renderCell: renderStatusCell },
    { field: "employeePhoneNumber", headerName: "Select The Agent", width: 150, renderCell: renderSelectAgentCell },
    { field: "employeeName", headerName: "Employee Name", width: 200 },
    { field: "totalPrice", headerName: "Price", width: 200 },
    { field: "actions", headerName: "Actions", width: 200, renderCell: renderActionsCell },
  ];

  const deleteApointment = async (id) => {
    try {
      const apointmentDoc = doc(db, "bookings", id);
      await deleteDoc(apointmentDoc);
      info_toast("Apointment Has Been Deleted");
      fetchData();
    } catch (err) {
      console.error(err);
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


  const handleUpdateApointment = (id) => {
    setShowUpdate({ id });
  };

  const factureApear = (id) => {
    setShowFacture({ id });
  };

  return (
    <div>
      {isLoading && <LoadingPage />}
      {showUpdate && <UpdateApointment parameter={showUpdate} />}
      {showFacture && <Facture parameter={showFacture} />}

      <div className="flex flex-col">
        <div
          style={{
            height: 500,
            width: "100%",
            zIndex: 1,
            overflowX: "auto",
            boxShadow: "0px 0px 10px 0px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            backgroundColor: "#f8f7ff",
          }}
          className="mt-7"
        >
          <DataGrid
            rows={apointmentList}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            isCellEditable={(params) => params.field === "status"}
            loading={isLoadingTable}
            editRowsModel={editRowsModel}
            onEditRowsModelChange={(model) => setEditRowsModel(model)}
          />
        </div>
      </div>
    </div>
  );
};

export default Bookings;

