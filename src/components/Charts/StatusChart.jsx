import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore'; 
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { db } from '../../firebase';



const StatusChart = () => {
  const [appointmentsData, setAppointmentsData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    // Fetch data from Firestore
    try {
      setIsLoading(true);
      const appointmentCollectionRef = collection(db, 'bookings');
      const data = await getDocs(appointmentCollectionRef);
      const appointments = data.docs.map((doc) => doc.data());

      // Filter appointments based on status ('Done' or 'Canceled')
      const filteredAppointments = appointments.filter(
        (appointment) => appointment.status === 'success' || appointment.status === 'canceled'
      );

      setAppointmentsData(filteredAppointments);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };


  const processData = () => {
    try {
      const monthlyData = {};

      appointmentsData.forEach((appointment) => {
        const date = new Date(appointment.updatedAt.toDate());
        const month = `${date.getFullYear()}-${date.getMonth() + 1}`;

        if (!monthlyData[month]) {
          monthlyData[month] = { month, success: 0, canceled: 0 };
        }

        if (appointment.status === 'success') {
          monthlyData[month].success++;
        } else if (appointment.status === 'canceled') {
          monthlyData[month].canceled++;
        }
      });

      const months = Object.values(monthlyData);
      setChartData(months);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // Fetch data when the component mounts
    fetchData();
  }, []);

  useEffect(() => {
    // Process data when appointmentsData changes
    processData();
  }, [appointmentsData]);

  return (
    <div>
      {!isLoading && (
        <div 
        style={{ height: 500, width: "100%", zIndex: 1, overflowX: "auto" ,
        boxShadow: "0px 0px 10px 0px rgba(0, 0, 0, 0.1)", 
        borderRadius: "8px",
        backgroundColor: "#f8f7ff",
      }} className='flex flex-col items-center justify-center my-6'>
        <div className=" bg-gray-200  rounded p-4 text-2xl font-medium mb-4 rounded-t-lg text-center">
          Bookings Status Chart
        </div>
      <BarChart width={600} height={400} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="success" fill="#00D43D" />
        <Bar dataKey="canceled" fill="#E91621" />
      </BarChart>
        </div>
      )}
    </div>
  );
};

export default StatusChart;
