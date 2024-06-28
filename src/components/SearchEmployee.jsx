import React, { useState, useEffect } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { getDocs, collection, query, where  } from "firebase/firestore";
import { db } from "../firebase";

const SearchEmployee = ({ selectedValue, onChange, parameter, category ,hasPhoneNumber }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchText, setSearchText] = useState("");

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getEmployeeId = async (selectedEmployee) => {
    try {
      const employeeCollectionRef = collection(db, "employee");
      const querySnapshot = await getDocs(
        query(
          employeeCollectionRef,
          where("displayName", "==", selectedEmployee)
        )
      );

      if (!querySnapshot.empty) {
        const employeeDoc = querySnapshot.docs[0];
        return employeeDoc.id;
      } else {
        console.log("No employee found with the given name");
        return null;
      }
    } catch (error) {
      console.error("Error getting employee ID: ", error);
      throw error;
    }
  };

  const handleMenuItemClick = async (selectedEmployee) => {
    const employeeId = await getEmployeeId(selectedEmployee);
    if (employeeId !== null) {
      onChange({ id: employeeId, name: selectedEmployee });
    }
    handleClose();
  };


  const employeeCollectionRef = collection(db, "employee");
  const [employeeList, setEmployeeList] = useState([]);

  const optionsEmployee = employeeList.map((employee) => ({
    value: employee, 
    label: employee, 
  }));

  const filteredOptions = optionsEmployee.filter((option) =>
    option.value.includes(searchText.toLowerCase())
  );

  const getEmployeeOptionsList = async (category) => {
    try {

      const data = await getDocs(employeeCollectionRef);
      const filteredData = data.docs
        .map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))
        .filter((employee) => employee.ocupation === category);

      const fullName = filteredData.map((employee) => {
        return `${employee.displayName}`;
      });

      setEmployeeList(fullName);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {

    getEmployeeOptionsList(category); 
    
  }, [category]);


  return (
    <div className="relative inline-block">
      <Button
        style={{
          backgroundColor: hasPhoneNumber ? '#47cd19' : '#3B82F6',
          color: "white",
          padding: "8px 0px",
          textAlign: "center",
          borderRadius: "4px",
          cursor: "pointer",
          width:"140px"
        }}
        onClick={handleClick}
        variant="outlined"
      >
        {selectedValue}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        style={{
          position: "absolute",
          marginTop: "0.5rem",
          borderRadius: "8px",
        }}
      >
        <TextField
          label="Search"
          variant="outlined"
          margin="dense"
          fullWidth
          onChange={(e) => setSearchText(e.target.value)}
        />
        {filteredOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleMenuItemClick(option.value)}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default SearchEmployee;
