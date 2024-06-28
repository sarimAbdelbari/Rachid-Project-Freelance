import { MdOutlineSupervisorAccount } from "react-icons/md";
import { HiOutlineRefresh } from "react-icons/hi";
import { FiBarChart } from "react-icons/fi";
import { FaUser } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import LoadingPage from '../util/LoadingPage';

const PanalBoard = () => {
  const [totalCustomers, setTotalCustomers] = useState("");
  const [totalEmployees, setTotalEmployees] = useState("");

  const [totalApointmentsDone, setTotalApointmentsDone] = useState("");
  const [totalApointmentsCanceled, setTotalApointmentsCanceled] = useState("");
  const [newCustomers, setNewCustomers] = useState("");
  const [newEmployees, setNewEmployees] = useState([]);
  
  const [apointmentsDone, setApointmentsDone] = useState([]);
  const [apointmentsCanceled, setApointmentsCanceled] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const customerCollectionRef = collection(db, "clients");
  const employeeCollectionRef = collection(db, "employee");
  const apointmentCollectionRef = collection(db, 'bookings');

  const fetchDataCustomer = async () => {
    try {
      setIsLoading(true);
      const data = await getDocs(customerCollectionRef);
      const customers = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      setTotalCustomers(customers.length);

      // Calculate the new customers added this month
      const currentDate = new Date();
      const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      const newCustomersThisMonth = customers.filter((customer) => {
        const createdAt = customer.createdAt.toDate();
        return createdAt >= currentMonthStart;
      });

      setNewCustomers(newCustomersThisMonth.length);

      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const fetchDataEmployee = async () => {
    try {
      setIsLoading(true);
      const data = await getDocs(employeeCollectionRef);
      const employeesData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
  
      const currentDate = new Date();
      const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  
      const newEmployeesThisMonth = employeesData.filter((employee) => {
        if (employee.createdAt && employee.createdAt.toDate) {
          const createdAt = employee.createdAt.toDate();
          return createdAt >= currentMonthStart;
        } else {
          console.warn(`Employee ${employee.id} has an invalid createdAt field`);
          return false;
        }
      });
  
      setNewEmployees(newEmployeesThisMonth.length);
      setTotalEmployees(employeesData.length);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };
  

  const fetchDataApointment = async () => {
    try {
      setIsLoading(true);
      const data = await getDocs(apointmentCollectionRef);
      const apointments = data.docs.map((doc) => doc.data());

      // Filter appointments based on status ('Done' or 'Canceled')
      const filteredApointmentsDone = apointments.filter(
        (apointment) => apointment.status === 'success' 
      );

      const filteredApointmentsCanceled = apointments.filter(
        (apointment) => apointment.status === 'canceled'
      );

      setTotalApointmentsDone(filteredApointmentsDone.length);
      setTotalApointmentsCanceled(filteredApointmentsCanceled.length);


      // Calculate the new customers added this month
      const currentDate = new Date();
      const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      const newApointmentDoneThisMonth = filteredApointmentsDone.filter((apointment) => {
        const UpdatedAt = apointment.updatedAt.toDate();
        return UpdatedAt >= currentMonthStart;
      });

      const newApointmentCanceledThisMonth = filteredApointmentsCanceled.filter((apointment) => {
        const UpdatedAt = apointment.updatedAt.toDate();
        return UpdatedAt >= currentMonthStart;
      });


      setApointmentsDone(newApointmentDoneThisMonth.length);
      setApointmentsCanceled(newApointmentCanceledThisMonth.length);

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataCustomer();
    fetchDataEmployee();
    fetchDataApointment();
  }, []);

  const calculatePercentageChange = (newCount, totalCount) => {
    if (totalCount === 0) {
      return 0;
    }
    const percentageChange = ((newCount * 100) / totalCount);
    return percentageChange.toFixed(2);
  };

  return (
    <div>
      {isLoading && <LoadingPage />} 
      <div className="flex  md:mt-20 sm:mt-20 flex-wrap justify-center gap-5 items-center">
        <div className="bg-gray-100 drop-shadow-xl h-44 sm:w-56 md:w-56 p-4 pt-9 rounded-2xl ">
          <button
            type="button"
            style={{ color: "white", backgroundColor: "#3B82F6" }}
            className="text-2xl opacity-0.9 rounded-full  p-4 hover:drop-shadow-xl"
          >
            <MdOutlineSupervisorAccount />
          </button>
          <p className="mt-3">
            <span className="text-lg font-semibold">{totalCustomers}</span>
            <span className={`text-sm ${calculatePercentageChange(newCustomers, totalCustomers) >= 0 ? 'text-green-600' : 'text-red-600'} ml-2`}>
              {calculatePercentageChange(newCustomers, totalCustomers)}%
            </span>
          </p>
          <p className="text-sm text-gray-500  mt-1">Customers</p>
        </div>
        <div className="bg-gray-100 drop-shadow-xl h-44 sm:w-56 md:w-56 p-4 pt-9 rounded-2xl ">
          <button
            type="button"
            style={{ color: "#F78208", backgroundColor: "#FCD2A6" }}
            className="text-2xl opacity-0.9 rounded-full  p-4 hover:drop-shadow-xl"
          >
            <FaUser />
          </button>
          <p className="mt-3">
            <span className="text-lg font-semibold">{totalEmployees}</span>
            <span className={`text-sm ${calculatePercentageChange(newEmployees, totalEmployees) >= 0 ? 'text-green-600' : 'text-red-600'} ml-2`}>
              {calculatePercentageChange(newEmployees, totalEmployees)}%
            </span>
          </p>
          <p className="text-sm text-gray-500  mt-1">Employees</p>
        </div>
        <div className="bg-gray-100 drop-shadow-xl h-44 sm:w-56 md:w-56 p-4 pt-9 rounded-2xl ">
          <button
            type="button"
            style={{ color: "#15EA7D", backgroundColor: "#bef9db" }}
            className="text-2xl opacity-0.9 rounded-full  p-4 hover:drop-shadow-xl"
          >
            <FiBarChart />
          </button>
          <p className="mt-3">
            <span className="text-lg font-semibold">{totalApointmentsDone}</span>
            <span className={`text-sm ${calculatePercentageChange(apointmentsDone, totalApointmentsDone) >= 0 ? 'text-green-600' : 'text-red-600'} ml-2`}>
              {calculatePercentageChange(apointmentsDone, totalApointmentsDone)}%
            </span>
          </p>
          <p className="text-sm text-gray-500  mt-1">Bookings Success</p>
        </div>
        <div className="bg-gray-100 drop-shadow-xl h-44 sm:w-56 md:w-56 p-4 pt-9 rounded-2xl ">
          <button
            type="button"
            style={{ color: "#F21620", backgroundColor: "#F9898E" }}
            className="text-2xl opacity-0.9 rounded-full  p-4 hover:drop-shadow-xl"
          >
            <HiOutlineRefresh />
          </button>
          <p className="mt-3">
            <span className="text-lg font-semibold">{totalApointmentsCanceled}</span>
            <span className={`text-sm ${calculatePercentageChange(apointmentsCanceled, totalApointmentsCanceled) >= 0 ? 'text-green-600' : 'text-red-600'} ml-2`}>
              {calculatePercentageChange(apointmentsCanceled, totalApointmentsCanceled)}%
            </span>
          </p>
          <p className="text-sm text-gray-500  mt-1">Bookings Cancelled</p>
        </div>
      </div>
    </div>
  );
};

export default PanalBoard;
