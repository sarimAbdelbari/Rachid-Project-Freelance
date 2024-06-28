import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

const CategoryPieChart = () => {
  const [apointmentCategories, setApointmentCategories] = useState([]);

  useEffect(() => {
    fetchDataApointment();
  }, []);

  const fetchDataApointment = async () => {
    try {
      const data = await getDocs(collection(db, 'bookings'));
      const apointments = data.docs.map((doc) => doc.data());

      const filteredApointmentsCategory = apointments.filter((apointment) => apointment.category);

      const categoriesCount = {};

      for (const apointment of filteredApointmentsCategory) {
        const categoryDoc = await getDoc(doc(db, 'catigories', apointment.category));
        const categoryData = categoryDoc.exists() ? categoryDoc.data() : {};

        const category = categoryData.frtitle;

        categoriesCount[category] = (categoriesCount[category] || 0) + 1;
      }

      const customColors = ['#5DADE2', '#82E0AA', '#F5B041', '#AF7AC5', '#E74C3C'];

      const totalCount = Object.values(categoriesCount).reduce((sum, count) => sum + count, 0);

      const resultData = Object.entries(categoriesCount).map(([name, count], index) => {
        const color = index < customColors.length ? customColors[index] : `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        return {
          name,
          value: (count / totalCount) * 100,
          color,
          paragraphColor: color,
        };
      });

      setApointmentCategories(resultData);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className='m-3'>
      <PieChart width={730} height={250}>
        <Pie
          data={apointmentCategories}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={({ name }) => name}
        >
          {apointmentCategories.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
      <div>
        {apointmentCategories.map((apointment, index) => (
          <div key={`apointment-${index}`} className='flex text-center  items-center'>
            <p
              className="border rounded w-3 h-3 mx-2  "
              style={{ backgroundColor: apointment.paragraphColor }}
            ></p>
            <p key={`p-${index}`}>{`${apointment.name}: ${apointment.value.toFixed(2)}%`}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPieChart;
