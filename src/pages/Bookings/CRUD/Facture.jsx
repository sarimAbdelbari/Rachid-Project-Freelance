import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { useStateContext } from "../../../contexts/ContextProvider";
import LoadingPage from "../../../util/LoadingPage";
import CloseIcon from "@mui/icons-material/Close";

const Facture = (props) => {
  const { id } = props.parameter;

  const [customerData, setCustomerData] = useState({});
  const [employeeData, setEmployeeData] = useState({});
  const [categoryData, setCategoryData] = useState("");
  const [apointmentData, setApointmentData] = useState({});

  const [isLoading, setIsLoading] = useState(true);
  const { setShowFacture } = useStateContext();


  const fetchData = async () => {
    try {
      const apointmentDocRef = doc(db, "bookings", id);
      const apointmentDoc = await getDoc(apointmentDocRef);


      if (apointmentDoc.exists()) {
        const apointmentData = apointmentDoc.data();
        const customerDocRef = doc(db, "clients", apointmentData.clientId);
        
        const employeeDocRef = apointmentData.employeeId
          ? doc(db, "employee", apointmentData.employeeId)
          : null;
         
        
        const categoryDoc = await getDoc(doc(db, "catigories", apointmentData.category));
        

      
  
        const [customerDoc, employeeDoc] = await Promise.all([
          getDoc(customerDocRef),
          employeeDocRef ? getDoc(employeeDocRef) : Promise.resolve(null),
        ]);
  
        setCustomerData(customerDoc.data() || {});

        setApointmentData(apointmentData || {});

        
         
        setCategoryData(categoryDoc.data() || {});
        

        setEmployeeData(employeeDoc ? employeeDoc.data() : {});
        
      } else {
        console.log(`Document with ID ${id} does not exist.`);
      }
    } catch (error) {
      console.error("Error fetching facture data: ", error);
    } finally {
      setIsLoading(false);
    }
  };
  

  useEffect(() => {
    fetchData();
  }, [id]);

  const closeModule = () => {
    setShowFacture(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="fixed z-40 top-0 overflow-y-auto left-0 w-full h-full bg-black bg-opacity-90">
      <div className="w-4/6 p-8 my-8 rounded-lg shadow-lg bg-white mx-auto">
        <div className="bg-gray-800 rounded p-4 text-white text-2xl font-semibold mb-4 rounded-t-lg text-center">
          Invoice
          <button
            className="float-right text-gray-300 hover:text-gray-500"
            onClick={closeModule}
          >
            <CloseIcon />
          </button>
        </div>
        <div className="flex justify-center flex-col items-center">
          <table className="w-full mb-4">
            <tbody>
              <TableRow label="Customer:" value={customerData.fullName || " "} />
              <TableRow label="Phone:" value={customerData.phoneNumber || " "} />
              <TableRow label="Employee:" value={employeeData.displayName || " "} />
              <TableRow label="Phone:" value={employeeData.phoneNumber || " "} />
              <TableRow label="Category:" value={categoryData.frtitle || " "} />
              <TableRow label="Status:" value={apointmentData.status || " "} />
              <TableRow label="Date:" value={apointmentData.dueDate.toDate().toString() || " "} />
            </tbody>
          </table>
          {/* Additional Details */}
          <div className="mb-4 text-center">
            <p className="text-md mb-4 text-gray-600">Job Details: {apointmentData.moreInfo}</p>
            <p className="text-xl font-semibold  text-[#1F2937]">Price: <span className="font-medium text-black">{apointmentData.totalPrice}</span> </p>
          </div>
          {/* Date of Printing */}
          <div className="text-center">
            <p className="text-md text-gray-600">
              Date of Printing: {new Date().toLocaleDateString()} , {new Date().toLocaleTimeString() }
            </p> 
          </div>
        </div>
        <div className="text-center mt-4">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
            onClick={handlePrint} 
          >
            Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

const TableRow = ({ label, value }) => (
  <tr>
    <td className="text-center pr-2 font-semibold text-gray-800">{label}</td>
    <td className="text-left pl-2">{value}</td>
  </tr>
);

export default Facture;
