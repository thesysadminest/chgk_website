import React, { useState, useEffect } from 'react';
import axios from 'axios';


const Grabber = ({ url, onDataFetched }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(url)
      .then((response) => {
        onDataFetched(response.data);
      })
      .catch((error) => {
        console.error('������ ��� �������� ������:', error);
      });
  }, [url, onDataFetched]);

    const successShow = (response) => {
        setData(response.data);
    };
};

export default Grabber;