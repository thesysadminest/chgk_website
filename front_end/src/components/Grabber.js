import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Grabber = ({ url }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        axios.get(url)
            .then((response) => {
                successShow(response);
            })
            .catch((error) => {
                successShow(error);
            });
    }, [url]);

    const successShow = (response) => {
        setData(response.data);
    };
};

export default Grabber;
