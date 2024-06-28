import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { db } from "../../firebase";

const EmployeeGrowthChart = () => {
  const [employeeList, setEmployeeList] = useState([]);
  const [chartData, setChartData] = useState([]);

  const employeeCollectionRef = collection(db, "employee");

  const fetchData = async () => {
    try {
      const data = await getDocs(employeeCollectionRef);
      const employees = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      setEmployeeList(employees);
    } catch (error) {
      console.error(error);
    }
  };

  const processData = () => {
    try {
      const monthlyData = {};

      employeeList.forEach((employee) => {
        if (employee.createdAt && employee.createdAt.toDate) {
          const date = new Date(employee.createdAt.toDate());
          const month = `${date.getFullYear()}-${date.getMonth() + 1}`;

          if (!monthlyData[month]) {
            monthlyData[month] = 0;
          }

          monthlyData[month]++;
        } else {
          console.warn(`Employee ${employee.id} has an invalid createdAt field`);
        }
      });

      const months = Object.keys(monthlyData);
      const employeeCounts = months.map((month) => monthlyData[month]);

      setChartData(
        months.map((month, index) => ({
          month,
          employees: employeeCounts[index],
        }))
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    processData();
  }, [employeeList]);

  return (
    <div>
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
        className="flex flex-col items-center justify-center my-6"
      >
        <div className="bg-gray-200 rounded p-4 text-2xl font-medium mb-4 rounded-t-lg text-center">
          Employees Growth Chart
        </div>
        <LineChart
          width={600}
          height={400}
          data={[{ month: "", employees: 0 }, ...chartData]}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="employees"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ r: 5 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </div>
    </div>
  );
};

export default EmployeeGrowthChart;
