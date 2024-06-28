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


const CustomersGrowthChart = () => {
  const [customerList, setCustomerList] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const customerCollectionRef = collection(db, "clients");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await getDocs(customerCollectionRef);
      const customers = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      setCustomerList(customers);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const processData = () => {
    try {
      const monthlyData = {};

      customerList.forEach((customer) => {
        const date = new Date(customer.createdAt.toDate());
        const month = `${date.getFullYear()}-${date.getMonth() + 1}`;

        if (!monthlyData[month]) {
          monthlyData[month] = 0;
        }

        monthlyData[month]++;
      });

      const months = Object.keys(monthlyData);
      const customerCounts = months.map((month) => monthlyData[month]);

      setChartData(
        months.map((month, index) => ({
          month,
          customers: customerCounts[index],
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
  }, [customerList]);


  
  return (
    <div>
      {!isLoading && (
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
            className="flex flex-col items-center justify-center  my-6"
          >
            <div className=" bg-gray-200  rounded p-4 text-2xl font-medium mb-4 rounded-t-lg text-center">
              Customers Growth Chart
            </div>
            <LineChart
              width={600}
              height={400}
              data={[{ month: "", customers: 0 }, ...chartData]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="customers"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersGrowthChart;
