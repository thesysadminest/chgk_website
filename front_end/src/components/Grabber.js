// Filename - src/App.js

import React from 'react';
import axios from 'axios';

class Grabber extends React.Component {

    state = {
        data : [],
    }

    componentDidMount() {
        axios.get('http://127.0.0.1:8000/api/question/1')
        .then((response) => {
            this.successShow(response);
        })
        .catch((error) => {
            this.successShow(error);
        });
    }

    successShow(response) {
        this.setState({
            data: response
        });
    }

    render() {
        return (
            <div>
              <h2>Welcome to React</h2>
              <h3>{JSON.stringify(this.state)}</h3>

              <pre>{JSON.stringify(this.state.data)}</pre>

              <div>{this.member}</div>
            </div>
        );
    }
}

export default Grabber;