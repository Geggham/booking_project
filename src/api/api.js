import axios from 'axios';

const apiUrl = 'https://hh.frontend.ark.software/api/booking';

const getBookingData = async () => {
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        accept: 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
    throw error;  
  }
};

export default getBookingData;
